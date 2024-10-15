global.rootDir = __dirname ;
global.startDate = null; 

const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

app.use(bodyParser.json());
app.use('/api', userRoutes);

// Static files from frontend
const frontendPath = path.join(global.rootDir, '..', 'frontend/build');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});