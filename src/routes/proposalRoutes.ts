import { Router } from 'express';
import { submitProposal } from '../controllers/proposalController';

const router = Router();

router.post('/proposals', submitProposal);

export default router;


