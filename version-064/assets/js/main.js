(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.hasAttribute('hidden');
      if (open) {
        mobilePanel.removeAttribute('hidden');
      } else {
        mobilePanel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      event.preventDefault();
      if (form.hasAttribute('data-local-search')) {
        return;
      }
      var target = form.getAttribute('action') || './search.html';
      window.location.href = target + (value ? '?q=' + encodeURIComponent(value) : '');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        resetTimer();
      });
    });
    var resetTimer = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    };
    showSlide(0);
    resetTimer();
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-filter-query]');
    var regionSelect = filterRoot.querySelector('[data-filter-region]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var resetButton = filterRoot.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
    var empty = filterRoot.querySelector('.empty-state');

    function applyQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      if (q && searchInput) {
        searchInput.value = q;
      }
    }

    function matches(card, query, region, type, year) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var okQuery = !query || text.indexOf(query) >= 0;
      var okRegion = !region || (card.getAttribute('data-region') || '') === region;
      var okType = !type || (card.getAttribute('data-type') || '') === type;
      var okYear = !year || (card.getAttribute('data-year') || '') === year;
      return okQuery && okRegion && okType && okYear;
    }

    function filterCards() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var show = matches(card, query, region, type, year);
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('active', visible === 0);
      }
    }

    applyQueryFromUrl();
    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        filterCards();
      });
    }
    filterCards();
  }
})();

function initMoviePlayer(playlistUrl) {
  var video = document.getElementById('video-player');
  var button = document.querySelector('.play-cover');
  var attached = false;

  if (!video || !playlistUrl) {
    return;
  }

  function attachPlaylist() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playlistUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(playlistUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = playlistUrl;
  }

  function startVideo() {
    attachPlaylist();
    if (button) {
      button.setAttribute('hidden', '');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (button) {
          button.removeAttribute('hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.setAttribute('hidden', '');
    }
  });
}
