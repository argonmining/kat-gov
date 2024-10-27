import { Router } from 'express';
import { fetchAllPositions, addPosition, modifyPosition, removePosition } from '../controllers/positionController';

const router = Router();

router.get('/positions', fetchAllPositions);
router.post('/positions', addPosition);
router.put('/positions/:id', modifyPosition);
router.delete('/positions/:id', removePosition);

export default router;
