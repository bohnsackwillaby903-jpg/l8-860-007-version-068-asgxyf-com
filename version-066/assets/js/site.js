(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    onReady(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupCardFilters();
        setupSearchQuery();
        setupPlayers();
    });

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var carousels = document.querySelectorAll("[data-hero-carousel]");
        carousels.forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            if (slides.length <= 1) {
                return;
            }
            var index = 0;
            var timer = null;

            function activate(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    activate(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    var nextIndex = Number(dot.getAttribute("data-hero-dot"));
                    stop();
                    activate(nextIndex);
                    start();
                });
            });

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            start();
        });
    }

    function setupCardFilters() {
        var blocks = document.querySelectorAll(".card-filter-block");
        blocks.forEach(function (block) {
            var input = block.querySelector("[data-card-search]");
            var buttons = Array.prototype.slice.call(block.querySelectorAll("[data-filter]"));
            var cards = Array.prototype.slice.call(block.querySelectorAll(".movie-card, .ranking-row"));
            var empty = block.querySelector("[data-empty-state]");
            var activeFilter = "all";

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search") || card.textContent);
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
                    var show = matchedQuery && matchedFilter;
                    card.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    applyFilter();
                });
            });

            applyFilter();
        });
    }

    function setupSearchQuery() {
        var page = document.querySelector("[data-search-page]");
        if (!page) {
            return;
        }
        var input = page.querySelector("[data-search-input]");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function setupPlayers() {
        var loadedVideos = new WeakSet();
        var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-hls]"));
        videos.forEach(function (video) {
            var button = document.querySelector('[data-play-for="' + video.id + '"]');
            var message = video.parentElement ? video.parentElement.querySelector(".player-message") : null;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }

            function loadVideo() {
                var stream = video.getAttribute("data-hls");
                if (!stream || loadedVideos.has(video)) {
                    return Promise.resolve();
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    loadedVideos.add(video);
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video.hlsInstance = hls;
                    loadedVideos.add(video);
                    return new Promise(function (resolve) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                            if (data && data.fatal) {
                                setMessage("播放加载失败，请稍后重试。");
                            }
                        });
                    });
                }
                video.src = stream;
                loadedVideos.add(video);
                return Promise.resolve();
            }

            function playVideo() {
                setMessage("");
                loadVideo().then(function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            setMessage("点击视频控制栏继续播放。");
                        });
                    }
                });
                if (button) {
                    button.classList.add("is-hidden");
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            video.addEventListener("play", function () {
                if (!loadedVideos.has(video)) {
                    loadVideo();
                }
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
        });
    }
})();
