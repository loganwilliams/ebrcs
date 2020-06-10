<template>
  <g
    :class="{ playhead: true, visible: playhead }"
    :style="{
      transform: `translate(${Math.floor(xScale(playhead))}px,0px)`,
      transition: localShift === 0 ? 'none' : '1s transform',
    }"
  >
    <line
      :x1="Math.floor(localShift)"
      :x2="Math.floor(localShift)"
      :y1="padding"
      :y2="height"
    />
    <line
      :x1="Math.floor(localShift) - 10"
      :x2="Math.floor(localShift) + 10"
      :y1="height"
      :y2="height"
    />
    <line
      :x1="Math.floor(localShift) - 10"
      :x2="Math.floor(localShift) + 10"
      :y1="padding"
      :y2="padding"
    />
    <text
      v-if="playing.length > 0"
      :x="Math.floor(localShift)"
      :y="padding"
      :dy="-3"
      :dx="10"
      text-anchor="beginning"
    >
      {{ playdate }}
    </text>
    <text
      v-if="playing.length > 0"
      :x="Math.floor(localShift)"
      :y="padding"
      :dy="-2"
      :dx="0"
      text-anchor="middle"
    >
      @
    </text>
    <text
      v-if="playing.length > 0"
      :x="Math.floor(localShift)"
      :y="padding"
      :dy="-3"
      :dx="-10"
      text-anchor="end"
    >
      {{
        $store.state.talkgroups[playing[0].talkgroup]
          ? $store.state.talkgroups[playing[0].talkgroup]["Alpha Tag"]
          : "Talkgroup " + tg
      }}
    </text>
  </g>
</template>

<script>
export default {
  name: "Playhead",
  props: {
    playing: Array,
    padding: Number,
    localShift: Number,
    playhead: null,
    playdate: String,
    xScale: Function,
    height: Number,
  },
};
</script>

<style lang="scss" scoped>
g.playhead {
  transition: 1s transform;
  stroke-opacity: 0;

  line {
    stroke: #0099ff;
    stroke-width: 1px;
  }

  &.visible {
    stroke-opacity: 1;
  }

  text {
    fill: #0099ff;
    font-size: 12px;
    font-family: "Roboto Mono", monospace;
  }
}
</style>
