const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient;
const mongodbUrl = "mongodb+srv://exampledevuser:exampledev@examplecluster-pwcub.gcp.mongodb.net/shop?retryWrites=true";
let _db;

const initDb = callback => {
    if (_db) {
        console.log('db already init');
        return callback(null, _db);
    }
    mongoClient.connect(mongodbUrl).then(client => {
        console.log('Setting DB')
        _db = client.db();
        return callback(null, _db);
    }).catch((err) => callback(err));
}

const getDb = () => {
    if (!!_db) {
        return _db;
    }
    throw Error('DB not initialized');
};

module.exports = {
    initDb: initDb,
    getDb: getDb,
}