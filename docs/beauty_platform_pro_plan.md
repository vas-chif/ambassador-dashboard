# 🌌 Beauty Platform Pro - Checklist Tecnica & Roadmap

> **Obiettivo**: Piattaforma unificata per la gestione di Ambasciatori, Saloni e Barbieri con focus vendita WhatsApp.
> **Regole**: §1-§6 ProfessioneSiCura (Security, Architecture, Cost Optimization).

---

## 🛠️ FASE 1: Fondamenta & Setup Core
- [ ] **Setup Iniziale Project Struture**
  - [ ] Inizializzazione Quasar/Vite con TypeScript Strict Mode (§3.9)
  - [ ] Configurazione Yarn Workspaces per separare `admin` e `public`
  - [ ] Integrazione `useSecureLogger` (Zero console.log) (§1.3)
- [ ] **Configurazione Firebase Pro**
  - [ ] Setup Environments: `development`, `staging`, `production` (§6)
  - [ ] Configurazione Emulatore Firebase locale per sviluppo (§6)
  - [ ] Definizione Custom Claims per ruoli (SuperAdmin, SalonAdmin, Ambassador) (§2)

---

## 🏗️ FASE 2: Architettura Multi-Tenant (§3)
- [ ] **Tenant Engine (Il cuore della piattaforma)**
  - [ ] Implementazione `TenantStore` (Pinia) per caricamento configurazione via Slug
  - [ ] Sistema di Routing Dinamico: `/:tenantSlug` per siti pubblici
  - [ ] Logica di isolamento dati Firestore: `where("tenantId", "==", slug)`
- [ ] **Data Schema & Types (§3.1)**
  - [ ] Definizione `ITenantConfig` (Colori, Logo, Tipo, Contatti)
  - [ ] Definizione `IProduct` con campo `whatsappTemplate` personalizzabile
  - [ ] Definizione `IArticle` per il blog/consulenze

---

## 👨‍💼 FASE 3: Modulo Super Admin (Il tuo Pannello)
- [ ] **Ambassadors & Salons Management**
  - [ ] Dashboard globale con statistiche di tutti i tenant
  - [ ] Form creazione nuovo Tenant (Salone o Ambasciatore)
  - [ ] Funzione "Login As": possibilità per il Super Admin di visionare le dashboard tenant
- [ ] **Audit & Compliance (§1.5)**
  - [ ] Logging delle azioni critiche (GDPR Art. 30)
  - [ ] Sistema di backup periodico delle 11 collezioni principali

---

## 💇‍♂️ FASE 4: Dashboard Tenant (Pannello Salone/Ambasciatore)
- [ ] **Personalizzazione & Catalogo**
  - [ ] Gestione prodotti con upload immagini sanificato (§2.1 / §3.1)
  - [ ] Configurazione messaggi WhatsApp specifici per ogni prodotto
  - [ ] Drag & Drop Builder per la propria Landing Page (§3.2)
- [ ] **Sicurezza Dashboard (§1.4)**
  - [ ] Implementazione Auto-Logout dopo 15 minuti (§1.4)
  - [ ] Protezione percorsi tramite Auth Guard e Custom Claims

---

## 🎨 FASE 5: User Experience & Public Page
- [ ] **Design Elite (§Designer Standard)**
  - [ ] Implementazione Design System "Beauty Pro" (Gradients, Glassmorphism)
  - [ ] Micro-animazioni per interazione tasto WhatsApp
- [ ] **Checkout WhatsApp**
  - [ ] Generatore dinamico di link WhatsApp codificato (Base64/URI)
  - [ ] Integrazione pulsante flottante "Richiedi Consulenza"

---

## 🛡️ FASE 6: Sicurezza & Hardening (Layer 2 & 3)
- [ ] **Firestore Rules (§2.2)**
  - [ ] Regole stringenti: un tenant può leggere/scrivere solo i propri ID
- [ ] **Cloud Functions (europe-west1) (§3.4)**
  - [ ] Validazione backend per creazione nuovi account
  - [ ] Sanificazione automatica stringhe via Backend

---
*Piano generato il: 2026-04-08*
*Sviluppato da: Antigravity AI Agent*
