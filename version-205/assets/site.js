(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.getElementById("mobileNav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".hero-prev");
      var next = carousel.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function play() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 6200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide")) || 0);
          play();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }

      show(0);
      play();
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-search]"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-genre]"));

    function applyFilter() {
      var query = inputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(" ");
      var genre = selects.map(function (select) {
        return select.value.trim();
      }).filter(Boolean)[0] || "";
      var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-list .movie-card"));
      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var meta = (card.getAttribute("data-meta") || "").toLowerCase();
        var genres = card.getAttribute("data-genre") || "";
        var queryMatch = !query || title.indexOf(query) !== -1 || meta.indexOf(query) !== -1;
        var genreMatch = !genre || genres.indexOf(genre) !== -1 || meta.indexOf(genre.toLowerCase()) !== -1;
        card.classList.toggle("hidden-card", !(queryMatch && genreMatch));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", applyFilter);
    });
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
  });
})();
