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

// fetch messages
const fetchMessages = async(req, res)=>{
  
  try {
    const leadMessages = await Message.find({ lead: req.params.id }).sort({ createdAt: -1 });

    if(leadMessages.length === 0)
    {
      return res.status(404).json({success: false, message: "You don't have any saved messages yet"})
    }

    return res.status(200).json({success: true, leadMessages});
  } catch (error) {
      return res.status(500).json({success: false, message: error.message});
  }


}

module.exports = { saveMessage, fetchMessages };