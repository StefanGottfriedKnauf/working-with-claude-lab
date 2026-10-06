const { loadApp } = require('./setup/loadApp');

const html = () => document.documentElement;

beforeEach(() => {
  window.localStorage.clear();
  html().removeAttribute('data-theme');
});

describe('theme toggle', () => {
  test('AC-4: defaults to dark when nothing is stored, ignoring the OS setting', async () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }); // OS says light
    try {
      await loadApp();
      expect(html().getAttribute('data-theme')).toBe('dark');
    } finally {
      delete window.matchMedia;
    }
  });

  test('AC-1: clicking #theme-toggle switches between dark and light, and the label names the next theme', async () => {
    const { document } = await loadApp();
    const toggle = document.getElementById('theme-toggle');
    expect(toggle.textContent).toMatch(/light/i);
    toggle.click();
    expect(html().getAttribute('data-theme')).toBe('light');
    expect(toggle.textContent).toMatch(/dark/i);
    toggle.click();
    expect(html().getAttribute('data-theme')).toBe('dark');
  });

  test('AC-3: the choice is saved in localStorage', async () => {
    const { document } = await loadApp();
    document.getElementById('theme-toggle').click();
    expect(window.localStorage.getItem('theme')).toBe('light');
  });

  test('AC-3: a stored choice is restored on load', async () => {
    window.localStorage.setItem('theme', 'light');
    const { document } = await loadApp();
    expect(html().getAttribute('data-theme')).toBe('light');
    expect(document.getElementById('theme-toggle').textContent).toMatch(/dark/i);
  });

  test('an unknown stored value falls back to dark', async () => {
    window.localStorage.setItem('theme', 'purple');
    await loadApp();
    expect(html().getAttribute('data-theme')).toBe('dark');
  });

  test('AC-2: app.js and style.css hold colours only in CSS variables; chart classes use them', () => {
    const fs = require('fs');
    const path = require('path');
    const dir = path.resolve(__dirname, '../../main/resources/static');
    expect(fs.readFileSync(path.join(dir, 'app.js'), 'utf8')).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(/);
    const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
    const outsideVars = css.split('\n').filter((l) => /#[0-9a-fA-F]{3,8}\b/.test(l) && !/^\s*--[\w-]+:/.test(l));
    expect(outsideVars).toEqual([]);
    expect(css).toMatch(/:root\[data-theme="light"\]/);
    expect(css).toMatch(/:root\[data-theme="dark"\]/);
  });
});
