(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilterPage() {
    var grid = document.querySelector("[data-filter-page]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var search = document.getElementById("localSearch");
    var type = document.getElementById("typeFilter");
    var year = document.getElementById("yearFilter");
    var sort = document.getElementById("sortFilter");

    function apply() {
      var keyword = normalize(search && search.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year")
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
        var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        card.classList.toggle("is-hidden", !(matchKeyword && matchType && matchYear));
      });

      var order = sort && sort.value ? sort.value : "default";
      var sorted = cards.slice().sort(function (a, b) {
        if (order === "rating") {
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        }
        if (order === "latest") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        if (order === "title") {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
        }
        return 0;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    [search, type, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function movieCard(movie) {
    var tags = (movie.genre || "").split(" / ").slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<div class="poster-frame">',
      '<img class="movie-img" src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '<span class="play-mark">▶</span>',
      '<span class="rating-pill">★ ' + escapeHtml(movie.rating) + '</span>',
      '</div>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-title" href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var box = document.getElementById("searchPageInput");
    var results = document.getElementById("searchResults");
    if (!box || !results || !window.MOVIE_INDEX) {
      return;
    }

    function render() {
      var q = normalize(box.value);
      var list = window.MOVIE_INDEX.filter(function (movie) {
        if (!q) {
          return true;
        }
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.oneLine,
          movie.year
        ].join(" ")).indexOf(q) !== -1;
      }).slice(0, 240);

      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
        return;
      }

      results.innerHTML = '<div class="movie-grid">' + list.map(movieCard).join("") + '</div>';
    }

    box.value = readQuery();
    box.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilterPage();
    initSearchPage();
  });
})();
