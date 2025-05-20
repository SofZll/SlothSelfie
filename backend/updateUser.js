const mongoose = require('mongoose');
const User = require('./models/userModel'); // Percorso del modello utente
const Notification = require('./models/notificationModel'); // Percorso del modello notifica
const NoAvailability = require('./models/noAvailabilityModel'); // Percorso del modello noAvailability
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
            console.log('Admin user already exists.');
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
createAdmin();
//updateNotification();

const dropProblematicIndex = async () => {
    try {
        await connectDB();
        console.log('Connected to the database.');

        const userCollection = mongoose.connection.db.collection('users');

        const indexes = await userCollection.indexes();
        console.log('Current indexes:', indexes);

        const result = await userCollection.dropIndex('email_1');
        console.log('Index dropped successfully:', result);
    } catch (error) {
        console.error('Error dropping index:', error);
    } finally {
        // Disconnetti dal database
        mongoose.connection.close();
    }
};

//dropProblematicIndex();

const listIndexes = async () => {
    try {
        await connectDB();
        const userCollection = mongoose.connection.db.collection('users');
        const notificationCollection = mongoose.connection.db.collection('notifications');
        // Ottieni gli indici della collezione utenti
        const userIndexes = await userCollection.indexes();
        console.log('Indici della collezione utenti:');
        console.log(JSON.stringify(userIndexes, null, 2));
        // Ottieni gli indici della collezione notifiche
        const notificationIndexes = await notificationCollection.indexes();
        console.log('Indici della collezione notifiche:');
        console.log(JSON.stringify(notificationIndexes, null, 2));
    } catch (error) {
        console.error('Errore nel recupero degli indici:', error);
    } finally {
        mongoose.connection.close();
    }
};

//listIndexes();

const deleteAllAvailability = async () => {
    try {
        await connectDB();
        console.log('Connected to the database.');

        // Elimina tutti i documenti nella collezione NoAvailability
        const result = await NoAvailability.deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from NoAvailability collection.`);
    } catch (error) {
        console.error('Error deleting documents:', error);
    }
    finally {
        // Disconnetti dal database
        mongoose.connection.close();
    }
}

//deleteAllAvailability();

const deleteRoomDeviceImages = async () => {
    try {
        await connectDB();
        console.log('Connected to the database.');

        // elimina in tutti i user isDevice o isRoom il campo image.data
        const result = await User.updateMany(
            { $or: [{ isDevice: true }, { isRoom: true }] },
            { $unset: { "image.data": "" } }
        );

        console.log(`Deleted ${result.modifiedCount} documents from NoAvailability collection.`);
    } catch (error) {
        console.error('Error deleting documents:', error);
    }
    finally {
        // Disconnetti dal database
        mongoose.connection.close();
    }
}
//deleteRoomDeviceImages();

const printTools = async () => {
    try {
        await connectDB();
        console.log('Connected to the database.');

        // Trova tutti gli utenti con isDevice o isRoom
        const users = await User.find({ $or: [{ isDevice: true }, { isRoom: true }] });

        // Stampa gli utenti
        users.forEach(user => {
            console.log(`User ID: ${user._id}, Username: ${user.username}, isDevice: ${user.isDevice}, isRoom: ${user.isRoom}`);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
    finally {
        // Disconnetti dal database
        mongoose.connection.close();
    }
}

//printTools();

const deleteEverythingfromDB = async () => {
    try {
        await connectDB();
        console.log('Connected to the database.');

        await mongoose.connection.db.dropDatabase();
        console.log('Database dropped successfully!');
    } catch (error) {
        console.error('Error dropping database:', error);
    } finally {
        mongoose.connection.close();
    }
}

//deleteEverythingfromDB();


//delete notification type: 'now' and urgency: true
//delete notification type: 'now' che sono doppie nel senso che hanno lo stesso elemento e lo stesso utente
const deleteNotificationNow = async () => {
    try {
        await connectDB();
        console.log('Connected to the database.');

        const result = await Notification.deleteMany(
            { type: 'now', urgency: true }
        );
        console.log(`Deleted ${result.deletedCount} notifications.`);

        const duplicates = await Notification.aggregate([
            { $match: { type: 'now' } },
            { $group: {
                _id: { element: "$element", user: "$user" },
                ids: { $push: "$_id" },
                count: { $sum: 1 }
            }},
            { $match: { count: { $gt: 1 } } }
        ]);

        let deletedCount = 0;
        for (const dup of duplicates) {
            // Tieni solo il primo, elimina gli altri
            const [keep, ...toDelete] = dup.ids;
            const res = await Notification.deleteMany({ _id: { $in: toDelete } });
            deletedCount += res.deletedCount;
        }
        console.log(`Deleted ${deletedCount} duplicate 'now' notifications.`);
    } catch (error) {
        console.error('Error deleting notifications:', error);
    } finally {
        mongoose.connection.close();
    }
}

//deleteNotificationNow();
