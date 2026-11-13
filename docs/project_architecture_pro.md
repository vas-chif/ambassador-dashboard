# 🏗️ Architettura Beauty Platform Pro - Struttura Centralizzata

> **Standard**: Centralizzazione totale (`shared/`) e Interfaccia Dinamica.
> **Obiettivo**: Massima riutilizzabilità e flessibilità del layout.

---

## 📂 1. Struttura delle Cartelle (Monorepo-Style)

```bash
/src
  ├── /boot            # Inizializzazione Firebase, I18n, Plugins
  ├── /css             # Design System (Variabili, Temi, Global CSS)
  ├── /shared          # 💎 IL CUORE: Disponibile per tutto il progetto
  │   ├── /types       # Interfacce TS (ITenant, IProduct, IOrder)
  │   ├── /stores      # Pinia Stores (Auth, Tenant, Builder, Cart)
  │   ├── /composables # Logica condivisa (useEncryption, useLogger, usePayment)
  │   ├── /utils       # Helper (validation, currency, formatting)
  │   └── /api         # Chiamate Firebase/Cloud Functions centralizzate
  ├── /components      # Componenti Vue riutilizzabili
  │   ├── /atomic      # Elementi base (Btn, Input, Badge)
  │   ├── /widgets     # Blocchi della pagina (Hero, ProductCard, Gallery)
  │   └── /builder     # Componenti specifici per il Drag&Drop
  ├── /modules         # Divisione logica delle aree
  │   ├── /admin       # Dashboard SuperAdmin (Tu)
  │   ├── /tenant      # Dashboard Cliente (Barbiere/Ambasciatore)
  │   └── /public      # Vetrina Pubblica (Landing Page dinamica)
  └── /router          # Percorsi con Guard di sicurezza (MFA, Subscription)
```

---

## 🧱 2. Componenti "Spostabili" (Dynamic Layout Engine)

Per rendere il sito **User-Friendly** e permettere ai saloni di cambiare l'ordine delle sezioni:

### A. I Widget Atomici
Ogni blocco della pagina (es: Carosello Prodotti) deve essere un file indipendente in `/components/widgets/`. 
- **Regola**: Deve essere "puro", ovvero riceve tutto via `props` e non conosce il resto della pagina.

### B. Il Layout JSON (Firestore)
La posizione dei componenti viene salvata come un array di configurazione:
```json
"layout": [
  { "id": "w1", "type": "HeroSection", "props": { "title": "Benvenuti" }, "order": 1 },
  { "id": "w2", "type": "ProductGrid", "props": { "category": "shampoo" }, "order": 2 }
]
```

### C. Il Dynamic Renderer
In `PublicPage.vue`, useremo un ciclo `v-for` che renderizza i componenti in base all'ordine salvato:
```vue
<component 
  v-for="widget in sortedWidgets" 
  :key="widget.id" 
  :is="componentStore.get(widget.type)" 
  v-bind="widget.props" 
/>
```

---

## 🚀 3. Vantaggi di questa scelta
1. **Recidività**: Se crei un nuovo widget per un Barbiere (es. "Tabella Prezzi Taglio"), lo puoi rendere disponibile a TUTTI con un click.
2. **Manutenibilità**: Se fixi un bug in un componente in `shared/`, si corregge in tutto il progetto (Admin, Tenant e Public).
3. **Velocità**: Usando uno store centralizzato per i tipi, non avrai mai errori di "dato mancante" tra Dashboard e Sito Pubblico.

---

## 🎨 4. Design System & Dynamic Themes
- **Core Platform (Admin/Tenant Dashboards)**:
  - Stile: **Premium Dark Mode**.
  - Colori: Background `#121212`, Accenti Oro (`#D4AF37`) e Viola Elettrico (`#8A2BE2`).
  - Obiettivo: Comunicare lusso e tecnologia.
- **Tenant Public Sites (Vetrine)**:
  - Totalmente personalizzabili tramite lo store `ITenantConfig`.
  - Ogni cliente può scegliere la propria Palette tramite il Color Picker della Dashboard.
  - I componenti devono usare variabili CSS (`--q-primary`, `--q-secondary`) che vengono iniettate dinamicamente al caricamento del Tenant.

---

## ⚡ 5. Cost Optimization & Persistence
- **Persistent Caching**: Utilizzo di `pinia-plugin-persistedstate` per salvare i dati dei tenant e dei cataloghi localmente.
- **TTL (Time To Live)**: I dati in cache scadono ogni 60 minuti o tramite aggiornamento manuale ("Refresh" dalla dashboard).
- **Risultato**: Riduzione drastica delle letture Firestore per visitatori che tornano più volte sulla stessa vetrina, mantenendo i costi di gestione vicini allo zero.
