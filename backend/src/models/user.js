const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    profileUrl: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        required: true
    },
    repositories: [{
        repoId: String,
        name: String,
        url: String,
        stars: Number,
        forks: Number,
        createdAt: Date
    }],
    commits: [{
        commitId: String,
        message: String,
        date: Date
    }],
    pullRequests: [{
        prId: String,
        title: String,
        url: String,
        createdAt: Date,
        mergedAt: Date
    }],
    issues: [{
        issueId: String,
        title: String,
        url: String,
        createdAt: Date,
        closedAt: Date
    }],
    rankingScore: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;