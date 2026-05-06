/* ═══════════════════════════════════════════════════
   HeoPlay — Cinematic App JS
   Offline · GPU-accelerated · 60fps
═══════════════════════════════════════════════════ */

'use strict';

// ── Song data ──────────────────────────────────────
const songs = [

  {
    title: "Every Breath You Take",
    file: "every_breath_you_take"
  },

  {
    title: "What Was Once",
    file: "what_was_once"
  },

  {
    title: "Made In Japan",
    file: "made_in_japan"
  },

  {
    title: "I Think They Call This Love",
    file: "i_think_they_call_this_love"
  },

  {
    title: "Rainbow Pen",
    file: "rainbow_pen"
  },

  {
    title: "No.1 Party Anthem",
    file: "no_1_party_anthem"
  }

];

// ── DOM refs ───────────────────────────────────────
const introScreen    = document.getElementById('intro-screen');
const introLogo      = document.getElementById('intro-logo');
const introTagline   = document.getElementById('intro-tagline');
const app            = document.getElementById('app');
const albumGrid      = document.getElementById('album-grid');
const videoOverlay   = document.getElementById('video-overlay');
const mainVideo      = document.getElementById('main-video');
const videoUi        = document.getElementById('video-ui');
const closeBtn       = document.getElementById('close-btn');
const playPauseBtn   = document.getElementById('play-pause-btn');
const playIcon       = document.getElementById('play-icon');
const pauseIcon      = document.getElementById('pause-icon');
const progressFill   = document.getElementById('progress-fill');
const progressThumb  = document.getElementById('progress-thumb');
const progressBg     = document.querySelector('.progress-bar-bg');
const currentTimeEl  = document.getElementById('current-time');
const totalTimeEl    = document.getElementById('total-time');
const videoTitleEl   = document.getElementById('video-title');
const videoTitleWrap = document.getElementById('video-title-wrap');
const fullscreenBtn  = document.getElementById('fullscreen-btn');

// ── Canvas intro ───────────────────────────────────
const canvas  = document.getElementById('intro-canvas');
const ctx     = canvas.getContext('2d');

let particles = [];
let animFrame;

function resizeCanvas() {

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

}

function spawnParticle() {

  return {

    x: Math.random() * canvas.width,

    y: Math.random() * canvas.height,

    r: Math.random() * 1.4 + 0.3,

    vx: (Math.random() - 0.5) * 0.4,

    vy: -Math.random() * 0.6 - 0.2,

    life: 0,

    max: Math.random() * 120 + 80

  };

}

function initParticles(n = 90) {

  particles =
  Array.from({ length: n }, spawnParticle);

}

function drawParticles() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  particles.forEach((p, i) => {

    p.x += p.vx;
    p.y += p.vy;

    p.life++;

    if (p.life > p.max) {
      particles[i] = spawnParticle();
    }

    const alpha =
    Math.sin((p.life / p.max) * Math.PI) * 0.55;

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      p.r,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
    `rgba(229, 9, 20, ${alpha})`;

    ctx.fill();

  });

  animFrame =
  requestAnimationFrame(drawParticles);

}

// ── Intro sequence ─────────────────────────────────
function runIntro() {

  resizeCanvas();

  window.addEventListener(
    'resize',
    resizeCanvas
  );

  initParticles();

  drawParticles();

  // Animate logo & tagline

  setTimeout(() => {
    introLogo.classList.add('animate');
  }, 300);

  setTimeout(() => {
    introTagline.classList.add('animate');
  }, 800);

  // Add progress bar

  const bar =
  document.createElement('div');

  bar.className = 'intro-progress';

  introScreen.appendChild(bar);

  // Transition to app

  setTimeout(
    transitionToApp,
    3400
  );

}

function transitionToApp() {

  cancelAnimationFrame(animFrame);

  introScreen.classList.add('fade-out');

  setTimeout(() => {

    introScreen.classList.add('hidden');

    app.classList.remove('hidden');

    buildGrid();

    requestAnimationFrame(() => {
      app.classList.add('visible');
    });

  }, 900);

}

// ── Build album grid ───────────────────────────────
function buildGrid() {

  albumGrid.innerHTML = '';

  songs.forEach((song, idx) => {

    const card =
    document.createElement('div');

    card.className = 'album-card';

    card.setAttribute('role', 'button');

    card.setAttribute('tabindex', '0');

    card.setAttribute(
      'aria-label',
      `Play ${song.title}`
    );

    card.innerHTML = `

      <img class="card-img"
           src="${song.file}.jpg"
           alt="${song.title}"
           loading="lazy"
           onerror="this.style.display='none'">

      <div class="card-overlay"></div>

      <div class="card-accent"></div>

      <div class="card-content">

        <div class="card-number">
          0${idx + 1}
        </div>

        <div class="card-title">
          ${song.title}
        </div>

      </div>

      <div class="card-play">

        <svg width="16"
             height="18"
             viewBox="0 0 16 18"
             fill="none">

          <polygon points="0,0 16,9 0,18"
          fill="white"/>

        </svg>

      </div>

    `;

    card.addEventListener(
      'click',
      () => openVideo(song)
    );

    card.addEventListener('keydown', e => {

      if (
        e.key === 'Enter' ||
        e.key === ' '
      ) {
        openVideo(song);
      }

    });

    albumGrid.appendChild(card);

  });

}

// ── Video player ───────────────────────────────────
let hideControlsTimer = null;
let isVideoOpen = false;

function openVideo(song) {

  videoTitleEl.textContent = song.title;

  mainVideo.src =
  song.file + '.mp4';

  mainVideo.load();

  videoOverlay.classList.remove(
    'hidden',
    'closing'
  );

  videoOverlay.classList.add('visible');

  isVideoOpen = true;

  setTimeout(() => {

    videoTitleWrap.classList.add('visible');

  }, 400);

  mainVideo.play().catch(() => {

    setPlayState(false);

  });

  setPlayState(true);

  resetControls();

  scheduleHideControls();

  if (
    screen.orientation &&
    screen.orientation.lock
  ) {

    screen.orientation
    .lock('landscape')
    .catch(() => {});

  }

  document.body.style.overflow = 'hidden';

}

function closeVideo() {

  if (!isVideoOpen) return;

  isVideoOpen = false;

  clearTimeout(hideControlsTimer);

  videoTitleWrap.classList.remove('visible');

  videoOverlay.classList.remove('visible');

  videoOverlay.classList.add('closing');

  setTimeout(() => {

    videoOverlay.classList.add('hidden');

    videoOverlay.classList.remove('closing');

    mainVideo.pause();

    mainVideo.src = '';

    videoUi.classList.remove('hide-controls');

  }, 420);

  if (
    screen.orientation &&
    screen.orientation.unlock
  ) {

    screen.orientation.unlock();

  }

  document.body.style.overflow = '';

}

// ── Playback controls ──────────────────────────────
function setPlayState(playing) {

  playIcon.style.display =
  playing ? 'none' : 'block';

  pauseIcon.style.display =
  playing ? 'block' : 'none';

}

playPauseBtn.addEventListener('click', () => {

  if (mainVideo.paused) {

    mainVideo.play();

    setPlayState(true);

  } else {

    mainVideo.pause();

    setPlayState(false);

  }

  resetControls();

  scheduleHideControls();

});

mainVideo.addEventListener('ended', () => {

  setPlayState(false);

  progressFill.style.width = '100%';

  progressThumb.style.left = '100%';

  videoUi.classList.remove('hide-controls');

});

mainVideo.addEventListener('timeupdate', () => {

  if (!mainVideo.duration) return;

  const pct =
  (mainVideo.currentTime / mainVideo.duration) * 100;

  progressFill.style.width = pct + '%';

  progressThumb.style.left = pct + '%';

  currentTimeEl.textContent =
  formatTime(mainVideo.currentTime);

});

mainVideo.addEventListener('loadedmetadata', () => {

  totalTimeEl.textContent =
  formatTime(mainVideo.duration);

});

// ── Progress seek ──────────────────────────────────
progressBg.addEventListener('click', e => {

  if (!mainVideo.duration) return;

  const rect =
  progressBg.getBoundingClientRect();

  const pct =
  Math.max(
    0,
    Math.min(
      1,
      (e.clientX - rect.left) / rect.width
    )
  );

  mainVideo.currentTime =
  pct * mainVideo.duration;

  resetControls();

  scheduleHideControls();

});

// ── Fullscreen ─────────────────────────────────────
fullscreenBtn.addEventListener('click', () => {

  const el = videoOverlay;

  if (!document.fullscreenElement) {

    (
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen
    ).call(el);

  } else {

    (
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen
    ).call(document);

  }

});

// ── Close ──────────────────────────────────────────
closeBtn.addEventListener(
  'click',
  closeVideo
);

// ── Toggle controls ────────────────────────────────
videoOverlay.addEventListener('click', e => {

  if (
    e.target.closest('.video-controls') ||
    e.target.closest('.close-btn')
  ) return;

  if (
    videoUi.classList.contains('hide-controls')
  ) {

    videoUi.classList.remove('hide-controls');

    scheduleHideControls();

  } else {

    clearTimeout(hideControlsTimer);

    videoUi.classList.add('hide-controls');

  }

});

function resetControls() {

  videoUi.classList.remove('hide-controls');

}

function scheduleHideControls() {

  clearTimeout(hideControlsTimer);

  hideControlsTimer = setTimeout(() => {

    if (!mainVideo.paused) {

      videoUi.classList.add('hide-controls');

    }

  }, 3500);

}

// ── Keyboard shortcuts ─────────────────────────────
document.addEventListener('keydown', e => {

  if (!isVideoOpen) return;

  if (e.key === 'Escape') {
    closeVideo();
  }

  if (e.key === ' ') {

    e.preventDefault();

    playPauseBtn.click();

  }

  if (e.key === 'ArrowRight') {

    mainVideo.currentTime += 10;

    resetControls();

    scheduleHideControls();

  }

  if (e.key === 'ArrowLeft') {

    mainVideo.currentTime -= 10;

    resetControls();

    scheduleHideControls();

  }

  if (e.key === 'f') {

    fullscreenBtn.click();

  }

});

// ── Helpers ────────────────────────────────────────
function formatTime(s) {

  if (isNaN(s)) return '0:00';

  const m =
  Math.floor(s / 60);

  const sec =
  Math.floor(s % 60)
  .toString()
  .padStart(2, '0');

  return `${m}:${sec}`;

}

// ── Boot ───────────────────────────────────────────
window.addEventListener(
  'DOMContentLoaded',
  runIntro
);
