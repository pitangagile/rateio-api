const mongoose  = require('mongoose');
const {database}  = require('../commons/variables');

mongoose.Promise = global.Promise;
let isConnected;

module.exports = connectToDatabase = () => {
    console.log('=> isConnected:' + isConnected);
    if (isConnected) {
        console.log('=> using existing database connection');
        return Promise.resolve();
    }

    console.log('=> using new database connection.' + 'Connecting to ' + database.connectionString);
    return mongoose.connect(database.connectionString)
        .then(db => {
            isConnected = db.connections[0].readyState;
            console.log('connected to mongoDB');
    });
};
