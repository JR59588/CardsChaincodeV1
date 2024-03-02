var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var cors = require("cors");
var mongoose = require("mongoose");
var logger = require("./logger");
const multer = require('multer');
const csv = require('csv-parser');

var http = require('http');
let controller = require("./api/controllers/controller");
// set up multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    console.log("File Object", file);
    let ext = '';
    if (file.originalname.split('.').length > 1) {
      ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
    }
    console.log('ext', ext);
    cb(null, file.fieldname + ext)
  }
})
const IP = "localhost";
mongoose.set('strictQuery', false);

//create multer instance
const upload = multer({ storage: storage });
//var port = 9443;
const fs = require("fs");
const https = require("https");
var db = "mongodb://" + IP + ":27017/Hyperledger";
console.log(db)
mongoose.connect(db, (err) => {
  console.log("Connecting to mongodb");
  if (err) {
    logger.error("Error!" + err);
  } else {
    console.log("Connected to mongodb");
  }
});

app.get("/", (req, res) => {
  res.status(200).send({ message: "Hello World from Node.JS" });
});
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(cors());
let routes = require("./api/routes/routes");
const { checkResultErrors } = require("ethers/lib/utils");
routes(app);



app.post('/uploadfile', upload.single('filetoupload'), function (req, res, next) {
  //console.log(req.file);
  let ext = '.csv'
  filepath = "uploads/" + req.file.fieldname + ext
  //console.log(filepath)
  let data = fs.createReadStream(filepath, 'utf8')
  //console.log(data)
  const results = []
  fs.createReadStream(filepath)
    .pipe(csv({}))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log(results[0])
      async function submitmerchantTx(data) {

        try {
          console.log("data = ", data);
          console.log(" Inside upload file api ", req.body.roleId);
          data.roleId = req.body.roleId;
          let mode = "Aggregator";
          data.mode = mode;
          const { body } = await superagent.post(
            'http://' + IP + ':3001/api/v1/merchantTx')
            .send(data)
          // Show response data
          let msg = "- For merchantId " + data.merchantId;
          console.log("----server.js---Submission response : ---", msg, "(", body, ")");
          msg = "";
          return msg;

        } catch (err) {
          console.error(err)

        }
      }

      let txmsg = "";
      for (let i = 0; i < results.length; i++) {
        console.log("results[i]", results[i]);
        let txpromise = Promise.resolve(submitmerchantTx(results[i]));
        txpromise.then(
          function (value) { txmsg = value; console.log("1 :", value); },
          function (error) { txmsg = error; console.log("2"); }
        )
        console.log("*****", txmsg);
      }
      res.status(200).send({ 'status': "file uploaded", "result": results, "length": results.length, "message": "To be completed tomm" });

    })

})


app.post('/user', (req, res) => {
  const Name = req.body.Name
  const Details = req.body.Details
  const What = req.body.What
  res.status(200).send({ 'message': "success", "Name": Name, "Details": Details, "What": What });
})


const superagent = require('superagent');

app.get('/check', function (req, res) {
  (async () => {
    const data = {
      email: "email",
      pwd: "pwd"
    }
    try {
      const { body } = await superagent.post(
        'http://' + IP + ':3001/user')
        .send(data)
      // Show response data
      console.log(body)
    } catch (err) {
      console.error(err)
    }
  })();
});

// app.listen(3001);
logger.info("server started at port :3001");

const server = http.createServer(app);
module.exports = server;