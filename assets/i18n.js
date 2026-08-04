/* assets/i18n.js
 * Multi-language support for GitPortrait
 */

window.GP_I18N = (function() {
  let currentLang = 'zh-CN';
  let dict = {};

  const LANGUAGES = {
    'zh-CN': '🇨🇳 简体中文',
    'zh-TW': '🇹🇼 繁體中文',
    'en': '🇺🇸 English',
    'ja': '🇯🇵 日本語',
    'ko': '🇰🇷 한국어',
    'es': '🇪🇸 Español',
    'fr': '🇫🇷 Français',
    'de': '🇩🇪 Deutsch'
  };

  async function load(lang) {
    if (dict[lang]) return dict[lang];
    try {
      const res = await fetch(`assets/i18n/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      dict[lang] = await res.json();
      return dict[lang];
    } catch (e) {
      console.warn('Failed to load i18n:', lang, e);
      // Fallback to zh-CN
      if (lang !== 'zh-CN') return load('zh-CN');
      return {};
    }
  }

  function t(key, fallback) {
    return dict[currentLang]?.[key] || fallback || key;
  }

  function getLang() { return currentLang; }
  function setLang(lang) { currentLang = lang; }

  return { load, t, getLang, setLang, LANGUAGES };
})();