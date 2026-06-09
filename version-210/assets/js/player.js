(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var overlay = document.getElementById('movie-play-button');
        var loaded = false;
        var hlsInstance = null;

        if (!video || !overlay || !source) {
            return;
        }

        function attachSource() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function startPlayback() {
            attachSource();
            overlay.classList.add('is-hidden');
            video.controls = true;

            var playback = video.play();
            if (playback && playback.catch) {
                playback.catch(function () {});
            }
        }

        overlay.addEventListener('click', startPlayback);

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
