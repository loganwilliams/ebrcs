import Vue from "vue";
import Vuex from "vuex";
import * as d3 from "d3";
import moment from "moment";
import util from "@/constants/util";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    calls: [],
    talkgroups: {},
    playStart: moment(),
    playing: false,
    muted_talkgroups: {},
    sort: "recent",
  },
  mutations: {
    setCalls(state, calls) {
      state.calls = calls;
    },

    setTalkgroups(state, talkgroups) {
      state.talkgroups = talkgroups;
    },

    play(state) {
      state.playStart = moment();
      state.playing = true;
    },

    stop(state) {
      state.playing = false;
    },

    mute(state, talkgroup) {
      state.muted_talkgroups[talkgroup] = true;
      state.muted_talkgroups = { ...state.muted_talkgroups };
    },

    unmute(state, talkgroup) {
      state.muted_talkgroups[talkgroup] = false;
      state.muted_talkgroups = { ...state.muted_talkgroups };
    },

    setMuted(state, muted) {
      state.muted_talkgroups = muted;
    },

    setSort(state, sort) {
      state.sort = sort;
    },
  },

  getters: {
    allTalkgroups(state) {
      let talkgroups = Object.keys(state.talkgroups);

      state.calls.forEach((c) => {
        if (!state.talkgroups[c.talkgroup]) {
          talkgroups.push(c.talkgroup);
        }
      });

      return talkgroups;
    },

    muted(state) {
      return Object.keys(state.muted_talkgroups).filter(
        (k) => state.muted_talkgroups[k]
      );
    },

    unmutedTalkgroups(state) {
      return Object.keys(state.talkgroups).filter(
        (tg) => !state.muted_talkgroups[tg]
      );
    },

    unmutedCategory(state, getters) {
      let types = getters.unmutedTalkgroups.map((tg) => {
        if (state.talkgroups[tg]) {
          return util.methods.getType(state.talkgroups[tg].Tag);
        } else {
          return "other";
        }
      });

      let type = types[0];

      types.forEach((t) => {
        if (t !== type) type = "";
      });

      return type;
    },
  },

  actions: {
    async loadData({ commit }) {
      let req = await fetch("http://192.241.215.152:3000/calls");
      let calls = await req.json();

      commit("setCalls", calls);
    },
    async loadTalkgroups({ commit }) {
      let talkgroups = await d3.csv("talkgroups.csv");

      let tg_dict = {};

      talkgroups.forEach((talkgroup) => {
        tg_dict[talkgroup.DEC] = talkgroup;
      });

      commit("setTalkgroups", tg_dict);
    },

    setMuteCategory({ state, getters, commit }, category) {
      let muted_talkgroups = {};

      if (category === "police") {
        getters.allTalkgroups.forEach((tg) => {
          if (!state.talkgroups[tg]) {
            muted_talkgroups[tg] = true;
          } else {
            let type = util.methods.getType(state.talkgroups[tg].Tag);
            if (type !== "police") muted_talkgroups[tg] = true;
          }
        });
      } else if (category === "fire") {
        getters.allTalkgroups.forEach((tg) => {
          if (!state.talkgroups[tg]) {
            muted_talkgroups[tg] = true;
          } else {
            let type = util.methods.getType(state.talkgroups[tg].Tag);
            if (type !== "fire") muted_talkgroups[tg] = true;
          }
        });
      } else if (category === "medical") {
        getters.allTalkgroups.forEach((tg) => {
          if (!state.talkgroups[tg]) {
            muted_talkgroups[tg] = true;
          } else {
            let type = util.methods.getType(state.talkgroups[tg].Tag);
            if (type !== "medical") muted_talkgroups[tg] = true;
          }
        });
      } else if (category === "other") {
        getters.allTalkgroups.forEach((tg) => {
          if (state.talkgroups[tg]) {
            let type = util.methods.getType(state.talkgroups[tg].Tag);
            if (type !== "other") muted_talkgroups[tg] = true;
          }
        });
      }

      commit("setMuted", muted_talkgroups);
    },
  },
  modules: {},
});
