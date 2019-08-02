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
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect();
  client.on('error', err => console.error('BANANA ERROR', err));
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
app.get('/aboutMe', (request, response) => {
  response.render('aboutMe')
});

app.get('/test', testFunction);
app.post('/search', getSearch);
app.get('/campground/:facilityId/:contractId', getCampground);

// #endregion ROUTES

// #region ---------- ROUTE HANDLERS ----------


async function getCampground(req, res) {

  const contractID = req.params.contractId;
  const facilityID = req.params.facilityId;

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`https://www.reserveamerica.com/campgroundDetails.do?contractCode=${contractID}&parkId=${facilityID}&xml=true`, { waitUntil: 'networkidle2' });

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

    res.render('camp-detail', { camp: camp });

  } catch (e) {
    console.log('PUPPETEER', e, 'PUPPETEER END');
  }
}




async function getSearch(req, res) {
  let constructedCamps = [];
  try {
    // get latitude and longitude and city name for queried location
    const locationResults = await getLocationData(req.body.searchInput);

    // get search query ie(locationResults.cityName) is already in DB
    const campSumResults = await CampgroundSummary.getFromDB(locationResults.cityName);

    // if something came back from DB use it if not call API
    if (campSumResults.rows.length) {
      const tempArr = constructedCamps.concat(campSumResults.rows);
      constructedCamps = tempArr;

    } else {

      let URL = `https://api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat=${locationResults.latLong.lat}&landmarkLong=${locationResults.latLong.lng}&xml=true&api_key=${process.env.CAMPGROUND_API_KEY}`;


      const xmlResults = await superagent.get(URL);

      // parse XML string to JS object
      const result = XMLconverter.xml2js(xmlResults.req.res.text);

      // dig into the returned JS object
      const campArr = result.elements[0].elements.slice(0, 10);

      // construct an array of campground summaries
      constructedCamps = campArr.map(camp => {
        const newCamp = new CampgroundSummary(camp.attributes, locationResults.cityName);
        newCamp.saveToDB();
        return newCamp;
      })
    }

    // create url string to append to weather widget search // 47d61n122d33/seattle/
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

    const iconArr = [
      'assets/vector/logo_vector.png',
      'assets/vector/vector-acorn.png',
      'assets/vector/vector-axe.png',
      'assets/vector/vector-backpack.png',
      'assets/vector/vector-boots.png',
      'assets/vector/vector-forest.png',
      'assets/vector/vector-marshmallow.png',
      'assets/vector/vector-mountain.png',
      'assets/vector/vector-tent.png',
      'assets/vector/vector-trunk.png'
    ]
    console.log('these are our camps', constructedCamps);
    res.render('search/search', { camps: constructedCamps, forcastStr: forcastStr, cityName: locationResults.cityName, iconArr: iconArr });

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

    const latLong = result.body.results[0].geometry.location;
    const cityName = result.body.results[0].address_components.filter(e => e.types.includes('locality'))[0].long_name;
    // console.log(result.body.results[0].address_components);
    return { latLong, cityName };

  } catch (e) {
    console.log('getLatLong(query) ERROR: ', e);
  }
}

// #endregion HELPER FUNCTIONS


// #region ---------- CONSTRUCTORS ----------

function CampgroundSummary(c, originalQuery) {
  this.originalquery = originalQuery.toLowerCase();
  this.availabilitystatus = c.availabilityStatus ? (c.availabilityStatus === 'Y' ? 'Available' : 'Unavailable') : 'API unknown';
  this.contractid = c.contractID || 'API unknown';
  this.facilityid = c.facilityID || 'API unknown';
  this.facilityname = c.facilityName || 'API unknown';
  this.faciltyphoto = c.faciltyPhoto ? 'https://www.reserveamerica.com' + c.faciltyPhoto : 'API unknown';
  this.latitude = c.latitude || 'API unknown';
  this.longitude = c.longitude || 'API unknown';
  this.regionname = c.regionName || 'API unknown';
  this.reservationchannel = c.reservationChannel || 'API unknown';
  this.shortname = c.shortName || 'API unknown';
  this.siteswithamps = c.sitesWithAmps || 'API unknown';
  this.siteswithpetsallowed = c.sitesWithPetsAllowed || 'API unknown';
  this.siteswithsewerhookup = c.sitesWithSewerHookup || 'API unknown';
  this.siteswithwaterhookup = c.sitesWithWaterHookup || 'API unknown';
  this.siteswithwaterfront = c.sitesWithWaterfront || 'API unknown';
  this.statestate = c.state || 'API unknown';
}

CampgroundSummary.prototype.saveToDB = function () {
  try {
    // console.log('Saving to database this: ', this);

    const SQL = 'INSERT INTO campground (originalQuery, availabilityStatus, contractID, facilityID, facilityName, faciltyPhoto, latitude, longitude, regionName, reservationChannel, shortName, sitesWithAmps, sitesWithPetsAllowed, sitesWithSewerHookup, sitesWithWaterHookup, sitesWithWaterfront, statestate) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17);';
    const values = [this.originalQuery, this.availabilityStatus, this.contractID, this.facilityID, this.facilityName, this.faciltyPhoto, this.latitude, this.longitude, this.regionName, this.reservationChannel, this.shortName, this.sitesWithAmps, this.sitesWithPetsAllowed, this.sitesWithSewerHookup, this.sitesWithWaterHookup, this.sitesWithWaterfront, this.statestate];
    return client.query(SQL, values);
  } catch (e) {
    console.log('DB-SAVE ERROR: ', e);
  }
}

CampgroundSummary.getFromDB = function (originalQuery) {
  try {

    console.log('Getting from database originalquery: ', originalQuery.toLowerCase());
    const SQL = 'SELECT * FROM campground where originalQuery = $1;';
    return client.query(SQL, [originalQuery.toLowerCase()]);
  } catch (e) {
    console.log('DB-GET ERROR: ', e);
  }
}


function Campground(c) {
  this.descripton = c.filter(e => e.attr === 'description')[0] ? c.filter(e => e.attr === 'description')[0].value : 'undefined';
  this.reservationURL = c.filter(e => e.attr === 'fullReservationUrl')[0] ? c.filter(e => e.attr === 'fullReservationUrl')[0].value : 'undefined';
  this.drivingDirections = c.filter(e => e.attr === 'drivingDirection')[0] ? c.filter(e => e.attr === 'drivingDirection')[0].value : 'undefined';
  this.facilityName = c.filter(e => e.attr === 'facility')[0] ? c.filter(e => e.attr === 'facility')[0].value : 'undefined';
  this.latitude = c.filter(e => e.attr === 'latitude')[0] ? c.filter(e => e.attr === 'latitude')[0].value : 'undefined';
  this.longitude = c.filter(e => e.attr === 'longitude')[0] ? c.filter(e => e.attr === 'longitude')[0].value : 'undefined';
  this.phoneNumber = c.filter(e => e.attr === 'number')[0] ? c.filter(e => e.attr === 'number')[0].value : 'undefined';
  this.city = c.filter(e => e.attr === 'city')[0] ? c.filter(e => e.attr === 'city')[0].value : 'undefined';
  this.streetAddress = c.filter(e => e.attr === 'streetAddress')[0] ? c.filter(e => e.attr === 'streetAddress')[0].value : 'undefined';
  this.zip = c.filter(e => e.attr === 'zip')[0] ? c.filter(e => e.attr === 'zip')[0].value : 'undefined';
  this.photos = c.filter(e => e.attr === 'realUrl').length > 0 ? c.filter(e => e.attr === 'realUrl')
    .map(p => 'https://www.reserveamerica.com' + p.value) : [];
}


// #endregion CONSTRUCTORS


// #region ---------- Benjamins test region ----------

function testFunction(req, res) {
  res.render('map-test');

}

// #endregion Benjamins test region


