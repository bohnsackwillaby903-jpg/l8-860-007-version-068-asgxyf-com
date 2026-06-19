(function () {
  "use strict";

  function closest(element, selector) {
    while (element && element !== document) {
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu]");
    var nav = document.querySelector("[data-nav-links]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      button.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCardFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-panel");
      var scope = document.querySelector(scopeSelector);
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
      var keyword = panel.querySelector("[data-filter-keyword]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var count = document.querySelector(panel.getAttribute("data-filter-count") || "");

      function apply() {
        var q = normalize(keyword && keyword.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var typeValue = normalize(card.getAttribute("data-type"));
          var yearValue = normalize(card.getAttribute("data-year"));
          var matched = (!q || haystack.indexOf(q) !== -1) &&
            (!type || typeValue === type) &&
            (!year || yearValue === year);

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "当前显示 " + visible + " 部";
        }
      }

      [keyword, typeSelect, yearSelect].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });

      var reset = panel.querySelector("[data-filter-reset]");
      if (reset) {
        reset.addEventListener("click", function () {
          if (keyword) {
            keyword.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          apply();
        });
      }

      apply();
    });
  }

  function setupSearchPage() {
    var mount = document.querySelector("[data-search-results]");

    if (!mount || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var input = document.querySelector("[data-search-input]");
    var typeSelect = document.querySelector("[data-search-type]");
    var yearSelect = document.querySelector("[data-search-year]");
    var note = document.querySelector("[data-search-note]");

    if (input) {
      input.value = params.get("q") || "";
    }
    if (typeSelect) {
      typeSelect.value = params.get("type") || "";
    }
    if (yearSelect) {
      yearSelect.value = params.get("year") || "";
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function card(movie) {
      var url = escapeHtml(movie.url);
      var cover = escapeHtml(movie.cover);
      var title = escapeHtml(movie.title);
      var meta = escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(" · "));
      var desc = escapeHtml(movie.oneLine || movie.genre || "高清免费在线观看");
      return [
        '<article class="movie-card" data-title="' + title + '">',
        '  <a class="poster-link" href="' + url + '">',
        '    <img src="' + cover + '" alt="' + title + '" loading="lazy">',
        '    <span class="quality-badge">HD</span>',
        '    <span class="type-badge">' + escapeHtml(movie.type || "影视") + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3 class="movie-title"><a href="' + url + '">' + title + '</a></h3>',
        '    <div class="muted">' + meta + '</div>',
        '    <p class="movie-desc">' + desc + '</p>',
        '  </div>',
        '</article>'
      ].join("\n");
    }

    function render() {
      var q = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" "));
        return (!q || haystack.indexOf(q) !== -1) &&
          (!type || normalize(movie.type) === type) &&
          (!year || normalize(movie.year) === year);
      });
      var shown = matches.slice(0, 240);
      mount.innerHTML = shown.length ? shown.map(card).join("\n") : '<div class="empty-state">没有找到匹配影片，请换个关键词再试。</div>';
      if (note) {
        note.textContent = '共找到 ' + matches.length + ' 部影片' + (matches.length > shown.length ? '，当前展示前 ' + shown.length + ' 部。' : '。');
      }
    }

    [input, typeSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", render);
        field.addEventListener("change", render);
      }
    });

    var form = document.querySelector("[data-search-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    }

    render();
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-hls-loader="true"]');
      if (existing) {
        existing.addEventListener("load", function () {
          resolve(window.Hls);
        });
        existing.addEventListener("error", reject);
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.async = true;
      script.defer = true;
      script.setAttribute("data-hls-loader", "true");
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var overlay = player.querySelector(".player-overlay");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-source");
      var started = false;

      function updateStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playNative() {
        video.src = source;
        video.play().then(function () {
          updateStatus("正在播放高清片源");
        }).catch(function () {
          updateStatus("浏览器阻止了自动播放，请再次点击播放器开始观看。");
        });
      }

      function startPlayer() {
        if (!video || !source) {
          updateStatus("当前影片暂未绑定播放源。");
          return;
        }

        if (started) {
          video.play();
          return;
        }
        started = true;
        if (overlay) {
          overlay.classList.add("hidden");
        }
        video.setAttribute("controls", "controls");
        updateStatus("正在初始化 HLS 播放器...");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          playNative();
          return;
        }

        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().then(function () {
                updateStatus("HLS 播放源已连接，正在播放高清内容。");
              }).catch(function () {
                updateStatus("片源已就绪，请点击播放器开始观看。");
              });
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                updateStatus("播放源连接异常，可刷新页面后重试。");
                hls.destroy();
              }
            });
          } else {
            updateStatus("当前浏览器不支持 HLS 播放，请换用支持 HLS 的浏览器。");
          }
        }).catch(function () {
          updateStatus("HLS 播放库加载失败，请检查网络后重试。");
        });
      }

      if (button) {
        button.addEventListener("click", startPlayer);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            startPlayer();
          }
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
}());
