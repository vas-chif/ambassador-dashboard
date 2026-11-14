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
- [x] **4.3 Toolbar Fluttuante In-Place per Singolo Prodotto & Riordino Drag & Drop**:
  - [x] Pillola contestuale (`[ ⠿ | ⬅️ ➡️ | ✏️ ]`) posizionata in alto a destra su ciascuna card prodotto in modalità preview.
  - [x] Modifica immediata: clic su `✏️` per aprire `ProductFormDialog.vue` con i dati del prodotto precaricati e salvataggio reattivo.
  - [x] Riordino a video con frecce rapide `⬅️` e `➡️` per scambiare posto istantaneamente con il prodotto adiacente.
  - [x] Riordino Drag & Drop nativo HTML5 (maniglia `⠿` e drop sulla card bersaglio) con salvataggio batch automatico (`updateProductsOrder`).
  - [x] Decomposizione modulare: estratto `ProductDetailDialog.vue` (208 righe) per preservare la soglia massima anti-monolite su `ProductGrid.vue` (§0.2 / §0.3).

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

### 👤 FASE 9: Sezione Profilo Dinamica, Multi-Bio & Tipografia Avanzata (Allineamenti, Stili, Bold)
- [x] **9.1 Supporto per Sezioni Profilo / Bio Aggiuntive (`profile_custom_...`)**:
  - [x] Aggiunta opzione 👤 **Profilo, Chi Sono & Filosofia** nel dialog `➕ Aggiungi Nuova Sezione`.
  - [x] Configurazione indipendente per ogni istanza profilo (titolo personalizzato, testo bio/storia, avatar opzionale, social opzionali).
- [x] **9.2 Personalizzazione Avanzata Stile, Allineamento & Larghezza**:
  - [x] **Allineamento Testo**: Sinistra, Centro, Destra, Giustificato (`textAlign: 'left' | 'center' | 'right' | 'justify'`).
  - [x] **Stile Tipografico & Peso**: Selezione Font (Serif elegante vs Sans-serif moderno) e Peso (Light, Normal, Bold / Grassetto).
  - [x] **Dimensione Titolo**: Dimensione regolabile (H2 grande, H3 medio, H4 compatto).
  - [x] **Ampiezza Massima del Testo**: Larghezza contenitore regolabile (Stretta 450px, Media 650px, Larga 850px, Piena 100%).
  - [x] **Opzioni Visibilità Elementi**: Toggle Mostra/Nascondi Avatar, Toggle Mostra/Nascondi Icone Social per le sezioni profilo.
- [x] **9.3 Interfaccia di Configurazione Diretta in Anteprima ([LandingPage.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/LandingPage.vue))**:
  - [x] Aggiornamento del dialog impostazioni profilo con controlli intuitivi a pulsanti/toggle per allineamenti, pesi e dimensioni.
  - [x] Anteprima istantanea e salvataggio reattivo su store locale + Firestore.

---

### 🌟 FASE 10: Carosello Editoriale Full-Width & Scheda Narrativa Sincronizzata Sotto
- [x] **10.1 Refactoring Architettura Visiva Carosello ([ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue))**:
  - [x] **Carosello Immagini Top Edge-to-Edge**: Espansione del carosello immagini a larghezza piena (Full-Width / 100% ampiezza schermo) senza margini angusti né box testuali sovrapposti a coprire volti e flaconi.
  - [x] **Immagini 100% Visibili & Pulite**: Foto prima/dopo e prodotti presentate a pieno campo con aspect ratio cinematografico bilanciato (altezza desktop ~420-580px, mobile ~280-360px) e contenimento ottimale (`contain`/`cover` intelligente con sfondo warm luxury `#f7f5f0`).
  - [x] **Navigazione Fluida & Autoplay**: Transizioni animate pulite, swipe touch mobile, frecce laterali discrete e autoplay sincronizzato.
- [x] **10.2 Scheda Narrativa Dinamica Sincronizzata Sotto al Carosello**:
  - [x] Blocco editoriale sottostante dedicato che mostra in tempo reale:
    - **Titolo dell'Articolo / Trattamento** (tipografia serif di prestigio `Playfair Display`).
    - **Descrizione Completa & Storia** (leggibile, senza clamping aggressivi che tagliano il testo).
    - **Pulsante CTA d'Azione WhatsApp / Scopri di Più** ben visibile e centrato.
    - **Miniature Galleria di Navigazione** posizionate subito sotto la foto principale (e prima del testo) per un'esplorazione tattile immediata, lasciando il pulsante CTA d'azione in calce come punto di conversione finale.
  - [x] **Sincronizzazione Reattiva Istantanea**: Quando la slide cambia (autoplay o interazione utente), il testo sottostante si aggiorna all'istante con transizione fluida (*smooth fade*).
- [x] **10.3 Adattabilità Universale Desktop & Mobile**:
  - [x] Layout identico, armonioso e privo di frammentazione tra smartphone, tablet e monitor widescreen.

---

### 🚀 FASE 11: Pipeline CI/CD GitHub Actions & Deploy Multi-Environment
- [x] **11.1 Aggiornamento Workflow Staging (`dev` -> `staging-glowandcarespace`)**:
  - [x] Configurazione setup Node.js v22 con cache Yarn per garantire compatibilità con Vite 7 in [firebase-hosting-dev.yml](file:///home/chif-vas/projects/beauty-ambassador/.github/workflows/firebase-hosting-dev.yml).
  - [x] Build e deploy automatico su `staging-glowandcarespace.web.app` al push su branch `dev`.
- [x] **11.2 Aggiornamento Workflow Production (`main` -> `glowandcarespace-maria`)**:
  - [x] Configurazione setup Node.js v22 con cache Yarn in [firebase-hosting-merge.yml](file:///home/chif-vas/projects/beauty-ambassador/.github/workflows/firebase-hosting-merge.yml).
  - [x] Build e deploy automatico su `glowandcarespace-maria.web.app` al merge/push su branch `main`.
- [x] **11.3 Push Diretto su Branch `dev`**:
  - [x] Esecuzione controllata del push su `origin dev` per attivare la pipeline di staging.

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

### 🧩 FASE 12: Decomposizione Modulare & Riduzione Monoliti (§0.2 / §0.3 AGENTS.md)
- [x] **12.1 Refactoring `src/pages/LandingPage.vue`**:
  - Ridotto da 1.544 righe a 569 righe (-63% di volume codice).
  - Estratti componenti specializzati e riutilizzabili:
    - `src/components/widgets/ActionPillBanner.vue` (91 righe)
    - `src/components/builder/SectionToolbar.vue` (173 righe)
    - `src/components/builder/AddSectionDialog.vue` (142 righe)
    - `src/components/builder/SectionSettingsDialog.vue` (677 righe)
- [x] **12.2 Refactoring `src/pages/admin/AdminSettings.vue`**:
  - Ridotto da 699 righe a 110 righe (-84% di volume codice).
  - Estratti sub-componenti dedicati per ciascun tab:
    - `src/components/settings/ProfileSettingsTab.vue` (189 righe)
    - `src/components/settings/BrandingSettingsTab.vue` (129 righe)
    - `src/components/settings/QrCodesSettingsTab.vue` (210 righe)
    - `src/components/settings/EmailConfigTab.vue` (62 righe)
- [x] **12.3 Decomposizione Store Pinia `src/stores/settings.ts`**:
  - Ridotto da 563 righe a 389 righe (-31%).
  - Estratto store dedicato `src/stores/articles.ts` (196 righe) con persistenza Stale-While-Revalidate e sincronizzazione Firestore in tempo reale.
  - Mantenimento al 100% della retrocompatibilità tramite getter e metodi delegati trasparenti in `settingsStore`.
- [x] **12.4 Verifica Qualità & Compilazione Completa**:
  - `yarn lint`: 0 errori e 0 warning.
  - `npx vue-tsc --noEmit`: 0 errori TypeScript.
  - `yarn build`: compilazione SPA completata con successo in 13.79s.

---

### 📦 FASE 13: Pillola Azioni Rapide Prodotti & Drag-and-Drop In-Place (§0.2 / §0.3)
- [x] **13.1 Pillola Fluttuante sulle Card Prodotto (`[ ⠿ | ⬅️ ➡️ | ✏️ ]`)**:
  - [x] Attiva solo in modalità `preview_mode=true` nell'angolo superiore destro di ciascuna card.
  - [x] Spostamento rapido ⬅️ / ➡️ con un solo clic.
  - [x] Maniglia di trascinamento nativa (HTML5 Drag & Drop) con highlight visivo border/glow all'hover target.
  - [x] Tasto Modifica rapida ✏️ che precarica direttamente il modale `ProductFormDialog.vue`.
- [x] **13.2 Decomposizione Modulare Anti-Monolite**:
  - [x] Estrazione di `src/components/widgets/ProductDetailDialog.vue` (236 righe).
  - [x] Estrazione di `src/components/widgets/ProductCard.vue` (277 righe).
  - [x] Snellezza di `ProductGrid.vue` a 295 righe (rispetta la soglia massima di ≤ 350 righe di §0.3).
- [x] **13.3 Aggiornamento Atomico Ordinamento su Firestore**:
  - [x] Metodo `updateProductsOrder(orderedProducts)` con aggiornamento locale ottimistico immediato e batch su Firestore.

---

### ❤️ FASE 14: Contatori Globali Firestore (Likes & Saves), Filtri Utente & Statistiche Admin
- [x] **14.1 Contatori Atomici su Cloud Firestore**:
  - [x] Estensione del modello dati `Product` con `likesCount?: number; savesCount?: number;`.
  - [x] Incremento/decremento atomico concorrente tramite `increment(1)` e `increment(-1)` di Firestore per prevenire race condition.
- [x] **14.2 Pillole Filtro Utente nella Griglia Prodotti**:
  - [x] `[ Tutti i Prodotti (N) ]`
  - [x] `[ 🔖 I Miei Salvati (N) ]` con badge contatore salvataggi personali.
  - [x] `[ ❤️ I Più Amati (N) ]` con badge contatore preferiti personali.
  - [x] Stato vuoto amichevole personalizzato per filtri senza elementi con pulsante di ripristino vista completa.
- [x] **14.3 Tabella Prodotti Console Admin con Colonna Statistiche**:
  - [x] Aggiunta della colonna `"Gradimento & Statistiche"` in `ProductListTable.vue` con visualizzazione in tempo reale di:
    - ❤️ Mi Piace totali
    - 🔖 Salvataggi totali nei preferiti
    - ⭐ Valutazione media con numero di recensioni
- [x] **14.4 Verifica & Build**:
  - [x] `npx vue-tsc --noEmit`: 0 errori.
  - [x] `yarn lint`: 0 errori.
  - [x] `yarn build`: compilazione SPA riuscita al 100%.

---

### 📑 FASE 15: Duplica Articolo & Prodotto (Admin & Preview) e Filtri Ricerca/Categoria
- [x] **15.1 Duplica Prodotto**:
  - [x] In Live Preview: aggiunto pulsante `content_copy` nella pillola in-place su ciascuna card prodotto in [ProductCard.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ProductCard.vue) con clonazione immediata e notifica.
  - [x] In Console Admin: aggiunto pulsante `content_copy` nella colonna azioni di [ProductListTable.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ProductListTable.vue) e gestione in [AdminProducts.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminProducts.vue).
- [x] **15.2 Duplica Articolo**:
  - [x] In Live Preview: `q-btn-group` in [ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue) con pulsanti `[ ✏️ Modifica | 📑 Duplica ]` per clonare istantaneamente l'articolo visibile con handler in [LandingPage.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/LandingPage.vue).
  - [x] In Console Admin: aggiunto pulsante `content_copy` in [AdminArticles.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminArticles.vue) con toast di conferma.
- [x] **15.3 Ricerca Testuale & Filtri Categoria in Console Admin**:
  - [x] **Prodotti** ([ProductListTable.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ProductListTable.vue)): barra di ricerca testuale reattiva (nome/descrizione) e dropdown categorie dinamiche con stato vuoto personalizzato.
  - [x] **Articoli** ([AdminArticles.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminArticles.vue)): barra di ricerca testuale e filtri a pillola per tipologia (*Tutti*, *Testimonianze*, *Schede Prodotto*) con stato vuoto e reset rapido.
- [x] **15.4 Verifica di Qualità**:
  - [x] `npx vue-tsc --noEmit`: 0 errori.
  - [x] `yarn lint`: 0 errori.
  - [x] `yarn build`: SPA compilata con successo.

---

### 📱 FASE 16: Widget Dashboard QR Code Rapidi per Scansione, Stampa e Download
- [x] **16.1 Componente Modulare `QuickQrCodesWidget.vue` ([src/components/admin/QuickQrCodesWidget.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/QuickQrCodesWidget.vue))**:
  - [x] Visualizzazione a schede/griglia con anteprima nitida di tutti i QR Code caricati nel profilo.
  - [x] Clic e ingrandimento immediato a schermo intero ad alta risoluzione con guida visiva per far inquadrare direttamente dallo smartphone del cliente.
  - [x] Pulsanti rapidi:
    - 📥 **Download PNG** ad alta risoluzione con nome file dedicato.
    - 🖨️ **Stampa Rapida** con finestra di anteprima e impaginazione etichetta/cartello da banco.
    - 🔗 **Copia Link URL** negli appunti con feedback toast.
  - [x] Stato vuoto dedicato con invito e pulsante di collegamento alla tab Impostazioni.
- [x] **16.2 Integrazione in Dashboard Principale ([src/pages/admin/AdminDashboard.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminDashboard.vue))**:
  - [x] Sottoscrizione in tempo reale a `settingsStore.subscribeToProfile()`.
  - [x] Layout pulito e arioso posizionato subito sotto i contatori KPI principali.

---

### ⭐ FASE 17: Reset Metriche (Rating, Like, Salvataggi) alla Duplicazione Prodotti
- [x] **17.1 Azzeramento Metriche di Valutazione e Interazione**:
  - Quando un prodotto viene duplicato (sia da Console Admin `/admin/products` sia dalla Live Preview in-place card), i campi `ratingAverage`, `ratingCount`, `likesCount`, e `savesCount` vengono rimossi dal clone e reinizializzati a `0`.
  - Il nuovo prodotto duplicato nasce come template/base pulita senza ereditare recensioni, cuoricini o preferiti del prodotto originale.

---

### ⚡ FASE 18: Risoluzione Reattività Istantanea Store & LocalStorage (Articoli & Prodotti)
- [x] **18.1 Eliminazione Plain Getter e Ripristino Computed Bidirezionale ([settings.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/settings.ts))**:
  - Sostituito il getter JavaScript statico `get articles()` con una `computed({ get, set })` reattiva nativa per ripristinare il tracciamento reattivo di Vue 3.
- [x] **18.2 Connessione Diretta Componenti ad `useArticlesStore`**:
  - [AdminArticles.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminArticles.vue), [ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue), [ArticleFormDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ArticleFormDialog.vue) e [LandingPage.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/LandingPage.vue) collegati direttamente a `useArticlesStore`.
  - Risolto il problema per cui duplicare o cancellare un articolo richiedeva il ricaricamento manuale della pagina (F5).
- [x] **18.3 Rimozione Vincolo Firestore `orderBy` & Ordinamento In-Memory Sicuro ([articles.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/articles.ts))**:
  - Rimosso `orderBy` dalla query Firestore (che scartava gli articoli privi di campo order) a favore dell'ordinamento in-memory `(a.order ?? 999) - (b.order ?? 999)`.
  - Aggiornamento ottimistico a 0ms e salvataggio immutabile in cache `localStorage` su aggiunta, duplicazione, modifica e cancellazione.
- [x] **18.4 Aggiornamento Ottimistico Prodotti ([products.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/products.ts))**:
  - Aggiunto aggiornamento reattivo immediato a 0ms e sincronizzazione in `localStorage` anche per `addProduct` (duplicazione prodotti).

---

### 💎 FASE 19: Scheda Dettaglio Prodotto Luxury & Responsive Multi-Display
- [x] **19.1 Distacco dal Header e Spaziatura di Respiro ([ProductDetailDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ProductDetailDialog.vue))**:
  - Inserito padding reattivo e distanziamento tra la toolbar superiore e la card prodotto, evitando che l'immagine tocchi o scivoli sotto il header.
- [x] **19.2 Layout 2-Colonne Centrato su Desktop & Widescreen**:
  - Contenitore centrato con larghezza massima di `1040px`, bordi arrotondati (`border-radius: 16px`) ed elevazione luxury (`shadow-2`).
  - Colonna sinistra (`col-12 col-md-6`): Vetrina immagine con sfondo warm luxury `#faf8f5`, contenimento ottimale e selettore galleria miniature interattivo.
  - Colonna destra (`col-12 col-md-6`): Tipografia editoriale con font serif `Playfair Display`, categoria, prezzo, stelline di gradimento, descrizione, istruzioni e bottone acquisto rapido.
- [x] **19.3 Adattamento Fluido Mobile (< 600px)**:
  - Disposizione a colonna singola pulita, margini controllati e toolbar inferiore sticky sempre a portata di mano.

---

### 🔧 FASE 20: Risoluzione Diagnostiche TypeScript IDE & Compatibilità Compilatore
- [x] **20.1 Compatibilità Modulo TypeScript (`quasar.config.ts`)**:
  - Attivato `extendTsConfig(tsConfig)` in `quasar.config.ts` per forzare `compilerOptions.module = 'esnext'`.
  - Configurato `module: 'esnext'` per prevenire l'errore TS6046 su compilatori IDE che non supportano `--module preserve`.
- [x] **20.2 Tipizzazione Environment Variables & Client Vite (`src/env.d.ts` e `tsconfig.json`)**:
  - Aggiunta reference `/// <reference types="vite/client" />` e interfaccia esplicita `ImportMetaEnv` in `src/env.d.ts`.
  - Aggiunto `"types": ["vite/client"]` in `tsconfig.json` per risolvere l'errore TS2339 (`Property 'env' does not exist on type 'ImportMeta'`).
- [x] **20.3 Isolamento Cartella `.quasar` in `tsconfig.json`**:
  - Inserito `".quasar"` nella direttiva `exclude` del file root `tsconfig.json` per evitare che l'IDE crei conflitti tra i due file di configurazione tsconfig.
- [x] **20.4 Risoluzione Cascade Errori Alias & Parametri `any` Impliciti**:
  - Con il ripristino del motore di configurazione TypeScript, tutti gli alias (`stores/*`, `src/*`, `components/*`) si risolvono istantaneamente nell'IDE, eliminando a cascata i falsi positivi TS2307 e TS7006.

---

---

### 👁️ FASE 21: Sistema di Visibilità Elementi (Mostra / Nascondi) per Prodotti e Articoli Carosello
- [x] **21.1 Estensione Modello Dati `Product` ([src/types/product.ts](file:///home/chif-vas/projects/beauty-ambassador/src/types/product.ts))**:
  - Aggiunto il campo opzionale `active?: boolean` (default `true`).
- [x] **21.2 Toggle Visibilità Prodotti in Live Preview ([ProductCard.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ProductCard.vue))**:
  - Inserito il pulsante occhio `visibility` / `visibility_off` nella pillola in-place fluttuante su ciascuna card prodotto.
  - Aggiunto badge visivo rosso `Nascosto` e attenuazione opacità (`opacity: 0.72`) in modalità anteprima per prodotti non attivi.
  - Filtraggio reattivo in [ProductGrid.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ProductGrid.vue): i clienti pubblici non visualizzano i prodotti nascosti, mentre l'ambassador in anteprima può gestirli e riattivarli con un clic.
- [x] **21.3 Toggle Visibilità Articoli nel Carosello & Dialog Impostazioni**:
  - In [SectionSettingsDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/builder/SectionSettingsDialog.vue): pulsante rapido occhio `👁` per ogni riga articolo nella lista ordinabile con aggiornamento Firestore istantaneo.
  - In [ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue): pulsante di stato `[ Visibile / Nascosto ]` nel gruppo azioni fluttuante in alto a destra sulla slide attiva con badge di notifica su slide non attiva.
- [x] **21.4 Toggle Visibilità in Console Admin ([ProductListTable.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ProductListTable.vue) & [ProductFormDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ProductFormDialog.vue))**:
  - Pulsante rapido `👁` e chip badge "Nascosto" nella tabella di gestione prodotti dell'amministratore.
  - Controllo `q-toggle` "Prodotto Attivo / Nascosto" nel modale di modifica prodotto.

---

### 👤 FASE 22: Pulizia Avatar di Default (Zero Immagini Demo) & Risoluzione Duplicati TypeScript
- [x] **22.1 Rimozione Stock Photo Quasar Demo (`https://cdn.quasar.dev/img/avatar.png`)**:
  - Eliminato il fallback hardcoded sull'immagine demo Quasar in [LandingPage.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/LandingPage.vue) e `https://placehold.co/200` in [ProfileSettingsTab.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/settings/ProfileSettingsTab.vue).
  - Implementata la computed `hasCustomAvatar`: se l'utente non ha caricato un'immagine, l'avatar mostra un contenitore neutro pulito con icona silhouette `person` (`color="grey-5"`), senza caricare immagini di terze persone.
  - Aggiunto pulsante `Rimuovi Foto Profilo` in [ProfileSettingsTab.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/settings/ProfileSettingsTab.vue) per permettere all'ambassador di azzerare la propria foto in qualsiasi momento.
- [x] **22.2 Risoluzione Diagnostica TS2451 in `ArticleCarousel.vue`**:
  - Rimossa la dichiarazione duplicata `let list` alle righe 35-36 di [ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue).

---

### 🚀 FASE 23: Configurazione Firebase Hosting Multi-Site CI/CD (Risoluzione Exit Code 2)
- [x] **23.1 Riconciliazione Multi-Sito su Singolo Progetto `glowandcarespace-maria`**:
  - Diagnosticato che sia il sito primario (`glowandcarespace-maria`) sia il sito di staging (`staging-glowandcarespace`) sono due siti di hosting appartenenti allo stesso progetto Google/Firebase `glowandcarespace-maria`.
- [x] **23.2 Mappatura Target in `firebase.json` & `.firebaserc`**:
  - Trasformata la configurazione `"hosting"` in `firebase.json` in un array multi-target con target espliciti `"staging"` e `"production"`.
  - Mappati i target `staging` (`staging-glowandcarespace`) e `production` (`glowandcarespace-maria`) in `.firebaserc`.
- [x] **23.3 Aggiornamento GitHub Actions Workflows**:
  - In [firebase-hosting-dev.yml](file:///home/chif-vas/projects/beauty-ambassador/.github/workflows/firebase-hosting-dev.yml): impostato `projectId: glowandcarespace-maria`, `target: staging` e autenticazione con `FIREBASE_SERVICE_ACCOUNT_GLOWANDCARESPACE_MARIA`.
  - In [firebase-hosting-merge.yml](file:///home/chif-vas/projects/beauty-ambassador/.github/workflows/firebase-hosting-merge.yml): impostato `projectId: glowandcarespace-maria` e `target: production`.

---

### 🧭 FASE 24: Evidenziazione Attiva nel Drawer di Navigazione Admin (`AdminLayout.vue`)
- [x] **24.1 Rilevamento Reattivo Route Attiva**:
  - Integrato `useRoute` da `vue-router` e funzione helper `isRouteActive` per verificare con precisione se la route corrente corrisponde alla voce di menu.
- [x] **24.2 Styling Luxury & Visual Feedback**:
  - Applicata classe `.admin-nav-item--active` con sfondo leggero primario (`rgba(52, 20, 20, 0.08)`), bordo sinistro a rilievo `4px solid var(--q-primary)`, icona e testo in grassetto primario `text-primary text-weight-bold`.
  - Inserito dot circolare indicatore sul lato destro (`side`) per rendere evidente e immediato a colpo d'occhio su quale sezione della console si trova l'ambassador.

---

### 🎨 FASE 25: Tipografia & Selezione Font del Brand in Impostazioni (`FontSettingsSection.vue`)
- [x] **25.1 Sub-Componente Modulare `FontSettingsSection.vue` (§0.2 / §0.3 AGENTS.md)**:
  - Creata una nuova sezione dedicata in `src/components/settings/FontSettingsSection.vue` per selezionare:
    - **Font dei Titoli**: *Playfair Display* (Serif Elegante), *Cormorant Garamond* (Serif Lusso), *Cinzel* (Serif Classico), *Plus Jakarta Sans* (Sans Moderno), *Montserrat* (Sans Geometrico), *Figtree* (Sans Pulito).
    - **Font per il Corpo del Testo**: *Figtree* (Consigliato leggibilità), *Plus Jakarta Sans* (Moderno), *Inter* (Neutro), *Playfair Display* (Total Luxury).
  - Card interattive con anteprima visiva reale renderizzata nel font corrispondente, badge di categoria e descrizione del mood.
- [x] **25.2 Precaricamento Tipografico & Variabili CSS `:root`**:
  - Aggiornato [index.html](file:///home/chif-vas/projects/beauty-ambassador/index.html) per precaricare i Google Fonts necessari.
  - Aggiornato [app.scss](file:///home/chif-vas/projects/beauty-ambassador/src/css/app.scss) con variabili dinamiche `--site-title-font` e `--site-body-font`.
- [x] **25.3 Integrazione Pinia & Aggiornamento Dinamico a 0ms**:
  - Estesa l'interfaccia `PublicProfile` in [settings.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/settings.ts) con `titleFont?: string` e `bodyFont?: string`.
  - In `applyTheme()`: aggiornamento in tempo reale delle variabili CSS su `document.documentElement`, consentendo l'anteprima istantanea senza ricaricare la pagina.
- [x] **25.4 Integrazione nella Scheda "Colori & Branding" ([BrandingSettingsTab.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/settings/BrandingSettingsTab.vue))**:
  - Inserito `FontSettingsSection` nella scheda e potenziata la card di anteprima dal vivo per mostrare titolo del salone, bio e pulsanti con i colori e i font selezionati.

---

### ✍️ FASE 26: Funzioni Avanzate di Formattazione Testo Rich-Text per Articoli e Prodotti
- [x] **26.1 Integrazione `<q-editor>` su Articoli ([ArticleFormDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ArticleFormDialog.vue))**:
  - Sostituita la semplice textarea con l'editor rich-text `<q-editor>` per la *Descrizione / Testimonianza Narrativa*.
  - Configurato il set completo di funzioni di formattazione: grassetto, corsivo, sottolineato, barrato, allineamenti (sinistra, centro, destra, giustificato), elenchi puntati e numerati, divisori orizzontali, link, pulizia formato e annulla/ripristina.
- [x] **26.2 Potenziamento Funzioni Editor Prodotti ([ProductFormDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ProductFormDialog.vue))**:
  - Aggiornati i campi *Product Description* e *Product Instructions* con la toolbar uniforme e avanzata a 5 sezioni (stili, allineamenti, liste, utilità, history).
- [x] **26.3 Rendering HTML & Supporto Stili nella Vetrina Pubblica ([ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue))**:
  - Aggiornato il rendering della descrizione da stringa pura a `v-html="currentArticle.description"` con regole SCSS dedicate per paragrafi, margini e liste puntate/numerate.
  - Aggiornata la scheda di anteprima live in [ArticleFormDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ArticleFormDialog.vue) con `v-html`.

---

### 🛡️ FASE 27: Risoluzione Race-Condition & Deduplicazione Istantanea Store (Prodotti & Articoli)
- [x] **27.1 Deduplicazione Reattiva su `addProduct` ([src/stores/products.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/products.ts))**:
  - Risolta la race-condition per cui `onSnapshot` inseriva il nuovo documento prima del termine di `addProduct`, causando l'inserimento duplicato in memoria.
  - Aggiunto controllo preventivo `if (!products.value.some(p => p.id === docRef.id))` e mappatura `Map<string, Product>` in `onSnapshot` per garantire zero duplicati a schermo.
- [x] **27.2 Deduplicazione Reattiva su `addArticle` ([src/stores/articles.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/articles.ts))**:
  - Applicata la medesima architettura di protezione a `addArticle` e al listener realtime degli articoli.
- [x] **27.3 Protezione Anti-Doppio Clic & Audit Logger ([AdminProducts.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminProducts.vue), [AdminArticles.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminArticles.vue), [ProductGrid.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ProductGrid.vue), [LandingPage.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/LandingPage.vue))**:
  - Aggiunti flag di blocco `isDuplicating` durante l'esecuzione asincrona per evitare click ravvicinati accidentali.
  - Rimossi tutti i `console.error` a favore di `useSecureLogger()` nel pieno rispetto della regola §4.

---
*Piano redatto in conformità con [AGENTS.md](file:///home/chif-vas/projects/beauty-ambassador/AGENTS.md) — Modalità Staging su branch `dev`.*

