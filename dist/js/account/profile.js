import {
  handleHttpError,
  enableNotifications,
} from '/static/js/common/functions.prod.js';
import { showErrorMessage } from '/static/js/common/notification.prod.js';
document.addEventListener('DOMContentLoaded', function () {
  $(document).ajaxError(function (event, xhr) {
    handleHttpError(xhr.status);
  });

  document.body.addEventListener('htmx:responseError', function (event) {
    handleHttpError(event.detail.xhr.status);
  });

  $('main').on('click', '.checkbox', async function () {
    let checked = $(this).prop('checked');
    if (checked) {
      await enableNotifications();
    } else {
      showErrorMessage(
        gettext('Notifications Silenced'),
        gettext('You will not receive notifications')
      );
    }
  });
});
