'use strict'

// #region ---------- SETUP ----------


// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
var XMLconverter = require('xml-js');


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

// #endregion SETUP


// #region ---------- ROUTES ----------

// API Routes
app.get('/test', testFunction);
app.get('/search', getSearch);

// #endregion ROUTES

// #region ---------- ROUTE HANDLERS ----------


async function getSearch() {
  let CAMPGROUND_API = '6h5g9gppzyn2rmffsvvwsj8f';
  let URL = `http://api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat=37.84035&landmarkLong=-122.4888889&xml=true&api_key=${CAMPGROUND_API}`;
  console.log(URL);
  try {
    const xmlResults = await superagent.get(URL);

    // parse XML string to JS object
    const result = XMLconverter.xml2js(xmlResults.req.res.text);

    // dig into the returned JS object
    const campArr = result.elements[0].elements.slice(0, 10);


    const constructedCamps = campArr.map(camp => {
      return new CampgroundSummary(camp.attributes);
    })
    console.log('APPLE', constructedCamps, 'APPLE-END');

  } catch (e) {
    console.log('OUR ERROR: ', e);
  }

}

// #endregion ROUTE HANDLERS

// #region ---------- CONSTRUCTORS ----------

function CampgroundSummary(c) {
  this.availabilityStatus = c.availabilityStatus || 'API unknown';
  this.facilityID = c.facilityID || 'API unknown';
  this.facilityName = c.facilityName || 'API unknown';
  this.faciltyPhoto = c.faciltyPhoto || 'API unknown';
  this.latitude = c.latitude || 'API unknown';
  this.longitude = c.longitude || 'API unknown';
  this.regionName = c.regionName || 'API unknown';
  this.reservationChannel = c.reservationChannel || 'API unknown';
  this.shortName = c.shortName || 'API unknown';
  this.sitesWithAmps = c.sitesWithAmps || 'API unknown';
  this.sitesWithPetsAllowed = c.sitesWithPetsAllowed || 'API unknown';
  this.sitesWithSewerHookup = c.sitesWithSewerHookup || 'API unknown';
  this.sitesWithWaterHookup = c.sitesWithWaterHookup || 'API unknown';
  this.sitesWithWaterfront = c.sitesWithWaterfront || 'API unknown';
  this.statestate = c.state || 'API unknown';
}

// #endregion CONSTRUCTORS


// #region ---------- Benjamins test region ----------

function testFunction(req, res) {
  let CAMPGROUND_API = '6h5g9gppzyn2rmffsvvwsj8f';
  let URL = `https://api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat=37.84035&landmarkLong=-122.4888889&xml=true&api_key=${CAMPGROUND_API}`;
  console.log(URL);

  superagent.get(URL)
    .then(result => console.log('THIS IS RESULT', result))
    .then(result => res.send('happy'))
    .catch(err => console.log('OUR ERROR: ', err));
}

// #endregion Benjamins test region


