const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const router = express.Router();
const app = express();
const url = require('./secret.js');
const PORT = 8080
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

const emptyValueChecker = function (str) {
    if (typeof str === "string" && str.trim().length === 0) {
        return false;
    } else {
        return true;
    }
};
client.connect(err => {
    const myDB = client.db('people').collection('friends');
    app.get('/user/:name', (req, res) => {
        console.log(req.params);
        myDB.find(req.params).toArray().then(results => {
            console.log(results);
            res.contentType('application/json');
            res.send(JSON.stringify(results))
        })
    })

    app.route('/users')
        .get((req, res) => {
            myDB.find().toArray().then(results => {
                console.log(results);
                res.contentType('application/json');
                res.send(JSON.stringify(results))
            })
        })

        .post((req, res) => {
            const userName = req.body.name;
            const checking = emptyValueChecker(userName);
            let boolen = true;
            if (checking) {
                myDB.insertOne(req.body).then((results) => {
                    res.contentType("application/json");
                    res.send(JSON.stringify(req.body));
                    boolean: false;
                });
            } else {
                console.log("Done");
                res.send({ status: boolen });
            }
        })

        .put((req, res) => {
            console.log(req.body);
            myDB.findOneAndUpdate(
                {
                    _id: ObjectID(req.body._id)
                },
                {
                    $set: {
                        name: req.body.name
                    }
                },
                {
                    upsert: false
                }).then(result => {
                    res.contentType('application/json');
                    res.send({ "status": true })
                })
        })

        .delete((req, res) => {
            console.log(req.body);
            myDB.deleteOne({
                _id: ObjectID(req.body._id)
            }).then(result => {
                let boo = true;
                if (result.deletedCount === 0) {
                    boo: false
                }
                res.send({ "status": boo })
            })
                .catch(error => console.log(error))
        })
})



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

console.log('Server ready')
app.listen(PORT);

module.exports = { emptyValueChecker };