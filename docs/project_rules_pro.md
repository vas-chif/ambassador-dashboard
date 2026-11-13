# 🎯 Regole Progetto Beauty Platform Pro - Linee Guida AI (Senior Level)

> **IMPORTANTE**: Questo file contiene le fondamenta architetturali e di sicurezza. 
> L'AI deve seguire SEMPRE queste linee guida. Non sono ammesse eccezioni.
> **Standard**: Senior Full-Stack Developer + Security Architect.

---

## 📋 **§1. REGOLE FONDAMENTALI (Priorità Massima)**

1. **§1.1 Package Manager**: Usare esclusivamente **YARN**. Mai usare `npm`.
2. **§1.2 JWT Navigation First**: Ruoli e permessi DEVONO essere nei Custom Claims. Zero query Firestore per il controllo accessi durante la navigazione.
3. **§1.3 useSecureLogger**: MAI usare `console.log`. Ogni evento deve essere tracciato tramite il logger centralizzato (GDPR Art. 32).
4. **§1.4 Auto-Logout**: Logout automatico dopo 15 minuti di inattività in ogni Dashboard admin.
5. **§1.5 Triple Layer Security**: Ogni restrizione UI (`v-if`) DEVE avere il Layer 2 (Rules) e il Layer 3 (Cloud Functions) corrispondente.

---

## 🛡️ **§2. SICUREZZA, PRIVACY & CRITTOGRAFIA**

### **§2.1 Crittografia Client-Side (PII Protection)**
I dati sensibili (Nome, Cognome, Telefono, Indirizzo) DEVONO essere criptati nel browser tramite **AES-256-GCM** prima dell'invio a Firestore.

```typescript
// ✅ CORRETTO
const encryptedData = await encryptSensitiveFields(userProfile);
await setDoc(doc(db, 'users', uid), encryptedData);

// ❌ SBAGLIATO
await setDoc(doc(db, 'users', uid), userProfile); // Dati in chiaro su DB
```

### **§2.2 Protezione SuperAdmin (MFA Obligatory)**
L'accesso ai ruoli `admin` e `superAdmin` richiede obbligatoriamente il **Multi-Factor Authentication (MFA)**.
- Il frontend deve bloccare l'accesso alla dashboard se `auth.currentUser.multiFactor.enrolledFactors` è vuoto per questi ruoli.

### **§2.3 Messaggistica & Ordini (Layer 3 Authorization)**
La creazione di entità critiche (Ordini, Nuovi Ambasciatori) è **VIETATA** direttamente dal client. 
Deve passare esclusivamente per **Cloud Functions** (§3.4).

```javascript
// Firestore Rules
match /orders/{orderId} {
  allow create: if false; // 🔒 Bloccato dal client
}
```

---

## 🏗️ **§3. PERFORMANCE & LIMITI (Anti-Stall)**

### **§3.1 Limiti di Query & Debugging**
Per motivi di costo e sicurezza, ogni query deve avere un limite. **ATTENZIONE**: Se dimentichi il limite nel codice Vue, Firestore restituirà `Permission Denied` a causa delle Rules.

```typescript
// ✅ CORRETTO (Allineato alle rules)
const q = query(collection(db, 'products'), limit(100));

// ❌ SBAGLIATO (Causa Permission Denied inspiegabile)
const q = query(collection(db, 'products')); 
```

### **§3.2 Accesso Immagini & Storage**
Le immagini (Avatar, Foto Prodotti) non devono essere pubbliche tramite URL "indovinabili".
- Usare Firebase Storage Rules per permettere la lettura solo ad utenti autenticati o legati allo slug specifico.
- Le immagini sensibili devono essere caricate con metadati di restrizione.

---

## 📝 **§4. STANDARD DI CODICE**

1. **File Header JSDoc**: Obbligatorio in ogni file (File, Description, Author, Created, Modified).
2. **Fine Funzione**: Marcatore obbligatorio `/*end functionName*/`.
3. **Vue Structure**: Ordine: `<script setup>` -> `<template>` -> `<style scoped>`.
4. **Audit Trail Immutabile**: I log di sistema devono avere `allow delete: if false` nelle Firestore Rules.

---
*Creato per: Beauty Platform Pro*
*Data Ultima Modifica: 2026-04-09*
