// controllers/messageController.js
const Message = require("../models/messageModel.js");
const Lead = require("../models/leadModel.js");

const saveMessage = async (req, res) => {
  const { id } = req.params;
  const { messageType, subject, content, isDraft } = req.body;

  try {
    const message = await Message.create({
      lead: id,
      messageType,
      subject,
      content,
      isDraft,
      sentAt: isDraft ? null : new Date(),
    });

    // If message is sent → update lead status
    if (!isDraft) {
      await Lead.findByIdAndUpdate(id, {
        status: "contacted",
      });
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { saveMessage };