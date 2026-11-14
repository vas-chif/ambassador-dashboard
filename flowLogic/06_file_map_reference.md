# 🗺️ Mappa dei File — "Cosa trovi e dove lo trovi"

Questa guida rapida elenca ogni file e directory del progetto, spiegandone con precisione il ruolo, le responsabilità e i collegamenti principali.

---

## 📁 1. Configurazione Root & Infrastruttura

| File | Descrizione & Scopo |
| :--- | :--- |
| **[AGENTS.md](file:///home/chif-vas/projects/beauty-ambassador/AGENTS.md)** | **Single Source of Truth** per gli AI Agent: regole dei 2 branch (`dev`/`main`), Explain-Before-Doing, policy 3-layer e standard Elara. |
| **[project_rules.md](file:///home/chif-vas/projects/beauty-ambassador/project_rules.md)** | Linee guida di ingegneria del software (Yarn, TypeScript strict, ottimizzazione costi). |
| **[.firebaserc](file:///home/chif-vas/projects/beauty-ambassador/.firebaserc)** | Mappatura dei progetti Firebase: `staging` (`staging-glowandcarespace`) e `production` (`glowandcarespace-maria`). |
| **[firebase.json](file:///home/chif-vas/projects/beauty-ambassador/firebase.json)** | Configurazione di Firebase Hosting (SPA rewrites su `index.html`) e percorsi regole Firestore. |
| **[firestore.rules](file:///home/chif-vas/projects/beauty-ambassador/firestore.rules)** | Regole di sicurezza del database Firestore (permessi di lettura pubblica e scrittura autenticata). |
| **[storage.rules](file:///home/chif-vas/projects/beauty-ambassador/storage.rules)** | Regole di sicurezza per il Cloud Storage (immagini prodotti e upload protetti). |
| **[package.json](file:///home/chif-vas/projects/beauty-ambassador/package.json)** | Dipendenze e script Yarn (`yarn dev`, `yarn build`, `yarn lint`, `yarn deploy:staging`, `yarn deploy:prod`). |
| **[tsconfig.json](file:///home/chif-vas/projects/beauty-ambassador/tsconfig.json)** | Configurazione TypeScript autonoma con `"module": "esnext"` e mapping dei percorsi. |

---

## 🚪 2. Inizializzazione Applicazione (`src/boot/`)

| File | Descrizione & Scopo |
| :--- | :--- |
| **[src/boot/firebase.ts](file:///home/chif-vas/projects/beauty-ambassador/src/boot/firebase.ts)** | Inizializza l'istanza Firebase con le variabili d'ambiente (`auth`, `db`, `storage`). |
| **[src/boot/auth-init.ts](file:///home/chif-vas/projects/beauty-ambassador/src/boot/auth-init.ts)** | Esegue il ripristino dell'autenticazione utente al caricamento iniziale della web app. |
| **[src/boot/i18n.ts](file:///home/chif-vas/projects/beauty-ambassador/src/boot/i18n.ts)** | Configurazione del supporto multilingua Vue I18n. |

---

## 🏛️ 3. Layout Applicativi (`src/layouts/`)

| File | Descrizione & Scopo |
| :--- | :--- |
| **[src/layouts/AdminLayout.vue](file:///home/chif-vas/projects/beauty-ambassador/src/layouts/AdminLayout.vue)** | Layout dell'Area Amministrativa con barra superiore, pulsante logout e drawer di navigazione. |
| **[src/layouts/AmbassadorLayout.vue](file:///home/chif-vas/projects/beauty-ambassador/src/layouts/AmbassadorLayout.vue)** | Shell leggera e pulita per le pagine pubbliche dei clienti. |
| **[src/layouts/BlankLayout.vue](file:///home/chif-vas/projects/beauty-ambassador/src/layouts/BlankLayout.vue)** | Layout a schermo intero senza intestazioni, utilizzato per la pagina di login `/admin/login`. |

---

## 📄 4. Pagine (`src/pages/`)

### A. Pagine Riservate Admin (`src/pages/admin/`)
* **[AdminLogin.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminLogin.vue)**: Login email/password con dialog integrato per il recupero password.
* **[AdminDashboard.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminDashboard.vue)**: Console principale con card KPI (Prodotti, Articoli, Impostazioni Profilo) e banner rapido Live Preview.
* **[AdminPreview.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminPreview.vue)**: Live Preview interattivo per testare la vista Mobile/Tablet/Desktop, spostare e nascondere sezioni.
* **[AdminProducts.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminProducts.vue)**: Schermata per la gestione e l'ordinamento dei prodotti in vendita.
* **[AdminArticles.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminArticles.vue)**: Gestione di articoli editoriali e storie prima/dopo per il carosello superiore.
* **[AdminSettings.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminSettings.vue)**: Schede Profilo, Titoli Vetrina, Banner Promozionale, Palette Colori e QR Code.

### B. Pagine Pubbliche & Builder
* **[LandingPage.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/LandingPage.vue)**: Vetrina principale su `/` con hero profilo, carosello articoli, banner pillola e griglia prodotti.
* **[AmbassadorPage.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/AmbassadorPage.vue)**: Vetrina dinamica su `/:ambassadorId` che assembla i widget salvati su Firestore.
* **[EditorPage.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/EditorPage.vue)**: Pagina host per il Page Builder Drag & Drop.

---

## 🧩 5. Componenti Modulari (`src/components/`)

### A. Componenti Amministrativi (`src/components/admin/`)
* **[ProductListTable.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ProductListTable.vue)**: Tabella prodotti con ordinamento drag & drop e comandi modifica/cancella.
* **[ProductFormDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/admin/ProductFormDialog.vue)**: Modale di inserimento/modifica prodotto con upload e compressione immagini.

### B. Widget Vetrina Pubblica (`src/components/widgets/`)
* **[ProductGrid.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ProductGrid.vue)**: Griglia di prodotti per i clienti, con rating a stelle e ordine WhatsApp.
* **[ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue)**: Carosello multimediale con doppia modalità Desktop e Mobile Touch.
* **[ContactDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ContactDialog.vue)**: Modale di invio email con supporto EmailJS.

### C. Componenti Impostazioni & Branding (`src/components/settings/`)
* **[ProfileSettingsTab.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/settings/ProfileSettingsTab.vue)**: Gestione anagrafica ambassador, bio, social e caricamento/rimozione avatar.
* **[BrandingSettingsTab.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/settings/BrandingSettingsTab.vue)**: Gestione palette colori predefinite, colori personalizzati primario/secondario e anteprima dal vivo.
* **[FontSettingsSection.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/settings/FontSettingsSection.vue)**: Selezione visiva dei font per i titoli e per il corpo del testo, con card interattive e anteprima tipografica.
* **[QrCodesSettingsTab.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/settings/QrCodesSettingsTab.vue)**: Generazione, visualizzazione fullscreen e download dei codici QR.
* **[EmailConfigTab.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/settings/EmailConfigTab.vue)**: Configurazione parametri di integrazione EmailJS.

### D. Page Builder (`src/components/builder/`)
* **[PageEditor.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/builder/PageEditor.vue)**: Canvas drag & drop per comporre e riordinare i widget della pagina.

---

## 🗄️ 6. Gestione dello Stato (`src/stores/`)

* **[auth.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/auth.ts)**: Gestione login, sessione, recupero credenziali e logout.
* **[products.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/products.ts)**: Listener Realtime, CRUD prodotti, compressione canvas e calcolo rating recensioni.
* **[settings.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/settings.ts)**: Gestione profilo, articoli, banner promozionale, colori tema CSS e QR Code.
* **[ambassador.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/ambassador.ts)**: Caricamento del profilo e del layout widget dal documento dell'ambassador.
* **[builder.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/builder.ts)**: Stato attivo del builder, aggiunta/rimozione sezioni e salvataggio layout.

---

## 🛠️ 7. Logica Condivisa & Tipi (`src/shared/`, `src/composables/`, `src/types/`)

* **[src/shared/logger.ts](file:///home/chif-vas/projects/beauty-ambassador/src/shared/logger.ts)**: `useSecureLogger()` per log conformi al GDPR con oscuramento automatico di email, telefoni e carte.
* **[src/shared/navigation.ts](file:///home/chif-vas/projects/beauty-ambassador/src/shared/navigation.ts)**: Definizione centralizzata del menu della dashboard.
* **[src/composables/useProductInteractions.ts](file:///home/chif-vas/projects/beauty-ambassador/src/composables/useProductInteractions.ts)**: Logica di Like, Salva nei preferiti, Condivisione e Rating prodotti.
* **[src/types/product.ts](file:///home/chif-vas/projects/beauty-ambassador/src/types/product.ts)**: Interfaccia TypeScript del prodotto.
* **[src/types/ambassador.ts](file:///home/chif-vas/projects/beauty-ambassador/src/types/ambassador.ts)**: Interfaccia del profilo ambassador e configurazione widget.
