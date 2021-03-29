'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const versionInput = document.querySelector('#firefox');
  versionInput.value = navigator.userAgent;

  const resolutionInput = document.querySelector('#resolution');
  resolutionInput.value = window.innerWidth + 'x' + window.innerHeight;

  let resolutionChanged = false;
  resolutionInput.addEventListener('change', () => {
    resolutionChanged = true;
  });
  window.onresize = () => {
    if (!resolutionChanged) {
      resolutionInput.value = window.innerWidth + 'x' + window.innerHeight;
    }
  }
});
