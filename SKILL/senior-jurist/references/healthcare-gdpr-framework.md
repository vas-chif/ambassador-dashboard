# 🏛️ Healthcare GDPR & Legal Framework (Italia & UE)

Documento di riferimento giuridico per lo sviluppo di sistemi di sanità digitale, cartelle cliniche elettroniche e gestionale SaaS sanitario.

---

## 1. GDPR — Regolamento UE 2016/679

### Articolo 6 — Liceità del Trattamento

- Nel contesto sanitario pubblico e privato, il trattamento dei dati personali comuni (nome, recapiti, dati fiscali) si fonda sull'esecuzione di un contratto o di misure precontrattuali (Art. 6 par. 1 lett. b) e sull'adempimento di obblighi legali e fiscali (Art. 6 par. 1 lett. c).

### Articolo 9 — Trattamento di Categorie Particolari di Dati (Dati Sanitari)

- I dati relativi alla salute beneficiano di una tutela rinforzata.
- Ai sensi dell'Art. 9 par. 2 lett. a) e h), il trattamento è lecito quando l'interessato ha prestato il **consenso esplicito** oppure quando il trattamento è necessario per finalità di medicina diagnostica, cura o gestione dei sistemi sanitari svolta da un professionista soggetto al segreto professionale.
- **Regola Architetturale CareFlow**: Il consenso sanitario deve essere **SEPARATO** da qualsiasi altra finalità (promemoria, marketing, profilazione).

### Articolo 13 — Informativa sul Trattamento Dati

- L'informativa deve essere fornita **prima** dell'inizio del trattamento.
- Deve specificare: Titolare del Trattamento, DPO (se presente), finalità, base giuridica, tempi di conservazione, diritti dell'interessato (accesso, rettifica, cancellazione, limitazione) e diritto di proporre reclamo al Garante Privacy.
- **UX/UI Requirement**: Testo chiaro, privo di legalese inaccessibile, suddiviso in micro-sezioni leggibili anche da soggetti anziani o caregiver.

### Articolo 28 — Responsabile del Trattamento (SaaS Vendor)

- CareFlow agisce come **Responsabile del Trattamento** (Data Processor) per conto dei liberi professionisti / cliniche che sono i **Titolari del Trattamento** (Data Controller).
- Il contratto di licenza SaaS deve includere l'Accordo sulla Nomina a Responsabile del Trattamento (DPA - Data Processing Agreement).

### Articolo 30 — Registro delle Attività di Trattamento

- Obbligo di tracciare ogni operazione sui dati sanitari.
- In CareFlow ogni operazione di `READ`, `WRITE`, `DECRYPT` e `DELETE` viene registrata in Audit Log con `timestamp`, `userId`, `action` e `resourceId`.

### Articolo 32 — Sicurezza del Trattamento (Zero-Knowledge & E2EE)

- Obbligo di adottare misure tecniche ed organizzative adeguate al rischio.
- **Crittografia client-side (AES-256-GCM)**: Tutti i dati identificativi (PII) ed i dati clinici dei pazienti vengono cifrati sul dispositivo dell'utente prima della trasmissione a Firestore. Le chiavi di decrittazione risiedono esclusivamente nella RAM del client e non sono mai accessibili ai server cloud in chiaro (Zero-Knowledge Architecture).

---

## 2. Normativa Italiana sulla Responsabilità Sanitaria

### Legge 24/2017 (Legge Gelli-Bianco)

- Disciplina la responsabilità professionale degli esercenti le professioni sanitarie.
- **Valore della Documentazione Clinica**: La cartella clinica ed il diario delle prestazioni costituiscono la primaria prova documentale in sede di giudizio civile e penale.
- **Immutabilità dei Record**: Una volta contrassegnato un intervento o un appuntamento come `executed`, il sistema applica un **Lockdown (isLocked = true)** per garantire che il diario non possa essere alterato ex-post, prevenendo contestazioni di falso materiale.

### Legge 219/2017 (Consenso Informato e DAT)

- Nessun trattamento sanitario può essere iniziato o proseguito se privo del consenso libero e informato della persona interessata.
- Il consenso informato deve essere documentato in forma scritta o attraverso dispositivi informatici.

---

## 3. Firma Elettronica Avanzata (FEA) — Regolamento eIDAS UE 910/2014

Per garantire il valore legale di contratti, moduli privacy e consensi informati sigillati in digitale senza ricorrere a certificati hardware costosi, CareFlow implementa la **Firma Elettronica Avanzata (FEA)** ai sensi dell'Art. 26 eIDAS:

1. **Identificazione del Firmatario**: Associazine univoca al Codice Fiscale / Anagrafica del paziente.
2. **Connessione Univoca**: Generazione di un documento PDF immutabile contenente il tratto autografo Base64, la data e l'ora.
3. **Controllo Esclusivo**: Il paziente firma direttamente sul canvas touch del dispositivo.
4. **Non-Ripudio**: Registrazione di metadati di contesto:
   - **Timestamp Server-side ISO 8601**
   - **Indirizzo IP del dispositivo firmatario**
   - **Coordinate GPS** (con fallback automatico in caso di diniego: `"GPS: Consenso Negato dall'utente"`).
5. **Inalterabilità**: Una volta generato il PDF di consenso, esso viene salvato su Storage inaccessibile per modifiche.

---

## 4. Fisco & Conservazione Sostitutiva

### Conservazione Decennale (Art. 2220 Codice Civile & CAD)

- Le ricevute fiscali, i preventivi approvati ed i registri di contabilità devono essere conservati per **almeno 10 anni**.
- La cancellazione da parte dell'utente non elimina i record fiscali già contabilizzati, ma applica una pseudonimizzazione mantenendo i dati aggregati per obbligo di legge.

### Regime Forfettario (Legge 190/2014)

- Monitoraggio automatico del tetto dei **85.000 €/anno** di incassi per i liberi professionisti.
- Generazione di avvisi visivi al raggiungimento del 75% e 95% della soglia per prevenire il fuoriuscita involontaria dal regime agevolato.
