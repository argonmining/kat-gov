import { Router } from 'express';
import {
  // Elections
  submitElection,
  fetchAllElections,
  removeElection,
  // Election Candidates
  submitElectionCandidate,
  fetchAllElectionCandidates,
  modifyElectionCandidate,
  removeElectionCandidate,
  // Election Positions
  fetchAllElectionPositions,
  addElectionPosition,
  modifyElectionPosition,
  removeElectionPosition,
  // Election Statuses
  fetchAllElectionStatuses,
  addElectionStatus,
  modifyElectionStatus,
  removeElectionStatus,
  // Election Types
  fetchAllElectionTypes,
  addElectionType,
  modifyElectionType,
  removeElectionType
} from '../controllers/electionController.js';

const router = Router();

// Elections
router.post('/', submitElection);
router.get('/', fetchAllElections);
router.delete('/:id', removeElection);

// Election Candidates
router.post('/candidates', submitElectionCandidate);
router.get('/candidates', fetchAllElectionCandidates);
router.put('/candidates/:id', modifyElectionCandidate);
router.delete('/candidates/:id', removeElectionCandidate);

// Election Positions
router.post('/positions', addElectionPosition);
router.get('/positions', fetchAllElectionPositions);
router.put('/positions/:id', modifyElectionPosition);
router.delete('/positions/:id', removeElectionPosition);

// Election Statuses
router.post('/statuses', addElectionStatus);
router.get('/statuses', fetchAllElectionStatuses);
router.put('/statuses/:id', modifyElectionStatus);
router.delete('/statuses/:id', removeElectionStatus);

// Election Types
router.post('/types', addElectionType);
router.get('/types', fetchAllElectionTypes);
router.put('/types/:id', modifyElectionType);
router.delete('/types/:id', removeElectionType);

export default router; 