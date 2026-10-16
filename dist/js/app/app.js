import {
  showErrorMessage,
  showSuccessMessage,
  unreadNotifications,
} from '/static/js/common/notification.prod.js';
import {
  saveImage,
  fadeOutModal,
  fadeInModal,
  loaderScreen,
  fadeOutLoader,
} from '/static/js/common/functions.prod.js';

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
    loaderScreen(gettext('Loading your Image'));
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
      fadeOutLoader();
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
            fadeOutLoader();

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
          fadeInModal('.imageEdit', '.imageEditHolder');
        },
        'image/webp',
        0.9
      );
    };
  });

  $('body').on('pointerdown', '#descriptionButton', function (e) {
    e.preventDefault();
  });

  $('body').on('click', '#descriptionButton', function () {
    const $pdi = $('#productDescriptionInput');
    let descriptions = $pdi.val().trim();
    let productDescriptionInputValue = new Array();
    if (descriptions.length) {
      productDescriptionInputValue = JSON.parse(descriptions);
      if (productDescriptionInputValue.length >= 5) {
        showErrorMessage(
          gettext('Maximum Descriptions'),
          gettext('You have reached your free limit for descriptions.')
        );
        return;
      }
    }
    let $descriptionInputs = $('.doubleInputHolder').find('input');
    let emptyField = false;
    $descriptionInputs.each(function () {
      let value = $(this).val().trim();

      if (!value.length) {
        emptyField = true;
        showErrorMessage(
          gettext('Fill Empty Fields'),
          gettext('Kindly fill in the empty fields.')
        );
        $(this).focus();
        return false; // Break the loop
      }
      emptyField = false;
    });
    const descriptionData = {
      descriptionType: $('#descriptionType').val().trim(),
      descriptionValue: $('#descriptionValue').val().trim(),
    };
    if (emptyField) {
      return;
    }

    let $prodDesc = $(
      '<div class="productDescription flex animate__animated animate__fadeInUp"></div>'
    );
    let $descHolder = $('<div class="prodDesc"></div>');
    let $descType = $('<div class="descriptionType"></div>').append(
      descriptionData.descriptionType
    );
    let $descValue = $('<div class="descriptionValue"></div>').append(
      descriptionData.descriptionValue
    );

    let $descriptionOptions = $(
      `
        <div class="decriptionOptions flex align-center">
          <div class="editDescriptionButton descriptionOptionButton">
            <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.4998 5.49994L18.3282 8.32837M3 20.9997L3.04745 20.6675C3.21536 19.4922 3.29932 18.9045 3.49029 18.3558C3.65975 17.8689 3.89124 17.4059 4.17906 16.9783C4.50341 16.4963 4.92319 16.0765 5.76274 15.237L17.4107 3.58896C18.1918 2.80791 19.4581 2.80791 20.2392 3.58896C21.0202 4.37001 21.0202 5.63634 20.2392 6.41739L8.37744 18.2791C7.61579 19.0408 7.23497 19.4216 6.8012 19.7244C6.41618 19.9932 6.00093 20.2159 5.56398 20.3879C5.07171 20.5817 4.54375 20.6882 3.48793 20.9012L3 20.9997Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="deleteDescriptionButton descriptionOptionButton">
            <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 12V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      `
    );

    $('.productDescriptions').append(
      $prodDesc.append(
        $descHolder.append($descType, $descValue),
        $descriptionOptions
      )
    );

    productDescriptionInputValue.push(descriptionData);
    $pdi.val(JSON.stringify(productDescriptionInputValue));

    if (productDescriptionInputValue.length >= 5) {
      $('.doubleInputHolder').find('button').prop('disabled', true);
      showErrorMessage(
        gettext('Maximum Descriptions Reached'),
        gettext('You have reached your maximum of 5 descriptions.')
      );
    }
    $descriptionInputs.val('');
  });

  $('body').on('click', '#cancelEditing', function () {
    fadeOutModal('.imageEdit', '.imageEditHolder');
  });

  $('body').on('click', '#saveEditing', function () {
    saveImage();
  });

  $('body').on('click', '.descriptionOptionButton', function () {
    let $parent = $(this).closest('.productDescription');
    let index = $parent.index();
    let descriptionData = JSON.parse(
      $('#productDescriptionInput').val().trim()
    );
    if ($(this).hasClass('editDescriptionButton')) {
      let description = descriptionData[index];
      $('#descriptionType').val(description.descriptionType);
      $('#descriptionValue').val(description.descriptionValue);
    }

    descriptionData.splice(index, 1);
    $('#productDescriptionInput').val(JSON.stringify(descriptionData));
    $parent.remove();
    if ($(this).hasClass('deleteDescriptionButton')) {
      showErrorMessage(
        gettext('Deleted Description'),
        gettext('You have removed the description')
      );
    }
    $('#descriptionButton').prop('disabled', false);
  });

  $('body').on('click', '#createProductButton', function () {
    let imageFile = $('#imageInput')[0].files[0];
    let productName = $('#productName').val().trim();
    let productDescription = $('#productDescriptionInput').val().trim();
    let formData = new FormData();
    formData.append('product_image', imageFile);
    formData.append('product_name', productName);
    formData.append('product_description', productDescription);
    $.ajax({
      method: 'POST',
      url: 'https://cloud.smartstock.africa/stock_products/',
      headers: {
        Authorization: `Bearer ${access}`,
      },
      processData: false,
      contentType: false,
      data: formData,
      success: function (response) {
        showSuccessMessage(
          interpolate(gettext('Product %s Created'), [response.product_name]),
          gettext('The product has been saved and added to stock')
        );
      },
    });
  });
});
