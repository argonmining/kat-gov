import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
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

const logger = createModuleLogger('electionRoutes');
const router = Router();

// Middleware to log route access
const logRoute = (req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    params: req.params,
  }, 'Route accessed');
  next();
};

router.use(logRoute);

// Election Types
router.get('/types', fetchAllElectionTypes);
router.post('/types', addElectionType);
router.put('/types/:id', modifyElectionType);
router.delete('/types/:id', removeElectionType);

// Election Statuses
router.get('/statuses', fetchAllElectionStatuses);
router.post('/statuses', addElectionStatus);
router.put('/statuses/:id', modifyElectionStatus);
router.delete('/statuses/:id', removeElectionStatus);

// Election Positions
router.get('/positions', fetchAllElectionPositions);
router.post('/positions', addElectionPosition);
router.put('/positions/:id', modifyElectionPosition);
router.delete('/positions/:id', removeElectionPosition);

// Election Candidates
router.get('/candidates', fetchAllElectionCandidates);
router.post('/candidates', submitElectionCandidate);
router.put('/candidates/:id', modifyElectionCandidate);
router.delete('/candidates/:id', removeElectionCandidate);

// Elections
router.post('/', submitElection);
router.get('/', fetchAllElections);
router.delete('/:id', removeElection);

export default router; 