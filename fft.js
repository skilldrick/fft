(function () {
  var ctx = new (window.AudioContext || window.webkitAudioContext)();
  var width = 1000;
  var fftHeight = 250;
  var height = fftHeight + 20;
  var canvas = document.getElementById("canvas")
  var canvasCtx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  function setupAnalyser() {
    var analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    return analyser;
  }

  function draw(analyser) {
    requestAnimationFrame(function () {
      draw(analyser);
    });

    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = '#ddd';
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = 'black';

    canvasCtx.beginPath();

    var min = Math.log(1);
    var max = Math.log(bufferLength - 1);
    var scale = (max - min) / width;

    for (var i = 1; i < bufferLength; i++) {
      var y = fftHeight - dataArray[i] * fftHeight / 256;
      var x = (Math.log(i) - min) / scale;
      canvasCtx.lineTo(x, y);
    }

    canvasCtx.stroke();

    //TODO: draw scale
  }

  function analyseSine() {
    var gain = ctx.createGain();
    gain.gain.value = 0.1;
    var analyser = setupAnalyser();
    var osc = ctx.createOscillator();
    osc.frequency.value = (ctx.sampleRate / analyser.fftSize) * 8; // 8th bin
    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    osc.start();
    draw(analyser);
  }

  function analyseAudio() {
    getAudioSource(ctx, "cissy-strut-start.mp3", function (source) {
      var analyser = setupAnalyser();
      source.connect(analyser);
      analyser.connect(ctx.destination);
      source.start();
      draw(analyser);
    });
  }

  analyseAudio();
})();
