const User = require('../models/user');
const githubService = require('../services/githubService');
const rankingService = require('../services/rankingService');
const db = require('../utils/firebase'); // Importa o Firestore

// Sync user data from GitHub
exports.syncUser = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'GitHub token is required' });
    }

    try {
        const userData = await githubService.fetchUserData(token);
        const userId = userData.githubId;

        // Salva ou atualiza o usuário no Firestore
        await db.collection('users').doc(userId).set(userData, { merge: true });

        // Recalcula ranking (ajuste se necessário para usar Firestore)
        await rankingService.recalculateRanking();

        return res.status(200).json({ message: 'User data synced successfully', user: userData });
    } catch (error) {
        return res.status(500).json({ message: 'Error syncing user data', error: error.message });
    }
};

// Get detailed user information
exports.getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(userDoc.data());
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving user data', error: error.message });
    }
};