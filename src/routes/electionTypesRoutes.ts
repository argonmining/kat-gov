import { Router } from 'express';
import { fetchAllElectionTypes, addElectionType, modifyElectionType, removeElectionType } from '../controllers/electionTypesController.js';

const router = Router();

router.get('/election-types', fetchAllElectionTypes);
router.post('/election-types', addElectionType);
router.put('/election-types/:id', modifyElectionType);
router.delete('/election-types/:id', removeElectionType);

export default router;
