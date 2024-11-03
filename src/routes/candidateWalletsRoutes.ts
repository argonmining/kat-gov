import { Router } from 'express';
import { fetchAllCandidateWallets, addCandidateWallet, modifyCandidateWallet, removeCandidateWallet } from '../controllers/candidateWalletsController.js';

const router = Router();

router.get('/candidate-wallets', fetchAllCandidateWallets);
router.post('/candidate-wallets', addCandidateWallet);
router.put('/candidate-wallets/:id', modifyCandidateWallet);
router.delete('/candidate-wallets/:id', removeCandidateWallet);

export default router;
