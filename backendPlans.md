# Kat Gov Application Overview

The **Kat Gov** project is an ambitious governance web application designed to facilitate transparent, decentralized decision-making within a blockchain-based community. This platform will allow members to submit proposals, participate in elections, cast votes, and access historical records of governance actions. The entire system operates without requiring users to connect their personal wallets, instead leveraging a unique, secure setup for managing contributions and votes directly on the blockchain.

Kat Gov is built on Bun, TypeScript, Express, and PostgreSQL. It integrates closely with the Kaspa blockchain to provide real-time data for voting processes and proposal submissions, while storing metadata in PostgreSQL for fast, reliable access to historical records.

## Project Objectives

The main goal of Kat Gov is to establish a decentralized, transparent governance system that gives users a direct voice in decisions. The platform is built to embody the values of blockchain—decentralization, transparency, and community empowerment. By allowing users to submit, vote on, and track proposals, Kat Gov provides a structured system for community-driven governance.

## Core Features

1. **Proposal Submission and Voting**:
   - Users can submit proposals across various categories, such as funding, development, or governance.
   - Each proposal has a lifecycle, with stages like nomination, voting, and archival.
   - Voting is conducted by sending tokens to designated addresses (YES/NO), allowing for decentralized participation without wallet connections.
   - A snapshot feature takes account balances at the start of each voting cycle to prevent manipulation.

2. **Elections for Governance Positions**:
   - Users can nominate candidates for specific governance roles, with open positions visible on the application.
   - Voting for candidates is conducted similarly to proposals, with tokens sent to candidate-specific addresses.
   - Results are tallied at the end of the election period and stored for historical reference.
   - Winning candidates are recorded for each position, adding transparency to leadership selection.

3. **Historical Data Access**:
   - The platform stores comprehensive historical data, allowing users to view past proposals, election results, and vote tallies.
   - Users can filter and search through past actions, making the governance process both transparent and accessible.

4. **Automated Token Burning**:
   - At the end of each proposal and election cycle, accumulated tokens are sent to a burn address.
   - This process reduces token supply, adding a deflationary element to the governance process.

5. **Dynamic Address Generation**:
   - The platform dynamically generates addresses for voting, nomination, and election participation.
   - This ensures each cycle is fresh and secure, with new addresses tied to specific events.

## Backend Architecture and Technologies

The backend is structured for modularity and scalability, with distinct layers and components for configuration, database management, business logic, API routes, and external integrations. Here’s an overview of the main components:

- **Configuration Layer**: Manages connection settings for the database and APIs (Kaspa and Kasplex) and loads environment variables securely.
- **Database (PostgreSQL)**: Stores all governance data, including proposals, votes, elections, and historical records. Data is organized into tables with relationships that allow for easy querying and retrieval.
- **Controllers**: Implements business logic for handling incoming requests, such as creating a proposal or recording a vote.
- **Routes**: Maps HTTP routes to controllers, allowing clients to interact with the backend through RESTful endpoints.
- **Services**: Integrates with external systems, like the Kaspa blockchain and Kasplex API, to retrieve blockchain data, create snapshots, and perform token burns.
- **Middleware**: Performs data validation and could potentially handle authorization if needed.

### Key Services and External Integrations

1. **Kaspa and Kasplex API Integration**:
   - The Kaspa and Kasplex APIs provide essential blockchain data, such as balance checks and transaction monitoring.
   - The application will use the Kasplex API for static data retrieval (e.g., checking balances at specific addresses) and the Kaspa WASM framework for more complex operations like creating snapshots.

2. **Snapshot Management**:
   - Snapshots are taken at the start of each voting or election cycle, recording the token balances of participants.
   - Snapshots are essential for vote counting, ensuring that only eligible tokens are counted, based on the snapshot at the beginning of the cycle.

3. **Token Burning Service**:
   - At the end of each cycle, accumulated tokens are sent to a designated burn address.
   - This deflationary mechanism reduces token supply over time, benefiting the remaining token holders.

4. **Dynamic Address Generation**:
   - Voting and nomination addresses are dynamically generated for each proposal and election cycle.
   - This setup prevents address reuse, enhancing the security and transparency of the process.

## Application Workflow

1. **Proposal Submission**:
   - A user submits a proposal through the platform, selecting the proposal category and paying a nominal token submission fee.
   - Once submitted, the proposal enters the nomination phase, requiring additional community support before moving to a vote.

2. **Nomination and Voting**:
   - Community members nominate proposals by sending tokens to specific addresses.
   - When a proposal gains enough support, it moves to the voting phase, where users cast votes (YES or NO) by sending tokens to designated addresses.
   - Votes are recorded and displayed in real time.

3. **Elections**:
   - For governance positions, users can nominate candidates and participate in elections by voting for their preferred candidate.
   - Election results are calculated and stored in the database, providing a permanent record of governance decisions.

4. **Token Burn**:
   - After each voting or election cycle, accumulated tokens are automatically sent to a burn address.
   - This process is transparent, with transaction records available for auditing.

## Goals and Vision

Kat Gov aims to empower its community with a fair, decentralized governance model that avoids reliance on centralized wallet connections or custodial control. By leveraging the Kaspa blockchain, Kat Gov ensures transparency, accountability, and security in all governance processes. The project will not only serve its initial community but will also be available as an open-source solution for other blockchain communities looking to implement similar decentralized governance systems.

The Kat Gov backend is now structured to accommodate each of these goals, and with the setup guide provided, a developer or AI instance should be able to continue building this application to completion.




Project Directory Structure
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


# Kat Gov Backend Development Guide

This document provides detailed step-by-step instructions for completing the backend development of the **Kat Gov** Governance Web Application. The backend is structured using Bun, TypeScript, Express, and PostgreSQL, and it facilitates proposal submissions, voting, election processes, and historical data access.

## Table of Contents
1. **Project Structure Overview**
2. **Configuration Files**
3. **Model Definitions**
4. **Controller Logic**
5. **Route Definitions**
6. **Service Implementations**
7. **Middleware Functions**
8. **Utility Functions**
9. **Database Schema Overview**
10. **Detailed Endpoint Explanations**
11. **Testing and Validation**

---

## 1. Project Structure Overview

The project structure is organized to separate concerns across various folders and files:

- **src/config**: Configuration files like database connection (`db.ts`) and Kaspa/Kasplex API settings (`kaspaAPI.ts`).
- **src/controllers**: Core logic for handling HTTP requests, divided by feature (e.g., `proposalController.ts`, `electionController.ts`).
- **src/middlewares**: Middleware for request validation or authentication (`authMiddleware.ts`, `validationMiddleware.ts`).
- **src/models**: Defines database tables and operations for each table, such as `Proposal.ts` and `Election.ts`.
- **src/routes**: Maps HTTP routes to controllers (e.g., `proposalRoutes.ts`, `electionRoutes.ts`).
- **src/services**: Manages interactions with external APIs or complex operations (`kaspaService.ts`, `snapshotService.ts`).
- **src/utils**: Reusable utility functions for error handling, logging, etc.
- **index.ts**: Application entry point that starts the server.
- **app.ts**: Configures Express application settings and middleware.

---

## 2. Configuration Files

### `db.ts` - Database Connection
Configures and manages the PostgreSQL connection using a connection pool. Loads database credentials from `.env` and exports the pool for use in models.

### `kaspaAPI.ts` - Kaspa/Kasplex API Configurations
Sets up base URLs and credentials for accessing the Kaspa and Kasplex APIs. Provides configuration objects for API interactions, which are imported by services.

---

## 3. Model Definitions

Each model represents a table in PostgreSQL and includes TypeScript interfaces for defining the schema, as well as functions for performing CRUD operations.

### Example Model Structure:
- **Interface Definition**: Defines the structure for each record.
- **CRUD Functions**: Functions for creating, updating, deleting, and retrieving records.
- **Database Queries**: Uses the `pool` instance from `db.ts` to interact with PostgreSQL.

Each model file (e.g., `Proposal.ts`) should export functions for interacting with that specific table, including necessary validations and error handling.

---

## 4. Controller Logic

Controllers handle the main business logic for incoming requests and coordinate between models and responses. Each controller function follows this general structure:

1. **Receive Request Data**: Parse and validate request parameters and body.
2. **Call Model Functions**: Use model functions to interact with the database.
3. **Return Results**: Send JSON responses with success or error messages.

Controllers are organized by feature (e.g., proposals, elections) and are mapped to routes.

---

## 5. Route Definitions

Routes map HTTP methods and URLs to controller functions. Each route file defines the endpoints for a specific feature and imports controllers as handlers.

### Example Route Structure:
- Define each route with the appropriate HTTP method.
- Map routes to controller functions.
- Use validation middleware as needed to ensure request data integrity.

Routes should be concise and only define the URL structure and middleware. All business logic is handled in the controllers.

---

## 6. Service Implementations

Services manage complex or external operations, such as interacting with APIs or handling blockchain tasks.

### `kaspaService.ts` and `kasplexService.ts`
These files handle requests to the Kaspa and Kasplex APIs. Use HTTP requests to retrieve balance, transaction history, or other data from the blockchain.

### `snapshotService.ts`
Manages snapshot creation for account balances at specific times. Uses the Kaspa WASM framework to create snapshots during voting periods and stores snapshots for future reference.

### `addressService.ts`
Generates dynamic addresses for voting and nomination, using private keys from the `.env` file to manage secure address creation.

### `burnService.ts`
Automates the token burning process at the end of each voting cycle, forwarding funds to a burn address. This service is triggered at the end of a proposal or election cycle.

Each service should export functions that can be used in controllers to trigger specific operations.

---

## 7. Middleware Functions

Middleware functions handle tasks such as request validation and, potentially, authentication. 

### `validationMiddleware.ts`
Validates incoming request data to ensure required fields are present and formatted correctly. Middleware should return meaningful error messages if validation fails.

### `authMiddleware.ts` (Optional)
Placeholder for potential authentication logic if the application needs to restrict access to certain endpoints.

---

## 8. Utility Functions

Utility files contain helper functions that are used across the application.

### `logger.ts`
Defines functions for consistent logging of information and errors, including timestamps and log levels (e.g., info, error).

### `errorHandler.ts`
A centralized function to handle errors. Catches errors in controllers or services and returns formatted error responses to the client.

### `formatter.ts`
Includes functions to format data for consistent presentation in responses.

### `validator.ts`
Reusable validation functions for common checks, like valid email format or string length.

Each utility function should be designed for reuse across multiple files and exported for easy import wherever needed.

---

## 9. Database Schema Overview

This backend relies on several key tables in PostgreSQL. Each table has a corresponding model file that defines functions for interacting with it.

- **proposals**: Stores proposal details.
- **proposal_votes**: Stores votes on proposals.
- **elections**: Stores election information.
- **election_votes**: Stores votes for candidates in elections.
- **positions**: Defines available governance positions.
- **candidates**: Stores candidate details for elections.
- **statuses**: Defines status types (e.g., pending, active) for proposals and elections.
- **proposal_types**: Stores types of proposals (e.g., funding, governance).

Each table has an `id` field as the primary key, with foreign keys linking related records. Relationships between tables should be carefully maintained in model functions.

---

## 10. Detailed Endpoint Explanations

Endpoints are divided by feature and organized in the `routes` folder. Each endpoint is associated with a controller function that performs specific tasks.

### Proposal Endpoints (`proposalRoutes.ts`)
- `POST /proposals`: Creates a new proposal.
- `GET /proposals`: Retrieves a list of proposals, with optional filters.
- `GET /proposals/:id`: Retrieves details for a specific proposal.
- `PATCH /proposals/:id/status`: Updates the status of a proposal.
- `POST /proposals/:id/vote`: Submits a vote for a proposal.

### Election Endpoints (`electionRoutes.ts`)
- `POST /elections`: Creates a new election.
- `GET /elections`: Retrieves a list of elections.
- `GET /elections/:id`: Retrieves details for a specific election.
- `PATCH /elections/:id/status`: Updates the status of an election.
- `POST /elections/:id/vote`: Submits a vote for a candidate in an election.

Each endpoint should:
1. Validate data using `validationMiddleware`.
2. Call the appropriate controller function for the business logic.
3. Return structured JSON responses with error handling.

---

## 11. Testing and Validation

Testing is essential for maintaining the stability of the backend.

### Suggested Testing Strategy:
- **Unit Tests**: Test individual functions in models, controllers, and services for correct logic.
- **Integration Tests**: Test API routes and their interactions with controllers and models.
- **Service Tests**: Ensure that services return expected results from external APIs (e.g., Kaspa and Kasplex APIs).

Each test should be designed to confirm that data is processed correctly and error handling functions as expected.

---

This guide provides all necessary instructions and detailed logic for building and completing the backend of the Kat Gov application. With these instructions, a developer or AI tool should be able to implement each component successfully.
