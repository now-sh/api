var express = require('express');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;

const notesApp = express();
const url = process.env.MONGO_URI_NOTES || 'mongodb://localhost/notes_api';

const Schema = mongoose.Schema;
const listSchema = Schema({ activity: String });
const List = mongoose.model('item', listSchema);

async function notesAPI() {
  //Local promise to global promise
  mongoose.Promise = global.Promise;
  //Database connection establishing
  mongoose.connect(url, { useNewUrlParser: true });
  mongoose.connection
    .once('open', () => {
      console.log('Connection Succesful!');
    })
    .on('error', (error) => {
      console.log('Your error : ' + error);
    });

  var urlencodedParser = bodyParser.urlencoded({ extended: false });

  //setting view engine
  notesApp.set('view engine', 'ejs');

  //getting the link and passing a page to that link
  notesApp.get('/', function (req, res) {
    console.log(req.url);
    res.sendFile(__dirname + '/index.html');
  });

  //Post request
  notesApp.post('/list', urlencodedParser, function (req, res) {
    console.log(req.body);
    items = req.body;

    //Saving to database
    const newitem = new List(items); //items is according to Schema
    newitem.save().then(() => {
      console.log('Value entered in database');

      //Mongoclient connects with db again before CRUD operations!
      MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db('List');

        //finding after saving the new item to db
        dbo
          .collection('items')
          .find({})
          .toArray(function (err, result) {
            if (err) throw err;

            console.log('Fetched properly!!');
            //passing to new webpage the items of database
            res.render('list', { q: { s: result } });

            db.close();
          });
      });
    });
  });
}
module.exports = (notesAPI, notesApp);
