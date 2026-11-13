# 📊 SaaS Unit Economics & Financial Strategy (CareFlow)

Guida strategica per l'ottimizzazione economica, il controllo dei costi cloud ed la gestione fiscale per CareFlow.

---

## 1. Cloud Cost Architecture (Target < 1,00 € / 1.000 Utenti / Mese)

Per mantenere un margine lordo (Gross Margin) > 85% sul software SaaS CareFlow, la gestione delle risorse cloud segue un principio rigoroso di **Zero-Read Redundancy**:

1. **Cache-First Architecture**:
   - I dati di anagrafica, preferenze e storico contabile vengono mantenuti in RAM (Pinia) e sincronizzati nel `localStorage` con validità di 30 giorni.
   - Le interrogazioni a Firestore avvengono **solo on-demand** o su refresh esplicito dell'utente.

2. **JWT Claims per Autorizzazioni**:
   - I permessi utente e il ruolo (`admin`, `collaborator`) sono codificati nei Custom Claims del token JWT di Firebase Auth.
   - Nessuna lettura Firestore viene effettuata ai fini del controllo accessi durante la navigazione o il cambio rotta.

3. **Batch Writing**:
   - Le scritture multiple (es. cambio stato appuntamento + chiusura preventivo + transazione contabile) avvengono in un unico `WriteBatch` Firestore per ridurre il costo computazionale e garantire atomicità.

---

## 2. Fiscalità Sanitaria Italiana & Commercialista Compliance

### Regime Forfettario (L. 190/2014)

- Limite massimo incassi annui: **85.000 €**.
- CareFlow calcola in tempo reale il fatturato incassato nell'anno solare corrente.
- **Soglie di Allarme**:
  - **75% (€ 63.750)**: Visualizzazione di un badge informativo discreto nella sezione Finanza.
  - **95% (€ 80.750)**: Banner di attenzione per pianificare gli incassi di fine anno ed evitare l'uscita dal regime agevolato.

### Esenzione IVA (Art. 10 n. 18 DPR 633/72)

- Le prestazioni sanitarie diagnostiche e terapeutiche rese da infermieri e medici registrati agli albi sono esenti da IVA.
- CareFlow applica per default il flag `taxablePercentage: 100` con dicitura automatica: _"Operazione esente IVA ai sensi dell'Art. 10 n. 18 DPR 633/72"_.

### Imposta di Bollo Virtuosa (2,00 €)

- Quando l'importo della prestazione esente IVA supera i **77,47 €**, sulla ricevuta/fattura deve essere applicata la marca da bollo da 2,00 €.
- CareFlow aggiunge e calcola automaticamente l'imposta nei totali di preventivo e ricevuta.

---

## 3. SaaS Business Metrics & Pricing Models

1. **Tier Start (Libero Professionista)**:
   - Agenda, Anagrafica Pazienti cifrata E2EE, Preventivi illimitati.
2. **Tier Pro (Studio Clinico)**:
   - Ingestion Modulo Privacy GDPR + Firma Digitale FEA + Contabilità e Tetto Fiscale 85k.
3. **Tier Enterprise (Team & ADI)**:
   - Gestione Magazzino Sanitario + Assistente Prelievi + Multi-Operatore + Audit Trail GDPR Art. 30.
