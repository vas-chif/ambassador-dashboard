# 📰 Flusso 03 — Articoli & Carosello Hero

Questo documento illustra la gestione dei contenuti editoriali, storie prima/dopo, consulenze personalizzate e il loro rendering dinamico nel carosello in cima alla vetrina pubblica.

---

## 📍 Dove si trova il codice

| Elemento | Percorso File | Ruolo Principale |
| :--- | :--- | :--- |
| **Gestione Articoli (Admin)** | [src/pages/admin/AdminArticles.vue](file:///home/chif-vas/projects/beauty-ambassador/src/pages/admin/AdminArticles.vue) | Creazione, modifica, pubblicazione e ordinamento degli articoli/storie. |
| **Carosello Vetrina (Frontend)** | [src/components/widgets/ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue) | Visualizzazione reattiva a doppia modalità (Mobile Touch & Desktop Cards). |
| **Store & Operazioni** | [src/stores/settings.ts](file:///home/chif-vas/projects/beauty-ambassador/src/stores/settings.ts) | Listener `subscribeToArticles`, aggiunta, aggiornamento, cancellazione ed elaborazione cover. |
| **Collezione Database** | Cloud Firestore | Collezione radice `/articles/{articleId}`. |

---

## 🎯 Regola Fondamentale: Distinzione Articoli vs Prodotti

| Caratteristica | 📰 Articoli / Storie (`/articles`) | 📦 Prodotti (`/products`) |
| :--- | :--- | :--- |
| **Scopo** | Informare, educare, mostrare risultati prima/dopo, offrire consulenze. | Vendita diretta, catalogo, prezzo e carrello WhatsApp. |
| **Posizione nel Sito** | **Carosello in alto** (Hero Banner superiore). | **Griglia prodotti** sotto al titolo personalizzato. |
| **Campi Dati** | Titolo, descrizione, cover 16:9, testo bottone (*"Scopri di più"*), link URL, stato attivo, ordine. | Nome, prezzo, immagini multiple, categoria, stock, istruzioni d'uso, recensioni. |
| **Esempi Tipici** | *"Esperienze reali \| Prima e dopo"*, *"Integrazione su Misura"*, *"Fai il Test della Pelle"*. | *"Daily Ritual Advanced Omega"*, *"Skin Device 3-in-1"*, *"Crema Idratante"*. |

---

## 🔄 Diagramma di Flusso degli Articoli

```mermaid
flowchart TD
    subgraph AdminArticles ["👨‍💼 Admin (/admin/articles)"]
        CreateArticle["Crea Articolo (Titolo, Descrizione, Cover 16:9)"]
        ToggleStatus["Toggle Attivo/Nascosto (Pubblicazione Immediata)"]
        OrderInput["Imposta Campo Ordine (1, 2, 3...)"]
        
        CreateArticle --> StoreArticles["settingsStore.addArticle() / updateArticle()"]
        ToggleStatus --> StoreArticles
        OrderInput --> StoreArticles
    end

    subgraph Firestore ["🔥 Cloud Firestore"]
        ArtCol[("Collezione 'articles' (where active == true, order by 'order')")]
        StoreArticles --> ArtCol
    end

    subgraph PublicView ["📱 Vetrina Pubblica (ArticleCarousel.vue)"]
        ArtCol -.->|Realtime Snapshot| Carousel["ArticleCarousel.vue"]
        
        Carousel -->|Schermi Grandi (>= md)| DesktopCards["Slide Orizzontale con Cover e Card Testo Sovrapposta"]
        Carousel -->|Schermi Mobile (< md)| MobileCards["Carosello Verticale a Scheda Piena (Touch Swipe, 600px)"]
        
        DesktopCards --> CTAAction["Click Pulsante (Es. 'Scopri di Più') ➔ Apertura Link o Modale"]
        MobileCards --> CTAAction
    end
```

---

## 💡 Ottimizzazioni per Schermi Mobile

Il componente [ArticleCarousel.vue](file:///home/chif-vas/projects/beauty-ambassador/src/components/widgets/ArticleCarousel.vue) adotta una logica **responsive adattiva**:
* **Su Desktop**: Mostra un layout da rivista di lusso, con grande fotografia di sfondo e card laterale elegante con testo e pulsante d'azione.
* **Su Smartphone (`$q.screen.lt.md`)**: Si trasforma in un carosello verticale da **600px di altezza**, strutturato per la lettura rapida:
  1. Immagine in alto (40% dell'altezza).
  2. Titolo e sommario leggibili con scroll fluido.
  3. Pulsante di chiamata all'azione ben evidente e comodo per il pollice.

