(function () {
    function safePlay(video) {
        var request = video.play();
        if (request && typeof request.catch === "function") {
            request.catch(function () {});
        }
    }

    function loadStream(video, src) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.getAttribute("src") !== src) {
                video.setAttribute("src", src);
            }
            safePlay(video);
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsPlayer) {
                video._hlsPlayer = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video._hlsPlayer.loadSource(src);
                video._hlsPlayer.attachMedia(video);
                video._hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    safePlay(video);
                });
            } else {
                safePlay(video);
            }
            return;
        }

        if (video.getAttribute("src") !== src) {
            video.setAttribute("src", src);
        }
        safePlay(video);
    }

    window.MoviePlayer = {
        init: function (options) {
            var video = document.getElementById(options.videoId);
            var button = document.getElementById(options.buttonId);
            var src = options.src;
            if (!video || !src) {
                return;
            }

            function start() {
                if (button) {
                    button.classList.add("is-hidden");
                }
                loadStream(video, src);
            }

            if (button) {
                button.addEventListener("click", start);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });

            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
        }
    };
}());
