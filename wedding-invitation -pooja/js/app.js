/*
  App: chhota sa screen manager
  -----------------------------
  - App.go('screen-id')  -> us screen par jao
  - App.next() / App.back()
  - HTML mein: <button data-go="screen-2">Next</button>
  - Har screen apni JS mein hooks register kar sakti hai:

      App.register('screen-1', {
        onEnter(el) { ... },   // screen dikhne par
        onLeave(el) { ... }    // screen chhodne par
      });
*/
const App = (() => {
  const hooks = {};
  const history = [];
  let screens = [];
  let current = null;

  function register(id, handlers) {
    hooks[id] = handlers;
  }

  function go(id, { pushHistory = true } = {}) {
    const target = document.getElementById(id);
    if (!target || target === current) return;

    if (current) {
      hooks[current.id]?.onLeave?.(current);
      current.classList.remove('active');
      if (pushHistory) history.push(current.id);
    }

    target.classList.add('active');
    if (target.dataset.mode === 'scroll') target.scrollTop = 0;
    current = target;
    hooks[id]?.onEnter?.(target);
  }

  function next() {
    const i = screens.indexOf(current);
    if (i < screens.length - 1) go(screens[i + 1].id);
  }

  function back() {
    const prev = history.pop();
    if (prev) go(prev, { pushHistory: false });
  }

  function start() {
    screens = [...document.querySelectorAll('.screen')];

    // data-go / data-next / data-back clicks
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-go], [data-next], [data-back]');
      if (!el) return;
      if (el.dataset.go) go(el.dataset.go);
      else if (el.hasAttribute('data-next')) next();
      else back();
    });

    if (screens.length) go(screens[0].id, { pushHistory: false });
  }

  return { register, go, next, back, start, get current() { return current; } };
})();
