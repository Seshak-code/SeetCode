import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

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
    starterCode: JSON.parse(p.starterCode || '{}')
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
    starterCode: JSON.parse(problem.starterCode || '{}')
  };
}

export async function getProblemTestWrapper(slug) {
  return await dbGet('SELECT * FROM problem_tests WHERE problem_slug = ?', [slug]);
}

export async function createProblem(problemData, testWrapperData) {
  const { slug, title, difficulty, summary, description, acceptanceRate, topics, constraints, examples, starterCode } = problemData;
  const { test_wrappers } = testWrapperData;

  await dbRun(
    `INSERT OR REPLACE INTO problems 
    (slug, title, difficulty, summary, description, acceptanceRate, topics, constraints, examples, starterCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug, title, difficulty, summary, description, acceptanceRate,
      JSON.stringify(topics), JSON.stringify(constraints), 
      JSON.stringify(examples), JSON.stringify(starterCode)
    ]
  );
  
  if (test_wrappers) {
    await dbRun(
      `INSERT OR REPLACE INTO problem_tests (problem_slug, test_wrappers) VALUES (?, ?)`,
      [slug, JSON.stringify(test_wrappers)]
    );
  }
}

export default {
  getAllProblems,
  getProblemBySlug,
  getProblemTestWrapper,
  createProblem,
  dbRun
};
