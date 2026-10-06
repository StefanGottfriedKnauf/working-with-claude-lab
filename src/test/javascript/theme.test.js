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

describe('theme.js (applied before first paint)', () => {
  const fs = require('fs');
  const path = require('path');
  const dir = path.resolve(__dirname, '../../main/resources/static');
  const source = () => fs.readFileSync(path.join(dir, 'theme.js'), 'utf8');
  const theme = () => {
    jest.resetModules();
    return require(path.join(dir, 'theme.js'));
  };

  test('index.html loads theme.js in <head>, before the stylesheet', () => {
    const head = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').split('</head>')[0];
    const script = head.indexOf('<script src="theme.js"></script>');
    expect(script).toBeGreaterThan(-1);
    expect(script).toBeLessThan(head.indexOf('<link rel="stylesheet"'));
  });

  test('readTheme: stored light or dark is returned', () => {
    window.localStorage.setItem('theme', 'light');
    expect(theme().readTheme(window)).toBe('light');
    window.localStorage.setItem('theme', 'dark');
    expect(theme().readTheme(window)).toBe('dark');
  });

  test('readTheme: nothing stored, or an unknown value, gives dark', () => {
    expect(theme().readTheme(window)).toBe('dark');
    window.localStorage.setItem('theme', 'purple');
    expect(theme().readTheme(window)).toBe('dark');
  });

  test('readTheme and saveTheme do not throw when localStorage is blocked', () => {
    const blocked = {};
    Object.defineProperty(blocked, 'localStorage', { get() { throw new Error('blocked'); } });
    expect(theme().readTheme(blocked)).toBe('dark');
    expect(() => theme().saveTheme(blocked, 'light')).not.toThrow();
  });

  test('loaded as a plain browser script, it sets the stored theme straight away', () => {
    window.localStorage.setItem('theme', 'light');
    window.eval(source());
    expect(html().getAttribute('data-theme')).toBe('light');
  });
});
