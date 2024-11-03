
-- Proposal and candidate status tables (base tables without dependencies)
CREATE TABLE proposal_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    simpleVote BOOLEAN DEFAULT TRUE
);

CREATE TABLE proposal_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    active BOOLEAN DEFAULT NULL
);

CREATE TABLE election_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    active BOOLEAN DEFAULT NULL
);

CREATE TABLE election_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    active BOOLEAN DEFAULT NULL
);

CREATE TABLE candidate_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    active BOOLEAN DEFAULT NULL
);

-- Proposal and candidate wallets
CREATE TABLE proposal_wallets (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) UNIQUE,
    encryptedPrivateKey VARCHAR(255) UNIQUE,
    balance NUMERIC,
    timestamp TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE candidate_wallets (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) UNIQUE,
    encryptedPrivateKey VARCHAR(255) UNIQUE,
    balance NUMERIC,
    created TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE
);

-- Main proposal-related tables
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    body TEXT,
    reviewed BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    passed BOOLEAN DEFAULT FALSE,
    votesActive BOOLEAN DEFAULT FALSE,
    openVote TIMESTAMPTZ,
    closeVote TIMESTAMPTZ,
    submitted TIMESTAMPTZ
);

CREATE TABLE proposal_snapshots (
    id SERIAL PRIMARY KEY,
    generated TIMESTAMPTZ,
    data JSONB
);

CREATE TABLE proposal_yes_votes (
    id SERIAL PRIMARY KEY,
    created TIMESTAMPTZ,
    hash VARCHAR(255) UNIQUE,
    toAddress VARCHAR(255),
    amountSent NUMERIC,
    votesCounted INTEGER,
    validVote BOOLEAN DEFAULT NULL
);

CREATE TABLE proposal_no_votes (
    id SERIAL PRIMARY KEY,
    created TIMESTAMPTZ,
    hash VARCHAR(255) UNIQUE,
    toAddress VARCHAR(255),
    amountSent NUMERIC,
    votesCounted INTEGER,
    validVote BOOLEAN DEFAULT NULL
);

CREATE TABLE proposal_nominations (
    id SERIAL PRIMARY KEY,
    created TIMESTAMPTZ,
    hash VARCHAR(255) UNIQUE,
    toAddress VARCHAR(255),
    amountSent NUMERIC,
    validVote BOOLEAN DEFAULT NULL
);

-- Main election-related tables
CREATE TABLE election_positions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    created TIMESTAMPTZ
);

CREATE TABLE election_candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    twitter VARCHAR(255),
    discord VARCHAR(255),
    telegram VARCHAR(255),
    created TIMESTAMPTZ,
    data BYTEA
);

CREATE TABLE election_snapshots (
    id SERIAL PRIMARY KEY,
    generated TIMESTAMPTZ,
    data JSONB
);

CREATE TABLE elections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    reviewed BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    votesActive BOOLEAN DEFAULT FALSE,
    openVote TIMESTAMPTZ,
    closeVote TIMESTAMPTZ,
    created TIMESTAMPTZ
);

CREATE TABLE election_primaries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    reviewed BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    votesActive BOOLEAN DEFAULT FALSE,
    openVote TIMESTAMPTZ,
    closeVote TIMESTAMPTZ,
    created TIMESTAMPTZ
);

-- Candidate-related nominations and votes tables
CREATE TABLE candidate_nominations (
    id SERIAL PRIMARY KEY,
    created TIMESTAMPTZ,
    hash VARCHAR(255) UNIQUE,
    toAddress VARCHAR(255),
    amountSent NUMERIC,
    validVote BOOLEAN DEFAULT NULL
);

CREATE TABLE candidate_votes (
    id SERIAL PRIMARY KEY,
    created TIMESTAMPTZ,
    hash VARCHAR(255) UNIQUE,
    toAddress VARCHAR(255),
    amountSent NUMERIC,
    votesCounted INTEGER,
    validVote BOOLEAN DEFAULT NULL
);

-- Adding foreign key constraints
ALTER TABLE proposals
    ADD COLUMN type INTEGER REFERENCES proposal_types(id),
    ADD COLUMN status INTEGER REFERENCES proposal_statuses(id),
    ADD COLUMN wallet INTEGER REFERENCES proposal_wallets(id),
    ADD COLUMN snapshot INTEGER REFERENCES proposal_snapshots(id),
    ADD COLUMN yes_votes INTEGER REFERENCES proposal_yes_votes(id),
    ADD COLUMN no_votes INTEGER REFERENCES proposal_no_votes(id);

ALTER TABLE proposal_wallets
    ADD COLUMN proposal_id INTEGER REFERENCES proposals(id);

ALTER TABLE proposal_snapshots
    ADD COLUMN proposal_id INTEGER REFERENCES proposals(id);

ALTER TABLE proposal_yes_votes
    ADD COLUMN proposal_id INTEGER REFERENCES proposals(id),
    ADD COLUMN proposal_snapshot_id INTEGER REFERENCES proposal_snapshots(id);

ALTER TABLE proposal_no_votes
    ADD COLUMN proposal_id INTEGER REFERENCES proposals(id),
    ADD COLUMN proposal_snapshot_id INTEGER REFERENCES proposal_snapshots(id);

ALTER TABLE proposal_nominations
    ADD COLUMN proposal_id INTEGER REFERENCES proposals(id);

ALTER TABLE elections
    ADD COLUMN type INTEGER REFERENCES election_types(id),
    ADD COLUMN position INTEGER REFERENCES election_positions(id),
    ADD COLUMN firstCandidate INTEGER REFERENCES election_candidates(id),
    ADD COLUMN secondCandidate INTEGER REFERENCES election_candidates(id),
    ADD COLUMN status INTEGER REFERENCES election_statuses(id),
    ADD COLUMN snapshot INTEGER REFERENCES election_snapshots(id);

ALTER TABLE election_primaries
    ADD COLUMN type INTEGER REFERENCES election_types(id),
    ADD COLUMN position INTEGER REFERENCES election_positions(id),
    ADD COLUMN candidates INTEGER REFERENCES election_candidates(id),
    ADD COLUMN status INTEGER REFERENCES election_statuses(id),
    ADD COLUMN snapshot INTEGER REFERENCES election_snapshots(id);

ALTER TABLE election_candidates
    ADD COLUMN type INTEGER REFERENCES candidate_statuses(id),
    ADD COLUMN status INTEGER REFERENCES candidate_statuses(id),
    ADD COLUMN wallet INTEGER REFERENCES candidate_wallets(id),
    ADD COLUMN nominations INTEGER REFERENCES candidate_nominations(id);

ALTER TABLE candidate_wallets
    ADD COLUMN candidate_id INTEGER REFERENCES election_candidates(id);

ALTER TABLE election_snapshots
    ADD COLUMN proposal_id INTEGER REFERENCES proposals(id);

ALTER TABLE candidate_nominations
    ADD COLUMN candidate_id INTEGER REFERENCES election_candidates(id);

ALTER TABLE candidate_votes
    ADD COLUMN candidate_id INTEGER REFERENCES election_candidates(id),
    ADD COLUMN election_snapshot_id INTEGER REFERENCES election_snapshots(id);

-- Adding indexes for optimization
CREATE INDEX idx_proposals_type ON proposals (type);
CREATE INDEX idx_proposals_status ON proposals (status);
CREATE INDEX idx_proposals_wallet ON proposals (wallet);
CREATE INDEX idx_election_candidates_wallet ON election_candidates (wallet);
CREATE INDEX idx_candidate_votes_candidate_id ON candidate_votes (candidate_id);
