import { debounce } from '/static/js/common/functions.prod.js';
import { showOutput } from '/static/js/common/notification.prod.js';

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
  window.visualViewport?.addEventListener('resize', () => {
    document.documentElement.style.setProperty(
      '--vh',
      `${window.visualViewport.height}px`
    );
  });
});
