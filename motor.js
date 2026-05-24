/* ============================================================
   AVENNA — motor.js
   Interatividade e animações do site
   ============================================================ */

(function () {
  'use strict';

  // ── Navbar: adiciona classe ao rolar ──
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ── Mobile menu ──
  const navToggle   = document.getElementById('navToggle');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    mobileOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });

  mobileClose.addEventListener('click', closeMobileMenu);
  mobileOverlay.addEventListener('click', closeMobileMenu);

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // ── Brand strip: duplica para loop infinito ──
  const stripTrack = document.getElementById('brandStripTrack');
  if (stripTrack) {
    const original = stripTrack.querySelector('.brand-strip-inner');
    if (original) {
      const clone = original.cloneNode(true);
      stripTrack.appendChild(clone);
    }
  }

  // ── Reveal on scroll (Intersection Observer) ──
  const revealEls = document.querySelectorAll('.reveal');

  // Stagger por grupo de filhos em grids
  function applyStagger(parentSelector) {
    document.querySelectorAll(parentSelector).forEach(parent => {
      const children = parent.querySelectorAll('.reveal');
      children.forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.11}s`;
      });
    });
  }

  applyStagger('.tech-grid');
  applyStagger('.diff-grid');
  applyStagger('.about-cards');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  // ── Parallax suave nas orbs do hero com o mouse ──
  const heroOrbs = document.querySelectorAll('#hero .orb');

  if (heroOrbs.length && window.matchMedia('(hover: hover)').matches) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      targetX = (e.clientX - cx) / cx;
      targetY = (e.clientY - cy) / cy;
    }, { passive: true });

    function animateOrbs() {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      heroOrbs.forEach((orb, i) => {
        const factor = (i + 1) * 14;
        orb.style.transform = `translate(${currentX * factor}px, ${currentY * factor}px)`;
      });

      requestAnimationFrame(animateOrbs);
    }

    animateOrbs();
  }

  // ── Link ativo na nav conforme seção visível ──
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active', active);
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => sectionObserver.observe(s));

  // ── Smooth scroll para âncoras ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Máscara de telefone ──
  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);

      if (v.length > 6) {
        v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        v = `(${v}`;
      }

      e.target.value = v;
    });
  }

  // ── Validação e envio do formulário ──
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn   = document.getElementById('submitBtn');

  function validateField(input) {
    const errorEl = document.getElementById(`${input.id}-error`);
    let msg = '';

    if (input.required && !input.value.trim()) {
      msg = 'Este campo é obrigatório.';
    } else if (input.type === 'email' && input.value.trim()) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(input.value.trim())) msg = 'Digite um e-mail válido.';
    } else if (input.id === 'telefone' && input.value.trim()) {
      const digits = input.value.replace(/\D/g, '');
      if (digits.length < 10) msg = 'Digite um telefone válido.';
    }

    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.toggle('visible', !!msg);
    }

    input.classList.toggle('error', !!msg);
    return !msg;
  }

  if (form) {
    const requiredFields = form.querySelectorAll('input[required], select[required]');

    requiredFields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let valid = true;
      requiredFields.forEach(field => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) return;

      const btnText = submitBtn.querySelector('.btn-text');
      const originalText = btnText.textContent;

      submitBtn.disabled = true;
      btnText.textContent = 'Enviando…';

      try {
        // Substitua pela sua URL de endpoint real
        // await fetch('/api/contato', { method: 'POST', body: new FormData(form) });

        // Simulação de envio
        await new Promise(resolve => setTimeout(resolve, 1400));

        form.classList.add('hidden');
        formSuccess.classList.remove('hidden');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        btnText.textContent = 'Erro ao enviar. Tente novamente.';
        setTimeout(() => { btnText.textContent = originalText; }, 3000);
      } finally {
        submitBtn.disabled = false;
        if (!form.classList.contains('hidden')) {
          btnText.textContent = originalText;
        }
      }
    });
  }

  // ── Cursorline sutil nas tech-cards (efeito spotlight) ──
  document.querySelectorAll('.tech-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const glow = card.querySelector('.tech-card-glow');
      if (!glow) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = `${x - 110}px`;
      glow.style.top  = `${y - 110}px`;
    });
  });

  // ── Cursor: pingo dourado + aura de purpurina ──
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    let cx = -300, cy = -300;
    let onScreen = false;
    let alive = 0;
    const MAX_PARTICLES = 80;

    // Raio da aura = 1/6 da menor dimensão da tela
    let RADIUS = Math.min(window.innerWidth, window.innerHeight) / 6;
    window.addEventListener('resize', () => {
      RADIUS = Math.min(window.innerWidth, window.innerHeight) / 6;
    }, { passive: true });

    // Paleta purpurina: dourado + branco brilhante + champagne
    const COLORS = [
      '#ffffff', '#fffaed', '#fff3c4', '#ffd580',
      '#f5e8c4', '#e2c89a', '#c9a96e', '#f0ddb0', '#ffe0a0'
    ];

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      onScreen = false;
      cursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      onScreen = true;
      cursorDot.style.opacity = '1';
    });

    function spawnGlitter() {
      if (alive >= MAX_PARTICLES) return;
      alive++;

      const p = document.createElement('div');
      p.className = 'cursor-particle';

      // Posição aleatória dentro do círculo de raio RADIUS (distribuição uniforme)
      const a  = Math.random() * Math.PI * 2;
      const r  = Math.sqrt(Math.random()) * RADIUS;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;

      // Forma: mistura de quadradinhos e fragmentos finos (purpurina real)
      const isThin  = Math.random() > 0.45;
      const size    = 1.2 + Math.random() * 2.6;
      const w       = isThin ? size * 0.55 : size;
      const h       = isThin ? size * 2.2  : size;
      const rot     = Math.random() * 360;
      const color   = COLORS[Math.floor(Math.random() * COLORS.length)];
      const alpha   = 0.55 + Math.random() * 0.45;
      const radius  = isThin ? '1px' : '0.5px';
      const dur     = 350 + Math.random() * 550;
      const glow    = size * 2;

      p.style.cssText = [
        `left:${px}px`, `top:${py}px`,
        `width:${w}px`, `height:${h}px`,
        `background:${color}`,
        `border-radius:${radius}`,
        `box-shadow:0 0 ${glow}px ${size * 0.5}px rgba(255,215,100,${(alpha * 0.9).toFixed(2)})`,
        `transform:translate(-50%,-50%) rotate(${rot}deg)`
      ].join(';');
      document.body.appendChild(p);

      // Flash: aparece, brilha no pico, some — sem se mover (purpurina estática)
      const peak = 0.28 + Math.random() * 0.2;
      p.animate([
        { opacity: 0,     transform: `translate(-50%,-50%) rotate(${rot}deg)      scale(0.2)` },
        { opacity: alpha, transform: `translate(-50%,-50%) rotate(${rot + 15}deg) scale(1)`,   offset: peak },
        { opacity: 0,     transform: `translate(-50%,-50%) rotate(${rot + 30}deg) scale(0.3)` }
      ], {
        duration: dur,
        easing: 'ease-in-out',
        fill: 'forwards'
      }).onfinish = () => { p.remove(); alive--; };
    }

    // Loop de animação: move o dot + spawna purpurina continuamente
    let frame = 0;
    function animateCursor() {
      cursorDot.style.left = `${cx}px`;
      cursorDot.style.top  = `${cy}px`;

      if (onScreen) {
        frame++;
        // ~2 partículas por frame a 60fps = ~120/s; lifetime ~0.5s → ~60 vivas
        spawnGlitter();
        if (frame % 2 === 0) spawnGlitter();
      }

      requestAnimationFrame(animateCursor);
    }

    onScreen = true;
    animateCursor();
  }

})();
