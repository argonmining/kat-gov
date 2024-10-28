-- Table: candidates
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position INTEGER REFERENCES positions(id), -- Added position reference
    election INTEGER REFERENCES elections(id)  -- Added election reference
);

-- Table: proposal_types
CREATE TABLE proposal_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    simple BOOLEAN DEFAULT FALSE
);

-- Table: positions
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    filled BOOLEAN DEFAULT FALSE,
    elect BOOLEAN DEFAULT FALSE,
    incumbent INTEGER REFERENCES candidates(id)
);

-- Table: statuses
CREATE TABLE statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Table: proposals
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    body TEXT,
    type INTEGER REFERENCES proposal_types(id),
    approved BOOLEAN DEFAULT FALSE,
    reviewed BOOLEAN DEFAULT FALSE,
    status INTEGER REFERENCES statuses(id),
    submitdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    openvote TIMESTAMP,
    snapshot TIMESTAMP,
    closevote TIMESTAMP,
    dynamic_wallet_id INTEGER REFERENCES dynamic_wallets(id) ON DELETE SET NULL -- New reference for dynamic wallet
);

-- Table: proposal_votes
CREATE TABLE proposal_votes (
    id SERIAL PRIMARY KEY,
    amt DECIMAL NOT NULL,
    hash TEXT NOT NULL,
    approve BOOLEAN,
    valid BOOLEAN DEFAULT TRUE,
    proposal INTEGER REFERENCES proposals(id),
    submitdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_id TEXT UNIQUE -- New transaction tracking field
);

-- Table: proposal_nominations
CREATE TABLE proposal_nominations (
    id SERIAL PRIMARY KEY,
    amt DECIMAL NOT NULL,
    hash TEXT NOT NULL,
    approve BOOLEAN,
    valid BOOLEAN DEFAULT TRUE,
    proposal INTEGER REFERENCES proposals(id),
    submitdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: elections
CREATE TABLE elections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    position INTEGER REFERENCES positions(id),
    status INTEGER REFERENCES statuses(id),
    submitdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    openvote TIMESTAMP,
    snapshot TIMESTAMP,
    closevote TIMESTAMP,
    winner INTEGER REFERENCES candidates(id),
    dynamic_wallet_id INTEGER REFERENCES dynamic_wallets(id) ON DELETE SET NULL -- New reference for dynamic wallet
);

-- Table: election_votes
CREATE TABLE election_votes (
    id SERIAL PRIMARY KEY,
    amt DECIMAL NOT NULL,
    candidate INTEGER REFERENCES candidates(id),
    position INTEGER REFERENCES positions(id),
    election INTEGER REFERENCES elections(id),
    valid BOOLEAN DEFAULT TRUE,
    hash TEXT NOT NULL,
    submitdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_id TEXT UNIQUE -- New transaction tracking field
);

-- Table: candidate_nominations
CREATE TABLE candidate_nominations (
    id SERIAL PRIMARY KEY,
    amt DECIMAL NOT NULL,
    hash TEXT NOT NULL,
    approved BOOLEAN,
    valid BOOLEAN DEFAULT TRUE,
    candidate INTEGER REFERENCES candidates(id),
    election INTEGER REFERENCES elections(id),
    position INTEGER REFERENCES positions(id),
    submitdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: dynamic_wallets
CREATE TABLE dynamic_wallets (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    encrypted_private_key TEXT NOT NULL,
    proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
    election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);