# Database Structure Overview

The database for the Kat Gov application is structured to support a DAO Governance platform. It consists of several tables that store both static and dynamic data. The static tables provide foundational data that other tables rely on for storing ongoing data.

## Key Tables and Their Purpose

### 1. `proposal_types`
- **Purpose**: Defines the types of proposals that can be submitted.
- **Columns**:
  - `id`: Primary key.
  - `name`: Name of the proposal type.
  - `simpleVote`: Boolean indicating if the proposal type uses a simple voting mechanism.

### 2. `proposal_statuses`
- **Purpose**: Tracks the status of proposals throughout their lifecycle.
- **Columns**:
  - `id`: Primary key.
  - `name`: Status name.
  - `active`: Boolean indicating if the status is currently active.

### 3. `election_types`
- **Purpose**: Defines the types of elections that can be held.
- **Columns**:
  - `id`: Primary key.
  - `name`: Name of the election type.
  - `active`: Boolean indicating if the election type is currently active.

### 4. `election_statuses`
- **Purpose**: Tracks the status of elections throughout their lifecycle.
- **Columns**:
  - `id`: Primary key.
  - `name`: Status name.
  - `active`: Boolean indicating if the status is currently active.

### 5. `candidate_statuses`
- **Purpose**: Tracks the status of candidates throughout the election process.
- **Columns**:
  - `id`: Primary key.
  - `name`: Status name.
  - `active`: Boolean indicating if the status is currently active.

### 6. `election_positions`
- **Purpose**: Defines the positions available in elections.
- **Columns**:
  - `id`: Primary key.
  - `title`: Title of the position.
  - `description`: Description of the position.
  - `created`: Timestamp of when the position was created.

## Pre-Added Static Data

### `proposal_types`
- DRAFT, Funding, Development, Governance

### `proposal_statuses`
- Draft, Submitted, Under Review, Open for Nomination, Pending Vote, Voting Open, Voting Closed, Approved, Rejected, Archived

### `election_types`
- DRAFT, General, Primary, Special

### `election_statuses`
- Draft, Under Review, Open for Nominations, Pending Vote, Voting Open, Voting Closed, Archived

### `candidate_statuses`
- Draft, Submitted, Under Review, Open for Nomination, Primary Qualified, General Qualified, Elected, Rejected

### `election_positions`
- Treasurer 1, Treasurer 2, Treasurer 3, Treasurer 4, Treasurer 5, Manager 1, Manager 2, Funding Lead, Development Lead, Marketing Lead

## Terminal Commands for Setting up the Database with Static Data

-- Database Setup
```bash
sudo -i -u postgres
psql -d katgov
\i katgov_schema.sql
```
To insert the static data into a fresh version of the database, use the following commands: 

-- Proposal Types
```bash
INSERT INTO proposal_types (name, simpleVote) VALUES ('DRAFT', true);
INSERT INTO proposal_types (name, simpleVote) VALUES ('Funding', true);
INSERT INTO proposal_types (name, simpleVote) VALUES ('Development', true);
INSERT INTO proposal_types (name, simpleVote) VALUES ('Governance', false);
```

-- Proposal Statuses
```bash
INSERT INTO proposal_statuses (name, active) VALUES ('Draft', false);
INSERT INTO proposal_statuses (name, active) VALUES ('Submitted', false);
INSERT INTO proposal_statuses (name, active) VALUES ('Under Review', false);
INSERT INTO proposal_statuses (name, active) VALUES ('Open for Nomination', true);
INSERT INTO proposal_statuses (name, active) VALUES ('Pending Vote', true);
INSERT INTO proposal_statuses (name, active) VALUES ('Voting Open', true);
INSERT INTO proposal_statuses (name, active) VALUES ('Voting Closed', true);
INSERT INTO proposal_statuses (name, active) VALUES ('Approved', true);
INSERT INTO proposal_statuses (name, active) VALUES ('Rejected', true);
INSERT INTO proposal_statuses (name, active) VALUES ('Archived', false);
```

-- Election Types
```bash
INSERT INTO election_types (name, active) VALUES ('DRAFT', false);
INSERT INTO election_types (name, active) VALUES ('General', true);
INSERT INTO election_types (name, active) VALUES ('Primary', true);
INSERT INTO election_types (name, active) VALUES ('Special', true);
```

-- Election Statuses
```bash
INSERT INTO election_statuses (name, active) VALUES ('Draft', false);
INSERT INTO election_statuses (name, active) VALUES ('Under Review', false);
INSERT INTO election_statuses (name, active) VALUES ('Open for Nominations', true);
INSERT INTO election_statuses (name, active) VALUES ('Pending Vote', true);
INSERT INTO election_statuses (name, active) VALUES ('Voting Open', true);
INSERT INTO election_statuses (name, active) VALUES ('Voting Closed', true);
INSERT INTO election_statuses (name, active) VALUES ('Archived', false);
```

-- Candidate Statuses
```bash
INSERT INTO candidate_statuses (name, active) VALUES ('Draft', false);
INSERT INTO candidate_statuses (name, active) VALUES ('Submitted', false);
INSERT INTO candidate_statuses (name, active) VALUES ('Under Review', false);
INSERT INTO candidate_statuses (name, active) VALUES ('Open for Nomination', true);
INSERT INTO candidate_statuses (name, active) VALUES ('Primary Qualified', true);
INSERT INTO candidate_statuses (name, active) VALUES ('General Qualified', true);
INSERT INTO candidate_statuses (name, active) VALUES ('Elected', true);
INSERT INTO candidate_statuses (name, active) VALUES ('Rejected', false);
```

-- Election Positions
```bash
INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 1', 'TBA', NOW());
INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 2', 'TBA', NOW());
INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 3', 'TBA', NOW());
INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 4', 'TBA', NOW());
INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 5', 'TBA', NOW());
INSERT INTO election_positions (title, description, created) VALUES ('Manager 1', 'TBA', NOW());
INSERT INTO election_positions (title, description, created) VALUES ('Manager 2', 'TBA', NOW());
INSERT INTO election_positions (title, description, created) VALUES ('Funding Lead', 'TBA', NOW());
INSERT INTO election_positions (title, description, created) VALUES ('Development Lead', 'TBA', NOW());
INSERT INTO election_positions (title, description, created) VALUES ('Marketing Lead', 'TBA', NOW());
```

This document provides a clear understanding of the static data and its role in the database, ensuring that anyone working with the application can easily set up and understand the foundational elements.