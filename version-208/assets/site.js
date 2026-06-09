(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var nextButton = slider.querySelector("[data-hero-next]");
        var prevButton = slider.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function sortCards(grid, mode) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        if (mode === "default") {
            cards.sort(function (a, b) {
                return Number(a.getAttribute("data-original-index")) - Number(b.getAttribute("data-original-index"));
            });
        }
        if (mode === "rating") {
            cards.sort(function (a, b) {
                return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
            });
        }
        if (mode === "year") {
            cards.sort(function (a, b) {
                return Number((b.getAttribute("data-year") || "").replace(/\D/g, "")) - Number((a.getAttribute("data-year") || "").replace(/\D/g, ""));
            });
        }
        if (mode === "title") {
            cards.sort(function (a, b) {
                return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
            });
        }
        cards.forEach(function (card) {
            grid.appendChild(card);
        });
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-button]"));
            var sortSelect = panel.querySelector("[data-sort-select]");
            var grid = panel.parentElement.querySelector("[data-movie-grid]");
            var activeFilter = "all";
            if (!grid) {
                return;
            }
            Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]")).forEach(function (card, index) {
                card.setAttribute("data-original-index", index);
            });

            function apply() {
                var query = normalize(input ? input.value : "");
                var filter = normalize(activeFilter);
                var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.textContent
                    ].join(" "));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFilter = filter === "all" || haystack.indexOf(filter) !== -1;
                    card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
                });
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var initialQuery = params.get("q");
                if (initialQuery) {
                    input.value = initialQuery;
                }
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            if (sortSelect) {
                sortSelect.addEventListener("change", function () {
                    sortCards(grid, sortSelect.value);
                    apply();
                });
            }

            apply();
        });
    }

    function setupMoviePlayer(options) {
        if (!options) {
            return;
        }
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var streamUrl = options.streamUrl;
        var hlsInstance = null;
        var loaded = false;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else {
                video.src = streamUrl;
            }
        }

        function startPlayback() {
            attachStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;

    ready(function () {
        setupMenu();
        setupHeroSlider();
        setupFilters();
    });
})();
