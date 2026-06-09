(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function text(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('active');
      document.body.classList.toggle('nav-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!panel || !cards.length) {
      return;
    }
    var keyword = panel.querySelector('[data-filter-keyword]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty]');
    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.tags, card.dataset.genre, card.dataset.region, card.dataset.year, card.dataset.type].join(' ').toLowerCase();
        var ok = (!q || haystack.indexOf(q) !== -1) && (!r || card.dataset.region === r) && (!y || card.dataset.year === y) && (!t || card.dataset.type === t);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    [keyword, region, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
      }
    });
    apply();
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root || !window.SiteSearchData) {
      return;
    }
    var form = root.querySelector('[data-search-form]');
    var qInput = root.querySelector('[data-search-q]');
    var regionInput = root.querySelector('[data-search-region]');
    var yearInput = root.querySelector('[data-search-year]');
    var typeInput = root.querySelector('[data-search-type]');
    var results = root.querySelector('[data-search-results]');
    var empty = root.querySelector('[data-search-empty]');
    var params = new URLSearchParams(location.search);
    if (qInput) {
      qInput.value = params.get('q') || '';
    }
    if (regionInput) {
      regionInput.value = params.get('region') || '';
    }
    if (yearInput) {
      yearInput.value = params.get('year') || '';
    }
    if (typeInput) {
      typeInput.value = params.get('type') || '';
    }
    function render() {
      var q = qInput ? qInput.value.trim().toLowerCase() : '';
      var region = regionInput ? regionInput.value : '';
      var year = yearInput ? yearInput.value : '';
      var type = typeInput ? typeInput.value : '';
      var matched = window.SiteSearchData.filter(function (item) {
        var haystack = [item.title, item.region, item.year, item.type, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        return (!q || haystack.indexOf(q) !== -1) && (!region || item.region === region) && (!year || item.year === year) && (!type || item.type === type);
      }).slice(0, 240);
      if (!results) {
        return;
      }
      results.innerHTML = matched.map(function (item) {
        return '<a class="card" href="' + text(item.url) + '">' +
          '<div class="card-poster"><img src="' + text(item.image) + '" alt="' + text(item.title) + '"><div class="poster-shade"><span class="play-icon">▶</span></div><span class="card-region">' + text(item.region) + '</span></div>' +
          '<div class="card-body"><h3>' + text(item.title) + '</h3><p>' + text(item.oneLine) + '</p><div class="card-meta"><span>' + text(item.type) + '</span><span>' + text(item.year) + '</span></div></div>' +
          '</a>';
      }).join('');
      if (empty) {
        empty.style.display = matched.length ? 'none' : 'block';
      }
    }
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    }
    [qInput, regionInput, yearInput, typeInput].forEach(function (el) {
      if (el) {
        el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', render);
      }
    });
    render();
  }

  function initPlayer() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var cover = shell.querySelector('[data-play-cover]');
      var message = shell.querySelector('[data-player-message]');
      var src = shell.getAttribute('data-stream');
      var bound = false;
      function setMessage(value) {
        if (message) {
          message.textContent = value || '';
        }
      }
      function bind() {
        if (bound || !video || !src) {
          return;
        }
        bound = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setMessage('播放加载异常，请刷新后重试');
            }
          });
        } else {
          video.src = src;
        }
      }
      function play() {
        bind();
        if (!video) {
          return;
        }
        shell.classList.add('is-playing');
        setMessage('');
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {
            shell.classList.remove('is-playing');
            setMessage('点击播放按钮开始播放');
          });
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      if (cover) {
        cover.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            shell.classList.remove('is-playing');
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
    initPlayer();
  });
})();
