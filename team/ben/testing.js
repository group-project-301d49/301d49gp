'use strict'

// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
var convert = require('xml-js');
var fs = require('fs');



// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
// Specify a directory for static resources
app.use(express.static('./public'));

// Database Setup: if you've got a good DATABASE_URL
if (process.env.DATABASE_URL) {
  const client = new pg.Client(process.env.DATABASE_URL);
  client.connect();
  client.on('error', err => console.error(err));
}

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// listen for requests
app.listen(PORT, () => console.log('Listening on port:', PORT));

// API Routes
app.get('/fun', (request, response) => {
  // test out your routes, perhaps ejs views or database stuff
  response.render('fun');

});



// campground API

async function handleSearch() {
  let CAMPGROUND_API = '6h5g9gppzyn2rmffsvvwsj8f';
  let URL = `http://api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat=37.84035&landmarkLong=-122.4888889&xml=true&api_key=${CAMPGROUND_API}`;
  console.log(URL);
  try {
    const xmlResults = await superagent.get(URL);
    // console.log('PINE', xmlResults.req.res.text, 'PINE-END');

    // console.log(__dirname);
    // const testxml = await fs.readFileSync(__dirname + '/test.xml', 'utf8');
    // console.log('BANANA', testxml, 'BANANA-END');

    // var options = { ignoreComment: true, alwaysChildren: true };
    var result = convert.xml2js(xmlResults.req.res.text);
    result.map(camp => {

    })
    console.log('APPLE', result.elements[0].elements.slice(0, 10), 'APPLE-END');

  } catch (e) {
    console.log('OUR ERROR: ', e);
  }

}


// google API

let query = 'seattle';
const GEOCODE_API_KEY = 'AIzaSyBcHsgB16wscewNOYKKaEzBJA10611zOGo';

async function getLocation(request, response) {

  const location_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GEOCODE_API_KEY}`;
  const result = await superagent.get(location_URL)

  console.log('Got data from API');
  if (!result.body.results.length) { throw 'No Data'; }
  else {
    console.log('POOP', result.body.results[0].geometry.location, "END-POOP")
  }
}

getLocation();


