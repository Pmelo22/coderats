const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/sync-user', userController.syncUser);
router.get('/user/:id', userController.getUser); // Corrigido de getUserById para getUser

module.exports = router;