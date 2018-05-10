const mongoose  = require('mongoose');
const {database}  = require('../commons/variables');

mongoose.Promise = global.Promise;
let isConnected;

module.exports = connectToDatabase = () => {
    if (mongoose.connection.readyState == 1) {
        return Promise.resolve();
    }

    return mongoose.connect(database.connectionString).then(db => {
        isConnected = db.connections[0].readyState;
    }).catch((error) => {
        res.send('Error to connect database: ' + error);
    });;
};
