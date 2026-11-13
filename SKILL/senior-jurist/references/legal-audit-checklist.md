# 📋 Legal Audit Checklist — CareFlow Compliance

Checklist operativa per la verifica di conformità legale prima di approvare una feature, un form o una struttura dati in CareFlow.

---

## 1. Audit Ingestion Paziente & Privacy

- [ ] **Trasparenza Informativa (Art. 13 GDPR)**: Il testo dell'informativa è presente, completo ed accessibile prima di raccogliere qualsiasi dato.
- [ ] **Consenso Sanitario Esplicito (Art. 9 GDPR)**: La checkbox per il trattamento dei dati sanitari è distinta, obbligatoria per la cura e non preselezionata.
- [ ] **Consenso Marketing / Communication (Opzionale)**: La checkbox per invio promemoria o comunicazioni è separata ed opzionale.
- [ ] **Consenso Metadati FEA (Obbligatorio per digitalizzazione)**: La checkbox per la registrazione di IP, GPS e timestamp per la firma digitale è esplicita.
- [ ] **Anti-Duplicato & Neonati/Esteri**: L'UUIDv4 è la chiave primaria univoca; il Codice Fiscale è usato come indice secondario (per consentire la registrazione di pazienti esteri senza CF italiano o neonati).

---

## 2. Audit FEA & Valore Probatorio (eIDAS Art. 26)

- [ ] **Immagine Firma autografa**: Il tratto grafico PNG Base64 è catturato e memorizzato.
- [ ] **IP Address**: L'indirizzo IP del dispositivo firmatario viene registrato ed immagazzinato nel record di consenso.
- [ ] **Timestamp ISO 8601**: La data ed ora esatta sono generate lato server/client al momento del click.
- [ ] **Fallback GPS Negato**: Se il browser nega i permessi GPS, il sistema non restituisce eccezioni bloccanti, ma salva il metadato: `"GPS: Consenso Negato dall'utente"`.
- [ ] **Generazione Sigillo PDF**: Il PDF del modulo di consenso firmato viene generato ed inviato allo Storage immutabile.

---

## 3. Audit Sicurezza PII & Logging (GDPR Art. 30/32)

- [ ] **Crittografia E2EE AES-256-GCM**: Tutti i campi PII (Nome, Cognome, CF, Telefono, Indirizzo, Note Cliniche) sono cifrati prima di essere inviati a Firestore.
- [ ] **Audit Trail di Accesso**: Ogni operazione di decrittazione `decryptObject` genera un log di audit tramite `systemStore.writeAuditLog('DECRYPT', resource, id)`.
- [ ] **Auto-Logout per Inattività**: Il timer di inattività a 15 minuti è attivo per proteggere le sessioni aperte su tablet o computer condivisi in ambulatorio.
- [ ] **Assenza PII nei Log**: Nessun dato personale o sanitario viene mai stampato in `console.log` o nei log di sistema cloud.

---

## 4. Audit Fiscale & Contabile

- [ ] **Conservazione Decennale (Art. 2220 C.C.)**: I dati contabili non vengono fisicamente eliminati in caso di revoca o cancellazione utente, ma pseudonimizzati.
- [ ] **WriteBatch Atomico**: L'incasso di una prestazione dall'Agenda aggiorna lo stato dell'appuntamento, il preventivo e la transazione contabile in un'unica transazione non divisibile (`writeBatch`).
- [ ] **Tetto Forfettario 85.000 €**: Il fatturato progressivo viene calcolato ed aggiornato ad ogni incasso con avvisi preventivi.
