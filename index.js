const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const fileUpload = require('express-fileupload');
const fs = require('fs-extra')

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x3yya.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('apartments'))
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("Hello from db it's working!")
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const apartmentCollection = client.db("apartmentHunt").collection("apartmentsList");
  const rentApartmentCollection = client.db("apartmentHunt").collection("rentApartmentList");
  const adminCollection = client.db("apartmentHunt").collection("admins");


  app.post('/rentApartment', (req, res) => {
    const rent = req.body;
    rentApartmentCollection.insertOne(rent)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  });

  app.get('/checkMyRent', (req, res) => {
    rentApartmentCollection.find({email: req.query.email})
    .toArray((err, rentApartments) => {
        res.send(rentApartments)
    })
  });

  app.get('/allBookingList', (req, res) => {
      rentApartmentCollection.find({})
      .toArray((err, allRent) => {
          res.send(allRent)
      })
  });


  app.post('/addApartment', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const location = req.body.location;
    const bedroom = req.body.bedroom;
    const bathroom = req.body.bathroom;
    const pricedetail = req.body.pricedetail;
    const propertydetail = req.body.propertydetail;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    apartmentCollection.insertOne({ title, description, price, pricedetail, propertydetail, location, bedroom, bathroom, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });
  

  // app.post('/addApartment', (req, res) => {
  //   const file = req.files.file;
  //   const title = req.body.title;
  //   const description = req.body.description;

  //   const newImg = file.data;
  //   const encImg = newImg.toString('base64');

  //   var image = {
  //     contentType: file.mimetype,
  //     size: file.size,
  //     img: Buffer.from(encImg, 'base64')
  //   };

  //   apartmentCollection.insertOne({ title, description, image })
  //     .then(result => {
  //       res.send(result.insertedCount > 0)
  //     })
  //   });


  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    console.log(admin);
    adminCollection.insertOne(admin)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  });


  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({email: email})
    .toArray((err, admin) => {
      res.send(admin.length> 0)
    })
  });

});



app.listen(process.env.PORT || port);