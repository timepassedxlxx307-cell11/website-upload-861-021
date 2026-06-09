(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var input = filterPanel.querySelector('[data-local-search]');
    var buttons = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-region]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var currentRegion = '';

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var region = card.getAttribute('data-region') || '';
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var year = (card.getAttribute('data-year') || '').toLowerCase();
        var matchesKeyword = !keyword || title.indexOf(keyword) > -1 || genre.indexOf(keyword) > -1 || region.toLowerCase().indexOf(keyword) > -1 || year.indexOf(keyword) > -1;
        var matchesRegion = !currentRegion || region === currentRegion;
        card.classList.toggle('hidden-card', !(matchesKeyword && matchesRegion));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentRegion = button.getAttribute('data-filter-region') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  }

  var searchInput = document.getElementById('global-search-input');
  var searchResults = document.getElementById('search-results');

  if (searchInput && searchResults && Array.isArray(window.SEARCH_MOVIES)) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function createResult(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card" data-card>' +
        '<a href="' + escapeHtml(movie.url) + '" class="movie-poster" aria-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="movie-type">' + escapeHtml(movie.type) + '</span>' +
        '<span class="movie-score">' + escapeHtml(movie.score) + '</span>' +
        '</a>' +
        '<div class="movie-body">' +
        '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
        '<p>' + escapeHtml(movie.summary) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
        '<div class="tag-list">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function renderSearch() {
      var keyword = searchInput.value.trim().toLowerCase();
      var movies = window.SEARCH_MOVIES.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return [movie.title, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(',')].join(' ').toLowerCase().indexOf(keyword) > -1;
      }).slice(0, 120);

      if (!movies.length) {
        searchResults.innerHTML = '<div class="detail-card"><h2>暂无匹配影片</h2><p>可以尝试使用片名、地区、年份或类型重新搜索。</p></div>';
        return;
      }

      searchResults.innerHTML = movies.map(createResult).join('');
    }

    searchInput.addEventListener('input', renderSearch);
    renderSearch();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
