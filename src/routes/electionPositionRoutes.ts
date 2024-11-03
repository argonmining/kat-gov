import { Router } from 'express';
import { fetchAllElectionPositions, addElectionPosition, modifyElectionPosition, removeElectionPosition } from '../controllers/electionPositionController.js';

const router = Router();

router.get('/positions', fetchAllElectionPositions);
router.post('/positions', addElectionPosition);
router.put('/positions/:id', modifyElectionPosition);
router.delete('/positions/:id', removeElectionPosition);

export default router; 