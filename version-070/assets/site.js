(function() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  const prevButton = document.querySelector("[data-hero-prev]");
  const nextButton = document.querySelector("[data-hero-next]");
  let activeSlide = 0;
  let sliderTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  function restartSlider() {
    if (sliderTimer) {
      window.clearInterval(sliderTimer);
    }

    if (slides.length > 1) {
      sliderTimer = window.setInterval(function() {
        showSlide(activeSlide + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    restartSlider();

    if (prevButton) {
      prevButton.addEventListener("click", function() {
        showSlide(activeSlide - 1);
        restartSlider();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function() {
        showSlide(activeSlide + 1);
        restartSlider();
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
        restartSlider();
      });
    });
  }

  const filterInput = document.querySelector("[data-filter-input]");
  const categoryFilter = document.querySelector("[data-category-filter]");
  const typeFilter = document.querySelector("[data-type-filter]");
  const cards = Array.from(document.querySelectorAll("[data-search]"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    const query = normalize(filterInput ? filterInput.value : "");
    const category = normalize(categoryFilter ? categoryFilter.value : "");
    const type = normalize(typeFilter ? typeFilter.value : "");

    cards.forEach(function(card) {
      const searchText = normalize(card.getAttribute("data-search"));
      const cardCategory = normalize(card.getAttribute("data-filter-category"));
      const cardType = normalize(card.getAttribute("data-filter-type"));
      const matchQuery = !query || searchText.indexOf(query) !== -1;
      const matchCategory = !category || cardCategory === category;
      const matchType = !type || cardType === type;
      card.hidden = !(matchQuery && matchCategory && matchType);
    });
  }

  if (filterInput || categoryFilter || typeFilter) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (initialQuery && filterInput) {
      filterInput.value = initialQuery;
    }

    [filterInput, categoryFilter, typeFilter].forEach(function(element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
})();
