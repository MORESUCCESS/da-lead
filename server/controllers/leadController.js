const Lead = require('../models/leadModel.js');
const messageModel = require('../models/messageModel.js');

// add leads
const createLead = async (req, res) => {
  try {
    const {
      businessName,
      website,
      socialHandle,
      contactEmail,
      industry,
      notes,
    } = req.body;

    // Basic validation
    if (!businessName) {
      return res.status(400).json({
        success: false,
        message: "Business name is required",
      });
    }

    const newLead = await Lead.create({
      businessName,
      website,
      socialHandle,
      contactEmail,
      industry,
      whyTheyNeedYou: notes, // map notes → your schema field
      createdBy: req.user.id, // IMPORTANT (from auth middleware)
    });

    return res.status(201).json({
      success: true,
      lead: newLead,
    });

  } catch (error) {
    console.error("CREATE LEAD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create lead",
    });
  }
};


// GET /leads - list leads
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({
      createdBy:req.user.id
    }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /leads/:id - lead details
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /leads/:id - update lead status
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    Object.assign(lead, req.body); // updates any fields in body
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE a lead
const deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    // Find the lead and ensure it belongs to the logged-in user
    const lead = await Lead.findOne({ _id: leadId, createdBy: req.user.id });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Also delete all messages attached to the lead
    await messageModel.deleteMany({lead: leadId});

    await lead.deleteOne();

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('DELETE LEAD ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to delete lead' });
  }
};

module.exports = { getLeads, getLeadById, updateLead, createLead, deleteLead };