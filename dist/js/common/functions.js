import {
  showErrorMessage,
  showSuccessMessage,
} from '/static/js/common/notification.prod.js';

export function debounce(func, delay = 500) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export function checkEmail(emailStr) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailStr);
}

export function validatePassword(value) {
  if (value.length < 8) {
    return 'The password is too short.';
  }

  if (!/\d/.test(value)) {
    return 'Enter a number 0-9.';
  }

  if (!/[a-zA-Z]/.test(value)) {
    return 'Enter an alphabet letter A-Z.';
  }

  if (!/[^a-zA-Z0-9\s]/.test(value)) {
    return 'Enter a special character - !@#$%^&*(){}[],./';
  }

  return null;
}

export function parseDuration(duration) {
  const match = duration.match(
    /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
  );

  if (!match) {
    return 0;
  }

  const days = Number(match[1] || 0);
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  const seconds = Number(match[4] || 0);

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

const COOLDOWN_KEY = 'login_cooldown_until';
let Timeout = null;
export function startCooldown(seconds) {
  const cooldownUntil = Date.now() + seconds * 1000;
  localStorage.setItem(COOLDOWN_KEY, cooldownUntil);
  clearTimeout(Timeout);
  updateCooldown();
}

export function updateCooldown() {
  clearTimeout(Timeout);
  const $button = $('#formButton');

  const cooldownUntil = Number(localStorage.getItem(COOLDOWN_KEY));

  if (!cooldownUntil) {
    $button.prop('disabled', false);
    return;
  }

  const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);

  if (remaining <= 0) {
    localStorage.removeItem(COOLDOWN_KEY);
    $button.prop('disabled', false);
    showSuccessMessage('Lockdown Lifted', 'Redirecting you');
    window.location.reload();
    return;
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  $button.prop('disabled', true);
  showErrorMessage(
    'Lockdown Initiated',
    `Try again after ${minutes} minute(s) and ${seconds} second(s)`
  );
  if (remaining < 60) {
    Timeout = setTimeout(updateCooldown, remaining * 1000);
  } else {
    Timeout = setTimeout(updateCooldown, 60000);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function enableNotifications() {
  const VAPID_PUBLIC_KEY = $('#vapid_public_key').val();
  const permission = await Notification.requestPermission();
  let csrftoken = $('[name="csrftoken"]')[0].content;
  if (permission !== 'granted') {
    showErrorMessage(
      gettext('Notifications Denied'),
      gettext('Kindly allow Notifications.')
    );
    return;
  }

  showSuccessMessage(
    gettext('Notifications Accepted!'),
    gettext('Notifications have been allowed.')
  );

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // We'll send this to Django next

  $.ajax({
    type: 'POST',
    url: '?action=activate_notifications',
    headers: {
      'X-CSRFToken': csrftoken,
    },
    data: JSON.stringify(subscription.toJSON()),
    success: function (response) {
      if (response.status) {
        showSuccessMessage(
          gettext('Notifications Registered'),
          gettext('You can now receive notifications.')
        );
      } else {
        showErrorMessage('Notifications Error', 'Kindly Try again');
      }
    },
  });
}

export async function unsubscribeNotifications(){
  const registration = await navigator.serviceWorker.ready;
  let csrftoken = $('[name="csrftoken"]')[0].content;

const subscription =
  await registration.pushManager.getSubscription();

if (subscription) {
  const success = await subscription.unsubscribe();
    
  $.ajax({
    type: 'POST',
    url: '?action=silence_notifications',
    headers: {
      'X-CSRFToken': csrftoken
    },
    data: JSON.stringify({endpoint:subscription.endpoint})
  })
}

}

export function handleHttpError(status) {
  switch (status) {
    case 401:
      window.location.href = '/login/';
      break;

    case 403:
      showErrorMessage(
        'Not Authenticated',
        'You don\'t have permission to do that.'
      );
      break;

    case 404:
      showErrorMessage('Not Found', 'The requested resource was not found.');
      break;

    case 500:
      showErrorMessage(
        'An Error Occurred',
        'Server error. Please try again later.'
      );
      break;
  }
}
