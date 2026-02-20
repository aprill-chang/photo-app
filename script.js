(function () {
  'use strict';

  /* Sticky nav: smooth scroll to sections */
  var nav = document.querySelector('.section-nav');
  if (nav) {
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href').slice(1);
      if (!id) return;

      var target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* Hero video: mute/unmute button (Instagram-style) */
  var heroVideo = document.getElementById('hero-video');
  var muteBtn = document.querySelector('.mute-btn');
  if (heroVideo && muteBtn) {
    var iconMuted = muteBtn.querySelector('.icon-muted');
    var iconUnmuted = muteBtn.querySelector('.icon-unmuted');

    function updateMuteButton() {
      var muted = heroVideo.muted;
      if (iconMuted) iconMuted.hidden = !muted;
      if (iconUnmuted) iconUnmuted.hidden = muted;
      muteBtn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
      muteBtn.setAttribute('title', muted ? 'Unmute' : 'Mute');
    }

    muteBtn.addEventListener('click', function () {
      heroVideo.muted = !heroVideo.muted;
      updateMuteButton();
    });

    heroVideo.addEventListener('volumechange', updateMuteButton);
    updateMuteButton();
  }

  /* Section videos (Other Videos): mute/unmute + autoplay when scrolled into view */
  var sectionWraps = document.querySelectorAll('.section-video-wrap');
  var observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var video = entry.target.querySelector('video');
      if (!video) return;
      if (entry.isIntersecting) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.25 }) : null;

  sectionWraps.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var btn = wrap.querySelector('.section-mute-btn');
    if (!video || !btn) return;

    if (observer) observer.observe(wrap);

    var iconMuted = btn.querySelector('.icon-muted');
    var iconUnmuted = btn.querySelector('.icon-unmuted');

    function updateBtn() {
      var muted = video.muted;
      if (iconMuted) iconMuted.hidden = !muted;
      if (iconUnmuted) iconUnmuted.hidden = muted;
      btn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
      btn.setAttribute('title', muted ? 'Unmute' : 'Mute');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      video.muted = !video.muted;
      updateBtn();
    });

    wrap.addEventListener('click', function (e) {
      if (e.target.closest('.section-mute-btn')) return;
      if (video.paused) video.play(); else video.pause();
    });

    video.addEventListener('volumechange', updateBtn);
    updateBtn();
  });
})();
