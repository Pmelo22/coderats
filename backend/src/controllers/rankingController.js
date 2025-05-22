const RankingService = require('../services/rankingService');

exports.getRanking = async (req, res) => {
    try {
        const ranking = await RankingService.getRanking();
        res.status(200).json(ranking);
    } catch (error) {
        console.error('Error fetching ranking:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};