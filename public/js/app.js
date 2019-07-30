'use strict'

function init() {

  $('.searchbar').keypress(function (e) {
    if (e.which === 13) { //Enter key pressed
      console.log(e.target.value);

      $.ajax({
        url: `/search/${e.target.value}`,
        type: 'POST',
        success: renderMap
      })
    }
  });
}

function renderMap(HTML) {
  $('main').empty().append(HTML)
  var mymap = L.map('mapid').setView([47.8451167, -121.8730556], 9);
  const attribution = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';
  const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tiles = L.tileLayer(tileURL, { attribution });
  tiles.addTo(mymap);

  // var myIcon = L.icon({
  //   iconUrl: 'tent-test.png',
  //   iconSize: [50, 50],
  //   iconAnchor: [25, 25],
  //   popupAnchor: [0, -20]
  // });
  var marker = L.marker([47.8451167, -121.8730556]).addTo(mymap);
  marker.bindPopup('1');
  var marker2 = L.marker([47.8, -121.8]).addTo(mymap);
  marker2.bindPopup('2');
}

$(() => {
  init();
});

