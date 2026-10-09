/* ===================================================================
   KRISH — Portfolio  |  JavaScript
   =================================================================== */

(function () {
  'use strict';

  /* =========================
     UTILITIES
  ========================= */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* =========================
     LOADER
  ========================= */
  const loader = $('#loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      initRevealAnimations();
      animateHeroEntrance();
    }, 1200);
  });

  /* =========================
     CUSTOM CURSOR
  /* =========================
     CUSTOM CURSOR & SPARKLE TRAILS
  ========================= */
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let lastSparkleTime = 0;

  const sparkleColors = ['#00f0ff', '#b14eff', '#00ff88', '#ff6b9d'];

  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-particle';
    const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
    sparkle.style.backgroundColor = color;
    sparkle.style.boxShadow = `0 0 8px ${color}`;
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 25 + 10;
    sparkle.style.setProperty('--vx', Math.cos(angle) * speed + 'px');
    sparkle.style.setProperty('--vy', Math.sin(angle) * speed + 'px');
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 700);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';

    const now = performance.now();
    if (now - lastSparkleTime > 35) {
      createSparkle(mouseX, mouseY);
      lastSparkleTime = now;
    }
  });

  // Click Shockwave Ripple
  document.addEventListener('click', (e) => {
    const shock = document.createElement('div');
    shock.className = 'click-shockwave';
    shock.style.left = e.clientX + 'px';
    shock.style.top = e.clientY + 'px';
    document.body.appendChild(shock);
    setTimeout(() => shock.remove(), 700);
  });

  function animateCursor() {
    ringX = lerp(ringX, mouseX, 0.15);
    ringY = lerp(ringY, mouseY, 0.15);
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effect on interactive elements
  const hoverTargets = 'a, button, .project-card, .skill-card, .stat-card, .filter-btn, .social-link';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
  });

  /* =========================
     PARTICLE BACKGROUND (INTERACTIVE WITH MOUSE)
  ========================= */
  const canvas = $('#particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 85;
  const CONNECTION_DIST = 140;
  const MOUSE_RADIUS = 120;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.size = Math.random() * 2 + 0.8;
      this.opacity = Math.random() * 0.45 + 0.15;
      this.color = Math.random() > 0.4 ? 'rgba(0, 240, 255,' : 'rgba(177, 78, 255,';
    }
    update() {
      // Mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const pushX = (dx / dist) * force * 3;
        const pushY = (dy / dist) * force * 3;
        this.x += pushX;
        this.y += pushY;
      }

      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color} ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      // Connect to mouse if close
      const mdx = particles[i].x - mouseX;
      const mdy = particles[i].y - mouseY;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < MOUSE_RADIUS) {
        const mOpacity = (1 - mDist / MOUSE_RADIUS) * 0.25;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(0, 240, 255, ${mOpacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Connect to other particles
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    drawConnections();
    requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();

  /* =========================
     NAVIGATION
  ========================= */
  const nav = $('#nav');
  const navLinks = $$('.nav__link');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  const mobileLinks = $$('.mobile-menu__link');
  const sections = $$('section[id]');

  // Scroll styling
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;

    // Scroll progress bar
    const scrollBar = $('#scrollProgressBar');
    if (scrollBar) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      scrollBar.style.width = pct + '%';
    }

    // Active link highlighting
    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 200;
      if (scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  });

  // Hamburger
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* =========================
     TYPED TEXT EFFECT
  ========================= */
  const typedEl = $('#typedText');
  const phrases = [
    'ECE Student',
    'Modern C++ Engineer',
    'Low-Latency & HFT Enthusiast',
    'Embedded Systems Developer',
    'Hardware / FPGA Architect'
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function typeEffect() {
    const current = phrases[phraseIdx];
    if (isDeleting) {
      charIdx--;
      typedEl.textContent = current.substring(0, charIdx);
    } else {
      charIdx++;
      typedEl.textContent = current.substring(0, charIdx);
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIdx === current.length) {
      speed = 2000; // pause at end
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      speed = 500;
    }

    setTimeout(typeEffect, speed);
  }
  setTimeout(typeEffect, 1600);

  /* =========================
     HERO ENTRANCE
  ========================= */
  function animateHeroEntrance() {
    const reveals = $$('.hero .reveal-text');
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 200);
    });
  }

  /* =========================
     SCROLL REVEAL
  ========================= */
  function initRevealAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Animate stat numbers
            if (entry.target.classList.contains('stat-card')) {
              animateStatNumber(entry.target);
            }
            // Animate skill bars
            if (entry.target.classList.contains('skill-card')) {
              const fill = entry.target.querySelector('.skill-card__fill');
              if (fill) {
                setTimeout(() => {
                  fill.style.width = fill.dataset.width + '%';
                  fill.classList.add('animated');
                }, 300);
              }
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    $$('.reveal-up').forEach((el) => observer.observe(el));
  }

  /* =========================
     STAT COUNTER ANIMATION
  ========================= */
  function animateStatNumber(card) {
    const numEl = card.querySelector('.stat-card__number');
    const target = parseInt(numEl.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      numEl.textContent = Math.floor(target * eased);
      if (progress < 1) requestAnimationFrame(update);
      else numEl.textContent = target;
    }
    requestAnimationFrame(update);
  }

  /* =========================
     PROJECT FILTER
  ========================= */
  const filterBtns = $$('.filter-btn');
  const projectCards = $$('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      projectCards.forEach((card) => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden-card');
          card.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });

  /* =========================
     CARD SPOTLIGHT & 3D TILT EFFECT
  ========================= */
  $$('.glass-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* =========================
     MAGNETIC BUTTONS & LINKS
  ========================= */
  $$('.btn, .social-link').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  /* =========================
     LIVE TELEMETRY TICKER
  ========================= */
  const latencyTicker = $('#latencyTicker');
  if (latencyTicker) {
    setInterval(() => {
      const jitter = (Math.random() * 38 + 82).toFixed(1);
      latencyTicker.textContent = `< ${jitter} ns`;
    }, 2400);
  }

  /* =========================
     CONTACT FORM
  ========================= */
  const form = $('#contactForm');
  const successMsg = $('#contactSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulate submission
    const btn = $('#contactSubmit');
    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      successMsg.classList.add('show');
      // Reset after delay
      setTimeout(() => {
        form.style.display = '';
        successMsg.classList.remove('show');
        btn.innerHTML = `<span>Send Message</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
        btn.disabled = false;
        form.reset();
      }, 3000);
    }, 1500);
  });

  /* =========================
     SMOOTH SCROLL FOR ALL ANCHOR LINKS
  ========================= */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* =========================
     FOOTER YEAR
  ========================= */
  const yearEl = $('#footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================
     FADE-IN-UP KEYFRAME (injected for filter animation)
  ========================= */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

})();
