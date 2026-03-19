import { problems } from '../data/problems.js';

export function getProblems(_request, response) {
  response.json(
    problems.map(({ starterCode, ...problem }) => problem)
  );
}

export function getProblemBySlug(request, response) {
  const problem = problems.find((entry) => entry.slug === request.params.slug);

  if (!problem) {
    return response.status(404).json({ message: 'Problem not found' });
  }

  return response.json(problem);
}
