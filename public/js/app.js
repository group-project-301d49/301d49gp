'use strict'

function init() {

  $('.searchbar').keypress(function (e) {
    if (e.which === 13) { //Enter key pressed
      console.log(e.target.value);

      $.ajax({
        url: `/search/${e.target.value}`,
        type: 'POST',
        success: function (result) {
          $('main').empty().append(result)
        }
      })
    }
  });

}

$(() => {
  init();
});

