const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

router.get('/api/ranking', rankingController.getRanking);

module.exports = router;