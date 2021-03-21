'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const versionInput = document.querySelector('#firefox');
  versionInput.value = navigator.userAgent;

  const resolutionInput = document.querySelector('#resolution');
  resolutionInput.value = window.innerWidth + 'x' + window.innerHeight;

  window.onresize = () => {
    resolutionInput.value = window.innerWidth + 'x' + window.innerHeight;
  }
});
