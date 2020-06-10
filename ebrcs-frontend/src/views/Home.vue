<template>
  <div class="home">
    <div class="nav-container">
      <div class="nav">
        <div class="title">East Bay Regional Communication System Live</div>

        <div
          :class="{
            button: true,
            active: $store.getters.unmutedCategory === 'police',
          }"
          @click="$store.dispatch('setMuteCategory', 'police')"
        >
          Police
        </div>
        <div
          :class="{
            button: true,
            active: $store.getters.unmutedCategory === 'fire',
          }"
          @click="$store.dispatch('setMuteCategory', 'fire')"
        >
          Fire
        </div>
        <div
          :class="{
            button: true,
            active: $store.getters.unmutedCategory === 'medical',
          }"
          @click="$store.dispatch('setMuteCategory', 'medical')"
        >
          Medical
        </div>
        <div
          :class="{
            button: true,
            active: $store.getters.unmutedCategory === 'other',
            'hide-portrait': true,
          }"
          @click="$store.dispatch('setMuteCategory', 'other')"
        >
          Interop/Other
        </div>
        <div
          :class="{ button: true, active: $store.getters.muted.length === 0 }"
          @click="$store.dispatch('setMuteCategory', 'all')"
        >
          All
        </div>
      </div>
      <div class="nav transport">
        <div
          :class="{ button: true, active: $store.state.sort === 'recent' }"
          @click="$store.commit('setSort', 'recent')"
        >
          Sort by recent
        </div>
        <div
          :class="{ button: true, active: $store.state.sort === 'talkgroup' }"
          @click="$store.commit('setSort', 'talkgroup')"
        >
          <span class="hide-portrait">Sort by </span>talkgroup ID
        </div>
        <div class="play button" @click="togglePlay()">
          {{ $store.state.playing ? "Stop" : "Autoplay" }}
        </div>
      </div>
    </div>
    <Timeline />
  </div>
</template>

<script>
// @ is an alias to /src
import Timeline from "@/components/Timeline.vue";

export default {
  name: "Home",
  components: {
    Timeline,
  },
  methods: {
    togglePlay() {
      if (this.$store.state.playing) {
        this.$store.commit("stop");
      } else {
        this.$store.commit("play");
      }
    },
  },
  mounted() {
    this.$store.dispatch("loadData");
    this.$store.dispatch("loadTalkgroups");

    window.setInterval(() => this.$store.dispatch("loadData"), 5000);
  },
};
</script>

<style lang="scss" scoped>
.home {
  width: 100vw;
  position: relative;
  overflow: hidden;
  font-family: "Roboto Mono", monospace;
  height: 100%;
}

.nav {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  @media only screen and (max-width: 800px) {
    flex-wrap: wrap;
  }

  @media only screen and (orientation: portrait) {
    justify-content: center;
  }
}

.nav-container {
  width: calc(100% - 2em);
  padding-left: 1em;
  padding-right: 1em;
  padding-bottom: 0.5em;
  height: 89px;

  @media only screen and (max-width: 800px) {
    height: 50px;
  }

  @media only screen and (max-width: 600px) {
    height: 70px;
  }

  @media only screen and (max-width: 400px) {
    height: 100px;
  }
}

div.button {
  color: white;
  border: 1px solid gray;
  background-color: #003831;
  padding: 0.25em;
  cursor: pointer;
  margin: 0.5em;
  font-size: 12px;

  &:hover {
    // background-color: #;
    border: 1px solid #efb21e;
    color: #efb21e;
  }

  &.active {
    // color: #efb21e;
    font-weight: 500;
    border: 1px solid #efb21e;
  }

  @media only screen and (max-width: 800px) {
    margin-top: 2px;
    margin-bottom: 2px;
  }

  @media only screen and (max-width: 400px) {
    margin: 3px;
  }
}

.title {
  font-weight: 500;
  flex-grow: 1;
  text-align: left;
  margin: 0.5em;
  padding: 0.25em;
  color: white;
  min-width: 200px;

  @media only screen and (max-width: 800px) {
    margin-top: 2px;
    margin-bottom: 2px;
    font-size: 12px;
  }

  @media only screen and (orientation: portrait) and (max-width: 800px) {
    text-align: center;
  }

  @media only screen and (max-width: 400px) {
    margin-top: 2px;
    margin-bottom: 2px;
    font-size: 16px;
  }
}

.hide-portrait {
  @media only screen and (max-width: 800px) {
    display: none;
  }
}
</style>
