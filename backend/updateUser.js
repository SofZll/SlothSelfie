const mongoose = require('mongoose');
const User = require('./models/userModel'); // Percorso del modello utente
const Notification = require('./models/notificationModel'); // Percorso del modello notifica
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGO_URI;

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
            {}, // Nessun filtro, aggiorna tutti gli utenti
            {
                $set: {
                    disableNotifications: {
                        all: true,
                        email: false,
                        system: false,
                        outsideWorkingHours: true,
                        outsideDayHours: true,
                        urgency: false,
                    },
                }
            },
            { upsert: false } // Non crea nuovi documenti, aggiorna solo quelli esistenti
        );

        console.log(`Updated ${result.modifiedCount} users.`);
    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        // Disconnetti dal database
        mongoose.connection.close();
    }
};

const updateNotification = async () => {
    try {
        // Connetti al database
        await connectDB();

        console.log('Connected to the database.');

        //elimina le notifiche che hanno come element: null
        const result = await Notification.deleteMany(
            { element: null }
        );
        console.log(`Deleted ${result.deletedCount} notifications.`);
    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        // Disconnetti dal database
        mongoose.connection.close();
    }
};


//updateIsAdminUndefined();
//createAdmin();
updateNotification();