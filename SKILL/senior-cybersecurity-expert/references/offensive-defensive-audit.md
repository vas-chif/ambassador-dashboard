# ⚔️ Offensive & Defensive Security Audit (Red/Blue Team)

Metodologia di Penetration Testing e Hardening Difensivo per le applicazioni sanitarie CareFlow.

---

## 1. Audit OWASP Top 10

### A01:2021 – Broken Access Control (Anti-IDOR)

- **Vulnerabilità**: Un utente malintenzionato modifica l'ID paziente nell'URL o nella chiamata API per accedere ai dati di un altro studio o clinica.
- **Contromisura Difensiva**: Ogni richiesta Firestore o Cloud Function deve imporre l'isolamento multi-tenant basato sui Custom Claims del token JWT autenticato:
  ```javascript
  // firestore.rules
  match /tenants/{tenantId}/{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == tenantId;
  }
  ```

### A02:2021 – Cryptographic Failures

- **Vulnerabilità**: Dati sensibili PII inviati o salvati in chiaro.
- **Contromisura Difensiva**: Obbligo di crittografia client-side AES-256-GCM. Verifica automatica tramite grep nei log e nel DB prima di qualsiasi rilascio in produzione.

### A03:2021 – Injection & Stored XSS

- **Vulnerabilità**: Inserimento di script dannosi nei campi di testo (es. Note Paziente, Nome, Anamnesi) eseguiti poi nel browser.
- **Contromisura Difensiva**:
  - Utilizzo di `{{ mustache }}` per il rendering del testo semplice.
  - Divieto assoluto di `v-html` non sanificato. Se necessario per rich text, applicare la sanitizzazione con DOMPurify.

### A06:2021 – Vulnerable and Outdated Components (Supply Chain)

- **Vulnerabilità**: Utilizzo di librerie HTTP terze con vulnerabilità note (es. `axios`, `node-fetch`).
- **Contromisura Difensiva**: Divieto assoluto di importare librerie HTTP generiche. Utilizzo esclusivo dei client SDK ufficiali Firebase ed `@emailjs/browser`.

### A07:2021 – Identification and Authentication Failures

- **Vulnerabilità**: Sessioni che rimangono attive indefinitamente su dispositivi medici condivisi.
- **Contromisura Difensiva**: Auto-logout automatico configurato a 15 minuti di inattività e pulizia immediata dello state Pinia al logout.

---

## 2. Comandi Grep di Controllo Rapido (Security Audit Script)

Da eseguire regolarmente nel terminale per intercettare violazioni di sicurezza:

```bash
# 1. Verifica assenza di console.log in produzione
grep -rn "console.log" src/ --exclude-dir=node_modules

# 2. Verifica assenza di v-html non sanificato
grep -rn "v-html" src/ --exclude-dir=node_modules

# 3. Verifica assenza di dipendenze HTTP vietate
grep -rn "axios" package.json

# 4. Verifica regole Firestore per controlli di autenticazione
grep -n "request.auth" firestore.rules
```
