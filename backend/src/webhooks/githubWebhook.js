const express = require('express');
const githubService = require('../services/githubService');

const router = express.Router();

// Handle GitHub webhook events
router.post('/github', async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    try {
        switch (event) {
            case 'push':
                // Handle push event
                await githubService.handlePushEvent(payload);
                break;
            case 'pull_request':
                // Handle pull request event
                await githubService.handlePullRequestEvent(payload);
                break;
            case 'issues':
                // Handle issues event
                await githubService.handleIssuesEvent(payload);
                break;
            // Add more cases as needed for other events
            default:
                return res.status(400).send('Event not handled');
        }
        res.status(200).send('Webhook received and processed');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;