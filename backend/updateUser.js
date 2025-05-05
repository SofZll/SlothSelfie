const mongoose = require('mongoose');
const User = require('./models/userModel'); // Percorso del modello utente

const mongoCredentials = {
    user: "kaorijiang",
    pwd: "dWFd3wNQCJQksWEs",
    site: "cluster0.ynn63.mongodb.net",
    dbname: "slothselfie"
};

const dbName = 'slothselfie';
const uri = `mongodb+srv://${mongoCredentials.user}:${mongoCredentials.pwd}@${mongoCredentials.site}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}
const updateUsers = async () => {
    try {
        // Connetti al database
        await connectDB();

        console.log('Connected to the database.');

        // Aggiorna tutti gli utenti che non hanno il campo `disableNotifications`
        const result = await User.updateMany(
            { disableNotifications: { $type: 'bool' } }, // Filtra gli utenti con `disableNotifications` booleano
            {
                $set: {
                    disableNotifications: {
                        all: true,
                        email: false,
                        system: false,
                        outsideWorkingHours: true,
                        outsideDayHours: true,
                    }
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} users.`);
    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        // Disconnetti dal database
        mongoose.connection.close();
    }
};

updateUsers();