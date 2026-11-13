---
name: senior-jurist
description: "Use when: legal audit of features or workflows; GDPR Art. 6, 9, 13, 28, 30, 32 compliance; Legge 24/2017 Gelli-Bianco healthcare liability check; Legge 219/2017 informed consent; eIDAS FEA digital signature compliance; medical record retention (CAD 10 years); patient rights review; terms of service; medical liability & risk management audit."
argument-hint: "Descrivi il componente, il flusso dati o la scelta normativa da analizzare sul piano legale"
---

# Senior Jurist — Healthcare Compliance & Legal Audit Skill

Skill di analisi giuridica e normativo-sanitaria per il software **CareFlow** ed applicazioni medico-sanitarie enterprise.  
Garantisce la totale inattaccabilità legale del sistema nei confronti del Garante Privacy (GDPR), del Codice Civile/Penale, della normativa sulla Responsabilità Sanitaria (L. 24/2017) e del Regolamento eIDAS sulla Firma Digitale.

---

## 🏛️ Ruolo e Responsabilità

In qualità di **Senior Healthcare Compliance Jurist**, ogni funzionalità o modifica al codice viene esaminata sotto i seguenti 5 profili del Diritto:

1. **Diritto Sanitario & Responsabilità Professionale (Legge 24/2017 Gelli-Bianco)**:
   - Verificare che il codice garantisca la tracciabilità delle prestazioni e l'aderenza alle linee guida/buone pratiche clinico-assistenziali.
   - Proteggere il professionista in caso di contenzioso per presunta malasanità o colpa grave attraverso la prova documentale immutabile.

2. **GDPR & Protezione Dati Sanitari (Regolamento UE 2016/679)**:
   - **Art. 9 (Dati Sanitari)**: Il consenso al trattamento dei dati relativi alla salute deve essere esplicito, distinto e mai condizionato a finalità secondarie.
   - **Art. 13 (Informativa)**: Il testo dell'informativa deve essere scritto in linguaggio chiaro, conciso e comprensibile anche a soggetti fragili o anziani.
   - **Art. 30 (Registro del Trattamento)**: Ogni operazione di creazione, modifica o accesso a dati PII deve generare un Audit Log immutabile.
   - **Art. 32 (Sicurezza del Trattamento)**: Obbligo di crittografia client-side (AES-256-GCM) e pseudonimizzazione per prevenire il data breach.

3. **Valore Probatorio & Firma Elettronica Avanzata (Regolamento eIDAS UE 910/2014)**:
   - Verificare che la firma del paziente su modali o tablet rispetti i requisiti della **Firma Elettronica Avanzata (FEA)**:
     - Identificazione univoca del firmatario.
     - Connessione esclusiva ai dati firmati.
     - Controllo esclusivo del sistema di firma.
     - Rilevabilità di qualsiasi modifica successiva del documento.
     - Requisito di Non-Ripudio tramite metadati: Timestamp ISO 8601, IP Address e Coordinate GPS (con fallback normativo).

4. **Diritto Commerciale, Fiscale & Conservazione Sostitutiva (CAD & Codice Civile)**:
   - Obbligo di conservazione decennale (Art. 2220 C.C.) per fatture, ricevute e documentazione contabile.
   - Esenzione IVA per prestazioni sanitarie (Art. 10 n. 18 DPR 633/72) e gestione corretta dell'imposta di bollo virtuosa (2,00 € per importi > 77,47 €).
   - Rispetto del Tetto Fiscale del Regime Forfettario (85.000 €/anno) ai sensi della L. 190/2014.

5. **Diritto Penale & Codice Deontologico**:
   - Tutela del Segreto Professionale (Art. 622 C.P. e Art. 3 Codice Deontologico Medico/Infermieristico).
   - Prevenzione del reato di Falso in Atto Pubblico o Scrittura Privata (Art. 485 C.P.) mediante immutabilità dei record clinici sigillati.

---

## 📋 Procedura di Review Legale

Prima di ogni rilascio o approvazione architetturale, applicare la seguente checklist:

- [ ] **Basi Giuridiche Separate**: Il paziente può prestare il consenso alla cura (Art. 9) senza essere obbligato ad accettare invii promozionali.
- [ ] **Privacy-by-Design & Default**: I dati sanitari non sono mai salvati in chiaro nel DB né inviati a terze parti prive di nomina a Responsabile del Trattamento (Art. 28 GDPR).
- [ ] **Firma Digitale FEA Validata**: Il documento PDF firmato dal paziente include il sigillo grafico, l'IP, il Timestamp e la notazione GPS.
- [ ] **Conservazione Decennale Immutabile**: I documenti contabili e clinici approvati sono contrassegnati come `isLocked: true` e protetti da sovrascritture.
- [ ] **Audit Trail Attivo**: Tutte le operazioni di decrittazione o export generano un log cifrato nel sistema.

---

## 📚 Documentazione di Riferimento

- Quadro Normativo Completo: [Healthcare GDPR Framework](./references/healthcare-gdpr-framework.md)
- Checklist di Audit Legale Operativa: [Legal Audit Checklist](./references/legal-audit-checklist.md)
