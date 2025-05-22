const User = require('../models/user');

function calculateRankingScore(user) {
    // Pesos: commits (40%), PRs (25%), issues (15%), diversidade (10%), streak (10%)
    const commitsScore = (user.commits?.length || 0) * 0.4;
    const prsScore = (user.pullRequests?.length || 0) * 0.25;
    const issuesScore = (user.issues?.length || 0) * 0.15;
    const diversityScore = (user.repositories?.length || 0) * 0.1;
    // streak pode ser implementado depois, por enquanto 0
    const streakScore = 0;
    return commitsScore + prsScore + issuesScore + diversityScore + streakScore;
}

async function recalculateRanking() {
    const users = await User.find();
    // Calcula score de cada usuário
    for (const user of users) {
        const score = calculateRankingScore(user);
        user.rankingScore = score;
        await user.save();
    }
}

async function getRanking() {
    // Retorna todos os usuários ordenados pelo rankingScore decrescente
    const users = await User.find().sort({ rankingScore: -1 });
    return users.map((user, idx) => ({
        rank: idx + 1,
        username: user.username,
        avatarUrl: user.avatarUrl,
        profileUrl: user.profileUrl,
        rankingScore: user.rankingScore,
        commits: user.commits?.length || 0,
        pullRequests: user.pullRequests?.length || 0,
        issues: user.issues?.length || 0,
        projects: user.repositories?.length || 0,
        lastUpdated: user.lastUpdated,
    }));
}

module.exports = {
    calculateRankingScore,
    recalculateRanking,
    getRanking,
};