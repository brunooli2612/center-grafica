// Só baixa o Three.js quando o palco aparece, depois que a página assentou.
// Até lá, e se o download falhar, fica o símbolo estático do HTML.
const stage = document.getElementById('logo-3d-stage');

if (stage) {
  const whenIdle = (fn) => {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1500 });
    else setTimeout(fn, 200);
  };

  const load = () => {
    import('./logo-3d-scene.js')
      .then(({ initLogo3D }) => initLogo3D(stage))
      .catch(() => {});
  };

  new IntersectionObserver(
    ([entry], observer) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      whenIdle(load);
    },
    { threshold: 0.25 }
  ).observe(stage);
}
