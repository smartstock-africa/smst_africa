import {
  showErrorMessage,
  unreadNotifications,
} from '/static/js/common/notification.prod.js';
import { saveImage } from '/static/js/common/functions.prod.js';
document.addEventListener('DOMContentLoaded', function () {
  unreadNotifications();
  let access = localStorage.getItem('access') || null;
  $('.profileHolder').on('click', function () {
    let $helper = $('.helperHolder');
    if ($helper.hasClass('animate__fadeInDown')) {
      $helper.removeClass('animate__fadeInDown').addClass('animate__fadeOutUp');
    } else {
      $.ajax({
        type: 'GET',
        url: 'https://cloud.smartstock.africa/smst_user/',
        headers: {
          Authorization: `Bearer ${access}`,
        },
        success: function (response) {
          Object.entries(response).forEach(([key, value]) => {
            $(`#${key}`).empty().append(value);
          });

          $('.helperHolder')
            .removeClass('animate__fadeOutUp')
            .addClass('animate__fadeInDown');
        },
      });
    }
  });

  $('body').on('click', '.addImageHolder', function () {
    $('#imageInput').trigger('click');
  });

  $('body').on('change', '#imageInput', function (e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorMessage(
        gettext('Image too big'),
        gettext('Kindly choose an image lower than 5MB')
      );
      this.value = '';

      return;
    }

    const allowedTypes = ['image/jpeg'];

    if (!allowedTypes.includes(file.type)) {
      showErrorMessage(
        gettext('Not an Image'),
        gettext('Only JPG and JPEG images are allowed!')
      );
      this.value = '';
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {
      const maxWidth = 1280;
      const scale = maxWidth / img.width;
      const width = maxWidth;
      const height = img.height * scale;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        function (blob) {
          if (!blob) {
            showErrorMessage(
              gettext('Image Processing Failed'),
              gettext('Could not process image, kindly try again')
            );
            return;
          }

          const $cropImage = $('#imageEditPreview');
          if ($cropImage[0].dataset.objectURL) {
            URL.revokeObjectURL($cropImage[0].dataset.objectURL);
          }
          const objectURL = URL.createObjectURL(blob);
          $cropImage[0].dataset.objectURL = objectURL;
          $cropImage[0].onload = function () {
            if ($cropImage.data('cropper')) {
              $cropImage.cropper('destroy');
            }

            $cropImage.cropper({
              aspectRatio: 1 / 1,
              viewMode: 3,
              minCanvasHeight: 100,
              autoCropArea: 1,
              zoomable: false,
              minCropBoxHeight: 100,
            });
          };
          $cropImage[0].src = objectURL;
          $('.imageEditHolder')
            .removeClass('animate__fadeOutDown')
            .addClass('animate__fadeInUp');
        },
        'image/webp',
        0.9
      );
    };
  });

  $('body').on('click', '#descriptionButton', function () {
    let $descriptionInputs = $('.doubleInputHolder').find('input');
    $descriptionInputs.each(function () {
      let value = $(this).val().trim();

      if (!value.length) {
        showErrorMessage(
          'Fill Empty Fields',
          'Kindly fill in the empty fields.'
        );
        $(this).focus();
        return false; // Break the loop
      }
    });
  });

  $('body').on('click', '#cancelEditing', function () {
    $('.imageEditHolder')
      .removeClass('animate__fadeInUp')
      .addClass('animate__fadeOutDown');
  });

  $('body').on('click', '#saveEditing', function () {
    saveImage();
  });
});
