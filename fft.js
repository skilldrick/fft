(function () {
  var ctx = new (window.AudioContext || window.webkitAudioContext)();
  var width = 1000;
  var fftHeight = 250;
  var height = fftHeight + 20;
  var fftSize = 2048; // number of samples used to generate each FFT
  var frequencyBins = fftSize / 2; // number of frequency bins in FFT

  var canvasCtx1 = setupCanvas('canvas1');
  var canvasCtx2 = setupCanvas('canvas2');

  function draw(analyser) {
    requestAnimationFrame(function () {
      draw(analyser);
    });

    var dataArray = new Uint8Array(frequencyBins);
    analyser.getByteFrequencyData(dataArray);

    drawLinearFFT(dataArray, canvasCtx1);
    drawLogarithmicFFT(dataArray, canvasCtx2);

    drawLinearScale(canvasCtx1);
    drawLogarithmicScale(canvasCtx2, frequencyBins);
  }

  function drawLinearFFT(dataArray, canvasCtx) {
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.beginPath();

    var sliceLength = width / frequencyBins;

    for (var i = 0; i < frequencyBins; i++) {
      var x = i * sliceLength;
      var y = fftHeight - dataArray[i] * fftHeight / 256;
      canvasCtx.lineTo(x, y);
    }

    canvasCtx.stroke();
  }

  function drawLogarithmicFFT(dataArray, canvasCtx) {
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.beginPath();

    var scale = Math.log(frequencyBins - 1) / width;
    var binWidthFreq = ctx.sampleRate / (frequencyBins * 2);
    var firstBinWidthPixels = Math.log(2) / scale;

    for (var i = 1; i < frequencyBins; i++) {
      var x = Math.log(i) / scale;
      var y = fftHeight - dataArray[i] * fftHeight / 256;
      canvasCtx.lineTo(x, y);
    }

    canvasCtx.stroke();
  }

  function drawLinearScale(canvasCtx) {
    canvasCtx.save();
    canvasCtx.fillStyle = "black";

    for (var x = 0; x < width; x += 100) {
      canvasCtx.beginPath();
      canvasCtx.moveTo(x, fftHeight);
      canvasCtx.lineTo(x, fftHeight + 4);
      canvasCtx.stroke();
      canvasCtx.fillText(Math.floor((ctx.sampleRate / 2) * x / width), x, height);
    }

    canvasCtx.restore();
  }

  function drawLogarithmicScale(canvasCtx) {
    canvasCtx.save();
    canvasCtx.fillStyle = "black";

    var scale = Math.log(frequencyBins - 1) / width;
    var binWidthInHz = ctx.sampleRate / (frequencyBins * 2);
    var firstBinWidthInPx = Math.log(2) / scale;

    for (var x = 0, freq = binWidthInHz; x < width; x += firstBinWidthInPx, freq *= 2) {
      canvasCtx.beginPath();
      canvasCtx.moveTo(x, fftHeight);
      canvasCtx.lineTo(x, fftHeight + 4);
      canvasCtx.stroke();
      canvasCtx.fillText(Math.floor(freq), Math.floor(x), height);
    }

    canvasCtx.restore();
  }

  function setupAnalyser() {
    var analyser = ctx.createAnalyser();
    analyser.fftSize = fftSize;
    return analyser;
  }

  function setupCanvas(id) {
    var canvas = document.getElementById(id)
    var canvasCtx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    canvasCtx.fillStyle = '#ddd';
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = 'black';

    canvasCtx.textBaseline = "bottom";
    canvasCtx.textAlign = "left";
    canvasCtx.font = "16px Courier";

    return canvasCtx;
  }

  function analyseSine() {
    var gain = ctx.createGain();
    gain.gain.value = 0.1;
    var analyser = setupAnalyser();
    var osc = ctx.createOscillator();
    osc.frequency.value = (ctx.sampleRate / fftSize) * 8; // 8th bin
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
