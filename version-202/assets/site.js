(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player]');
    if (!video) {
      return;
    }
    var button = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-player-status]');
    var source = video.getAttribute('data-source');
    var hlsInstance = null;
    var initialized = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function hideOverlay() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('点击视频控件继续播放');
        });
      }
    }

    function init() {
      if (!source) {
        setStatus('播放源暂不可用');
        return;
      }
      hideOverlay();
      setStatus('正在连接播放源');
      if (initialized) {
        playVideo();
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
          playVideo();
        }, { once: true });
        video.load();
        return;
      }
      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus('');
            playVideo();
          });
          hlsInstance.on(Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放连接异常，请稍后重试');
            }
          });
        } else {
          video.src = source;
          video.load();
          setStatus('');
          playVideo();
        }
      }).catch(function () {
        video.src = source;
        video.load();
        setStatus('');
        playVideo();
      });
    }

    if (button) {
      button.addEventListener('click', init);
    }
    video.addEventListener('play', hideOverlay);
    video.addEventListener('click', function () {
      if (!initialized) {
        init();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  setupPlayer();

  function movieCard(item) {
    var title = escapeHtml(item.title);
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card small-card">' +
      '<a class="poster-link" href="' + item.url + '" aria-label="' + title + '">' +
      '<img src="' + item.image + '" alt="' + title + '" loading="lazy">' +
      '<span class="play-badge">播放</span></a>' +
      '<div class="card-body"><a class="card-title" href="' + item.url + '">' + title + '</a>' +
      '<p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</p>' +
      '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div></div></article>';
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupSearch() {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var meta = document.getElementById('searchMeta');
    var typeFilter = document.getElementById('typeFilter');
    var regionFilter = document.getElementById('regionFilter');
    if (!input || !results || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var query = input.value.trim().toLowerCase();
      var type = typeFilter ? typeFilter.value : '';
      var region = regionFilter ? regionFilter.value : '';
      var list = window.MOVIE_INDEX.filter(function (item) {
        var hay = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(' '), item.oneLine].join(' ').toLowerCase();
        var okQuery = !query || hay.indexOf(query) !== -1;
        var okType = !type || hay.indexOf(type.toLowerCase()) !== -1;
        var okRegion = !region || hay.indexOf(region.toLowerCase()) !== -1;
        return okQuery && okType && okRegion;
      }).slice(0, 120);
      results.innerHTML = list.map(movieCard).join('');
      if (meta) {
        meta.textContent = list.length ? '已显示相关影片' : '没有找到匹配内容';
      }
    }

    input.addEventListener('input', render);
    if (typeFilter) {
      typeFilter.addEventListener('change', render);
    }
    if (regionFilter) {
      regionFilter.addEventListener('change', render);
    }
    render();
  }

  setupSearch();
})();
