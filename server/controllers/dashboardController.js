const Lead = require('../models/leadModel.js');

// GET /dashboard/stats


const getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments({createdBy: req.user.id});
    const contacted = await Lead.countDocuments({createdBy: req.user.id, status: 'contacted' });
    const replied = await Lead.countDocuments({createdBy: req.user.id, status: 'replied' });
    const closed = await Lead.countDocuments({createdBy: req.user.id, status: 'closed' });
    const highOpportunity = await Lead.countDocuments({createdBy: req.user.id, opportunityScore: 'high' });
    const needsFollowUp = await Lead.countDocuments({createdBy: req.user.id, status: 'contacted' });

    res.json({ totalLeads, contacted, replied, closed, highOpportunity, needsFollowUp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = getDashboardStats;
