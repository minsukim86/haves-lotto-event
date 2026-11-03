(function () {
  var cfg = window.HAVES_LP || {};
  var target = cfg.targetUrl || 'https://haveslotto.com/';

  document.querySelectorAll('[data-bind]').forEach(function (el) {
    var key = el.getAttribute('data-bind');
    if (!cfg[key]) return;
    var val = String(cfg[key]);
    if (key === 'headline') {
      el.innerHTML = val.replace(/\n/g, '<br>');
    } else {
      el.textContent = val;
    }
  });

  document.querySelectorAll('[data-cta]').forEach(function (a) {
    a.setAttribute('href', target);
  });
})();
