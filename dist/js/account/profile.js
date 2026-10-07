import {
  handleHttpError,
  enableNotifications,
  checkInput,
} from '/static/js/common/functions.prod.js';
import {
  showErrorMessage,
  showSuccessMessage,
} from '/static/js/common/notification.prod.js';

document.addEventListener('DOMContentLoaded', function () {
  NProgress.done();
  let csrftoken = $('[name="csrftoken"]')[0].content;

  $(document).ajaxError(function (event, xhr) {
    handleHttpError(xhr.status);
  });

  $(document).ajaxStart(function () {
    NProgress.start();
  });
  $(document).ajaxComplete(function () {
    checkInput();
    NProgress.done();
  });

  $(document).on('htmx:beforeRequest', function () {
    NProgress.start();
  });
  $(document).on('htmx:afterSwap', function () {
    checkInput();
    NProgress.done();
  });

  window.addEventListener('popstate', () => {
    NProgress.start();
    setTimeout(() => {
      NProgress.done();
    }, 1000);
  });

  const params = new URLSearchParams(window.location.search);

  let view = params.get('view_page');
  if (view) {
    NProgress.start();
    $.ajax({
      type: 'GET',
      url: `?page=${view}`,
      success: function (response) {
        $('.mainContent').empty().append(response);
        NProgress.done();
      },
    });
  }

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

  $('main').on('click', 'button', function () {
    let $input = $('.inputHolder').find('input');
    let inputId = $input.attr('id');
    let value = $input.val().trim();
    let editName = $input.data('edit-name');
    if (value.length == 0) {
      showErrorMessage('Empty Field', 'Kindly Fill in the Blank Space');
      return;
    }

    $.ajax({
      type: 'POST',
      headers: {
        'X-CSRFToken': csrftoken,
      },
      url: '?action=edit_personal_info',
      data: JSON.stringify({
        editName: inputId,
        editValue: value,
      }),
      success: function (response) {
        if (response.status) {
          showSuccessMessage(
            'Details Changed',
            `You have updated your ${editName}`
          );
          return;
        }
        showErrorMessage('Details Not Changed', 'An error occurred try again.');
      },
    });
  });
});
