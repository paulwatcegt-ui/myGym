/* Enter at the product hero; preserve in-page links and browser back/forward. */
(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation && navigation.type === 'back_forward') return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  const showHero = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  showHero();
  document.addEventListener('DOMContentLoaded', showHero, { once: true });
})();
