import { Router } from 'express';
import { getProblemBySlug, getProblems, submitProblem, createProblemAdmin } from '../controllers/problemController.js';

const router = Router();

router.get('/', getProblems);
router.post('/admin/upload', createProblemAdmin);
router.get('/:slug', getProblemBySlug);
router.post('/:slug', submitProblem);

export default router;
