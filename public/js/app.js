
function init() {

  $('#usersSearch').keypress(function (e) {
    if (e.which == 13) {//Enter key pressed
      console.log('ENTER KEY PRESSED')
    }
  });

}

$(() => {
  init();
});

