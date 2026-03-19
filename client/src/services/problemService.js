const API_BASE = '/api';

export async function fetchProblems() {
  const response = await fetch(`${API_BASE}/problems`);
  if (!response.ok) {
    throw new Error('Failed to fetch problems');
  }

  return response.json();
}

export async function fetchProblemBySlug(slug) {
  const response = await fetch(`${API_BASE}/problems/${slug}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch problem');
  }

  return response.json();
}
