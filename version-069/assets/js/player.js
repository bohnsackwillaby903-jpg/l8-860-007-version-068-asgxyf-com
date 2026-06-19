
(function () {
    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        var currentScript = document.currentScript || Array.prototype.slice.call(document.scripts).filter(function (script) {
            return script.src.indexOf("player.js") !== -1;
        }).pop();
        var localUrl = currentScript ? new URL("hls-vendor.js", currentScript.src).href : "./assets/js/hls-vendor.js";
        return import(localUrl).then(function (module) {
            return module.H || module.default || window.Hls;
        }).catch(function () {
            return new Promise(function (resolve, reject) {
                var script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
                script.onload = function () {
                    resolve(window.Hls);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        });
    }

    window.setupMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-video");
        var cover = document.getElementById("player-cover");
        if (!video || !streamUrl) {
            return;
        }

        var started = false;
        var hlsInstance = null;

        function reveal() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        function start() {
            reveal();
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                playVideo();
                return;
            }
            loadHlsLibrary().then(function (Hls) {
                if (Hls && Hls.isSupported && Hls.isSupported()) {
                    hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                            return;
                        }
                        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        }
                    });
                } else {
                    video.src = streamUrl;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    playVideo();
                }
            }).catch(function () {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                playVideo();
            });
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", reveal);
        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };
})();
