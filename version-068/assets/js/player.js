(function () {
  "use strict";

  window.initMoviePlayer = function (videoId, layerId, source) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var hls = null;

    if (!video || !source) {
      return;
    }

    function bindSource() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute("data-ready", "1");
    }

    function start() {
      bindSource();
      video.controls = true;

      if (layer) {
        layer.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
