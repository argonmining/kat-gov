import { Router } from 'express';
import { fetchAllProposalSnapshots, addProposalSnapshot, modifyProposalSnapshot, removeProposalSnapshot } from '../controllers/proposalSnapshotsController.js';

const router = Router();

router.get('/proposal-snapshots', fetchAllProposalSnapshots);
router.post('/proposal-snapshots', addProposalSnapshot);
router.put('/proposal-snapshots/:id', modifyProposalSnapshot);
router.delete('/proposal-snapshots/:id', removeProposalSnapshot);

export default router; 