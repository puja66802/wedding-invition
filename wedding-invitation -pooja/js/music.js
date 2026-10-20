/*
  Music: background gaana + play/pause button
  -------------------------------------------
  - Gaana: assets/music.m4a (song.mpeg ka halka 128kbps AAC copy)
  - Music.play() seal tap par chalta hai (browser user ke tap ke bina gaana nahi chalne deta)
  - Button ka look (pause icon + ghoomta ring) "on" state se chalta hai,
    isliye gaana file na ho tab bhi design waisa hi dikhta hai
*/
const Music = (() => {
  const audio = document.getElementById('bg-music');
  const btn   = document.getElementById('music-btn');
  let on = false;

  // Gaane ka sirf ye hissa bajta hai, phir shuru se dobara (loop)
  const CLIP_START = 0;     // sec
  const CLIP_END   = 35;    // sec: 0:35 par wapas shuru
  const FADE       = 2.5;   // sec: aakhir mein dheere-dheere awaaz kam
  const VOLUME     = 1;

  audio.loop = false;       // loop hum khud sambhalte hain (CLIP_END par)
  setInterval(() => {
    if (audio.paused) return;
    const t = audio.currentTime;
    if (t >= CLIP_END || audio.ended) {
      audio.currentTime = CLIP_START;
      audio.volume = VOLUME;
      return;
    }
    // fade-in pehle 1 sec, fade-out aakhri FADE sec (iPhone volume nahi badalne deta, wahan seedha loop)
    const fadeIn  = Math.min(1, (t - CLIP_START) / 1);
    const fadeOut = Math.min(1, (CLIP_END - t) / FADE);
    audio.volume = Math.max(0, Math.min(fadeIn, fadeOut)) * VOLUME;
  }, 100);
  audio.addEventListener('ended', () => {        // gaana 35 sec se chhota ho to bhi loop
    if (!on) return;
    audio.currentTime = CLIP_START;
    audio.play().catch(() => {});
  });

  function render() {
    btn.classList.toggle('is-playing', on);
    btn.setAttribute('aria-label', on ? 'Music band karein' : 'Music chalayein');
  }

  function play() {
    on = true;
    render();
    audio.play().catch(() => {});   // file na ho ya browser roke to bhi design chalta rahe
  }

  function pause() {
    on = false;
    render();
    audio.pause();
  }

  btn.addEventListener('click', () => (on ? pause() : play()));

  return { play, pause };
})();
