import { Router } from 'express';
import { getProblemBySlug, getProblems, submitProblem, createProblemAdmin, getProblemSubmissions } from '../controllers/problemController.js';

const router = Router();

router.get('/', getProblems);
router.post('/admin/upload', createProblemAdmin);
router.get('/:slug', getProblemBySlug);
router.post('/:slug', submitProblem);
router.get('/:slug/submissions', getProblemSubmissions);

export default router;
