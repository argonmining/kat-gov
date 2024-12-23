# API Endpoint Changes Documentation

This document outlines the changes made to API endpoints as part of the consolidation effort to better organize endpoints under their respective resource paths.

## Proposal Endpoints
All proposal-related endpoints are now under `/api/proposals/`

| Old Endpoint | New Endpoint |
|-------------|--------------|
| `/api/statuses` | `/api/proposals/statuses` |
| `/api/types` | `/api/proposals/types` |
| `/api/snapshots` | `/api/proposals/snapshots` |
| `/api/votes` | `/api/proposals/votes` |
| `/api/yes-votes` | `/api/proposals/yes-votes` |
| `/api/no-votes` | `/api/proposals/no-votes` |
| `/api/nominations` | `/api/proposals/nominations` |

## Election Endpoints
All election-related endpoints are now under `/api/elections/`

| Old Endpoint | New Endpoint |
|-------------|--------------|
| `/api/statuses` | `/api/elections/statuses` |
| `/api/types` | `/api/elections/types` |
| `/api/positions` | `/api/elections/positions` |
| `/api/candidates` | `/api/elections/candidates` |

## Candidate Endpoints
All candidate-related endpoints are now under `/api/candidates/`

| Old Endpoint | New Endpoint |
|-------------|--------------|
| `/api/wallets` | `/api/candidates/wallets` |
| `/api/votes` | `/api/candidates/votes` |
| `/api/nominations` | `/api/candidates/nominations` |

## Unchanged Root-Level Endpoints
The following endpoints remain at the root `/api/` level:

- `/api/burnkrc20`
- `/api/burnkaspa`
- `/api/returnkaspa`
- `/api/dropkasgas`
- `/api/burnyeswallet`
- `/api/burnnowallet`
- `/api/nominationFee`
- `/api/verifyNominationTransaction` 