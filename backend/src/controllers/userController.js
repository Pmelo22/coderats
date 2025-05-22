const User = require('../models/user');
const githubService = require('../services/githubService');
const rankingService = require('../services/rankingService');

// Sync user data from GitHub
exports.syncUser = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'GitHub token is required' });
    }

    try {
        const userData = await githubService.fetchUserData(token);
        const userId = userData.githubId;

        // Save or update user data in the database
        const updatedUser = await User.findOneAndUpdate(
            { githubId: userId },
            userData,
            { upsert: true, new: true }
        );

        // Recalculate ranking
        await rankingService.recalculateRanking();

        return res.status(200).json({ message: 'User data synced successfully', user: updatedUser });
    } catch (error) {
        return res.status(500).json({ message: 'Error syncing user data', error: error.message });
    }
};

// Get detailed user information
exports.getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ githubId: id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving user data', error: error.message });
    }
};