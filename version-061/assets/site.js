(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var index = 0;
        var showSlide = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    var filterInput = document.querySelector('.js-card-filter');
    var cardContainer = document.querySelector('.js-card-container');
    if (filterInput && cardContainer) {
        var cards = Array.prototype.slice.call(cardContainer.querySelectorAll('.movie-card'));
        filterInput.addEventListener('input', function () {
            var key = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
                card.classList.toggle('hidden-card', key && text.indexOf(key) === -1);
            });
        });
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('video[data-stream]'));
    players.forEach(function (video) {
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            window.addEventListener('pagehide', function () {
                hls.destroy();
            }, { once: true });
        } else {
            video.src = stream;
        }
        var wrap = video.closest('.player-wrap');
        var start = wrap ? wrap.querySelector('.play-start') : null;
        if (start) {
            start.addEventListener('click', function () {
                video.play();
                start.classList.add('hidden');
            });
            video.addEventListener('play', function () {
                start.classList.add('hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    start.classList.remove('hidden');
                }
            });
        }
    });

    var searchResults = document.getElementById('searchResults');
    if (searchResults && window.catalogItems) {
        var params = new URLSearchParams(window.location.search);
        var searchInput = document.getElementById('searchInput');
        var categorySelect = document.getElementById('searchCategory');
        var typeSelect = document.getElementById('searchType');
        if (searchInput) {
            searchInput.value = params.get('q') || '';
        }
        var render = function () {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var matched = window.catalogItems.filter(function (item) {
                var text = [item.title, item.region, item.type, item.genre, item.tags, item.year, item.category, item.oneLine].join(' ').toLowerCase();
                var okQuery = !query || text.indexOf(query) !== -1;
                var okCategory = !category || item.category === category;
                var okType = !type || item.type.indexOf(type) !== -1 || item.genre.indexOf(type) !== -1;
                return okQuery && okCategory && okType;
            }).slice(0, 240);
            if (!matched.length) {
                searchResults.innerHTML = '<div class="content-card"><h2>暂无匹配内容</h2><p>可以更换影片名称、地区、年份、分类或标签继续搜索。</p></div>';
                return;
            }
            searchResults.innerHTML = matched.map(function (item) {
                return '<article class="movie-card">'
                    + '<a href="' + item.url + '" class="movie-poster-link" aria-label="' + escapeHtml(item.title) + '">'
                    + '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" class="movie-poster" loading="lazy">'
                    + '<span class="poster-mask"></span><span class="play-badge">▶</span><span class="poster-meta">' + escapeHtml(item.duration) + '</span></a>'
                    + '<div class="movie-card-body"><div class="movie-card-kicker">' + escapeHtml(item.category) + ' · ' + escapeHtml(item.year) + '</div>'
                    + '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>'
                    + '<p>' + escapeHtml(item.oneLine) + '</p><div class="movie-card-footer"><span>⭐ ' + escapeHtml(item.rating) + '</span><span>' + escapeHtml(item.region) + '</span></div></div></article>';
            }).join('');
        };
        var escapeHtml = function (value) {
            return String(value).replace(/[&<>"]/g, function (char) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char];
            });
        };
        if (searchInput) {
            searchInput.addEventListener('input', render);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', render);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', render);
        }
        render();
    }
})();
