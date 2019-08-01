'use strict'

function init() {

  // $('.tb').keypress(function (e) {
  //   if (e.which === 13) { //Enter key pressed
  //     console.log(e.target.value);

  //     $.ajax({
  //       url: `/search/${e.target.value}`,
  //       type: 'POST',
  //       success: renderSearch
  //     })
  //   }
  // });
}

function searchSubmit(e) {
  if (e.key === 'Enter') {
    alert('Enter was just pressed.');
  }
  return false;
}

function renderSearch(HTML) {

  $('main').empty().append(HTML);
  renderMap();

}

function renderMap() {

  // const campSect = $('.camp-summary');
  const latArr = $('.camp-summary').map((i, el) => $(el).data('lat')).toArray();
  const lngArr = $('.camp-summary').map((i, el) => $(el).data('lng')).toArray();

  // console.log(latArr);
  const latCenter = latArr.reduce((acc, value) => acc += value) / latArr.length;
  const lngCenter = lngArr.reduce((acc, value) => acc += value) / lngArr.length;

  var mymap = L.map('mapid').setView([latCenter, lngCenter], 9);
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
  latArr.reduce((acc, value) => acc += value)
  for (let i = 0; i < latArr.length; i++) {
    L.marker([latArr[i], lngArr[i]]).addTo(mymap);
  }

  // marker.bindPopup('1');

}



function hideMap() {
  $('#map').toggleClass('hide');
}


$(() => {
  init();
});

