# SlothSelfie

## Partecipanti:
Sofia Zanelli: [@SofZll](https://github.com/SofZll)
Kaori Jiang: [@Kmoon-7](https://github.com/Kmoon-7)
Giulia Torsani: [@giulia-t](https://github.com/giulia-t)

## Contributo individuale:
Giulia Torsani:
- gestione dei progetti
- preview
- import/export tramite iCalendar

Kaori Jang:
- sistema di notifiche
- hub
- chat
- autenticazione

Sofia Zanelli:
- calendario
- note
- pomodoro

## Organizzazione in file:
Il progetto è strutturato in due cartelle principali:

### `backend/`
Contiene tutta la logica **server-side**.

Sottocartelle principali:
- `config/`, `controllers/`, `models/`, `routes/` – configurazione, logica applicativa e API
- `services/`, `jobs/`, `socket/`, `scheduler/`, `uploads/`, `utils/` – notifiche, job schedulati, gestione socket, file temporanei e funzioni di utilità  

File principali:
- `server.js` avvio del server  
- `.env` configurazione dell’ambiente  

### `sloth-selfie/`
Contiene la parte **client-side**.

Struttura interna:
- `public/` gestione dei progetti tramite JavaScript puro (HTML/CSS/JS)  
- `src/` applicazione React, organizzata in:
  - `components/`
  - `pages/`
  - `layouts/`
  - `contexts/`
  - `routes/`
  - `utils/`
  - `styles/`
  - `assets/`

Infine, nella root del progetto si trovano i file comuni:
- `README.md`
- `package.json`
- `.gitignore`

## Tecnologie e scelte implementative

### Frontend
- **React** per home, calendario, pomodoro e note  
- **JavaScript puro** per la gestione dei progetti  
- **Bootstrap** per lo styling  

### Backend
- **Node.js**
- Gestione dei pacchetti tramite **npm**

### Database
- **MongoDB**, ospitato sui server del dipartimento

### Deploy
- Deploy effettuato tramite due container Docker
- Container ospitati su macchine del dipartimento

Tutti i sorgenti si trovano nella directory `sources`.

## Avvio in locale:
1. Posizionarsi nella cartella principale del progetto  
   (livello superiore rispetto a `backend/` e `sloth-selfie/`)

2. Installare le dipendenze (da eseguire sia nella cartella backend/ sia nella cartella sloth-selfie/):
   ```bash
   npm install

3. Avviare l'applicazione:
   ```bash
   npm install
   
L’applicazione sarà quindi disponibile su:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (porta configurata nel file .env)
