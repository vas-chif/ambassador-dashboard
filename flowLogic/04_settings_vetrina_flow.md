# ⚙️ Flusso 04 — Impostazioni, Branding & Banner Promozionale

Questo documento descrive la configurazione del profilo dell'ambassador, la gestione del branding dinamico (colori, avatar, link social), la personalizzazione dei titoli delle sezioni della vetrina e del banner promozionale.

---

## 📍 Dove si trova il codice

| Elemento | Percorso File | Ruolo Principale |
| :--- | :--- | :--- |
| **Pagina Impostazioni (Admin)** | [src/pages/admin/AdminSettings.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminSettings.vue) | Interfaccia a tab: Profilo, Vetrina & Banner, QR Code, EmailJS. |
| **Store Impostazioni** | [src/stores/settings.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/settings.ts) | Gestione stato `profile`, caricamento avatar, applicazione colori CSS in tempo reale. |
| **Vetrina Pubblica (Consumatore)** | [src/pages/LandingPage.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/LandingPage.vue) | Rendering reattivo dei dati profilo, del banner ovale e del titolo prodotti. |
| **Dialogo Contatti Email** | [src/components/widgets/ContactDialog.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ContactDialog.vue) | Invio messaggi diretti tramite EmailJS con credenziali configurate. |
| **Documento Database** | Cloud Firestore | Singolo documento `/settings/public_profile`. |

---

## 🎨 Elementi di Personalizzazione Gestiti

```mermaid
flowchart TD
    subgraph DashboardSettings ["⚙️ /admin/settings (Pannello Profilo & Vetrina)"]
        ProfData["Dati Profilo: Nome, Bio, Avatar, Social (WhatsApp, IG, TikTok)"]
        ColorPalette["Colori Brand: Primary & Secondary (Color Picker o Quick Palettes)"]
        VetrinaTitles["Titolo Sezione Prodotti (es. 'I Miei Prodotti Preferiti')"]
        ActionBannerSettings["Banner Promozionale Ovale: Toggle, Testo Promo, Testo Bottone, Link"]
        QRCodes["QR Code Manager: Creazione, Anteprima Zoom e Download"]
    end

    subgraph Firestore ["🔥 Cloud Firestore (/settings/public_profile)"]
        PublicDoc[("Documento 'public_profile'")]
        DashboardSettings -->|updateProfile()| PublicDoc
    end

    subgraph PublicLanding ["🌐 Landing Page Pubblica"]
        PublicDoc -.->|subscribeToProfile()| Header["Header con Avatar, Nome e Pulsanti Social WhatsApp/IG"]
        PublicDoc -.->|setCssVar()| Theme["Applicazione Dinamica Variabili CSS Quasar/Tailwind"]
        PublicDoc -.-> ActionBanner["Banner Promozionale Ovale (Pill Banner)"]
        PublicDoc -.-> ProdTitle["Titolo Dinamico sopra la Griglia Prodotti"]
    end
```

---

## 🛠️ Dettaglio delle Funzionalità

### 1. Titolo Personalizzato della Griglia Prodotti
* **Campo**: `productsSectionTitle`
* **Dove si imposta**: In [AdminSettings.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminSettings.vue) nella sezione *"Personalizzazione Vetrina & Banner"*.
* **Comportamento**: Permette a ciascun professionista di rinominare la testata della propria galleria (es. *"I Miei Prodotti Preferiti"*, *"Linea Viso Professionale"*, *"Trattamenti Esclusivi"*). Se il campo viene lasciato vuoto, il sistema adotta automaticamente il default elegante *"I Miei Prodotti Preferiti"*.

### 2. Banner Promozionale a Pillola (Action Banner)
Collocato tra il carosello hero e la griglia prodotti:
* **`actionBannerEnabled`**: Un interruttore toggle che permette di nascondere o mostrare il banner con un clic.
* **`actionBannerText`**: Il messaggio promozionale visibile a sinistra (es. *"Acquista qui con codice sconto la tua Skin Care e integrazione personalizzata"*).
* **`actionBannerButtonText`**: L'etichetta del pulsante circolare a destra (es. *"Skin Care"*, *"Promo"*, *"Ordina"*).
* **`actionBannerUrl`**: L'URL di destinazione. Se non specificato, reindirizza in automatico alla chat WhatsApp del professionista.

### 3. Palette Colori & Tema Dinamico
In `settingsStore.applyTheme()`:
* Quando i colori primario e secondario vengono salvati o selezionati tramite le palette predefinite (*Luxury Gold*, *Classic Taupe*, *Ocean*, ecc.), Quasar aggiorna le CSS variables globali (`--q-primary`, `--q-secondary`).
* L'intera vetrina assume istantaneamente l'identità visiva del salone o dell'ambassador.

### 4. Gestione QR Code
* L'ambassador può caricare e nominare QR code specifici (es. per il proprio catalogo WhatsApp, recensioni Google o pagina personale).
* Include funzioni di **Zoom ad alta risoluzione** per mostrare il QR code a schermo intero e **Download automatico** per la stampa.

### 5. Tipografia del Brand & Font Dinamici
* **Campi**: `titleFont` (Font per Heading e Brand Name) e `bodyFont` (Font per il corpo del testo e descrizioni).
* **Componente dedicato**: [FontSettingsSection.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/settings/FontSettingsSection.vue) integrato nella tab *Colori & Branding*.
* **Font Titoli Selezionabili**:
  - *Playfair Display* (Serif Elegante, Editoriale)
  - *Cormorant Garamond* (Serif Lusso, Cosmetica d'élite)
  - *Cinzel* (Serif Classico, Profumeria di nicchia)
  - *Plus Jakarta Sans* (Sans Moderno, Beauty Tech)
  - *Montserrat* (Sans Geometrico, Audace)
  - *Figtree* (Sans Pulito, Minimalista)
* **Font Corpo Selezionabili**: *Figtree*, *Plus Jakarta Sans*, *Inter*, *Playfair Display*.
* **Reattività Istantanea**: All'interno di `settingsStore.applyTheme()`, le variabili CSS `:root` (`--site-title-font` e `--site-body-font`) vengono aggiornate in tempo reale su `document.documentElement`, consentendo l'anteprima istantanea a 0ms senza refresh di pagina.

