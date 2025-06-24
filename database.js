
const { Client } = require('pg');

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create quiz_results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        username VARCHAR(100),
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage DECIMAL(5,2),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.end();
  }
}

async function saveQuizResult(username, score, totalQuestions) {
  const databaseUrl = process.env.DATABASE_URL;
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    
    const percentage = ((score / totalQuestions) * 100).toFixed(2);
    
    // Insert or update user
    await client.query(`
      INSERT INTO users (username) 
      VALUES ($1) 
      ON CONFLICT (username) DO NOTHING
    `, [username]);

    // Get user ID
    const userResult = await client.query('SELECT id FROM users WHERE username = $1', [username]);
    const userId = userResult.rows[0]?.id;

    // Save quiz result
    await client.query(`
      INSERT INTO quiz_results (user_id, username, score, total_questions, percentage)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, username, score, totalQuestions, percentage]);

    return { success: true, percentage };
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

async function getTopScores(limit = 10) {
  const databaseUrl = process.env.DATABASE_URL;
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT username, MAX(score) as best_score, MAX(percentage) as best_percentage
      FROM quiz_results 
      GROUP BY username 
      ORDER BY best_score DESC, best_percentage DESC 
      LIMIT $1
    `, [limit]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching top scores:', error);
    return [];
  } finally {
    await client.end();
  }
}

module.exports = { initDatabase, saveQuizResult, getTopScores };
