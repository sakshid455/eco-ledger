# Eco Ledger: Technical Project Overview

Eco Ledger is an institutional-grade network built to tokenize real-world land assets and facilitate the verifiable trading of carbon credits. It solves the "Trust Gap" by providing mathematical proof for every ecological claim.

## 1. The Core Vision
The project aims to digitize physical land into liquid assets. Instead of relying on manual trust, the system uses **AI for estimation** and **Cryptography for verification**.

## 2. Step-by-Step Workflow (What Happens)

1.  **Node Enrollment (Identity)**: 
    *   A user joins the network as a Landowner, Investor, Industry, or Admin. 
    *   **Key Generation**: During registration, the system generates an **RSA-4096 Key Pair**. The Private Key is saved locally by the user (non-custodial), and the Public Key is stored in the registry.
2.  **Access (Security)**:
    *   Authentication is secured via salted SHA-256 hashing.
    *   Users access their designated terminal by verifying their unique node identity.
3.  **Asset Registration**: 
    *   Landowners submit property data. The system generates a **SHA-256 Hash** of the property metadata. This creates a "Digital Fingerprint" that is tamper-evident.
4.  **AI Estimation (Genkit)**: 
    *   The system uses AI (Google Gemini via Genkit) to analyze soil types, vegetation, and climate zones to calculate the Carbon Sequestration Potential.
5.  **Institutional Verification**: 
    *   Admin nodes review the registration. If valid, they **sign the asset hash** using their RSA Private Key. This creates an "Immutable Proof of Approval."
6.  **Tokenization**: 
    *   Verified assets are fractionalized into **Investment Tokens (INV)** or **Carbon Credit Tokens (CC)**. 
7.  **Trading & Settlement**: 
    *   Industry nodes (Buyers) acquire Carbon Credits to offset their emissions. 
    *   Transactions are settled with **AES-256 Encryption** to protect financial privacy.
8.  **State Anchoring**: 
    *   Periodically, all network events are bundled into a **Merkle Tree**. The resulting **Merkle Root** is anchored to the global registry, ensuring the history is mathematically immutable.

## 3. Cryptographic Blueprint (The "How" and "Why")

| Algorithm | Role | Why We Use It |
| :--- | :--- | :--- |
| **SHA-256** | **Data Integrity** | To create unique fingerprints for every document and asset. |
| **RSA-4096** | **Authenticity** | To provide non-repudiable digital signatures for approvals and settlements. |
| **AES-256-GCM** | **Confidentiality** | To encrypt sensitive values like "Transaction Price" on the ledger. |
| **Merkle Trees** | **Consensus** | To anchor the state and prove transaction inclusion efficiently. |

## 4. Code Implementation Map

### Core Crypto Engine
*   **Path**: `src/lib/crypto.ts`
*   **What's inside**: The "Engine Room" using the Web Crypto API.

### Authentication Layer
*   **Path**: `src/services/auth-service.ts`
*   **What's inside**: Implements the salted SHA-256 protocol.

### The Ledger Service
*   **Path**: `src/services/ledger-service.ts`
*   **What's inside**: Orchestrates the algorithms, such as signing an asset hash using RSA when an admin approves land.

---
*Created for Project Presentation - Eco Ledger v4.2 Technical Documentation.*
