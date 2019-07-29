'use strict';

require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is up on ${PORT}`));


app.get('/location', getLocation);
app.get('/weather', getWeather);

//Constructor / Normalizer
// function Location(query, data) {
//   this.search_query = query;
//   this.formatted_query = data.formatted_address;
//   this.latitude = data.geometry.location.lat;
//   this.longitude = data.geometry.location.lng;
// }

let query = 'seattle';
// Static Method: Fetch a location from google
function getLocation(request,response){
  const location_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(location_URL)
    .then(data => {
      console.log('Got data from API');
      if (!data.body.results.length) { throw 'No Data'; }
      else {
        response.send(data);
      }
    });
}
// Weather Constructor/Normalizer
// function Weather(day) {
//   this.forecast = day.summary;
//   this.time = new Date(day.time * 1000).toString().slice(0, 15);
// }

function getWeather(request, response) {
  const weatherURL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${query.latitude},${query.longitude}`;

  return superagent.get(weatherURL)
    .then(result =>{
      const weatherSummaries = result.body.daily.data.map;
      response.send(result);
    });
}
