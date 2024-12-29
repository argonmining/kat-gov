# Kaspa Governance Voting System

## Overview
The Kaspa Governance voting system uses a harmonious combination of mathematical principles inspired by both quadratic voting and musical mathematics. This creates a fair and democratic system that gives meaningful voice to all token holders while preventing any single entity from having overwhelming influence.

## How Votes Are Calculated

### Basic Principles
- Minimum voting amount: Configurable (default 0.1 tokens)
- Your voting power increases as you commit more tokens, but at a decreasing rate
- The system uses musical octaves and mathematical dampening to create fair voting power
- Maximum effective voting amount: Configurable (default 100,000 tokens)

### Vote Power Levels
Your vote power falls into musical categories that scale dynamically with the maximum vote limit:
- Piano: Up to 5% of maximum vote power
- Mezzo-Piano: 5-15% of maximum vote power
- Mezzo-Forte: 15-35% of maximum vote power
- Forte: 35-70% of maximum vote power
- Fortissimo: 70-100% of maximum vote power

### Examples
With default settings (0.1 min, 100,000 max), here's how votes scale:
```
0.1 tokens    → 1 vote         (Piano)
1 tokens      → 4.6 votes      (Piano)
10 tokens     → 22.3 votes     (Mezzo-Piano)
100 tokens    → 109 votes      (Mezzo-Forte)
1,000 tokens  → 537 votes      (Forte)
10,000 tokens → 2,651 votes    (Forte)
100,000 tokens → 13,076 votes  (Fortissimo)
```

### Anti-Whale Protection
- Voting power increases more slowly as you commit more tokens
- Maximum effective voting amount is configurable per project
- Committing more than the maximum doesn't increase voting power
- Snapshot validation ensures tokens were held at proposal creation
- Square root scaling ensures diminishing returns on large token commitments

### Musical Connection
Like Kaspa's musical themes, our voting system uses mathematical principles from music:
- Each doubling of tokens (octave) provides a harmonious increase in voting power
- Vote power categories follow musical dynamics (Piano to Fortissimo)
- The system creates a natural, harmonious progression of voting power
- Power levels scale dynamically with the maximum vote limit

### Important Notes
1. Your wallet must have held the tokens at the time of the proposal snapshot
2. Each vote requires a transaction to the voting contract
3. Vote calculations are final and executed on-chain
4. You can vote with any amount above the configured minimum
5. Vote power levels adjust automatically based on the configured maximum

## Technical Details
The voting power calculation combines musical octaves with power scaling:
1. Calculates musical octaves from your token amount
2. Applies a 2/3 power scaling for fairness
3. Incorporates semitone ratios for harmonic progression
4. Caps at the configured maximum effective voting power
5. Dynamically adjusts power level thresholds based on the maximum

This creates a system that is both mathematically fair and musically harmonious, while remaining flexible enough to accommodate different token economies through configurable limits. 