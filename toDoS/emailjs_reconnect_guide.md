# 📧 Guida Risoluzione: Errore Invio Email (412 Invalid Grant - EmailJS)

> **Diagnosi Errore**: `POST https://api.emailjs.com/api/v1.0/email/send 412 (Precondition Failed)`  
> **Messaggio Ricevuto**: `Gmail_API: Invalid grant. Please reconnect your Gmail account`  
> **Stato Codice App**: ✅ **Nessun bug nel codice dell'app**. Il frontend Quasar/Vue 3 invia correttamente i dati all'API di EmailJS. Il blocco avviene a monte tra i server di EmailJS e Google.

---

## 🔍 Perché si verifica questo errore?

EmailJS è configurato per inviare le email tramite l'**API ufficiale di Gmail** utilizzando un'autorizzazione sicura OAuth2 (Google Sign-In).

L'errore `Invalid grant` indica che il **token di autorizzazione Google è scaduto o è stato revocato**. Questo accade normalmente quando:
1. **Scadenza periodica del token Google**: se l'app OAuth di Google è in modalità "Testing", i token scadono ogni 7 giorni; in produzione possono scadere dopo periodi di inattività o aggiornamenti di sicurezza Google.
2. **Cambio password dell'account Gmail**: se la password dell'account Google è stata modificata, Google invalida tutte le autorizzazioni terze collegate.
3. **Revoca permessi**: l'autorizzazione a EmailJS è stata rimossa dalle impostazioni di sicurezza dell'account Google (`myaccount.google.com/permissions`).

---

## 📋 CHECKLIST OPERATIVA: Come Ricollegare Gmail su EmailJS (2 Minuti)

Segui questi passaggi per ripristinare immediatamente l'invio delle email:

- [ ] **Passo 1 — Accesso alla Dashboard di EmailJS**:
  - Apri il browser e vai su [https://dashboard.emailjs.com/admin](https://dashboard.emailjs.com/admin).
  - Effettua il login con il tuo account EmailJS.

- [ ] **Passo 2 — Sezione Servizi Email (Email Services)**:
  - Nel menu laterale a sinistra, clicca su **"Email Services"** (o vai su [https://dashboard.emailjs.com/admin/services](https://dashboard.emailjs.com/admin/services)).
  - Noterai un avviso rosso/arancione accanto al tuo servizio Gmail attivo (es. icona di warning o stato disconnected).

- [ ] **Passo 3 — Ricollegamento dell'Account Gmail**:
  - Clicca sul servizio Gmail configurato per aprire le sue impostazioni.
  - Clicca sul pulsante **"Reconnect Account"** (oppure **"Connect Account"** / **"Sign in with Google"**).
  - Si aprirà la finestra popup di Google: seleziona l'indirizzo Gmail desiderato.
  - Seleziona la casella di spunta per concedere il permesso a EmailJS di inviare email a tuo nome (**"Invia email per tuo conto"**).
  - Clicca su **"Continua"** / **"Consenti"**.

- [ ] **Passo 4 — Test Diretto dalla Dashboard EmailJS**:
  - Dopo aver ricollegato l'account, rimarrai nella schermata del servizio.
  - Clicca sul pulsante **"Test It"** (oppure **"Save & Test"**).
  - Inserisci un'email di prova e verifica che lo stato ritorni `200 OK - Email sent successfully`.

- [ ] **Passo 5 — Test sul Sito Web**:
  - Torna sulla tua web app (o sulla console admin/vetrina).
  - Apri il modulo contatti ("Contattami" / `ContactDialog`).
  - Compila i campi (Nome, Email, Messaggio) e clicca su **Invia Messaggio**.
  - Riceverai la notifica verde di conferma: *"Messaggio inviato con successo!"*.

---

## 💡 Consiglio Pro: Come evitare future scadenze del token Google

Se usi Gmail gratuito, Google impone policy rigide sui token OAuth. Per avere un'infrastruttura di invio email che non scade mai nel tempo, puoi considerare in futuro:
1. **Password per le App (App Password)** con connessione SMTP standard su EmailJS invece di Google OAuth.
2. Oppure un provider transazionale dedicato gratuito (come **Resend**, **Brevo / Sendinblue** o **SendGrid**) collegato a EmailJS, che utilizza chiavi API permanenti che non scadono mai.

