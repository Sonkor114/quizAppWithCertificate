
const express = require('express');
const path = require('path');
const { initDatabase, saveQuizResult, getTopScores } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static('.'));

// Initialize database on server start
initDatabase();

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to save quiz results
app.post('/api/save-result', async (req, res) => {
  const { username, score, totalQuestions } = req.body;
  
  if (!username || score === undefined || !totalQuestions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await saveQuizResult(username, score, totalQuestions);
  res.json(result);
});

// API endpoint to get top scores
app.get('/api/top-scores', async (req, res) => {
  const scores = await getTopScores();
  res.json(scores);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
