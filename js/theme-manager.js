/**
 * ThemeManager — Light / Dark / System Theme Toggle (agency-ux-architect)
 * Safe against restricted localStorage contexts.
 */
export class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || 'system';
    this.applyTheme(this.currentTheme);
    this.initializeToggle();
  }

  getStoredTheme() {
    try {
      const stored = window.localStorage.getItem('center_grafica_theme');
      return stored === 'dark' || stored === 'light' || stored === 'system' ? stored : null;
    } catch {
      return null;
    }
  }

  applyTheme(theme) {
    const validTheme = ['light', 'dark', 'system'].includes(theme) ? theme : 'system';
    if (typeof document !== 'undefined') {
      if (validTheme === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', validTheme);
      }
    }

    try {
      if (validTheme === 'system') {
        window.localStorage.removeItem('center_grafica_theme');
      } else {
        window.localStorage.setItem('center_grafica_theme', validTheme);
      }
    } catch {
      // Ignore storage errors in sandboxed/private contexts
    }

    this.currentTheme = validTheme;
    this.updateToggleUI();
  }

  initializeToggle() {
    if (typeof document === 'undefined') return;
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (event) => {
      const button =
        event.target instanceof Element ? event.target.closest('.theme-toggle-option') : null;
      if (button && toggle.contains(button)) {
        const selected = button.getAttribute('data-theme');
        if (selected) {
          this.applyTheme(selected);
        }
      }
    });
  }

  updateToggleUI() {
    if (typeof document === 'undefined') return;
    const options = document.querySelectorAll('.theme-toggle-option');
    options.forEach((option) => {
      const isSelected = option.getAttribute('data-theme') === this.currentTheme;
      option.classList.toggle('active', isSelected);
      option.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
  }
}
