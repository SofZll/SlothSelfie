const cors = require('cors');

const corsOptions = {
    //origin: 'http://localhost:3000', // Origine del tuo frontend
    origin: 'https://site232453.tw.cs.unibo.it',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // se stai inviando cookie o sessioni
}

module.exports = cors(corsOptions);