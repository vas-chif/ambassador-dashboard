# 🌌 Beauty Platform Pro - Checklist Tecnica & Roadmap INTEGRALE

> **Obiettivo**: Piattaforma SaaS professionale (Ambasciatori & Saloni) con gestione abbonamenti Stripe.
> **Standard**: §1-§6 ProfessioneSiCura (Security, Architecture, Cost Optimization).

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

## 🏗️ FASE 2: Architettura Multi-Tenant (§3)
- [ ] **Tenant Engine (Il cuore della piattaforma)**
  - [ ] Implementazione `TenantStore` (Pinia) per caricamento configurazione via Slug
  - [ ] Sistema di Routing Dinamico: `/:tenantSlug` per siti pubblici
  - [ ] Logica di isolamento dati Firestore: `where("tenantId", "==", slug)`
- [ ] **Data Schema & Types (§3.1)**
  - [ ] Definizione `ITenantConfig` (Colori, Logo, Tipo, Contatti)
  - [ ] Definizione `IProduct` con campo `whatsappTemplate` personalizzabile
  - [ ] Definizione `IArticle` per il blog/consulenze

## 👨‍💼 FASE 3: Modulo Super Admin (Il tuo Pannello)
- [ ] **Ambassadors & Salons Management**
  - [ ] Dashboard globale con statistiche di tutti i tenant (Totale iscritti, fatturato globale)
  - [ ] Form creazione nuovo Tenant (Salone o Ambasciatore)
  - [ ] Funzione "Login As": possibilità per il Super Admin di visionare le dashboard tenant
- [ ] **Audit & Compliance (§1.5)**
  - [ ] Logging delle azioni critiche (GDPR Art. 30)
  - [ ] Sistema di backup periodico delle 11 collezioni principali

## 💇‍♂️ FASE 4: Dashboard Tenant (Pannello Salone/Ambasciatore)
- [ ] **Personalizzazione & Catalogo**
  - [ ] Gestione prodotti con upload immagini sanificato (§2.1 / §3.1)
  - [ ] Configurazione messaggi WhatsApp specifici per ogni prodotto
  - [ ] Drag & Drop Builder per la propria Landing Page (§3.2)
- [ ] **Sicurezza Dashboard (§1.4)**
  - [ ] Implementazione Auto-Logout dopo 15 minuti (§1.4)
  - [ ] Protezione percorsi tramite Auth Guard e Custom Claims

## 🎨 FASE 5: User Experience & Public Page
- [ ] **Design Elite (Aesthetics Standard)**
  - [ ] Implementazione Design System "Beauty Pro" (Gradients, Glassmorphism)
  - [ ] Micro-animazioni per interazione tasto WhatsApp
- [ ] **Checkout WhatsApp**
  - [ ] Generatore dinamico di link WhatsApp codificato (Base64/URI)
  - [ ] Integrazione pulsante flottante "Richiedi Consulenza"

## 🛡️ FASE 6: Sicurezza & Hardening (Layer 2 & 3)
- [ ] **Firestore Rules (§2.2)**
  - [ ] Regole stringenti: un tenant può leggere/scrivere solo i propri ID
  - [ ] Implementazione **Query Limits** (max 100/500) per prevenire stall e costi eccessivi
- [ ] **Cloud Functions (europe-west1) (§3.4)**
  - [ ] Validazione backend per creazione nuovi account e **Prodotti Critici** (Layer 3)
  - [ ] Sanificazione automatica stringhe via Backend
- [ ] **MFA & SuperAdmin Protection (§2.2)**
  - [ ] Obbligo di Multi-Factor Authentication per ruoli Admin/SuperAdmin
  - [ ] Check di attivazione MFA nel router guard della dashboard
- [ ] **Utility di Crittografia (§2.1)**
  - [ ] Implementazione AES-256-GCM per protezione PII (Dati Sensibili)
- [ ] **Storage Security (§3.2)**
  - [ ] Setup Security Rules per Firebase Storage (Protezione accesso immagini e avatar)

## 💳 FASE 7: Monetizzazione & Billing (Stripe Integration)
- [ ] **Setup Stripe Billing**
  - [ ] Configurazione Stripe Portal per la gestione abbonamenti (Piano Mensile/Annuale)
  - [ ] Sincronizzazione Webhook: aggiornamento automatico status `isActive` in Firestore
- [ ] **Gestione Periodo di Prova (Trial)**
  - [ ] Implementazione logica "Trial 14 days" alla creazione del Tenant
  - [ ] Sistema di notifiche "Remember to pay" (Email/Dashboard) 3 giorni prima della scadenza
- [ ] **Controllo Accessi & Sospensione Account**
  - [ ] Layer 2 (Rules): Blocco scrittura se `subscriptionStatus != 'active'`
  - [ ] Layer 3 (Cloud Functions): Controllo giornaliero scadenze e disattivazione automatica slug
- [ ] **Dashboard Fatturazione Tenant**
  - [ ] Visualizzazione status abbonamento e tasto "Manage Subscription" (Stripe Portal)

## ⚖️ FASE 8: Legal & Compliance (Recycle pattern ProfessioneSiCura)
- [ ] **Setup Pagine Legali (Struttura Mobile-First)**
  - [ ] **PrivacyPage.vue**: Implementazione GDPR Art. 13-14 (Trattamento dati, Ruoli, Note)
  - [ ] **TermsPage.vue**: Termini di servizio, codice del consumo e foro competente
  - [ ] **Cookie Policy**: Banner conforme con blocco preventivo dei cookie
- [ ] **Documentazione Dashboard**
  - [ ] **LicensePage**: Visualizzazione licenze Open Source e termini di licenza SaaS
  - [ ] **Audit Trail**: Registro accessi per conformità GDPR

## 📣 FASE 9: Servizi & Marketing (Landing Page Professionale)
- [ ] **Services Page (Vetrina per te)**
  - [ ] Tabella comparativa piani: "Basic" (Slug), "Pro" (Catalogo WhatsApp), "Elite" (Dominio Custom)
  - [ ] Showcase delle funzionalità per attirare nuovi saloni
  - [ ] Form di contatto / Pre-registrazione

## 🌟 FASE 10: Premium Features (Dominio Personalizzato)
- [ ] **Custom Domain Engine**
  - [ ] Sistema di mapping domini esterni (CNAME pointing)
  - [ ] Setup automatico SSL tramite Firebase Hosting o Cloudflare API
  - [ ] Whitelabeling: Rimozione branding della piattaforma per i piani Elite

---
*Piano integrale generato il: 2026-04-09*
*Sviluppato da: Antigravity AI Agent*
