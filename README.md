# 🌱 Eco Ledger – Overview

Eco Ledger is a platform that **tokenizes land assets** and enables **secure carbon credit trading** using AI and cryptography.

---

## 🚀 Workflow (How it works)

1. **User Registration**  
   Users join as Landowners, Investors, or Admins.  
   RSA-4096 keys are generated for identity.

2. **Secure Access**  
   Login uses salted SHA-256 hashing.

3. **Land Registration**  
   Property data is hashed (SHA-256) to create a secure digital fingerprint.

4. **AI Estimation**  
   AI (Google Gemini via Genkit) estimates carbon potential.

5. **Verification**  
   Admin signs asset using RSA → proof of approval.

6. **Tokenization**  
   Assets become:
   - Investment Tokens (INV)
   - Carbon Credits (CC)

7. **Trading**  
   Transactions are secured using AES-256 encryption.

8. **Blockchain Integrity**  
   Data is stored using Merkle Trees for immutability.

---

## 🔐 Cryptographic Stack

- **SHA-256** → Data integrity  
- **RSA-4096** → Digital signatures  
- **AES-256** → Secure transactions  
- **Merkle Trees** → Data verification  

---

## 📁 Key Code Areas

- `src/lib/crypto.ts` → Core cryptography  
- `src/services/auth-service.ts` → Authentication  
- `src/services/ledger-service.ts` → Transaction logic  

---

✨ *Eco Ledger ensures trust through AI + cryptographic verification.*