const cron = require('node-cron');
const rankingService = require('../services/rankingService');

// Job to update the ranking of all users every hour
const updateRankingJob = cron.schedule('0 * * * *', async () => {
    try {
        console.log('Starting ranking update job...');
        await rankingService.updateAllUserRankings();
        console.log('Ranking update job completed successfully.');
    } catch (error) {
        console.error('Error updating rankings:', error);
    }
});

// Start the job
updateRankingJob.start();

module.exports = updateRankingJob;