/*
 * Theme storage and application (TODO-231). Loaded in <head> before the stylesheet so the
 * saved theme is on <html> before first paint. app.js uses the same functions for the toggle.
 * Works as a browser global (OpsTheme) and as a CommonJS module for Jest.
 */
(function (root) {
  'use strict';

  var KEY = 'theme';
  var DEFAULT_THEME = 'dark';

  /** The stored theme ("light" or "dark"), else the default. Safe when storage is blocked. */
  function readTheme(win) {
    try {
      var value = win.localStorage.getItem(KEY);
      return value === 'light' || value === 'dark' ? value : DEFAULT_THEME;
    } catch (e) {
      return DEFAULT_THEME;
    }
  }

  function applyTheme(doc, theme) {
    doc.documentElement.setAttribute('data-theme', theme);
  }

  function saveTheme(win, theme) {
    try {
      win.localStorage.setItem(KEY, theme);
    } catch (e) {
      // Storage can be blocked (private mode); the theme still switches for this visit.
    }
  }

  var api = { readTheme: readTheme, applyTheme: applyTheme, saveTheme: saveTheme };

  if (typeof module !== 'undefined') {
    module.exports = api;
  } else if (root.document) {
    root.OpsTheme = api;
    applyTheme(root.document, readTheme(root));
  }
})(typeof window !== 'undefined' ? window : this);
