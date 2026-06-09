(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
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

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));

        function passSelects(card) {
            return selects.every(function (select) {
                var key = select.getAttribute("data-filter-select");
                var value = normalize(select.value);
                if (!value) {
                    return true;
                }
                return normalize(card.getAttribute("data-" + key)).indexOf(value) !== -1;
            });
        }

        function filter() {
            var query = normalize(input ? input.value : "");
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var visible = (!query || text.indexOf(query) !== -1) && passSelects(card);
                card.classList.toggle("is-hidden", !visible);
            });
        }

        if (input) {
            input.addEventListener("input", filter);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", filter);
        });
        filter();
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card" data-card>',
            '<a class="poster" href="./' + item.file + '">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" class="poster-img" loading="lazy" onerror="this.classList.add(\'image-empty\')">',
            '<span class="type-pill">' + escapeHtml(item.type) + '</span>',
            '<span class="play-cue">▶</span>',
            '</a>',
            '<div class="card-body">',
            '<h2><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h2>',
            '<p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + '</p>',
            '<p class="card-desc">' + escapeHtml(item.one_line) + '</p>',
            '<a class="card-category" href="./' + item.category_file + '">' + escapeHtml(item.category_name) + '</a>',
            '</div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var data = window.SITE_SEARCH_DATA || [];
        if (!form || !input || !results || !data.length) {
            return;
        }

        function run(query) {
            var q = normalize(query);
            var matched = data.filter(function (item) {
                var text = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    item.tags,
                    item.one_line,
                    item.category_name
                ].join(" "));
                return !q || text.indexOf(q) !== -1;
            }).slice(0, 120);
            if (!matched.length) {
                results.innerHTML = '<div class="page-hero compact"><h1>没有找到匹配影片</h1><p>可以尝试输入片名、年份、地区或题材关键词。</p></div>';
                return;
            }
            results.innerHTML = '<div class="movie-grid">' + matched.map(cardTemplate).join("") + '</div>';
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            url.searchParams.set("q", input.value.trim());
            window.history.replaceState({}, "", url.toString());
            run(input.value);
        });

        input.addEventListener("input", function () {
            run(input.value);
        });

        var initial = new URL(window.location.href).searchParams.get("q") || "";
        input.value = initial;
        if (initial) {
            run(initial);
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
