# Beauty Ambassador (GlowAndCareSpace) — Unified Agent Instructions

Questo repository e queste istruzioni sono **dedicate esclusivamente a questo progetto**: la console monoutente e vetrina pubblica **Beauty Ambassador** (GlowAndCareSpace).
All'interno della piattaforma **Elara**, questa intera applicazione funge da **modello/clone operativo indipendente** da aprire e assegnare a ciascun singolo ambassador/salone: ogni professionista disporrà della propria istanza/vista isolata per gestire unicamente il proprio profilo, il proprio catalogo prodotti, i propri articoli e le vendite WhatsApp, senza interferenze con altri utenti.
Lo stack tecnologico è basato su **Quasar 2 (Vue 3)**, **TypeScript**, **Firebase (Auth, Firestore, Storage)**, **Pinia**, e **Tailwind CSS**.
Questo file è la **Single Source of Truth** per qualsiasi AI Agent che opera su questo repository. L'Agent deve seguire queste istruzioni in modo rigoroso.

---

## 🛡️ §0 — REGOLA ASSOLUTA: Explain-Before-Doing

Prima di ogni modifica a codice o file, l'Agent deve dichiarare:

```
> **Cosa:** [file + funzione/componente + righe interessate]
> **Come:** [approccio tecnico specifico]
> **Perché:** [regola rispettata + problema risolto]
> **Impatto:** [rischio mitigato o valore aggiunto]
```

Non procedere mai ad applicare modifiche senza aver prima scritto questo blocco per il consenso dell'utente.

---

## 🛡️ §0.1 — REGOLA ASSOLUTA: Conservazione della Logica Preesistente & Autorizzazione Modifiche

- **Mantenimento Logica Preesistente**: Durante qualsiasi modifica, formattazione o refactoring di codice, l'Agent DEVE sempre mantenere ed integrare la logica di business e le funzionalità preesistenti senza rimuoverle o ometterle.
- **Autorizzazione Preventiva**: Qualora si renda necessario modificare, sostituire o eliminare la logica esistente, l'Agent NON deve mai procedere in autonomia: DEVE prima chiedere il consenso esplicito all'utente, specificando nel dettaglio cosa viene modificato, la motivazione e le implicazioni.

---

## 🧩 §0.2 — REGOLA ASSOLUTA: Modularità, Riuso Componenti & DRY (Don't Repeat Yourself)

- **Analisi Preventiva del Codice Esistente**: Prima di scrivere nuovo codice o modificare viste/pagine, l'Agent DEVE sempre esplorare l'albero dei componenti (`src/components/`, `src/layouts/`, `src/stores/`, `src/composables/`) per verificare se esistono già componenti pronti o pattern analoghi da riutilizzare o estendere.
- **Generazione di Componenti Replicabili**: Se non esiste un componente adatto, l'Agent NON deve scrivere decine o centinaia di righe monolitiche direttamente nella pagina genitore, ma DEVE **estrarre e creare un nuovo componente riutilizzabile e modulare** (es. in `src/components/widgets/`, `src/components/admin/`, o `src/components/common/`).
- **Prevenzione del Debito Tecnico**: Evitare assolutamente copy-paste di markup, stili duplicati e logiche ripetute, per minimizzare l'onere di manutenzione e facilitare l'estensione futura della piattaforma.

---

## 📏 §0.3 — REGOLA ASSOLUTA: Limite Dimensioni File & Manutenibilità (Anti-Monolite)

- **Soglie Massime di Righe per File**:
  - **Componenti UI / Widget / Dialog (`src/components/`)**: Massimo consigliato **250 – 350 righe**. Se un componente supera questa soglia, DEVE essere decomposto in sub-componenti dedicati (es. separando il form, la toolbar, l'anteprima o le tab).
  - **Pagine & Viste Orchestratrici (`src/pages/`)**: Massimo **400 – 500 righe**. Le pagine devono fungere solo da orchestratori puliti che compongono widget e componenti specializzati, non contenere centinaia di righe di modali inline, form o stili mastodontici.
  - **Store Pinia / Moduli di Logica (`src/stores/`, `src/composables/`)**: Massimo **300 – 400 righe**. Decomporre in moduli o composable specializzati qualora la logica cresca eccessivamente.
- **Obbligo di Refactoring su File Eccedenti**: Quando l'Agent interviene su un file che supera tali soglie o nota una crescita sproporzionata durante l'implementazione, DEVE proporre o applicare lo scorporo logico in componenti dedicati e incapsulati.

---

## 📌 §1 — Git & Branch Management (Solo 2 Branch: dev & main)

- **Regola dei 2 Branch & Mappatura Ambienti**: Sono ammessi ESCLUSIVAMENTE **due branch permanenti**:
  - **`dev` (Staging)**:
    - **Progetto Firebase**: `staging-glowandcarespace`
    - **URL Web App**: https://staging-glowandcarespace.web.app
    - **URL Dominio**: https://staging-glowandcarespace.firebaseapp.com
    - **Scopo**: Ambiente di sviluppo, test e staging. Tutto il lavoro attivo, le nuove funzionalità e i refactoring risiedono qui.
  - **`main` (Production)**:
    - **Progetto Firebase**: `glowandcarespace-maria`
    - **URL Web App**: https://glowandcarespace-maria.web.app
    - **URL Dominio**: https://glowandcarespace-maria.firebaseapp.com
    - **Scopo**: Riservato unicamente alla produzione stabile. Nessun commit diretto su `main`: i rilasci avvengono solo tramite merge/promozione controllata da `dev` a `main`.
- **Pulizia dei Branch**: Non devono esistere altri branch permanenti. Eventuali branch temporanei di feature/hotfix devono essere fusi in `dev` e cancellati subito dopo.
- **Branch Protetti**: MAI pushare forzatamente (`git push --force`) sui branch condivisi (`dev`, `main`).
- **Commit Messages**: Usare rigorosamente la convenzione **Conventional Commits** (`feat: ...`, `fix: ...`, `chore: ...`, `security: ...`, `style: ...`).

---

## 📋 §2 — Comandi del Progetto

Usa esclusivamente **yarn** come package manager principale. MAI usare `npm` o `pnpm`.

| Task                     | Command          |
| ------------------------ | ---------------- |
| Dev server (HMR)         | `yarn dev`       |
| Production build         | `yarn build`     |
| Lint (auto-fix)          | `yarn lint`      |
| Type check (TypeScript)  | `npx vue-tsc --noEmit` |

---

## 🏢 §3 — Architettura Multi-Tenant & Console Monoutente (Elara)

- **Template/Clone per Ciascun Ambassador**: Questa web app costituisce il modello/clone ufficiale che la piattaforma Elara assegnerà e aprirà per ogni singolo ambassador/salone iscritto.
- **Dashboard Scoped per Utente**: La dashboard `/admin` è concepita unicamente come la console operativa del singolo ambassador/salone. Ogni utente gestisce esclusivamente il proprio profilo, i propri prodotti e i propri articoli.
- **Nessuna Gestione Ambassador nell'Area Privata Utente**: Nella dashboard del singolo utente non deve essere presente alcuna voce o card "Manage Ambassadors" (riservata in futuro a un pannello SuperAdmin separato).
- **Isolamento dei Dati**: Tutte le query Firestore devono essere vincolate all'identificativo del tenant/ambassador (`tenantId == currentUserId`).
- **White-Label & Branding Dinamico**: Titoli, avatar e link devono derivare dinamicamente dai dati del profilo dell'ambassador (`settingsStore.profile`), mai essere hardcoded.

---

## 🛡️ §4 — Sicurezza, Privacy & Qualità

- **Zero console.log in Produzione**: Usare sempre `useSecureLogger()` (`src/shared/logger.ts`) che gestisce la redazione automatica dei dati PII (email, telefono, carte).
- **Sicurezza a 3 Layer**:
  1. *Layer 1 (Frontend)*: Validazione campi e route guards (`router/index.ts`).
  2. *Layer 2 (Database)*: Regole stringenti in `firestore.rules` e `storage.rules`.
  3. *Layer 3 (Backend / Cloud Functions)*: Validazioni server-side e Custom Claims.
- **Auto-Logout**: Timeout di inattività dopo 15 minuti per le sessioni protette.
- **Caching Locale Obbligatorio (UX Istantanea & Riduzione Costi)**: Implementare SEMPRE il caching locale (`localStorage` o persistenza Pinia) per dati statici e semi-statici (profilo, colori, prodotti, articoli, layout del builder). Adottare il pattern **Stale-While-Revalidate**: mostrare immediatamente i dati dalla cache locale all'apertura (zero attese o schermate bianche per l'utente) e aggiornare/sincronizzare in background da Firestore.
- **Ottimizzazione Costi Cloud**: Leggere i dati on-demand ed evitare listener ridondanti o cicli di polling non necessari.
- **TypeScript Strict**: Nessun tipo `any` indiscriminato; tutti i tipi risiedono centralizzati in `src/types/`.

---

## 🧠 §5 — Competenze e Ruoli Specializzati (Skills)

L'Agent ha a disposizione le seguenti skill e checklist specialistiche collocate in `.agents/skills/` e `SKILL/`:
- **Senior Architect**: Validazione architettura, caching, separazione moduli e scalabilità.
- **Senior Cybersecurity Expert**: Zero-Trust, hardening Firestore/Storage, protezione PII e anti-XSS.
- **Senior QA Engineer**: Test di integrazione, UX mobile-first e regression testing.
- **Senior Jurist**: Conformità GDPR, Art. 13-14, cookie policy e trasparenza e-commerce.
- **Firebase Skills**: Guide dedicate per Firestore, Auth, Storage, Hosting e Cloud Functions.

