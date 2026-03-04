# SlothSelfie

## Partecipanti:
- Sofia Zanelli: [@SofZll](https://github.com/SofZll)
- Kaori Jiang: [@Kmoon-7](https://github.com/Kmoon-7)
- Giulia Torsani: [@giulia-t](https://github.com/giulia-t)

## Contributo individuale:
Giulia Torsani:
    - progetti
    - preview
    - import/export con iCalendar

Kaori Jang:
    - notifiche
    - hub
    - chat
    - autenticazione

Sofia Zanelli:
    - calendario
    - note
    - pomodoro

## Organizzazione in file:
Il progetto è strutturato in due cartelle principali:

backend/: contiene tutta la logica server-side. Al suo interno troviamo sottocartelle come:

    config/, controllers/, models/, routes/ per la configurazione, la gestione della logica e delle API,

    services/, jobs/, socket/, scheduler/, uploads/, utils/ per la gestione di notifiche, file temporanei, socket e funzioni di utilità,

    File principali come server.js e .env per l'avvio del server e la configurazione dell’ambiente.

sloth-selfie/: contiene la parte client-side, divisa in:

    public/: gestione dei progetti tramite JavaScript puro (HTML/CSS/JS),

    src/: applicazione React, organizzata in sottocartelle components/, pages/, layouts/, contexts/, routes/, utils/, styles/, e assets/ per un’organizzazione modulare di componenti, pagine e servizi.

Infine, nella root del progetto si trovano i file comuni come README.md, package.json, e .gitignore.

## Tecnologie e scelte implementative:
Frontend: realizzato principalmente con React (per home, calendario, pomodoro, note) e JavaScript puro per la gestione dei progetti. Per lo stile è stato utilizzato Bootstrap.

Backend: implementato in Node.js, con gestione dei pacchetti tramite npm.

Database: tutti i dati sono memorizzati su un MongoDB ospitato sui server del dipartimento.

Deploy: effettuato su due container Docker, ospitati su macchine del dipartimento.

Tutti i sorgenti si trovano nella directory sources.

## Avvio in locale:
Posizionarsi all'interno della cartella di riferimento (livello superiore rispetto a sloth-selfie e da backend) e lanciare con: 
npm run dev
(Da lanciare solo dopo aver installato le dipendenze tramite "npm install" sia dentro alla cartella backend, sia dentro alla cartella sloth-selfie).

L’applicazione sarà quindi disponibile su:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (porta configurata nel file .env)
