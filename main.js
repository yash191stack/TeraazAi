// ============================================
// TERAAZ AI — THE DHARMA ENGINE 🕋
// "TEHELKA" NUCLEAR UI EDITION 🔱
// ============================================

gsap.registerPlugin(ScrollTrigger);

// ==================== PRELOADER ====================
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('done');
      initMonolithPortal();
      initTehelkaInteractions();
      initNavbar();
      initCounters();
      initModalSystem();
      initJourneyScroll();
    }, 1500);
  } else {
    initTehelkaInteractions();
    initNavbar();
    initCounters();
    initModalSystem();
    initJourneyScroll();
  }
});

// ==================== THE PORTAL JOURNEY (TEHELKA BURST) ====================
function initMonolithPortal() {
  const overlay = document.getElementById('gate-overlay');
  if (!overlay) return;

  const burst = document.createElement('div');
  burst.className = 'burst-overlay';
  document.body.appendChild(burst);

  gsap.set("#app", { opacity: 0, scale: 0.95 });
  gsap.set("#navbar", { opacity: 0, y: -50 });

  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#smooth-wrapper",
      pin: "#smooth-wrapper",
      start: "top top",
      end: "+=2500",
      scrub: 1.2,
      anticipatePin: 1
    }
  });

  // Unlock Sequence
  masterTl.to("#dharma-lock", { rotation: -15, scale: 1.2, duration: 0.1 }, 0);
  masterTl.to("#dharma-lock path", { y: -25, duration: 0.1, ease: "back.out(2)" }, 0.05);

  // Burst & Gate Switch
  masterTl.to(burst, { opacity: 1, duration: 0.1 }, 0.15);
  masterTl.set("#gate-overlay", { display: "none" }, 0.25);
  masterTl.set("#app", { opacity: 1, scale: 1 }, 0.25);
  masterTl.to(burst, { opacity: 0, duration: 0.4, ease: "power2.out" }, 0.26);

  masterTl.to("#navbar", { opacity: 1, y: 0, duration: 0.4 }, 0.3);
  masterTl.to("#void-mist", { opacity: 0, duration: 0.8 }, 0.4);
}

// ==================== TEHELKA INTERACTIONS ====================
function initTehelkaInteractions() {
  // 1. Magnetic Buttons
  const magnets = document.querySelectorAll('.btn-magnetic, .btn-primary, .btn-outline');
  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const bound = btn.getBoundingClientRect();
      const x = e.clientX - bound.left - bound.width / 2;
      const y = e.clientY - bound.top - bound.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    });
  });

  // 2. 3D Tilt Bento Boxes
  const boxes = document.querySelectorAll('.bento-box');
  boxes.forEach(box => {
    box.addEventListener('mousemove', (e) => {
      const bound = box.getBoundingClientRect();
      const x = e.clientX - bound.left;
      const y = e.clientY - bound.top;
      
      const xc = bound.width / 2;
      const yc = bound.height / 2;
      const dx = x - xc;
      const dy = y - yc;

      // Update Mesh Gradient light position
      box.style.setProperty('--x', `${(x / bound.width) * 100}%`);
      box.style.setProperty('--y', `${(y / bound.height) * 100}%`);

      // Tilt
      gsap.to(box, {
        rotateX: -dy / 10,
        rotateY: dx / 10,
        duration: 0.5,
        ease: "power2.out"
      });
    });

    box.addEventListener('mouseleave', () => {
      gsap.to(box, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
    });
  });
}

// ==================== ROBUST COUNTERS ====================
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = (target % 1 !== 0) ? 1 : 0;
    gsap.to({ val: 0 }, {
      val: target,
      duration: 2.5,
      ease: "expo.out",
      onUpdate: function() {
        el.textContent = this.targets()[0].val.toFixed(decimals);
      }
    });
  };

  counters.forEach(counter => {
    ScrollTrigger.create({
      trigger: counter,
      start: "top 90%",
      onEnter: () => animateCounter(counter),
      once: true
    });
  });
}

// ==================== NAVBAR & PROGRESS ====================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const progBar = document.getElementById('nav-progress');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    const winScroll = window.pageYOffset;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progBar) progBar.style.width = scrolled + "%";
    if (winScroll > 100) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

// ==================== MODAL SYSTEM ====================
function initModalSystem() {
  const modal = document.getElementById('data-modal');
  const modalBody = document.getElementById('modal-body');
  const triggers = document.querySelectorAll('[data-modal]');
  const closeBtn = document.querySelector('.modal-close');

  if (!modal || !modalBody) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const key = trigger.getAttribute('data-modal');
      // Mock data expansion
      modalBody.innerHTML = `<h2>Data Analysis: ${key.toUpperCase()}</h2><p>Deep legal research protocol activated for topic ${key}...</p>`;
      modal.classList.add('active');
    });
  });

  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
  window.onclick = (e) => { if (e.target == modal) modal.classList.remove('active'); };
}

// ==================== JOURNEY SCROLL ====================
function initJourneyScroll() {
  const steps = gsap.utils.toArray(".journey-step");
  steps.forEach(step => {
    gsap.from(step, {
      opacity: 0, y: 50, scale: 0.9,
      scrollTrigger: { trigger: step, start: "top 85%", toggleActions: "play none none reverse" }
    });
  });
}

// ==================== THREE.JS (LIQUID CHROME CHAKRA) ====================
const heroCanvas = document.getElementById('hero-3d');
if (heroCanvas && typeof THREE !== 'undefined') {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // High-Energy Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const p1 = new THREE.PointLight(0xD4AF37, 5); p1.position.set(10, 10, 10); scene.add(p1);
  const p2 = new THREE.PointLight(0xFFFFFF, 2); p2.position.set(-10, -10, 10); scene.add(p2);

  const group = new THREE.Group();
  scene.add(group);

  // Liquid Chrome Material
  const material = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    metalness: 1,
    roughness: 0.1,
    emissive: 0x221100,
    envMapIntensity: 2
  });

  const chakra = new THREE.Mesh(new THREE.TorusGeometry(10, 0.3, 32, 100), material);
  group.add(chakra);

  // Spokes
  for (let i = 0; i < 24; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.1, 10, 0.1), material);
    spoke.rotation.z = (i / 12) * Math.PI;
    spoke.position.y = 0;
    group.add(spoke);
  }

  camera.position.z = 25;

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.z += 0.005;
    group.rotation.y = Math.sin(Date.now() * 0.001) * 0.2;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
