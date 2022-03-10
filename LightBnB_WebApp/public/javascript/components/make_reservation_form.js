$(() => {

  const $makeReservationForm = $(`
  <form action="/properties" method="post" id="make-reservation-form" class="make-reservation-form">
      <p>Make Reservation</p>
      <div class="label-wrapper">
        <p>Start date</p>
        <p>End date</p>
      </div>
      <div class="make-reservation-form__field-wrapper">
        <label for="make-reservation-form__minimum-price-per-night">Start date</label>
        <input type="date" name="minimum_price_per_night" id="make-reservation-form__minimum-price-per-night">
        <label for="make-reservation-form__maximum-price-per-night">End date</label>
        <input type="date" name="maximum_price_per_night" id="make-reservation-form__maximum-price-per-night">
      </div>

      <div class="make-reservation-form__field-wrapper">
          <button>Reserve</button>
          <a id="make-reservation-form__cancel" href="#">Cancel</a>
      </div>
    </form>
  `)
  window.$makeReservationForm = $makeReservationForm;

  $makeReservationForm.on('submit', function(event) {
    event.preventDefault();
    const data = $(this).serialize();

    getAllListings(data).then(function( json ) {
      propertyListings.addProperties(json.properties);
      views_manager.show('listings');
    });
  });

  $('body').on('click', '#make-reservation-form__cancel', function() {
    views_manager.show('listings');
    return false;
  });

});