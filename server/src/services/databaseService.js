import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Enable WAL mode for concurrent Read/Write capabilities without locking issues
db.run('PRAGMA journal_mode = WAL;');

// Promisify sqlite3 methods
export const dbRun = promisify(db.run.bind(db));
export const dbAll = promisify(db.all.bind(db));
export const dbGet = promisify(db.get.bind(db));

export async function getAllProblems() {
  const problems = await dbAll('SELECT * FROM problems');
  return problems.map(p => ({
    ...p,
    topics: JSON.parse(p.topics || '[]'),
    constraints: JSON.parse(p.constraints || '[]'),
    examples: JSON.parse(p.examples || '[]'),
    starterCode: JSON.parse(p.starterCode || '{}'),
    hints: JSON.parse(p.hints || '[]')
  }));
}

export async function getProblemBySlug(slug) {
  const problem = await dbGet('SELECT * FROM problems WHERE slug = ?', [slug]);
  if (!problem) return null;
  
  return {
    ...problem,
    topics: JSON.parse(problem.topics || '[]'),
    constraints: JSON.parse(problem.constraints || '[]'),
    examples: JSON.parse(problem.examples || '[]'),
    starterCode: JSON.parse(problem.starterCode || '{}'),
    hints: JSON.parse(problem.hints || '[]')
  };
}

export async function getProblemTestWrapper(slug) {
  return await dbGet('SELECT * FROM problem_tests WHERE problem_slug = ?', [slug]);
}

export async function createProblem(problemData, testWrapperData) {
  const { slug, title, difficulty, summary, description, acceptanceRate, topics, constraints, examples, starterCode, hints } = problemData;
  const { test_wrappers } = testWrapperData;

  await dbRun(
    `INSERT OR REPLACE INTO problems 
    (slug, title, difficulty, summary, description, acceptanceRate, topics, constraints, examples, starterCode, hints)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug, title, difficulty, summary, description, acceptanceRate,
      JSON.stringify(topics), JSON.stringify(constraints), 
      JSON.stringify(examples), JSON.stringify(starterCode),
      JSON.stringify(hints || [])
    ]
  );
  
  if (test_wrappers) {
    await dbRun(
      `INSERT OR REPLACE INTO problem_tests (problem_slug, test_wrappers) VALUES (?, ?)`,
      [slug, JSON.stringify(test_wrappers)]
    );
  }
}

export async function getUser(username, password) {
  // In a real app we'd use bcrypt, but we'll fulfill the raw req "password" locally
  return await dbGet('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
}

export async function createSubmission(userId, slug, language, code, status, timeMs, feedback) {
  // Guard against massive code string explosions
  const slicedCode = code.slice(0, 15000); 
  await dbRun(
    `INSERT INTO submissions (user_id, problem_slug, language, code, status, execution_time_ms, feedback)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, slug, language, slicedCode, status, timeMs, JSON.stringify(feedback)]
  );
}

export async function getSubmissionsBySlug(userId, slug) {
  const runs = await dbAll(
    'SELECT * FROM submissions WHERE user_id = ? AND problem_slug = ? ORDER BY created_at DESC', 
    [userId, slug]
  );
  return runs.map(run => ({
    ...run,
    feedback: JSON.parse(run.feedback || '[]')
  }));
}

export default {
  getAllProblems,
  getProblemBySlug,
  getProblemTestWrapper,
  createProblem,
  getUser,
  createSubmission,
  getSubmissionsBySlug,
  dbRun
};
