// Firebase Admin SDK initialization for Node.js backend
const admin = require('firebase-admin');

// Use environment variable or path to your service account key JSON
// Exemplo: process.env.GOOGLE_APPLICATION_CREDENTIALS
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://coderats-9eaf5.firebaseio.com'
});

const db = admin.firestore();

module.exports = db;
