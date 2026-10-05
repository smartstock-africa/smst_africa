import {
  handleHttpError,
  enableNotifications,
  checkInput,
} from '/static/js/common/functions.prod.js';
import { showErrorMessage } from '/static/js/common/notification.prod.js';

document.addEventListener('DOMContentLoaded', function () {
  NProgress.done();

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
  window.visualViewport?.addEventListener('resize', () => {
    document.documentElement.style.setProperty(
      '--vh',
      `${window.visualViewport.height}px`
    );
  });
});
