# 🚀 Beauty Ambassador Platform - Roadmap

## 📂 1. Fondamenta & Sicurezza
- [x] Implementazione login Admin (Email/Password)
- [x] Sistema di recupero password (Firebase Auth)
- [x] Protezione registrazione (il tasto scompare se l'Admin esiste già)
- [x] Correzione Logger di sistema (No `console.log`)
- [x] Regole di sicurezza Firestore per collezione `users`

## 📊 2. Dashboard & Navigazione
- [x] Restyling Dashboard con card cliccabili
- [x] Centralizzazione Interfacce Navigazione (`src/types/navigation.ts`)
- [x] Fonte unica di verità per il Menu (`src/shared/navigation.ts`)
- [x] Conteggio dinamico Prodotti e Articoli nella Dashboard

## 👥 3. Gestione Multi-Ambassador (Prossimo Passo)
- [ ] Migrazione Store `ambassador.ts` per supporto lista completa
- [ ] Pagina **AdminAmbassadors.vue**: Tabella gestione (Lista/Aggiungi/Elimina)
- [ ] Generazione automatica Slug e Codice univoco per ogni ambasciatore
- [ ] Isolamento Dati: Ogni prodotto/articolo deve avere un `ambassadorId` (Multi-Account)

## 🎨 4. Landing Page & Builder
- [ ] Ottimizzazione `AmbassadorPage.vue` per caricamento dinamico via Slug
- [ ] Drag & Drop Builder: Funzionalità salvataggio widget per ID specifico
- [ ] Anteprima mobile "WhatsApp Style" per i prodotti

---
> [!TIP]
> Ogni volta che completiamo un punto, aggiorneremo questo file.
