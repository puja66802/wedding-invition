/* =========================================================
   SCREEN 1 : Envelope
   Seal par click -> seal tootna -> 4 flaps khulna -> next screen
   ========================================================= */
(() => {
  const screen = document.getElementById('screen-1');
  const seal   = document.getElementById('s1-seal');

  const OPEN_DURATION = 2100;   // ms: seal + 4 flaps khulne ka poora time (CSS ke hisaab se)
  let opening = false;

  seal.addEventListener('click', () => {
    if (opening) return;
    opening = true;

    screen.classList.add('is-opening');

    // Gaana yahin shuru (user ka tap zaroori hai)
    Music.play();

    // Phone par halki vibration (jahan support ho)
    if (navigator.vibrate) navigator.vibrate(30);

    setTimeout(() => App.next(), OPEN_DURATION);
  });

  App.register('screen-1', {
    // Wapas is screen par aane par lifafa phir se band dikhe
    onEnter() {
      opening = false;
      screen.classList.remove('is-opening');
    }
  });
})();
