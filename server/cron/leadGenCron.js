const cron = require('node-cron');
const userModel = require('../models/userModel');
const { generateLeadsForUser } = require('../controllers/leadFinderController.js');

// Runs every day at 6am
cron.schedule('0 6 * * *', async () => {
  console.log('Running daily lead generation cron...');

  try {
    const users = await userModel.find({
      freelanceCategory: { $ne: '' },
      location: { $ne: '' },
    });

    console.log(`Generating leads for ${users.length} users...`);

    for (const user of users) {
      try {
        await generateLeadsForUser(user);
        console.log(`Leads generated for user: ${user._id}`);
      } catch (err) {
        console.error(`Failed for user ${user._id}:`, err.message);
      }
    }

    console.log('Daily lead generation complete.');
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
});