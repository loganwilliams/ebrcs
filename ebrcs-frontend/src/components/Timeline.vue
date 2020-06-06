<template>
  <div class="timeline" ref="container">
    <svg :width="width" :height="height">
      <g class="legend">
        <g v-for="tg in Object.keys(yIndex)" :key="tg">
          <text
            :x="width - label_padding + 10"
            :y="0"
            :dy="10"
            :style="{
              transform: `translate(0px,${yScale(yIndex[tg])}px)`,
            }"
            :class="{ muted: $store.state.muted_talkgroups[tg] }"
            @click="
              $store.state.muted_talkgroups[tg]
                ? $store.commit('unmute', tg)
                : $store.commit('mute', tg)
            "
          >
            {{
              $store.state.talkgroups[tg]
                ? $store.state.talkgroups[tg]["Alpha Tag"]
                : "Talkgroup " + tg
            }}
          </text>
          <line :x1="0" :x2="width" :y1="0" :y2="0" />
        </g>
      </g>
      <g class="xaxis">
        <g v-for="tick in minorXTicks" :key="tick.valueOf()">
          <line
            class="minor"
            :style="{
              transform: `translate(${scaleDate(tick)}px,0px)`,
            }"
            :y1="padding"
            :y2="height"
            :x1="0"
            :x2="0"
          />
        </g>
        <g v-for="tick in xTicks" :key="tick.valueOf()">
          <line
            :style="{
              transform: `translate(${scaleDate(tick)}px,0px)`,
            }"
            :y1="padding"
            :y2="height"
            :x1="0"
            :x2="0"
          />
          <text
            :style="{
              transform: `translate(${scaleDate(tick) + 5}px,0px)`,
            }"
            :x="0"
            :y="height - 5"
            :dx="0"
          >
            {{ formatDate(tick) }}
          </text>
        </g>
      </g>
      <g>
        <rect
          v-for="call in calls"
          :key="call.call_id"
          :x="0"
          :y="0"
          :style="{
            transform: `translate(${scaleDate(call.start_time)}px,${yScale(
              yIndex[call.talkgroup]
            )}px)`,
            fill: getColor(
              $store.state.talkgroups[call.talkgroup]
                ? $store.state.talkgroups[call.talkgroup].Tag
                : 'Other'
            ),
          }"
          :width="((width - 2 * padding) * call.length) / (30 * 60)"
          :height="(height - 2 * padding) / nYs"
          @click="call.encrypted ? null : playCall(call)"
          :class="{
            playing: playing.indexOf(call.call_id) >= 0,
            queued: queue.map((q) => q.call_id).indexOf(call.call_id) >= 0,
            listened: listened.indexOf(call.call_id) >= 0,
            encrypted: call.encrypted,
            muted: $store.state.muted_talkgroups[call.talkgroup],
          }"
        />
      </g>
    </svg>
  </div>
</template>

<script>
// TODO:
// Scroll everything according to offset based on last server sync
// Use cue of new messages to play rather than a time based cursor
// Add the ability to turn groups on and off

import * as d3 from "d3";
import moment from "moment";
import { Howl, Howler } from "howler";
import util from "@/constants/util";

export default {
  name: "Timeline",
  data() {
    return {
      width: 1600,
      height: 500,
      padding: 20,
      label_padding: 140,
      colorScale: d3.scaleOrdinal(d3.schemeSet3),
      playing: [],
      listened: [],
      queue: [],
      resizeObserver: null,
    };
  },
  mounted() {
    const ro = new ResizeObserver(this.updateSize);
    ro.observe(this.$refs.container);
    this.resizeObserver = ro;
    this.updateSize();
  },
  beforeDestroy() {
    this.resizeObserver.unobserve(this.$refs.container);
  },
  methods: {
    updateSize() {
      this.height = this.$refs.container.getBoundingClientRect().height;
      this.width = this.$refs.container.getBoundingClientRect().width;
    },

    scaleDate(v) {
      return this.xScale(moment(v));
    },

    playCall(call) {
      if (this.playing.indexOf(call.call_id) >= 0) {
        Howler.stop();
        this.playing = this.playing.filter((s) => s !== call.call_id);
        if (this.queue.length > 0) {
          this.playCall(this.queue.shift());
        }
        return;
      }

      if (this.playing.length > 0) {
        this.queue.push(call);
        return;
      }

      if (this.$store.state.muted_talkgroups[call.talkgroup]) {
        if (this.queue.length > 0) {
          this.playCall(this.queue.shift());
        }
        return;
      }

      let sound = new Howl({
        src: [
          "https://ebrcs.sfo2.digitaloceanspaces.com/" +
            call.filename.split("audio_files/")[1].replace("wav", "m4a"),
        ],
      });

      sound.on("loaderror", () => {
        // sometimes we might play an audio file before it's been uploaded to S3, this will retry
        this.playing = this.playing.filter((s) => s !== call.call_id);
        this.playCall(call);
      });

      sound.play();

      this.playing.push(call.call_id);
      this.listened.push(call.call_id);

      sound.on("end", () => {
        this.playing = this.playing.filter((s) => s !== call.call_id);
        if (this.queue.length > 0) {
          this.playCall(this.queue.shift());
        }
      });
    },

    formatDate(t) {
      return moment(t).format("hh:mm A");
    },
  },
  computed: {
    calls() {
      return this.$store.state.calls;
    },

    maxDate() {
      if (!this.calls[0]) return moment();
      return moment(this.calls[0].stop_time);
    },

    minDate() {
      if (this.width < 800) {
        return moment(this.maxDate).add(-10, "m");
      }

      if (this.width < 1400) {
        return moment(this.maxDate).add(-20, "m");
      }

      return moment(this.maxDate).add(-30, "m");
    },

    xScale() {
      return d3
        .scaleTime()
        .domain([new Date(this.minDate), new Date(this.maxDate)])
        .range([this.padding, this.width - this.label_padding]);
    },

    yScale() {
      return d3
        .scaleLinear()
        .domain([0, Object.keys(this.yIndex).length])
        .range([this.padding, this.height - this.padding]);
    },

    nYs() {
      return Object.keys(this.yIndex).length;
    },

    yIndex() {
      let tgs = {};
      let i = 0;
      let sorted;

      if (this.$store.state.sort === "recent") {
        sorted = this.calls.map((c) => c.talkgroup);
      }

      if (this.$store.state.sort === "talkgroup") {
        sorted = this.calls.map((c) => c.talkgroup).sort((a, b) => +a - +b);
      }

      sorted.forEach((tg) => {
        if (!Object.prototype.hasOwnProperty.call(tgs, tg)) {
          tgs[tg] = i;
          i += 1;
        }
      });

      return tgs;
    },

    xTicks() {
      if (this.width < 800) {
        return this.xScale.ticks(2);
      }

      if (this.width < 1400) {
        return this.xScale.ticks(4);
      }

      return this.xScale.ticks(6);
    },

    minorXTicks() {
      let ticks;
      if (this.width < 800) {
        ticks = this.xScale.ticks(7);
      } else if (this.width < 1400) {
        ticks = this.xScale.ticks(14);
      } else {
        ticks = this.xScale.ticks(20);
      }

      ticks = ticks.filter(
        (t) => this.xTicks.map((t) => t.valueOf()).indexOf(t.valueOf()) < 0
      );

      return ticks;
    },

    autoplay() {
      return this.$store.state.playing;
    },
  },
  watch: {
    // cursor(to, from) {
    //   this.calls.forEach((call) => {
    //     if (moment(call.start_time) > from && moment(call.start_time) < to) {
    //       this.playCall(call);
    //     }
    //   });
    // },
    autoplay(to) {
      if (to) {
        let to_play = this.calls.filter(
          (c) => moment(c.start_time) > this.$store.state.playStart
        );
        let reversed = to_play.slice().reverse();

        this.queue.push(...reversed);
        if (this.playing.length === 0 && this.queue.length > 0)
          this.playCall(this.queue.shift());
      } else {
        this.queue = [];
        Howler.stop();
        this.playing = [];
      }
    },
    calls(to, from) {
      // find new calls (diff to and from)
      // add ids to play queue

      if (this.autoplay) {
        let prev_ids = from.map((c) => c.call_id);
        let new_calls = to.filter((c) => prev_ids.indexOf(c.call_id) < 0);
        let reverse_order = new_calls.slice().reverse();

        this.queue.push(...reverse_order);
        if (this.playing.length === 0 && this.queue.length > 0)
          this.playCall(this.queue.shift());
      }
    },
  },
  mixins: [util],
};
</script>

<style lang="scss" scoped>
.timeline {
  width: 100%;
  height: 500px;
}

svg {
  text {
    font-size: 12px;
    font-family: "Roboto Mono", monospace;
    fill: white;
  }

  rect {
    fill: none;
    stroke: white;
    stroke-width: 0px;
    transition: 1s transform;
    opacity: 0.7;

    &:hover {
      stroke-width: 1px;
      cursor: pointer;
      opacity: 1;
    }

    &.encrypted {
      fill: black !important;
      stroke: red;
      stroke-width: 1px;
      opacity: 1;

      &:hover {
        cursor: not-allowed;
        stroke-width: 1px;
        opacity: 1;
      }
    }

    &.playing {
      stroke: #0099ff;
      stroke-width: 3px;
      opacity: 1;
    }

    &.queued {
      stroke-width: 3px;
      opacity: 1;
    }

    &.listened:not(.playing) {
      opacity: 0.3;

      &:hover {
        opacity: 0.6;
      }
    }

    &.muted {
      fill: gray !important;
      stroke: gray;
      opacity: 0.7;
    }
  }

  .legend {
    line {
      stroke-width: 1px;
      stroke: none;
    }

    text {
      transition: 1s transform;
      cursor: pointer;

      &.muted {
        fill: gray;
      }
    }
  }

  .xaxis {
    line {
      transition: 1s transform;
      stroke-width: 1px;
      stroke: #ccc;

      &.minor {
        stroke: #444;
        opacity: 1;
      }
    }

    text {
      transition: 1s transform;
    }
  }

  .cursor {
    line {
      stroke: white;
      stroke-width: 2px;
    }
  }
}
</style>