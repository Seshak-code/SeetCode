import { executeCodeInDocker } from '../services/executionService.js';
import { getAllProblems, getProblemBySlug as getProblemFromDb } from '../services/databaseService.js';

export async function getProblems(_request, response) {
  try {
    const problems = await getAllProblems();
    response.json(problems.map(({ starterCode, ...problem }) => problem));
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database error fetching problems' });
  }
}

export async function getProblemBySlug(request, response) {
  try {
    const problem = await getProblemFromDb(request.params.slug);
    if (!problem) {
      return response.status(404).json({ message: 'Problem not found' });
    }
    return response.json(problem);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Database error fetching problem' });
  }
}

export async function submitProblem(request, response) {
  const { slug } = request.params;
  const { code, language, isRunMode } = request.body;
  
  const { executeCodeInDocker } = await import('../services/executionService.js');
  const result = await executeCodeInDocker(code, language, slug, isRunMode);
  return response.json(result);
}

export async function createProblemAdmin(request, response) {
  try {
    const { problemData, testWrapperData } = request.body;
    const { createProblem } = await import('../services/databaseService.js');
    await createProblem(problemData, testWrapperData);
    response.json({ message: 'Problem configured successfully in local SQLite' });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Failed to inject problem' });
  }
}
