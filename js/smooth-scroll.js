// js/smooth-scroll.js
window.lenis = new Lenis({ 
  lerp: 0.08, 
  smoothWheel: true 
});

window.lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  window.lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Smooth anchor scrolling.
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    // If it's a valid ID on the page or just '#'
    if (id !== '#' && id.startsWith('#')) {
      const targetElement = document.querySelector(id);
      if (targetElement) {
        e.preventDefault();
        window.lenis.scrollTo(targetElement);
      }
    }
  });
});
