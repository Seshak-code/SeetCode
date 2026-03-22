import { executeCodeInDocker } from '../services/executionService.js';
import {
  getAllProblems,
  getProblemBySlug as getProblemFromDb,
  createSubmission,
  getSubmissionsBySlug,
  createProblem,
} from '../services/databaseService.js';

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
  try {
    const { slug } = request.params;
    const { code, language, isRunMode, userId, firmwareCode } = request.body;

    const result = await executeCodeInDocker(code, language, slug, isRunMode, firmwareCode || null);

    if (!isRunMode && userId) {
      await createSubmission(userId, slug, language, code, result.status, result.executionTimeMs, result.feedback);
    }

    return response.json(result);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Execution failed' });
  }
}

export async function getProblemSubmissions(request, response) {
  try {
    const { slug } = request.params;
    const { userId } = request.query;
    if (!userId) return response.status(400).json({ error: 'Missing userId parameter' });

    const runs = await getSubmissionsBySlug(userId, slug);
    return response.json(runs);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

export async function createProblemAdmin(request, response) {
  try {
    const { problemData, testWrapperData } = request.body;
    await createProblem(problemData, testWrapperData);
    response.json({ message: 'Problem configured successfully in local SQLite' });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Failed to inject problem' });
  }
}
