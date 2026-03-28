const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return this.provider !== "google";
      },
    },

    bio: { type: String, default: "" },
    freelanceCategory: { type: String, default: "" },

    plan: { type: String, enum: ["free", "pro"], default: "free" },
    
    provider: {
      type: String,
      default: "local",
    },
    avatar: String,

    location: {
      type: String,
      default: ""
    },
    lastGeneratedDate: {
      type: String,
      default: ""
    },
    seenLeads: { type: [String], default: [] },
    dailyLeads: { type: Array, default: [] },
  },
  { timestamps: true },
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

module.exports = userModel;
