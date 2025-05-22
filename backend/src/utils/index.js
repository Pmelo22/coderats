export const formatUserData = (userData) => {
    return {
        id: userData.id,
        login: userData.login,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        name: userData.name,
        bio: userData.bio,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
    };
};

export const calculateRankingScore = (user) => {
    const commitsScore = user.commits * 2; // Example scoring
    const prsScore = user.pullRequests * 3; // Example scoring
    const reviewsScore = user.reviews * 1; // Example scoring
    return commitsScore + prsScore + reviewsScore;
};

export const handleError = (error) => {
    console.error('Error:', error.message);
    return { success: false, message: error.message };
};