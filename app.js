const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const router = express.Router();
const app = express();
const url = require('./secret.js');
// const logger = require('./logger.js');
const PORT = 8080
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

//////////////////////////////////////////////////////////////////////////

const { format, createLogger, transports } = require("winston");
const { timestamp, combine, printf, errors } = format;
var path = require('path');


const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
  
  format: combine(
    format.colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.File({ filename: "file.log" }),
    new transports.Console(),
  ],
  exceptionHandlers: [new transports.File({ filename: "exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "rejections.log" })],
});

//module.exports=logger;

//////////////////////////////////////////////////////////////////////////



logger.info("hello i exist");
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

        .post(async (req, res) => {
            logger.info("hello i reached post request");
            try {
                console.log("REQ:", req.body)
                if (req.body.name == "") {
                    res.status(400).send("Invalid user name")
                }
                else {
                    const resp = await myDB.insertOne(req.body)
                    res.contentType("application/json");
                    res.send(JSON.stringify(resp));
                }
            } catch (err) {
                console.log("[ERROR:]", err)
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