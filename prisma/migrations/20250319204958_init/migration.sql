-- CreateTable
CREATE TABLE "candidate_nominations" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMPTZ(6),
    "hash" VARCHAR(255),
    "toaddress" VARCHAR(255),
    "amountsent" DECIMAL,
    "validvote" BOOLEAN,
    "candidate_id" INTEGER,

    CONSTRAINT "candidate_nominations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_statuses" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "active" BOOLEAN,

    CONSTRAINT "candidate_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_votes" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMPTZ(6),
    "hash" VARCHAR(255),
    "toaddress" VARCHAR(255),
    "amountsent" DECIMAL,
    "votescounted" INTEGER,
    "validvote" BOOLEAN,
    "candidate_id" INTEGER,
    "election_snapshot_id" INTEGER,

    CONSTRAINT "candidate_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_wallets" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(255),
    "encryptedprivatekey" VARCHAR(255),
    "balance" DECIMAL,
    "created" TIMESTAMPTZ(6),
    "active" BOOLEAN DEFAULT true,
    "candidate_id" INTEGER,

    CONSTRAINT "candidate_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_candidates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "twitter" VARCHAR(255),
    "discord" VARCHAR(255),
    "telegram" VARCHAR(255),
    "created" TIMESTAMPTZ(6),
    "data" BYTEA,
    "type" INTEGER,
    "status" INTEGER,
    "wallet" INTEGER,
    "nominations" INTEGER,

    CONSTRAINT "election_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_positions" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "created" TIMESTAMPTZ(6),

    CONSTRAINT "election_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_primaries" (
    "id" SERIAL NOT NULL,
    "election_id" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "reviewed" BOOLEAN DEFAULT false,
    "approved" BOOLEAN DEFAULT false,
    "votesactive" BOOLEAN DEFAULT false,
    "openvote" TIMESTAMPTZ(6),
    "closevote" TIMESTAMPTZ(6),
    "created" TIMESTAMPTZ(6),
    "type" INTEGER,
    "position" INTEGER,
    "status" INTEGER,
    "snapshot" INTEGER,

    CONSTRAINT "election_primaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_snapshots" (
    "id" SERIAL NOT NULL,
    "generated" TIMESTAMPTZ(6),
    "data" JSONB,
    "proposal_id" INTEGER,

    CONSTRAINT "election_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_statuses" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "active" BOOLEAN,

    CONSTRAINT "election_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "active" BOOLEAN,

    CONSTRAINT "election_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elections" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "reviewed" BOOLEAN DEFAULT false,
    "approved" BOOLEAN DEFAULT false,
    "votesactive" BOOLEAN DEFAULT false,
    "openvote" TIMESTAMPTZ(6),
    "closevote" TIMESTAMPTZ(6),
    "created" TIMESTAMPTZ(6),
    "type" INTEGER,
    "position" INTEGER,
    "firstcandidate" INTEGER,
    "secondcandidate" INTEGER,
    "status" INTEGER,
    "snapshot" INTEGER,

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_no_votes" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMPTZ(6),
    "hash" VARCHAR(255),
    "toaddress" VARCHAR(255),
    "fromaddress" VARCHAR(255),
    "amountsent" DECIMAL,
    "votescounted" INTEGER,
    "validvote" BOOLEAN,
    "proposal_id" INTEGER,
    "proposal_snapshot_id" INTEGER,

    CONSTRAINT "proposal_no_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_nominations" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMPTZ(6),
    "hash" VARCHAR(255),
    "toaddress" VARCHAR(255),
    "fromaddress" VARCHAR(255),
    "amountsent" DECIMAL,
    "validvote" BOOLEAN,
    "proposal_id" INTEGER,

    CONSTRAINT "proposal_nominations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_snapshots" (
    "id" SERIAL NOT NULL,
    "generated" TIMESTAMPTZ(6),
    "data" JSONB,
    "proposal_id" INTEGER,

    CONSTRAINT "proposal_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_statuses" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "active" BOOLEAN,

    CONSTRAINT "proposal_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "simplevote" BOOLEAN DEFAULT true,

    CONSTRAINT "proposal_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_wallets" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(255),
    "encryptedprivatekey" VARCHAR(255),
    "balance" DECIMAL,
    "timestamp" TIMESTAMPTZ(6),
    "active" BOOLEAN DEFAULT true,
    "proposal_id" INTEGER,

    CONSTRAINT "proposal_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_yes_votes" (
    "id" SERIAL NOT NULL,
    "created" TIMESTAMPTZ(6),
    "hash" VARCHAR(255),
    "toaddress" VARCHAR(255),
    "fromaddress" VARCHAR(255),
    "amountsent" DECIMAL,
    "votescounted" INTEGER,
    "validvote" BOOLEAN,
    "proposal_id" INTEGER,
    "proposal_snapshot_id" INTEGER,

    CONSTRAINT "proposal_yes_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "body" TEXT,
    "reviewed" BOOLEAN DEFAULT false,
    "approved" BOOLEAN DEFAULT false,
    "passed" BOOLEAN DEFAULT false,
    "votesactive" BOOLEAN DEFAULT false,
    "openvote" TIMESTAMPTZ(6),
    "closevote" TIMESTAMPTZ(6),
    "submitted" TIMESTAMPTZ(6),
    "type" INTEGER,
    "status" INTEGER,
    "wallet" INTEGER,
    "snapshot" INTEGER,
    "yes_votes" INTEGER,
    "no_votes" INTEGER,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_votes" (
    "id" SERIAL NOT NULL,
    "election_id" INTEGER NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "toaddress" VARCHAR(255) NOT NULL,
    "amountsent" DECIMAL NOT NULL,
    "created" TIMESTAMPTZ(6) NOT NULL,
    "validvote" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "election_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_transactions" (
    "id" SERIAL NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "ticker" VARCHAR(255) NOT NULL,
    "amount" DECIMAL,
    "created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "treasury_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__election_candidatesToelection_primaries" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "__election_candidatesToelection_primaries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_nominations_hash_key" ON "candidate_nominations"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_statuses_name_key" ON "candidate_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_votes_hash_key" ON "candidate_votes"("hash");

-- CreateIndex
CREATE INDEX "idx_candidate_votes_candidate_id" ON "candidate_votes"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_wallets_address_key" ON "candidate_wallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_wallets_encryptedprivatekey_key" ON "candidate_wallets"("encryptedprivatekey");

-- CreateIndex
CREATE INDEX "idx_election_candidates_wallet" ON "election_candidates"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "election_primaries_election_id_key" ON "election_primaries"("election_id");

-- CreateIndex
CREATE UNIQUE INDEX "election_statuses_name_key" ON "election_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "election_types_name_key" ON "election_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_no_votes_hash_key" ON "proposal_no_votes"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_no_votes_fromaddress_proposal_id_key" ON "proposal_no_votes"("fromaddress", "proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_nominations_hash_key" ON "proposal_nominations"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_nominations_fromaddress_proposal_id_key" ON "proposal_nominations"("fromaddress", "proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_statuses_name_key" ON "proposal_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_types_name_key" ON "proposal_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_wallets_address_key" ON "proposal_wallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_wallets_encryptedprivatekey_key" ON "proposal_wallets"("encryptedprivatekey");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_yes_votes_hash_key" ON "proposal_yes_votes"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_yes_votes_fromaddress_proposal_id_key" ON "proposal_yes_votes"("fromaddress", "proposal_id");

-- CreateIndex
CREATE INDEX "idx_proposals_status" ON "proposals"("status");

-- CreateIndex
CREATE INDEX "idx_proposals_type" ON "proposals"("type");

-- CreateIndex
CREATE INDEX "idx_proposals_wallet" ON "proposals"("wallet");

-- CreateIndex
CREATE INDEX "idx_election_votes_election_id" ON "election_votes"("election_id");

-- CreateIndex
CREATE INDEX "idx_election_votes_candidate_id" ON "election_votes"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "treasury_transactions_hash_key" ON "treasury_transactions"("hash");

-- CreateIndex
CREATE INDEX "idx_treasury_transactions_hash" ON "treasury_transactions"("hash");

-- CreateIndex
CREATE INDEX "idx_treasury_transactions_type" ON "treasury_transactions"("type");

-- CreateIndex
CREATE INDEX "idx_treasury_transactions_ticker" ON "treasury_transactions"("ticker");

-- CreateIndex
CREATE INDEX "idx_treasury_transactions_type_ticker" ON "treasury_transactions"("type", "ticker");

-- CreateIndex
CREATE INDEX "__election_candidatesToelection_primaries_B_index" ON "__election_candidatesToelection_primaries"("B");

-- AddForeignKey
ALTER TABLE "candidate_nominations" ADD CONSTRAINT "candidate_nominations_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "election_candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "candidate_votes" ADD CONSTRAINT "candidate_votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "election_candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "candidate_votes" ADD CONSTRAINT "candidate_votes_election_snapshot_id_fkey" FOREIGN KEY ("election_snapshot_id") REFERENCES "election_snapshots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "candidate_wallets" ADD CONSTRAINT "candidate_wallets_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "election_candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_nominations_fkey" FOREIGN KEY ("nominations") REFERENCES "candidate_nominations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_status_fkey" FOREIGN KEY ("status") REFERENCES "candidate_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_type_fkey" FOREIGN KEY ("type") REFERENCES "candidate_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_wallet_fkey" FOREIGN KEY ("wallet") REFERENCES "candidate_wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_primaries" ADD CONSTRAINT "election_primaries_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_primaries" ADD CONSTRAINT "election_primaries_position_fkey" FOREIGN KEY ("position") REFERENCES "election_positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_primaries" ADD CONSTRAINT "election_primaries_snapshot_fkey" FOREIGN KEY ("snapshot") REFERENCES "election_snapshots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_primaries" ADD CONSTRAINT "election_primaries_status_fkey" FOREIGN KEY ("status") REFERENCES "election_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_primaries" ADD CONSTRAINT "election_primaries_type_fkey" FOREIGN KEY ("type") REFERENCES "election_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_snapshots" ADD CONSTRAINT "election_snapshots_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_firstcandidate_fkey" FOREIGN KEY ("firstcandidate") REFERENCES "election_candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_position_fkey" FOREIGN KEY ("position") REFERENCES "election_positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_secondcandidate_fkey" FOREIGN KEY ("secondcandidate") REFERENCES "election_candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_snapshot_fkey" FOREIGN KEY ("snapshot") REFERENCES "election_snapshots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_status_fkey" FOREIGN KEY ("status") REFERENCES "election_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_type_fkey" FOREIGN KEY ("type") REFERENCES "election_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposal_no_votes" ADD CONSTRAINT "proposal_no_votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposal_no_votes" ADD CONSTRAINT "proposal_no_votes_proposal_snapshot_id_fkey" FOREIGN KEY ("proposal_snapshot_id") REFERENCES "proposal_snapshots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposal_nominations" ADD CONSTRAINT "proposal_nominations_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposal_snapshots" ADD CONSTRAINT "proposal_snapshots_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposal_wallets" ADD CONSTRAINT "proposal_wallets_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposal_yes_votes" ADD CONSTRAINT "proposal_yes_votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposal_yes_votes" ADD CONSTRAINT "proposal_yes_votes_proposal_snapshot_id_fkey" FOREIGN KEY ("proposal_snapshot_id") REFERENCES "proposal_snapshots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_no_votes_fkey" FOREIGN KEY ("no_votes") REFERENCES "proposal_no_votes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_snapshot_fkey" FOREIGN KEY ("snapshot") REFERENCES "proposal_snapshots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_status_fkey" FOREIGN KEY ("status") REFERENCES "proposal_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_type_fkey" FOREIGN KEY ("type") REFERENCES "proposal_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_wallet_fkey" FOREIGN KEY ("wallet") REFERENCES "proposal_wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_yes_votes_fkey" FOREIGN KEY ("yes_votes") REFERENCES "proposal_yes_votes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_votes" ADD CONSTRAINT "election_votes_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "election_votes" ADD CONSTRAINT "election_votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "election_candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "__election_candidatesToelection_primaries" ADD CONSTRAINT "__election_candidatesToelection_primaries_A_fkey" FOREIGN KEY ("A") REFERENCES "election_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__election_candidatesToelection_primaries" ADD CONSTRAINT "__election_candidatesToelection_primaries_B_fkey" FOREIGN KEY ("B") REFERENCES "election_primaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
