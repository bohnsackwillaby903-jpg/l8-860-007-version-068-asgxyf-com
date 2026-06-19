
(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var change = function (next) {
                if (!slides.length) {
                    return;
                }
                current = (next + slides.length) % slides.length;
                slides.forEach(function (slide, index) {
                    slide.classList.toggle("active", index === current);
                });
                dots.forEach(function (dot, index) {
                    dot.classList.toggle("active", index === current);
                });
            };
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    change(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });
            window.setInterval(function () {
                change(current + 1);
            }, 6200);
        }

        var filter = document.querySelector("[data-card-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        if (filter && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (query) {
                filter.value = query;
            }
            var apply = function () {
                var value = normalize(filter.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var match = !value || text.indexOf(value) !== -1;
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            };
            filter.addEventListener("input", apply);
            apply();
            if (filter.hasAttribute("data-autofocus-search")) {
                window.setTimeout(function () {
                    filter.focus();
                }, 120);
            }
        }
    });
})();
