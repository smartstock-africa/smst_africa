import {
  debounce,
  validatePassword,
} from '/static/js/common/functions.prod.js';
import {
  showOutput,
  clearOutput,
} from '/static/js/common/notification.prod.js';

document.addEventListener('DOMContentLoaded', function () {
  $('main').on(
    'input',
    '#username',
    debounce(function (e) {
      const value = e.target.value
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9_]/g, '');
      e.target.value = value;

      if (value.length <= 4) {
        showOutput('Username too short.');
        return;
      } else if (value.length > 12) {
        showOutput('Username too long.');
        return;
      }
      $.ajax({
        type: 'GET',
        url: `/?action=check_username&username=${value}`,
        success: function (response) {
          if (response.status == 'valid') {
            showOutput('Username is unique.', true);
          } else {
            showOutput('Username already taken.');
          }
        },
      });
    })
  );

  $('main').on(
    'input',
    '#password1, #reppassword1',
    debounce(function (e) {
      let value = e.target.value.trim();
      $(this).val(value);
      const error = validatePassword(value);
      if (error) {
        showOutput(error);
        return;
      }
      clearOutput();
    })
  );
  $('main').on(
    'input',
    '#password2, #reppassword2',
    debounce(function (e) {
      let value = e.target.value.trim();
      let passwordField =
        e.target.id === 'password2' ? '#password1' : '#reppassword1';
      if (value !== $(passwordField).val()) {
        showOutput('Passwords do not match.');
        return;
      }
      clearOutput();
    })
  );
  window.visualViewport?.addEventListener('resize', () => {
    document.documentElement.style.setProperty(
      '--vh',
      `${window.visualViewport.height}px`
    );
  });
});
