# 🔒 Zero-Trust & E2EE Cryptographic Architecture (CareFlow)

Guida tecnica per l'architettura crittografica End-to-End Encryption (E2EE) ed il modello Zero-Trust applicati ai dati sanitari.

---

## 1. Modello Crittografico Client-Side (AES-256-GCM)

CareFlow adotta l'architettura **Zero-Knowledge Cloud**: il backend Firebase viene trattato come un canale inaffidabile ed il server memorizza esclusivamente dati cifrati imprevedibili.

### Specifiche dell'Algoritmo

- **Cifrario**: **AES-256-GCM** (Galois/Counter Mode) via `window.crypto.subtle` (WebCrypto API).
- **Initialization Vector (IV)**: 12 byte (96 bit) generati con `crypto.getRandomValues()`. Un IV nuovo ed imprevedibile deve essere usato per **ogni singola operazione** di cifratura.
- **Authentication Tag**: 128 bit integrati nel ciphertext per garantire la rilevabilità immediata di manomissioni o alterazioni dei dati.

### Derivazione delle Chiavi (PBKDF2)

- **Master Key Derivation**: Derivata dalla passphrase/Master PIN dell'utente tramite **PBKDF2-HMAC-SHA256**.
- **Iterazioni**: Minimo **100.000 iterazioni** con Salt univoco di 16 byte per difendere il sistema da attacchi a forza bruta ed arcobaleno (Rainbow Tables).

---

## 2. Lifecycle delle Chiavi e Protezione in RAM

1. **Inizializzazione Sessione**:
   - All'atto del login, la Master Key viene decrittata e la `ClinicalKey` viene conservata in memoria RAM volatile (Pinia Store).
2. **Operazioni di Cifratura/Decrittazione**:
   - `encryptObject(data)`: Cifra l'oggetto JSON PII in un payload Base64 prima della scrittura su Firestore.
   - `decryptObject(ciphertext)`: Decifra il payload in RAM prima del rendering nell'interfaccia utente.
3. **Chiusura Sessione & Purge**:
   - Al logout o per inattività (15 minuti), lo store esegue un purge immediato sovrascrivendo le variabili contenenti le chiavi in memoria (`key = null`).

---

## 3. Envelope di Ripristino (Recovery Envelope)

Per prevenire la perdita irreversibile dei dati in caso di smarrimento della Master Key:

- Viene generata una Mnemonic Phrase a **24 parole (BIP-39)**.
- Il token di verifica della Master Key viene cifrato con la chiave derivata dalla passphrase di ripristino e memorizzato nell'oggetto utente (`recoveryEnvelope`).
