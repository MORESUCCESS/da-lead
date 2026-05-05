const userModel = require('../models/userModel.js');
const { generateLeadsForUser } = require('./leadFinderController.js'); 

const conFunction = async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const users = await userModel.find({
      freelanceCategory: { $ne: '' },
      location: { $ne: '' },
    });

    console.log(`Cron: generating leads for ${users.length} users`);

    const results = [];
    for (const user of users) {
      try {
        await generateLeadsForUser(user);
        results.push({ userId: user._id, status: 'success' });
      } catch (err) {
        results.push({ userId: user._id, status: 'failed', error: err.message });
      }
    }

    return res.json({ success: true, results });
  } catch (err) {
    console.error('Cron error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = conFunction;