# 📋 Piano Operativo — Visual Builder & True-Viewport Live Preview

> **Obiettivo**: Implementare un sistema di visualizzazione e modifica interattiva ("Visual Builder") per la vetrina dell'ambassador, con rendering autentico pixel-perfect (iPhone / Tablet / Desktop reale), eliminazione della barra laterale fissa ingombrante, comandi contestuali in-place su ciascuna sezione (incluso tasto Duplica) e posizionamento libero del box testo per gli articoli.  
> **Standard**: Conforme alle direttive [AGENTS.md](file:///home/chif-vas/projects/beauty-ambassador/AGENTS.md) (Explain-Before-Doing, Caching Locale, Zero console.log, TypeScript Strict).

---

## 🔍 1. Diagnosi Tecnica & Soluzione Architetturale

### Perché la preview precedente non era fedele alla realtà
* **Discrepanza Viewport Quasar/CSS**: `$q.screen.lt.md` e le media query CSS `@media (max-width: 600px)` controllano l'ampiezza di `window.innerWidth`. Un semplice `<div style="width: 390px">` dentro un monitor desktop calcola comunque `1920px`, impedendo l'attivazione del vero layout mobile verticale (come mostrato nelle immagini 1, 2 e 3).
* **Ingombro della Sidebar**: Il pannello laterale a sinistra occupava oltre il 25% dello spazio, schiacciando la vista desktop e costringendola entro barre di scorrimento interne orizzontali e verticali.

### La Soluzione: "True-Viewport Engine"
* Utilizzo di un **`<iframe>` isolato con viewport controllato**: l'iframe definisce un proprio `window.innerWidth` reale (es. `393px` per iPhone 16, `768px` per iPad, `100%` per Desktop), attivando **esattamente** le stesse media-query e stili nativi che si vedono aprendo la pagina su un vero smartphone o nei DevTools (immagini 4, 5, 6, 7).
* **Zero Sidebar Fissa**: La preview si estende al 100% dell'area di lavoro; i comandi sono contestuali e compaiono direttamente sulle sezioni.

---

## 🛠️ CHECKLIST DI IMPLEMENTAZIONE DETTAGLIATA

### 📐 FASE 1: Motore Viewport Reale & Iframe Sandbox (*Senior Architect*)
- [x] **1.1 Creazione Componente Viewport Autentico (`src/pages/admin/AdminPreview.vue`)**:
  - [x] Implementazione container iframe con URL sincronizzato `/?preview_mode=true`.
  - [x] Supporto risoluzioni reali dinamiche:
    - 📱 **Mobile**: Larghezza fissata a `393px` (rapporto d'aspetto iPhone 16) con centratura elegante.
    - 📲 **Tablet**: Larghezza fissata a `768px` (iPad portrait).
    - 💻 **Desktop**: Larghezza fluida al `100%` (Full-width senza restrizioni laterali).
- [x] **1.2 Eliminazione Sidebar Statica Sinistra**:
  - [x] Rimozione del pannello fisso "Organizza Sezioni" che restringeva lo schermo.
  - [x] Spazio visivo liberato al 100% per un'esperienza a schermo intero reale.
- [x] **1.3 Top-Bar Fluttuante Sottile (Floating HUD)**:
  - [x] Barra superiore compatta e semitrasparente:
    - Selettore dispositivo (Icone: Smartphone, Tablet, Desktop).
    - Indicatore di salvataggio stato (Salvataggio in corso / Salvato).
    - Pulsante rapido *"Apri Vetrina Esterna"* (`window.open('/', '_blank')`).
- [x] **1.4 Canale di Sincronizzazione Real-Time**:
  - [x] Connessione tramite store reattivo condiviso e localStorage per riflettere le modifiche nell'iframe istantaneamente senza refresh di pagina.

---

### 🎨 FASE 2: Hover Action Bar In-Place & Pulsante Duplica (*Senior UX/UI Designer*)
- [x] **2.1 Barra Azioni Contestuale in Sovrimpressione (Hover Action Toolbar)**:
  - Creare un componente toolbar che compare al passaggio del mouse sopra ciascuna sezione della pagina:
  - [x] 👁️ **Nascondi / Mostra**: Clic immediato per disattivare o riattivare la visibilità della sezione senza eliminarla.
  - [x] ⬆️ / ⬇️ **Sposta Su / Giù**: Frecce rapide per riordinare la sequenza delle sezioni direttamente dal blocco stesso.
  - [x] 📑 **Duplica Sezione**: Pulsante dedicato per clonare istantaneamente il blocco selezionato (es. duplicare un carosello, un banner o una griglia per creare sezioni tematiche diverse).
  - [x] ➕ **Aggiungi Elemento Rapido**: Pulsante contestuale per aggiungere al volo un nuovo prodotto o un nuovo articolo.
  - [x] ⚙️ **Impostazioni Layout**: Apertura di un dialog compatto per allineamenti, padding e configurazione della sezione.
- [x] **2.2 Design System Non Invasivo**:
  - [x] La toolbar rimane discreta, con sfondo scuro soft (`rgba(17, 24, 39, 0.92)`), icone bianche nitide e tooltip di aiuto.
  - [x] Invisibile nella versione finale per i clienti (attiva solo in modalità preview_mode).

---

### 📰 FASE 3: Layout Engine Avanzato Box Testo Articoli (*Immagini 10 & 11*)
- [x] **3.1 Aggiornamento Modello Dati `Article` ([src/stores/settings.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/settings.ts))**:
  - [x] Aggiunta configurazione di posizionamento personalizzato:
    ```typescript
    export interface ArticleLayoutConfig {
      displayMode?: 'below' | 'split-right' | 'split-left' | 'overlay';
      horizontalAlign?: 'left' | 'center' | 'right';
      verticalAlign?: 'top' | 'middle' | 'bottom';
      boxWidth?: 'sm' | 'md' | 'lg' | 'full';
      textAlign?: 'left' | 'center' | 'right';
      cardBgColor?: string;
      cardTextColor?: string;
    }
    ```
- [x] **3.2 Selettore a 9 Quadranti (Posizionamento Spaziale)**:
  - [x] Componente visivo con griglia interattiva 3x3 (`ArticleFormDialog.vue`) per scegliere dove collocare la card di testo sull'immagine:
    - ↖️ Alto Sinistra | ⬆️ Alto Centro | ↗️ Alto Destra
    - ⬅️ Centro Sinistra | ⏺️ Centro Assoluto | ➡️ Centro Destra
    - ↙️ Basso Sinistra | ⬇️ Basso Centro | ↘️ Basso Destra
- [x] **3.3 Controllo Dimensioni & Ridimensionamento ([ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue))**:
  - [x] Regolazione della larghezza della card:
    - Compatta (`sm` -> col-md-5).
    - Media (`md` -> col-md-7).
    - Larga (`lg` -> col-md-9).
    - Piena ampiezza (`full` -> col-md-10).
  - [x] Adattamento responsive: su schermi mobile la card si riadatta automaticamente per garantire leggibilità senza sforamenti.
- [x] **3.4 Modalità di Disposizione Relativa Immagine-Testo (Desktop & Mobile)**:
  - [x] Implementazione opzione `displayMode` in `ArticleLayoutConfig` (`ArticleFormDialog.vue`):
    - ⬇️ **Sotto l'immagine (`below`)**: l'immagine è visibile al 100% in alto senza alcuna sovrapposizione (ideale per foto Prima/Dopo), con titolo, descrizione e bottone collocati sotto come nella visualizzazione mobile.
    - ➡️ **Affiancato a Destra (`split-right`)**: immagine a sinistra e card testo a destra su due colonne pulite distinte (senza sfondo immagine duplicato).
    - ⬅️ **Affiancato a Sinistra (`split-left`)**: card testo a sinistra e immagine a destra.
    - 🔲 **Sovrapposto (`overlay`)**: card fluttuante posizionata con i 9 quadranti.
- [x] **3.5 Doppia Scelta Intelligente nell'Admin (Opzione 3) & Carosello Full-Width Adattivo**:
  - [x] Aggiunta selettore tipologia in `ArticleLayoutConfig`: `articleType: 'testimonial' | 'product'`.
  - [x] Modalità guidata in `ArticleFormDialog.vue`:
    - 📸 **Testimonianza / Prima & Dopo**: layout pre-impostato su 'below' (foto panoramica in alto 100% visibile e testo sotto) o split.
    - 🧴 **Scheda Prodotto / Presentazione**: layout split o overlay a 9 quadranti.
  - [x] Ripristino universale delle miniature di Quasar: passaggio garantito di `:img-src="article.imageUrl"` alla slide con azzeramento del background CSS (`background: #ffffff !important`) per le modalità non-overlay.
  - [x] Estensione larghezza carosello al 100% (`col-12` full-width) rimuovendo la restrizione `col-lg-8`.
  - [x] Altezza adattabile (`clamp(640px, 80vh, 850px)` per below) per includere immagine, testo e barra miniature con proporzioni armoniose.

---

### ➕ FASE 4: Inserimento Rapido Prodotti & Articoli in Anteprima
- [x] **4.1 Creazione Rapida Articoli nel Carosello**:
  - [x] Tasto rapido `+ Aggiungi Articolo` integrato nella toolbar del carosello.
  - [x] Apertura del modale completo (`ArticleFormDialog.vue`) con Titolo, Descrizione, Cover 16:9, Quadrante a 9 posizioni, Link.
  - [x] Aggiornamento immediato del carosello a video senza uscire dalla preview.
- [x] **4.2 Creazione Rapida Prodotti nella Griglia**:
  - [x] Tasto rapido `+ Aggiungi Prodotto` integrato nella toolbar della griglia prodotti.
  - [x] Apertura del dialog prodotto (`ProductFormDialog.vue`) con upload e compressione automatica dell'immagine.
  - [x] Inserimento istantaneo del prodotto nella griglia con rating e pulsante WhatsApp.

---

### 🔀 FASE 7: Riordino Articoli (Drag & Drop) & Modifica Rapida Singolo Articolo in Anteprima
- [x] **7.1 Modifica Rapida dell'Articolo Visibile Direttamente nel Carosello**:
  - [x] Pulsante rapido `✏️ Modifica Questo Articolo` posizionato direttamente sulla slide attiva o nella toolbar del carosello in modalità preview.
  - [x] Apertura istantanea di `ArticleFormDialog.vue` precaricato con l'articolo corrente (`currentArticle`).
  - [x] Sincronizzazione immediata su schermo dopo il salvataggio.
- [x] **7.2 Gestore Riordino Articoli con Drag & Drop e Frecce**:
  - [x] Interfaccia interattiva nel dialog impostazioni carosello (o drawer dedicato) con lista delle card articolo.
  - [x] Supporto Drag & Drop nativo (HTML5 / touch-friendly con handle ⠿) e pulsanti freccia (⬆️ / ⬇️) per invertire l'ordine con un clic.
  - [x] Metodo `updateArticlesOrder` in `settingsStore` con aggiornamento immediato della cache locale (`localStorage`) e salvataggio batch in Firestore.
- [x] **7.3 Azioni Rapide per Singolo Articolo**:
  - [x] Toggle visibilità immediato (Mostra/Nascondi) dalla lista.
  - [x] Eliminazione rapida articolo con richiesta di conferma Quasar.

---

### 🧱 FASE 8: Generatore Multi-Sezione (+ Aggiungi Sezione & Configurazioni Indipendenti)
- [x] **8.1 Pulsante Globale e Contestuale "+ Aggiungi Nuova Sezione"**:
  - [x] Pulsante `➕ Aggiungi Sezione` presente sia in calce alla vetrina che contestualmente tra una sezione e l'altra.
  - [x] Modale di scelta tipologia con schede grafiche:
    - 📸 **Carosello Articoli & Storie**: per testimonianze prima/dopo o storie cliniche supplementari.
    - 🧴 **Griglia Prodotti**: per cataloghi secondari, linee tematiche o selezioni speciali.
    - 🔘 **Banner Promozionale / Azione**: per bottoni d'azione personalizzati (WhatsApp, promozioni, percorsi).
- [x] **8.2 Gestione Configurazioni Indipendenti per Istanze Multiple**:
  - [x] Supporto nel profilo per impostazioni per-sezione (`customSections?: Record<string, CustomSectionConfig>`): titolo, testo banner, link e filtri dedicati per ciascun blocco duplicato o aggiunto.
  - [x] Possibilità di filtrare il carosello per tipologia (es. carosello solo Testimonianze vs carosello Presentazione Prodotti).
- [x] **8.3 Eliminazione Sezioni Extra / Duplicate**:
  - [x] Pulsante 🗑️ `Elimina Sezione` nella toolbar delle sezioni aggiunte/duplicate per rimuoverle facilmente dall'ordine della pagina.

---

### 🛡️ FASE 5: Sicurezza, Caching Locale & Performance (*Cybersecurity & Architect*)
- [x] **5.1 Caching Locale Obbligatorio (Pattern Stale-While-Revalidate)**:
  - [x] Salvataggio immediato in `localStorage` delle preferenze di disposizione e visibilità per azzerare tempi di caricamento (0ms).
  - [x] Sincronizzazione asincrona su Firestore nel documento `settings/public_profile`.
- [x] **5.2 Protezione delle Rotte & Permessi**:
  - [x] I controlli in-place e la modalità di modifica sono attivi via `preview_mode=true` nella console riservata.
  - [x] Nessuna esposizione dei pulsanti di amministrazione agli utenti non in anteprima.

---

### 🧪 FASE 6: Quality Assurance & Checklist di Verifica (*Senior QA Engineer*)
- [x] **6.1 Verifica Pixel-Perfect su Mobile**:
  - [x] Test su viewport 393px (iPhone 16): verifica scorrimento carosello touch, assenza di scroll orizzontali non voluti.
- [x] **6.2 Verifica Pixel-Perfect su Desktop**:
  - [x] Test su viewport desktop (100% Full Width): resa estetica ariosa, nitidezza delle immagini e corretta centratura.
- [x] **6.3 Verifica del Pulsante Duplica**:
  - [x] Test di duplicazione di una sezione: verifica che il nuovo blocco mantenga l'integrità dei dati e generi un ID univoco.
- [x] **6.4 Test Funzionali e Linter**:
  - [x] `yarn lint`: 0 errori e 0 warning (passato).
  - [x] `npx vue-tsc --noEmit`: 0 errori di compilazione TypeScript (passato).
  - [x] `yarn build`: compilazione SPA riuscita con successo.

---
*Piano redatto in conformità con [AGENTS.md](file:///home/chif-vas/projects/beauty-ambassador/AGENTS.md) — Modalità Staging su branch `dev`.*

