(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function activateSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activateSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activateSlide(current + 1);
      }, 5200);
    }

    var homeSearch = document.querySelector("[data-home-search]");
    if (homeSearch) {
      homeSearch.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = homeSearch.querySelector("input");
        var query = input ? input.value.trim() : "";
        var suffix = query ? "?q=" + encodeURIComponent(query) : "";
        window.location.href = "./search.html" + suffix;
      });
    }

    var searchInput = document.querySelector("#search-input");
    var genreFilter = document.querySelector("#genre-filter");
    var yearFilter = document.querySelector("#year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var emptyState = document.querySelector(".empty-state");

    function applySearch() {
      if (!cards.length) {
        return;
      }

      var query = normalize(searchInput ? searchInput.value : "");
      var genre = normalize(genreFilter ? genreFilter.value : "");
      var year = normalize(yearFilter ? yearFilter.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year
        ].join(" "));
        var cardGenre = normalize(card.dataset.genre);
        var cardYear = normalize(card.dataset.year);
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (genre && cardGenre.indexOf(genre) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? "none" : "block";
      }
    }

    if (searchInput || genreFilter || yearFilter) {
      var params = new URLSearchParams(window.location.search);
      if (searchInput && params.get("q")) {
        searchInput.value = params.get("q");
      }
      [searchInput, genreFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applySearch);
          control.addEventListener("change", applySearch);
        }
      });
      applySearch();
    }
  });
})();

function initMoviePlayer(source, videoId, buttonId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var attached = false;

  if (!video) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = source;
    attached = true;
  }

  function play() {
    attach();
    if (button) {
      button.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });
}
