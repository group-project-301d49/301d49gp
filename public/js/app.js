'use strict'

function init() {
  renderMap();
}


function searchSubmit(e) {
  if (e.key === 'Enter') {
    alert('Enter was just pressed.');
  }
  return false;
}

function renderMap() {

  // get lat and lon and image from each camp summary result
  const latArr = $('.camp-summary').map((i, el) => $(el).data('lat')).toArray();
  const lngArr = $('.camp-summary').map((i, el) => $(el).data('lng')).toArray();
  const imgArr = $('.thumbnail-image').map((i, el) => $(el).attr('src')).toArray();

  const latCenter = latArr.reduce((acc, value) => acc += value) / latArr.length;
  const lngCenter = lngArr.reduce((acc, value) => acc += value) / lngArr.length;

  var mymap = L.map('mapid').setView([latCenter, lngCenter], 9);
  const attribution = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';
  const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tiles = L.tileLayer(tileURL, { attribution });
  tiles.addTo(mymap);


  for (let i = 0; i < latArr.length; i++) {
    let myIcon = L.icon({
      iconUrl: imgArr[i].replace('.png', '_black.png'),
      iconSize: [30, 30],
      iconAnchor: [25, 25],
      popupAnchor: [0, -20]
    });
    L.marker([latArr[i], lngArr[i]], { icon: myIcon }).addTo(mymap);
  }

  // marker.bindPopup('1');
  hideMap();
  hideWeather()
}


function hideWeather() {
  $('.search-weather').toggle();
}

function hideMap() {
  $('.map-results').toggle();
}


$(() => {
  init();
});

