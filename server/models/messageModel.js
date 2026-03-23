// message model
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["pitch", "follow_up", "closing"],
      default: "pitch",
    },
    subject: String,
    content: String,
    isDraft: {
      type: Boolean,
      default: true,
    },
    sentAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
