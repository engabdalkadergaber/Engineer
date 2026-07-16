(function () {
  "use strict";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Navbar scroll + mobile drawer
  const nav = document.getElementById("navbar");
  const drawer = document.getElementById("mobile-drawer");
  const burger = document.querySelector(".hamburger");
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (burger && drawer) {
    burger.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      drawer.setAttribute("aria-hidden", String(!open));
    });
    drawer.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        drawer.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        drawer.setAttribute("aria-hidden", "true");
      })
    );
  }

  // Particle text hero
  const canvas = document.getElementById("particle-canvas");
  if (canvas) initParticles(canvas);

  function initParticles(canvas) {
    const ctx = canvas.getContext("2d");
    const phrases = ["Structural Excellence", "Site Management", "On Time · On Budget", "Engineering Precision"];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let mouse = { x: -9999, y: -9999, r: 90 };
    let phraseIndex = 0;
    let rafId = null;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles(phrases[phraseIndex]);
    }
    function buildParticles(text) {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      const off = document.createElement("canvas");
      off.width = w; off.height = h;
      const octx = off.getContext("2d");
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      const fontSize = Math.min(Math.max(Math.floor(w / (text.length * 0.7)), 38), 96);
      octx.font = `800 ${fontSize}px "Montserrat", system-ui, sans-serif`;
      octx.fillText(text, w / 2, h / 2 - Math.min(80, h * 0.12));
      const img = octx.getImageData(0, 0, w, h).data;
      const gap = Math.max(4, Math.floor(fontSize / 22));
      const next = [];
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const i = (y * w + x) * 4 + 3;
          if (img[i] > 128) {
            next.push({ x: Math.random() * w, y: Math.random() * h, hx: x, hy: y, vx: 0, vy: 0 });
          }
        }
      }
      if (particles.length && next.length) {
        const reuse = Math.min(particles.length, next.length);
        for (let i = 0; i < reuse; i++) { particles[i].hx = next[i].hx; particles[i].hy = next[i].hy; }
        if (next.length > particles.length) {
          for (let i = particles.length; i < next.length; i++) particles.push(next[i]);
        } else if (next.length < particles.length) {
          particles.length = next.length;
        }
      } else {
        particles = next;
      }
    }
    function step() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "#F2A03D";
      for (const p of particles) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < mouse.r * mouse.r) {
          const d = Math.sqrt(d2) || 1;
          const force = ((mouse.r - d) / mouse.r) * 4;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
        p.vx += (p.hx - p.x) * 0.02;
        p.vy += (p.hy - p.y) * 0.02;
        p.vx *= 0.86; p.vy *= 0.86;
        p.x += p.vx; p.y += p.vy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(step);
    }
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });
    canvas.addEventListener("touchmove", (e) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: true });
    canvas.addEventListener("touchend", () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener("resize", () => { cancelAnimationFrame(rafId); resize(); if (!prefersReducedMotion) step(); });
    resize();
    if (!prefersReducedMotion) {
      step();
      setInterval(() => { phraseIndex = (phraseIndex + 1) % phrases.length; buildParticles(phrases[phraseIndex]); }, 4000);
    } else { step(); cancelAnimationFrame(rafId); }
  }

  // Count-up + bar fill on scroll
  const expObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll(".count").forEach(animateCount);
      entry.target.querySelectorAll(".bar span").forEach((el) => { el.style.width = (el.dataset.width || 0) + "%"; });
      expObserver.unobserve(entry.target);
    });
  }, { threshold: 0.25 });
  document.querySelectorAll(".exp-card[data-animate]").forEach((c) => expObserver.observe(c));

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll(".bar span").forEach((el) => { el.style.width = (el.dataset.width || 0) + "%"; });
      skillObserver.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".skills-grid").forEach((g) => skillObserver.observe(g));

  function animateCount(el) {
    const target = parseFloat(el.dataset.target) || 0;
    if (prefersReducedMotion) { el.textContent = target.toString(); return; }
    const start = performance.now();
    const duration = 1500;
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 4);
      const val = target * e;
      el.textContent = Math.round(val).toString();
      if (t < 1) requestAnimationFrame(frame); else el.textContent = target.toString();
    }
    requestAnimationFrame(frame);
  }

  // Reveal reviews
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), (i % 3) * 100);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".review-card").forEach((r) => revealObs.observe(r));

  // Certificates data + accordion
  const certs = [
    { shortLabel: "Site Manager", fullTitle: "Certified Construction Site Manager", issuer: "Saudi Contractors Authority", year: "2016", image: "./Certificates/1.png" },
    { shortLabel: "NEBOSH IGC", fullTitle: "NEBOSH International General Certificate", issuer: "NEBOSH · Occupational Health & Safety", year: "2018", image: "./Certificates/2.png" },
    { shortLabel: "OSHA 30", fullTitle: "OSHA 30-Hour Construction Safety", issuer: "OSHA", year: "2015", image: "./Certificates/3.png" },
    { shortLabel: "PMP", fullTitle: "Project Management Professional", issuer: "Project Management Institute (PMI)", year: "2020", image: "./Certificates/4.png" },
    { shortLabel: "Primavera P6", fullTitle: "Primavera P6 Certified Professional", issuer: "Oracle Primavera", year: "2017", image: "./Certificates/5.png" },
  ];
  const acc = document.getElementById("certAccordion");
  if (acc) {
    acc.innerHTML = certs.map((c, i) => `
      <div class="cert-panel" role="button" tabindex="0" aria-label="${c.fullTitle}, ${c.issuer}, ${c.year}" data-index="${i}">
        <img src="${c.image}" alt="${c.fullTitle}" />
        <span class="cert-chip">${c.shortLabel}</span>
        <div class="cert-zoom" aria-hidden="true">⤢</div>
        <div class="cert-info">
          <span class="yr">${c.year}</span>
          <h4>${c.fullTitle}</h4>
          <p>${c.issuer}</p>
        </div>
      </div>`).join("");
    const panels = acc.querySelectorAll(".cert-panel");
    const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
    panels.forEach((p) => {
      p.addEventListener("click", () => {
        const idx = Number(p.dataset.index);
        if (isMobile()) {
          if (p.classList.contains("is-open")) {
            openLightbox(certs.map((c) => ({ src: c.image, cap: `${c.fullTitle} — ${c.issuer}, ${c.year}` })), idx);
          } else {
            panels.forEach((x) => x.classList.remove("is-open"));
            p.classList.add("is-open");
          }
        } else {
          openLightbox(certs.map((c) => ({ src: c.image, cap: `${c.fullTitle} — ${c.issuer}, ${c.year}` })), idx);
        }
      });
      p.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.click(); }
      });
    });
    if (panels[0] && isMobile()) panels[0].classList.add("is-open");
  }

  // Lightbox
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");
  const lbClose = lb.querySelector(".lb-close");
  const lbPrev = lb.querySelector(".lb-prev");
  const lbNext = lb.querySelector(".lb-next");
  let lbSet = [], lbIdx = 0;
  function openLightbox(set, index) {
    lbSet = set; lbIdx = index || 0;
    updateLightbox();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function updateLightbox() {
    const cur = lbSet[lbIdx];
    if (!cur) return;
    lbImg.src = cur.src;
    lbImg.alt = cur.cap || "";
    lbCap.textContent = cur.cap || "";
    lbPrev.style.display = lbSet.length > 1 ? "grid" : "none";
    lbNext.style.display = lbSet.length > 1 ? "grid" : "none";
  }
  function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function nextLb() { lbIdx = (lbIdx + 1) % lbSet.length; updateLightbox(); }
  function prevLb() { lbIdx = (lbIdx - 1 + lbSet.length) % lbSet.length; updateLightbox(); }
  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", prevLb);
  lbNext.addEventListener("click", nextLb);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  window.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextLb();
    if (e.key === "ArrowLeft") prevLb();
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) (dx < 0 ? nextLb : prevLb)();
    touchX = null;
  });

  // Project gallery lightbox
  const groups = {};
  document.querySelectorAll("[data-lightbox]").forEach((a) => {
    const key = a.dataset.lightbox;
    (groups[key] = groups[key] || []).push({ src: a.getAttribute("href"), cap: a.querySelector("img") ? a.querySelector("img").alt : "", el: a });
  });
  Object.values(groups).forEach((set) => {
    set.forEach((item, i) => {
      item.el.addEventListener("click", (e) => {
        e.preventDefault();
        openLightbox(set.map((s) => ({ src: s.src, cap: s.cap })), i);
      });
    });
  });
})();
