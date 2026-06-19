(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');

    if (toggle && links) {
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function markCoverEmpty(image) {
        image.style.display = 'none';
        if (image.parentElement) {
            image.parentElement.classList.add('cover-empty');
        }
    }

    document.querySelectorAll('img[data-cover]').forEach(function (image) {
        image.addEventListener('error', function () {
            markCoverEmpty(image);
        });
        if (image.complete && image.naturalWidth === 0) {
            markCoverEmpty(image);
        }
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var initialQuery = '';

    try {
        initialQuery = new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
        initialQuery = '';
    }

    document.querySelectorAll('[data-search-input]').forEach(function (input, index) {
        var scope = input.closest('section');
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]')) : [];

        function applySearch() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region')
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
            });
        }

        input.addEventListener('input', applySearch);

        if (index === 0 && initialQuery) {
            input.value = initialQuery;
            applySearch();
        }
    });

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play]');
        var initialized = false;
        var hlsInstance = null;

        function attachSource() {
            if (!video || initialized) {
                return;
            }

            var source = video.getAttribute('data-src');

            if (!source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            initialized = true;
        }

        function startPlayback() {
            attachSource();
            if (!video) {
                return;
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                overlay.classList.add('is-hidden');
                startPlayback();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    }
}());
