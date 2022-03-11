$(() => {

  const $makeReservationForm = $(`
  <form action="/properties" method="post" id="make-reservation-form" class="make-reservation-form">
      <p>Make Reservation</p>
      <div class="label-wrapper">
        <p>Start date</p>
        <p>End date</p>
      </div>
      <div class="make-reservation-form__field-wrapper">
        <label for="make-reservation-form__start-date">Start date</label>
        <input type="date" name="start-date" id="make-reservation-form__start-date">
        <label for="make-reservation-form__end-date">End date</label>
        <input type="date" name="end-date" id="make-reservation-form__end-date">
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
    // TODO verify data here before sending
    const data = $(this).serialize() + `&property_id=${propertyIdToBeReserved}`;

    makeReservationFunc(data).then(function() {
      $('#make-reservation-form').append("<p>Reservation successful</p>");
    });
  });

  $('body').on('click', '#make-reservation-form__cancel', function() {
    views_manager.show('listings');
    return false;
  });

});