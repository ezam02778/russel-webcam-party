const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const btnSwitch = document.getElementById('btnSwitch');
const btnEffect = document.getElementById('btnEffect');
const btnSnap   = document.getElementById('btnSnap');
const btnFace   = document.getElementById('btnFace');
const btnRecord = document.getElementById('btnRecord');

let usingFront = false;
let effectOn = true;
let faceOverlayOn = false;
let stream = null;

// recorder vars
let mediaRecorder;
let recordedChunks = [];
let recording = false;

// ukuran canvas
function fitCanvas(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * devicePixelRatio);
  canvas.height = Math.floor(rect.height * devicePixelRatio);
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

// start kamera
async function startCamera(){
  if (stream){
    stream.getTracks().forEach(t=>t.stop());
  }
  const constraints = {
    video:{
      facingMode: usingFront ? 'user' : { ideal: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };
  try{
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    await video.play();
    requestAnimationFrame(drawLoop);
  }catch(err){
    alert('Gagal akses kamera: ' + err.message);
    console.error(err);
  }
}

// efek glitch simple
function drawEffect(){
  const w = canvas.width, h = canvas.height;
  try {
    const img = ctx.getImageData(0,0,w,h);
    const d = img.data;
    const shift = 8;
    for (let y=0;y<h;y+=2){
      const offset = (Math.sin((Date.now()/200)+y/30) * 6)|0;
      for (let x=0;x<w;x++){
        const i = (y*w + x)*4;
        const iR = (y*w + Math.min(w-1, x+offset+shift))*4;
        const iB = (y*w + Math.min(w-1, x-offset-shift))*4;
        d[i+0] = d[iR+0];
        d[i+2] = d[iB+2];
      }
    }
    ctx.putImageData(img, 0, 0);
  } catch(e) {
    console.warn('Effect skipped:', e);
  }
}

// loop render
function drawLoop(){
  fitCanvas();
  const w = canvas.width, h = canvas.height;
  ctx.drawImage(video, 0, 0, w, h);

  if(effectOn) drawEffect();
  requestAnimationFrame(drawLoop);
}

// snapshot
btnSnap.addEventListener('click', ()=>{
  const data = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = data;
  a.download = `snap-${Date.now()}.png`;
  a.click();
});

// switch camera
btnSwitch.addEventListener('click', async ()=>{
  usingFront = !usingFront;
  await startCamera();
});

// toggle effect
btnEffect.addEventListener('click', ()=>{
  effectOn = !effectOn;
  btnEffect.textContent = effectOn ? '✨ Toggle Effect' : '⚪ Effect Off';
});

// record video
btnRecord.addEventListener('click', ()=>{
  if(!recording){
    recordedChunks = [];
    const canvasStream = canvas.captureStream(30);
    mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorder.ondataavailable = e=>{
      if(e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = ()=>{
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `record-${Date.now()}.webm`;
      a.click();
    };
    mediaRecorder.start();
    btnRecord.textContent = '⏹️ Stop Record';
    recording = true;
  } else {
    mediaRecorder.stop();
    btnRecord.textContent = '⏺️ Start Record';
    recording = false;
  }
});

// start
startCamera();