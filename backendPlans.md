1. Project Directory Structure
Given that we’re using Bun, TypeScript, and Express, a modular structure will keep code maintainable. Here’s a proposed directory structure:
kat-gov-backend/
├── src/
│   ├── config/                  # Configuration files (e.g., database, API keys)
│   │   ├── db.ts
│   │   └── kaspaAPI.ts
│   ├── controllers/             # Business logic for endpoints
│   ├── middlewares/             # Middleware functions
│   ├── models/                  # Database models/schemas
│   ├── routes/                  # API routes
│   ├── services/                # External service integrations (Kasplex, Kaspa API, WASM)
│   ├── utils/                   # Helper functions
│   ├── index.ts                 # Application entry point
│   └── app.ts                   # Express app configuration
├── .env                         # Environment variables
├── tsconfig.json                # TypeScript configuration
└── bun.lockb                    # Bun package lockfile

2. Database Schema (PostgreSQL)
Here’s a refined look at each table based on your example, with notes on relationships where relevant:
Table: proposal_types
Defines types for proposals (e.g., Funding, Development).
id: Primary Key, auto-increment
name: Type of proposal, short text
simple: Boolean (true if simple type)
Table: positions
Defines positions for elections, some being electable.
id: Primary Key, auto-increment
title: Text
filled: Boolean
elect: Boolean
incumbent: Foreign Key, referencing candidates.id
Table: statuses
Defines possible statuses for proposals and elections.
id: Primary Key, auto-increment
name: Short text (e.g., Pending, Approved)
active: Boolean
Table: proposals
Contains core proposal data.
id: Primary Key, auto-increment
title: Short text
subtitle: Short text
body: HTML/text
type: Foreign Key, referencing proposal_types.id
approved: Boolean
reviewed: Boolean
status: Foreign Key, referencing statuses.id
votes: Array of Foreign Keys, referencing proposal_votes.id
submitdate: Timestamp
openvote: Timestamp
snapshot: Timestamp
closevote: Timestamp
Table: proposal_votes
Records individual votes for proposals.
id: Primary Key, auto-increment
amt: Decimal
hash: Text
approve: Boolean
valid: Boolean
proposal: Foreign Key, referencing proposals.id
submitdate: Timestamp
Table: proposal_nominations
Records nomination transactions for proposals.
id: Primary Key, auto-increment
amt: Decimal
hash: Text
approve: Boolean
valid: Boolean
proposal: Foreign Key, referencing proposals.id
submitdate: Timestamp
Table: elections
Tracks election details and statuses.
id: Primary Key, auto-increment
title: Short text
candidates: Array of Foreign Keys, referencing candidates.id
position: Foreign Key, referencing positions.id
votes: Array of Foreign Keys, referencing election_votes.id
status: Foreign Key, referencing statuses.id
submitdate: Timestamp
openvote: Timestamp
snapshot: Timestamp
closevote: Timestamp
winner: Foreign Key, referencing candidates.id
Table: election_votes
Logs votes for election candidates.
id: Primary Key, auto-increment
amt: Decimal
candidate: Foreign Key, referencing candidates.id
position: Foreign Key, referencing positions.id
election: Foreign Key, referencing elections.id
valid: Boolean
hash: Text
submitdate: Timestamp
Table: candidate_nominations
Logs nominations for election candidates.
id: Primary Key, auto-increment
amt: Decimal
hash: Text
approved: Boolean
valid: Boolean
candidate: Foreign Key, referencing candidates.id
election: Foreign Key, referencing elections.id
position: Foreign Key, referencing positions.id
submitdate: Timestamp
3. API Endpoints
Here’s a proposed initial list of endpoints for the backend:
Proposals:
POST /proposals - Submit a new proposal.
GET /proposals - Retrieve a list of proposals with filtering options.
GET /proposals/:id - Retrieve a specific proposal’s details.
PATCH /proposals/:id/status - Update the status of a proposal.
POST /proposals/:id/vote - Submit a vote for a proposal.
Nominations:
POST /proposals/:id/nominate - Nominate a proposal.
Elections:
POST /elections - Submit a new election.
GET /elections - Retrieve a list of elections with filtering options.
GET /elections/:id - Retrieve details of a specific election.
PATCH /elections/:id/status - Update the status of an election.
POST /elections/:id/vote - Submit a vote for an election.
Candidates:
POST /candidates - Add a candidate.
GET /candidates - Retrieve a list of candidates.
GET /candidates/:id - Retrieve candidate details.
Snapshots:
POST /snapshots - Trigger a snapshot for an active election/proposal period.
Historical Data:
GET /history/proposals - Retrieve historical proposal data.
GET /history/elections - Retrieve historical election data.
4. Blockchain Integration Service
Since blockchain operations will be separate, here’s how we might structure this component:
Services:
kaspaService.ts: Handles API requests to Kaspa for balance checks, transaction monitoring, and snapshots.
kasplexService.ts: Handles API requests to Kaspa for balance checks, transaction monitoring, and snapshots.
snapshotService.ts: Manages snapshot creation via the Kaspa WASM framework.
addressService.ts: Dynamically generates addresses for voting and nomination.
burnService.ts: Automates TOKEN burn transactions at the end of each cycle.



1. WebSocket vs. HTTP Requests
Since Kasplex doesn't support WebSockets and the Kaspa WASM does, we can optimize by primarily using HTTP requests. Here’s why:
HTTP for Snapshot and Balance Retrieval: With page-load-based balance/status updates, HTTP calls are more manageable and efficient, reducing complexity.
WebSocket Integration for WASM: We can reserve WebSockets for real-time operations only where strictly necessary, such as snapshot generation or dynamic balance monitoring during active voting windows.
Suggested Approach:
Kasplex Services: Use HTTP for balance checking and transaction monitoring.
Kaspa WASM: Implement WebSocket streams selectively within snapshotService.ts to capture balance changes or trigger snapshot updates when a transaction impacts an active proposal or election.
2. Snapshot Challenges
Since the snapshot process will likely need customization, we’ll need both blockchain-specific functions and caching mechanisms for data integrity. Here's an approach for handling this:
Real-time Snapshot Functionality:
Use Kaspa WASM to capture address balances at specific times.
Save each snapshot with an ID that links it to proposals or elections for later access.
Snapshot Caching Strategy:
Cache snapshot data to reduce repeated blockchain calls, ensuring quick access to historical data during vote counting.
Once we have a clearer sense of Kaspa WASM's snapshot capabilities, we can refine this section further.
3. Environment Configuration (.env Setup)
For security and customizability, here’s a proposed setup for .env placeholders:
# Database Configurations
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password

# Kaspa and Kasplex Configurations
KASPA_API_BASE_URL=https://kaspa.api.endpoint
KASPLEX_API_BASE_URL=https://kasplex.api.endpoint
KASPA_WASM_RESOLVER=your_wasm_resolver

# Snapshot Service Private Keys
SNAPSHOT_SERVICE_PRIVATE_KEY=your_private_key
DYNAMIC_ADDRESS_PRIVATE_KEY=your_dynamic_address_key

# Other Configurations
PORT=8080
