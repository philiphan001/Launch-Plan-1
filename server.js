const express = require('express');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// 1. Create a new session
app.post('/api/sessions', async (req, res) => {
  const { user_id, game_id } = req.body;
  const session_id = uuidv4();
  await pool.query(
    'INSERT INTO sessions (id, user_id, game_id) VALUES ($1, $2, $3)',
    [session_id, user_id, game_id]
  );
  res.json({ session_id });
});

// 2. Fetch random questions for a game
app.get('/api/questions', async (req, res) => {
  const { game, limit = 10 } = req.query;
  // Get game_id by name
  const gameResult = await pool.query('SELECT id FROM games WHERE name = $1', [game]);
  if (gameResult.rows.length === 0) return res.status(404).json({ error: 'Game not found' });
  const game_id = gameResult.rows[0].id;
  // Fetch random questions
  const questions = await pool.query(
    `SELECT q.id, q.title, q.description, q.emoji, c.name as category, s.name as subcategory
     FROM questions q
     LEFT JOIN categories c ON q.category_id = c.id
     LEFT JOIN subcategories s ON q.subcategory_id = s.id
     WHERE q.game_id = $1 AND q.is_active = true
     ORDER BY RANDOM() LIMIT $2`,
    [game_id, limit]
  );
  res.json(questions.rows);
});

// 3. Record a user response
app.post('/api/responses', async (req, res) => {
  const { session_id, question_id, response_value, response_time_ms, device_info } = req.body;
  await pool.query(
    `INSERT INTO responses (session_id, question_id, response_value, response_time_ms, device_info)
     VALUES ($1, $2, $3, $4, $5)`,
    [session_id, question_id, response_value, response_time_ms, device_info]
  );
  res.json({ status: 'ok' });
});

// 4. (Optional) Send session to LLM for analysis (mocked)
app.post('/api/llm/analyze', async (req, res) => {
  const { session_id, analysis_type } = req.body;
  // Fetch all responses for the session, join with questions
  const responses = await pool.query(
    `SELECT r.response_value, q.title, q.description, c.name as category
     FROM responses r
     JOIN questions q ON r.question_id = q.id
     LEFT JOIN categories c ON q.category_id = c.id
     WHERE r.session_id = $1`,
    [session_id]
  );
  // Build prompt (simple example)
  const prompt = responses.rows.map(r =>
    `Q: [${r.category}] ${r.title} - ${r.description}\nA: ${r.response_value}`
  ).join('\n');
  // Call LLM API here (mocked)
  const llm_response = { recommendations: ['Sample career 1', 'Sample career 2'] };
  // Store analysis
  await pool.query(
    `INSERT INTO llm_analyses (session_id, prompt, llm_response, analysis_type)
     VALUES ($1, $2, $3, $4)`,
    [session_id, prompt, JSON.stringify(llm_response), analysis_type]
  );
  res.json({ llm_response });
});

app.listen(3001, () => console.log('API server running on port 3001')); 