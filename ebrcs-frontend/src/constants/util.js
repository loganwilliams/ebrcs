export default {
  methods: {
    getType(tag) {
      if (
        tag === "Law Dispatch" ||
        tag === "Law Tac" ||
        tag === "Law Talk" ||
        tag === "Military"
      )
        return "police";
      if (tag === "Prison" || tag === "Corrections") return "prison";
      if (tag === "EMS Dispatch" || tag === "EMS-Tac" || tag === "Hospital")
        return "medical";
      if (tag === "Fire Dispatch" || tag === "Fire-Tac" || tag === "Fire-Talk")
        return "fire";

      return "other";
    },

    getColor(tag) {
      let type = this.getType(tag);

      if (type === "police") return "#74edeb";
      if (type === "medical") return "#fc62ef";
      if (type === "fire") return "#fc8d62";
      if (type === "prison") return "#ffff63";

      return "#8cdb65";
    },
  },
};
