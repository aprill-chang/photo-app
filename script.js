(function () {
  'use strict';

  /* Hero video: autoplay muted without user scroll. Try multiple triggers so it starts on load when possible */
  var heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.setAttribute('playsinline', '');

    function tryPlay() {
      heroVideo.muted = true;
      heroVideo.play().catch(function () {});
    }

    tryPlay();
    if (document.readyState !== 'complete') {
      window.addEventListener('load', tryPlay);
    }
    window.addEventListener('pageshow', tryPlay);
    requestAnimationFrame(function () { tryPlay(); });
    setTimeout(tryPlay, 100);
    setTimeout(tryPlay, 400);
    heroVideo.addEventListener('loadeddata', tryPlay);
    heroVideo.addEventListener('canplay', tryPlay);
    document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
  }

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

  /* Active nav link: bold + underline for section in view (Google tab style) */
  var sectionIds = ['getting-ready', 'first-look', 'ceremony', 'cocktail-hours', 'group-photo', 'reception', 'after-party', 'other-videos'];
  var navLinksById = {};
  sectionIds.forEach(function (id) {
    var link = document.querySelector('.section-nav a[href="#' + id + '"]');
    if (link) navLinksById[id] = link;
  });

  function setActiveSection(id) {
    Object.keys(navLinksById).forEach(function (linkId) {
      var link = navLinksById[linkId];
      if (linkId === id) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'location');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveOnScroll() {
    var vh = window.innerHeight;
    var trigger = vh * 0.35;
    var current = null;
    for (var i = 0; i < sectionIds.length; i++) {
      var el = document.getElementById(sectionIds[i]);
      if (!el) continue;
      var top = el.getBoundingClientRect().top;
      if (top <= trigger) current = sectionIds[i];
    }
    if (current) setActiveSection(current);
  }

  window.addEventListener('scroll', function () {
    requestAnimationFrame(updateActiveOnScroll);
  }, { passive: true });
  updateActiveOnScroll();

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

  /* Lightbox: click photo to open, prev/next, close */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = lightbox && lightbox.querySelector('.lightbox-image');
  var lightboxCounter = lightbox && lightbox.querySelector('.lightbox-counter');
  var lightboxClose = lightbox && lightbox.querySelector('.lightbox-close');
  var lightboxBackdrop = lightbox && lightbox.querySelector('.lightbox-backdrop');
  var lightboxPrev = lightbox && lightbox.querySelector('.lightbox-prev');
  var lightboxNext = lightbox && lightbox.querySelector('.lightbox-next');

  if (lightbox && lightboxImg) {
    var lightboxImages = [];
    var lightboxIndex = 0;

    function showLightbox() {
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      updateLightboxImage();
    }

    function hideLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }

    function updateLightboxImage() {
      if (lightboxImages.length === 0) return;
      var img = lightboxImages[lightboxIndex];
      lightboxImg.setAttribute('src', img.src || img.getAttribute('src'));
      lightboxImg.setAttribute('alt', img.alt || '');
      if (lightboxCounter) lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + lightboxImages.length;
    }

    function goPrev() {
      if (lightboxImages.length <= 1) return;
      lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
      updateLightboxImage();
    }

    function goNext() {
      if (lightboxImages.length <= 1) return;
      lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
      updateLightboxImage();
    }

    document.querySelectorAll('.photo-grid').forEach(function (grid) {
      var imgs = grid.querySelectorAll('img');
      imgs.forEach(function (img, i) {
        img.addEventListener('click', function () {
          lightboxImages = Array.prototype.slice.call(imgs);
          lightboxIndex = i;
          showLightbox();
        });
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', hideLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', hideLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', goPrev);
    if (lightboxNext) lightboxNext.addEventListener('click', goNext);

    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); hideLightbox(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    });
  }
})();
