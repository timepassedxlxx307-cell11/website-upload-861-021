(function() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("siteNav");

  if (toggle && nav) {
    toggle.addEventListener("click", function() {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

  panels.forEach(function(panel) {
    var input = panel.querySelector("[data-filter-input]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var count = panel.querySelector("[data-filter-count]");
    var list = document.querySelector("[data-card-list]");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];

    if (!cards.length) {
      return;
    }

    if (panel.hasAttribute("data-search-page") && input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query) {
        input.value = query;
      }
    }

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : "");
      var typeValue = normalize(typeSelect ? typeSelect.value : "");
      var yearValue = normalize(yearSelect ? yearSelect.value : "");
      var visible = 0;

      cards.forEach(function(card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchType = !typeValue || cardType === typeValue;
        var matchYear = !yearValue || cardYear === yearValue;
        var show = matchQuery && matchType && matchYear;

        card.classList.toggle("is-hidden", !show);

        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + " 部";
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    applyFilter();
  });
}());
