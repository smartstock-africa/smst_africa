import {
  debounce,
  checkEmail,
  validatePassword,
  updateCooldown,
  startCooldown,
  parseDuration,
  handleHttpError,
} from '/static/js/common/functions.prod.js';
import {
  showOutput,
  showSuccessMessage,
  clearOutput,
  showErrorMessage,
} from '/static/js/common/notification.prod.js';

document.addEventListener('DOMContentLoaded', function () {
  let csrftoken = $('[name="csrftoken"]')[0].content;
  updateCooldown();
  $(document).ajaxError(function (event, xhr) {
    handleHttpError(xhr.status);
  });

  document.body.addEventListener('htmx:responseError', function (event) {
    handleHttpError(event.detail.xhr.status);
  });

  $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    if (localStorage.getItem('login_cooldown_until')) {
      updateCooldown();
      jqXHR.abort();
    }
  });
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
  $('main').on('click', '#formButton', function () {
    let invalid = false;
    $('input').each(function () {
      const $input = $(this);
      let val = $input.val().trim();
      if (val.length <= 0) {
        showErrorMessage(
          'Empty Fields',
          'Kindly fill the input with information'
        );
        invalid = true;
        return;
      }
    });
    if (invalid) {
      invalid = false;
      return;
    }
    let $username = $('#username');
    let $email = $('#email');
    let $otp = $('#fullOtp');
    let $pwd1 = $('#password1');
    let $resetPwd1 = $('#reppassword1');
    let $pwd2 = $('#password2');
    let $resetPwd2 = $('#reppassword2');
    let $loginEmail = $('#login_email');
    let $loginPassword = $('#login_password');
    let $resetEmail = $('#reset_email');
    if ($username.length) {
      let username = $username.val().trim();
      $.ajax({
        type: 'POST',
        headers: {
          'X-CSRFToken': csrftoken,
        },
        url: '/?action=update_username',
        data: JSON.stringify({
          username: username,
        }),
        success: function (response) {
          if (response.status) {
            showSuccessMessage(
              'Username Changed',
              'You have successfully updated your username.'
            );
            window.location.reload();
          } else {
            showErrorMessage('Error', 'Your username could not be changed.');
          }
        },
      });
    } else if ($email.length) {
      $.ajax({
        type: 'POST',
        headers: {
          'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify({
          email: $email.val().trim(),
        }),
        url: '/?action=verify_email',
        success: function (response) {
          $('#formContent').empty().append(response);
        },
      });
    } else if ($otp.length) {
      if ($otp.val().trim().length < 5) {
        showErrorMessage('Invalid OTP', 'The OTP is 6 digits long.');
        return;
      }
      $.ajax({
        type: 'POST',
        url: '?action=validate_email',
        headers: {
          'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify({
          otp: $otp.val().trim(),
        }),
        success: function (response) {
          let status = response.status;
          if (status == 'social_auth') {
            window.location.href = response.url;
            return;
          } else if (status) {
            showSuccessMessage('OTP Correct!', 'Validating your details');
            $('#formContent').empty().append(response.html);
          } else {
            showErrorMessage(
              'Invalid OTP!',
              'Confirm you are entering the latest password and it has not expired.'
            );
          }
        },
      });
    } else if ($pwd1.length && $pwd2.length) {
      let value = $pwd1.val().trim();
      let repValue = $pwd2.val().trim();
      if (value == repValue) {
        $.ajax({
          type: 'POST',
          url: '?action=create_account',
          headers: {
            'X-CSRFToken': csrftoken,
          },
          data: JSON.stringify({
            password: value,
          }),
          success: function (response) {
            if (response.status) {
              showOutput('Details Saved', 'Log into your account.');
              window.location.reload();
            } else {
              showErrorMessage('Error Occurred', 'Try creating again.');
            }
          },
        });
      }
    } else if ($loginEmail.length && $loginPassword.length) {
      let email = $loginEmail.val().trim();
      let password = $loginPassword.val().trim();
      $.ajax({
        type: 'POST',
        url: '?action=login_user',
        headers: {
          'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify({
          email: email,
          password: password,
        }),
        success: function (response) {
          let status = response.status;
          if (status) {
            showSuccessMessage('Success', 'Logging your Account');
            window.location.reload();
          } else {
            showErrorMessage(
              'Invalid',
              'You have entered the wrong password or email.'
            );
          }
        },
        error: function (xhr) {
          if (xhr.status === 429) {
            const data = xhr.responseJSON;

            const seconds = parseDuration(data.cooloff_timedelta);
            startCooldown(seconds);
          }
        },
      });
    } else if ($resetEmail.length) {
      $.ajax({
        type: 'POST',
        headers: {
          'X-CSRFToken': csrftoken,
        },
        url: '?action=reset_email',
        data: JSON.stringify({
          email: $resetEmail.val().trim(),
        }),
        success: function (response) {
          $('#formContent').empty().append(response);
        },
      });
    } else if ($resetPwd1.length && $resetPwd2.length) {
      const params = new URLSearchParams(window.location.search);
      $.ajax({
        type: 'POST',
        headers: {
          'X-CSRFToken': csrftoken,
        },
        url: '/?action=change_password',
        data: JSON.stringify({
          password1: $resetPwd1.val().trim(),
          password2: $resetPwd2.val().trim(),
          token: params.get('token'),
        }),
        success: function (response) {
          if (response.status) {
            showSuccessMessage(
              'Password Changed',
              'Login with your new values'
            );
            $('#formContent').empty().append(response.html);
            return;
          }
          showErrorMessage('Password Not Changed', 'Kindly Try again.');
        },
      });
    }
  });

  $('main').on(
    'input',
    '#email, #reset_email',
    debounce(function (e) {
      const value = e.target.value.trim().toLowerCase();
      $(this).val(value);
      if (!checkEmail(value)) {
        showOutput('Kindly Enter a valid Email');
        return;
      }
      clearOutput();
    })
  );
  let otpCode = [];
  $('main').on('input', '.numeric-input', function () {
    let $this = $(this);
    let value = $this.val().replace(/[^0-9]/g, '');
    $this.val(value);
    value = $(this).val();
    if (value.length == 1) {
      if ($this.next().length) {
        $this.next().focus();
      }
    }

    $('.numeric-input').each((_, input) => {
      let value = input.value.trim();
      otpCode.push(value);
    });
    $('.otpFullValue').val(otpCode.join(''));
    otpCode = [];
  });

  $('main').on('keydown', '.numeric-input', function (e) {
    let $this = $(this);
    if (e.key == 'Backspace') {
      if ($this.prev().length && $this.val().length == 0) {
        e.preventDefault();
        $this.prev().focus();
      }
    }
  });

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
});
