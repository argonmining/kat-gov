-- Table: candidates
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
    -- Add other necessary fields here
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
    closevote TIMESTAMP
);

-- Table: proposal_votes
CREATE TABLE proposal_votes (
    id SERIAL PRIMARY KEY,
    amt DECIMAL NOT NULL,
    hash TEXT NOT NULL,
    approve BOOLEAN,
    valid BOOLEAN DEFAULT TRUE,
    proposal INTEGER REFERENCES proposals(id),
    submitdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    winner INTEGER REFERENCES candidates(id)
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
    submitdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
