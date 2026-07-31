document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navDrawer = document.getElementById('navDrawer');

  function handleScroll() {
    if (window.scrollY > 15) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Initial check on load
  handleScroll();

  // Listen to window scroll events
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Toggle navigation drawer
  if (menuToggle && navDrawer) {
    menuToggle.addEventListener('click', () => {
      navDrawer.classList.toggle('open');
    });
  }
});
