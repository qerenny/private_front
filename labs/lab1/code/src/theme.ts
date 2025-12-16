export function initTheme(): void {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  injectThemeToggle();
}

function injectThemeToggle(): void {
  const navbarCollapse = document.getElementById('navbarNav');
  if (!navbarCollapse) return;

  // Check if button already exists to prevent duplicates
  if (document.getElementById('themeToggleBtn')) return;

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'themeToggleBtn';
  toggleBtn.className = 'theme-toggle-btn';
  toggleBtn.setAttribute('aria-label', 'Toggle theme');
  toggleBtn.innerHTML = getToggleIcon();

  toggleBtn.addEventListener('click', toggleTheme);

  const navbarNav = navbarCollapse.querySelector('.navbar-nav');
  if (navbarNav) {
    const li = document.createElement('li');
    li.className = 'nav-item d-flex align-items-center';
    li.appendChild(toggleBtn);
    navbarNav.appendChild(li);
  }
}

function getToggleIcon(): string {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  // Use icons from sprite
  const sunIcon = `<svg width="16" height="16" fill="currentColor" class="bi bi-sun-fill" viewBox="0 0 16 16">
    <use href="assets/sprite.svg#icon-sun"></use>
  </svg>`;

  const moonIcon = `<svg width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16">
    <use href="assets/sprite.svg#icon-moon"></use>
  </svg>`;

  return isDark ? sunIcon : moonIcon;
}

function toggleTheme(): void {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  if (newTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }

  // Update button icon
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = getToggleIcon();
  }
}
