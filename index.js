/* ═══════════════════════════════════════════════════
   HeoPlay — Cinematic App JS
   Offline · GPU-accelerated · 60fps
═══════════════════════════════════════════════════ */

'use strict';

// ── Song data ──────────────────────────────────────
const songs = [
  { title: "Every Breath You Take", file: "every_breath_you_take" },
  { title: "What Was Once", file: "what_was_once" },
  { title: "Made In Japan", file: "made_in_japan" },
  { title: "I Think They Call This Love", file: "i_think_they_call_this_love" }
];

// ── DOM refs ───────────────────────────────────────
const introScreen  = document.getElementById('intro-screen');
const introLogo    = document.getElementById('intro-logo');
const introTagline = document.getElementById('intro-tagline');
const app          = document.getElementById('app');
const albumGrid    = document.getElementById('album-grid');

// ── Canvas intro ───────────────────────────────────
const canvas = document.getElementById('intro-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animFrame;

// ── Resize canvas ──────────────────────────────────
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// ── Particle generator ─────────────────────────────
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

// ── Initialize particles ───────────────────────────
function initParticles(n = 90) {
  particles = Array.from({ length: n }, spawnParticle);
}

// ── Draw particles ─────────────────────────────────
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    if (p.life > p.max) {
      particles[i] = spawnParticle();
    }

    const alpha = Math.sin((p.life / p.max) * Math.PI) * 0.55;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(229, 9, 20, ${alpha})`;
    ctx.fill();
  });

  animFrame = requestAnimationFrame(drawParticles);
}

// ── Intro sequence ─────────────────────────────────
function runIntro() {

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  initParticles();
  drawParticles();

  // Animate logo
  setTimeout(() => {
    introLogo.classList.add('animate');
  }, 300);

  // Animate tagline
  setTimeout(() => {
    introTagline.classList.add('animate');
  }, 800);

  // Add progress bar
  const bar = document.createElement('div');
  bar.className = 'intro-progress';
  introScreen.appendChild(bar);

  // Move to app
  setTimeout(transitionToApp, 3400);
}

// ── Transition to app ──────────────────────────────
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

// ── Build album cards ──────────────────────────────
function buildGrid() {

  albumGrid.innerHTML = '';

  songs.forEach((song, idx) => {

    const card = document.createElement('div');

    card.className = 'album-card';

    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.setAttribute(
      'aria-label',
      `Play ${song.title}`
    );

    card.innerHTML = `
      <img
        class="card-img"
        src="${song.file}.jpg"
        alt="${song.title}"
        loading="lazy"
        onerror="this.style.display='none'"
      >

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
        <svg
          width="16"
          height="18"
          viewBox="0 0 16 18"
          fill="none"
        >
          <polygon
            points="0,0 16,9 0,18"
            fill="white"
          />
        </svg>
      </div>
    `;

    // ── Open video directly ────────────────────────
    card.addEventListener('click', () => {
      openVideo(song);
    });

    card.addEventListener('keydown', e => {

      if (e.key === 'Enter' || e.key === ' ') {

        e.preventDefault();

        openVideo(song);
      }
    });

    albumGrid.appendChild(card);
  });
}

// ── Open video in browser player ───────────────────
function openVideo(song) {

  const videoUrl =
    `https://17may26.vercel.app/${song.file}.mp4`;

  window.location.href = videoUrl;
}

// ── Boot ───────────────────────────────────────────
window.addEventListener(
  'DOMContentLoaded',
  runIntro
);
