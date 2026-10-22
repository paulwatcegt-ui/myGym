/* Local interactions only: no analytics, release requests or upstream demo. */
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.addEventListener('click', e => { if (!e.target.closest('.mg-nav')) close(); });
  const dialog = document.querySelector('.image-dialog');
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    dialog.querySelector('img').src = button.dataset.image;
    dialog.querySelector('img').alt = 'myGym ' + button.dataset.title + '真实界面，演示数据';
    dialog.querySelector('h2').textContent = button.dataset.title;
    dialog.showModal();
  }));
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.hash === '#' + entry.target.id));
    }), { rootMargin: '-15% 0px -55% 0px' });
    nav.querySelectorAll('a').forEach(a => { const section=document.querySelector(a.hash); if(section) observer.observe(section); });
  }
})();
