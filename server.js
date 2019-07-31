'use strict'

// #region ---------- SETUP ----------


// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
var XMLconverter = require('xml-js');
const puppeteer = require('puppeteer');


// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
// Specify a directory for static resources
app.use(express.static('public'));

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

app.get('/', (request, response) => {
  response.render('index');
});
app.get('/aboutMe',(request, response) => {
  response.render('aboutMe')});

app.get('/test', testFunction);
app.post('/search/:query', getSearch);
app.get('/campground', getCampground);

// #endregion ROUTES

// #region ---------- ROUTE HANDLERS ----------


async function getCampground(req, res) {

  let contractCode = 'CO';
  let parkId = 50032;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.reserveamerica.com/campgroundDetails.do?contractCode=${contractCode}&parkId=${parkId}&xml=true`, { waitUntil: 'networkidle2' });

    let resultObj = [];

    const attrHandles = await page.$$('.html-attribute');
    // console.log(attrHandles)
    for (const attrHandle of attrHandles) {
      const attr = await attrHandle.$eval('.html-attribute-name', e => e.textContent);
      const value = await attrHandle.$eval('.html-attribute-value', e => e.textContent);

      resultObj.push({ attr, value });
    }

    await browser.close();

    const camp = new Campground(resultObj);
    console.log(camp);

  } catch (e) {
    console.log('PUPPETEER', e, 'PUPPETEER END');
  }
}


async function getSearch(req, res) {

  let query = req.params.query;

  // get latitude and longitude and city name for queried location
  const locationResults = await getLocationData(query);


  let URL = `http://api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat=${locationResults.latLong.lat}&landmarkLong=${locationResults.latLong.lng}&xml=true&api_key=${process.env.CAMPGROUND_API_KEY}`;

  try {
    const xmlResults = await superagent.get(URL);

    // parse XML string to JS object
    const result = XMLconverter.xml2js(xmlResults.req.res.text);

    // dig into the returned JS object
    const campArr = result.elements[0].elements.slice(0, 10);

    // construct an array of campground summaries
    const constructedCamps = campArr.map(camp => {
      return new CampgroundSummary(camp.attributes);
    })
    // console.log(constructedCamps);

    // create url string to append to weather widget search
    // 47d61n122d33/seattle/
    const lat = Number.parseFloat(locationResults.latLong.lat)
      .toFixed(2)
      .toString()
      .replace('-', '')
      .split('.')
    const long = Number.parseFloat(locationResults.latLong.lng)
      .toFixed(2)
      .toString()
      .replace('-', '')
      .split('.')
    const parsedCityName = locationResults.cityName.replace(/\s+/g, '-').toLowerCase()

    // console.log(lat, long);
    const forcastStr = `${lat[0]}d${lat[1]}n${long[0]}d${long[1]}/${parsedCityName}/`;
    console.log('banana', forcastStr, 'banana');

    res.render('search/search', { camps: constructedCamps, forcastStr: forcastStr, cityName: locationResults.cityName });

  } catch (e) {
    console.log('getSearch() ERROR: ', e);
  }

}

// #endregion ROUTE HANDLERS


// #region ---------- HELPER FUNCTIONS ----------

async function getLocationData(query) {
  try {
    const location_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
    const result = await superagent.get(location_URL);

    // console.log(result.body.results[0].geometry.location);
    // console.log(result.body.results[0].address_components[0].long_name.replace(/\s+/g, '-').toLowerCase());
    const latLong = result.body.results[0].geometry.location;
    const cityName = result.body.results[0].address_components.filter(e => e.types.includes('locality'))[0].long_name;
    return { latLong, cityName };

  } catch (e) {
    console.log('getLatLong(query) ERROR: ', e);
  }
}

// #endregion HELPER FUNCTIONS


// #region ---------- CONSTRUCTORS ----------

function CampgroundSummary(c) {
  this.availabilityStatus = c.availabilityStatus ? (c.availabilityStatus === 'Y' ? 'Available' : 'Unavailable') : 'API unknown';
  this.contractID = c.contractID || 'API unknown';
  this.facilityID = c.facilityID || 'API unknown';
  this.facilityName = c.facilityName || 'API unknown';
  this.faciltyPhoto = c.faciltyPhoto ? 'http://www.reserveamerica.com' + c.faciltyPhoto : 'API unknown';
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


function Campground(c) {
  this.descripton = c.filter(e => e.attr === 'description')[0].value;
  this.reservationURL = c.filter(e => e.attr === 'fullReservationUrl')[0].value;
  this.drivingDirections = c.filter(e => e.attr === 'drivingDirection')[0].value;
  this.facilityName = c.filter(e => e.attr === 'facility')[0].value;
  this.latitude = c.filter(e => e.attr === 'latitude')[0].value;
  this.longitude = c.filter(e => e.attr === 'longitude')[0].value;
  this.phoneNumber = c.filter(e => e.attr === 'number')[0].value;
  this.city = c.filter(e => e.attr === 'city')[0].value;
  this.streetAddress = c.filter(e => e.attr === 'streetAddress')[0].value;
  this.zip = c.filter(e => e.attr === 'zip')[0].value;
  this.photos = c.filter(e => e.attr === 'realUrl')
    .map(p => 'https://www.reserveamerica.com' + p.value);
}


// #endregion CONSTRUCTORS


// #region ---------- Benjamins test region ----------

function testFunction(req, res) {
  res.render('map-test');

}

// #endregion Benjamins test region


