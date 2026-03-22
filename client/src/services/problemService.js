const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Problems ────────────────────────────────────────────────────────────────

export async function fetchProblems() {
  const res = await fetch(`${API_BASE}/problems`);
  if (!res.ok) throw new Error('Failed to fetch problems');
  return res.json();
}

export async function fetchProblemBySlug(slug) {
  const res = await fetch(`${API_BASE}/problems/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch problem');
  return res.json();
}

// ─── Code Execution ──────────────────────────────────────────────────────────

export async function submitCode(slug, code, language, isRunMode = false, userId = null, firmwareCode = null) {
  const res = await fetch(`${API_BASE}/problems/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, isRunMode, userId, firmwareCode }),
  });
  if (!res.ok) throw new Error('Execution request failed');
  return res.json();
}

// ─── Submissions ─────────────────────────────────────────────────────────────

export async function fetchSubmissions(slug, userId) {
  const res = await fetch(`${API_BASE}/problems/${slug}/submissions?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
}
