import { Router } from 'express';
import { getNominationFee, verifyNominationTransaction } from '../controllers/nominationFeeController.js';

const router = Router();

router.get('/nominationFee', getNominationFee);
router.post('/verifyNominationTransaction', verifyNominationTransaction);

export default router; 