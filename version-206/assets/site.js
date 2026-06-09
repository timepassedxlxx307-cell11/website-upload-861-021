(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var setSlide = function (next) {
        index = next;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          setSlide(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          setSlide((index + 1) % slides.length);
        }, 5600);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q") || "";
    var filterInput = document.querySelector("[data-filter-input]");
    var filterSelect = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title][data-tags]"));
    var noResults = document.querySelector("[data-no-results]");

    if (filterInput && queryFromUrl) {
      filterInput.value = queryFromUrl;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var q = normalize(filterInput ? filterInput.value : "");
      var category = filterSelect ? filterSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags"));
        var cardCategory = card.getAttribute("data-category") || "";
        var matched = (!q || text.indexOf(q) !== -1) && (!category || cardCategory === category);
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle("is-visible", visible === 0);
      }
    }

    if (cards.length && (filterInput || filterSelect)) {
      if (filterInput) {
        filterInput.addEventListener("input", applyFilter);
      }
      if (filterSelect) {
        filterSelect.addEventListener("change", applyFilter);
      }
      applyFilter();
    }
  });
})();
