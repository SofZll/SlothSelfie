const mongoose = require('mongoose');
const User = require('./models/userModel'); // Percorso del modello utente
const bcrypt = require('bcrypt');

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

const updateIsAdminUndefined = async () => {
    try {
        // Connetti al database
        await connectDB();
        console.log('Connected to the database.');
        // Aggiorna gli utenti con `isAdmin` undefined
        const result = await User.updateMany(
            { isAdmin: { $ne: true } },
            { $set: { isAdmin: false } }
        );
        console.log(`Updated ${result.modifiedCount} users.`);
    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        // Disconnetti dal database
        mongoose.connection.close();
    }
};
            

const createAdmin = async () => {
    try {
        await connectDB();

        console.log('Connected to the database.');

        // Crea un utente Admin se non esiste
        const admin = await User.findOne({ isAdmin: true });

        if (admin) {
            await admin.deleteOne();
            console.log('Admin user deleted.');
        } else {
            const newAdmin = new User({
                username: 'SuperUser',
                password: await bcrypt.hash('admin', 10),
                isAdmin: true,
                disableNotifications: {
                    all: true,
                    email: false,
                    system: false,
                    outsideWorkingHours: true,
                    outsideDayHours: true,
                },
            });
            await newAdmin.save();
            console.log('Admin user created.');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        // Disconnetti dal database
        mongoose.connection.close();
    }
};


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

//updateIsAdminUndefined();
//createAdmin();
//updateUsers();