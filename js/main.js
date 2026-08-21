/* ==========================================================================
   Katyal Fitness Gym — interactions
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- images
     Photos are the real assets exported from the Figma file (images/). If one
     is missing, hide the <img> so the gradient on .img-ph shows through
     instead of a broken-image icon.                                        */
  document.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.target.classList.add('is-broken');
  }, true);

  /* ------------------------------------------------------------- hero video
     Autoplay is a request, not a guarantee — browsers block it on low battery
     or data-saver, and it should not run at all under reduced motion. In every
     failure path we fall back to the poster still, which is already painted. */
  var heroVideo = $('#heroVideo');
  if (heroVideo) {
    var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    var conn = navigator.connection || {};
    var saveData = conn.saveData === true;

    if (saveData) {
      /* Detaching the sources and re-loading aborts the transfer outright —
         pausing alone would still pull the whole file down. Poster remains. */
      heroVideo.preload = 'none';
      while (heroVideo.firstChild) heroVideo.removeChild(heroVideo.firstChild);
      heroVideo.removeAttribute('src');
      heroVideo.load();
    }

    var applyMotionPref = function () {
      if (noMotion.matches || saveData) {
        heroVideo.removeAttribute('autoplay');
        heroVideo.pause();
      } else {
        var p = heroVideo.play();
        if (p && typeof p.catch === 'function') p.catch(function () { /* poster stays */ });
      }
    };

    applyMotionPref();
    if (typeof noMotion.addEventListener === 'function') {
      noMotion.addEventListener('change', applyMotionPref);
    }

    /* Don't burn cycles decoding video that is scrolled out of view. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (noMotion.matches || saveData) return;
          if (entry.isIntersecting) {
            var p = heroVideo.play();
            if (p && typeof p.catch === 'function') p.catch(function () {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.01 }).observe(heroVideo);
    }
  }

  /* ------------------------------------------------------------------ year */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------- nav */
  var nav     = $('#nav');
  var burger  = $('#navBurger');
  var links   = $('#navLinks');

  var onScroll = function () {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var closeMenu = function () {
    if (!links) return;
    links.classList.remove('is-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  };

  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', links).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('click', function (e) {
      if (!links.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* Highlight the nav link for the section currently on screen. */
  var navLinkMap = {};
  $$('#navLinks a').forEach(function (a) {
    var id = a.getAttribute('href');
    if (id && id.charAt(0) === '#' && id.length > 1) navLinkMap[id.slice(1)] = a;
  });

  var sectionEls = Object.keys(navLinkMap)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sectionEls.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var active = navLinkMap[entry.target.id];
        if (!active) return;
        $$('#navLinks a').forEach(function (a) { a.classList.remove('is-active'); });
        active.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionEls.forEach(function (s) { spy.observe(s); });
  }

  /* -------------------------------------------------------------- carousel */
  var track = $('#carouselTrack');
  var prev  = $('#prevBtn');
  var next  = $('#nextBtn');

  if (track && prev && next) {
    var originals = $$('.scard', track);
    var count = originals.length;

    /* The set is cloned once and appended, so the track can always keep moving
       forward. Landing on the first clone is visually identical to landing on
       the real first card, which is what makes the wrap invisible: we snap the
       track back with the transition switched off and nobody sees the seam. */
    if (count > 1) {
      originals.forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');   /* duplicates, not content */
        clone.classList.add('is-clone');
        track.appendChild(clone);
      });
    }

    var cards = $$('.scard', track);
    var index = 0;
    var animating = false;
    var releaseTimer;

    var step = function () {
      if (cards.length < 2) return cards.length ? cards[0].offsetWidth : 0;
      return cards[1].offsetLeft - cards[0].offsetLeft;
    };

    var apply = function () {
      track.style.transform = 'translateX(' + (-index * step()) + 'px)';
    };

    /* Reposition with the transition suppressed, so the wrap is not visible. */
    var jumpTo = function (i) {
      track.style.transition = 'none';
      index = i;
      apply();
      void track.offsetWidth;            /* force reflow before restoring */
      track.style.transition = '';
    };

    /* Runs when a slide finishes — also on a timer, so a transitionend that
       never fires (reduced motion, a backgrounded tab) cannot wedge it. */
    var settle = function () {
      clearTimeout(releaseTimer);
      animating = false;
      if (index >= count) jumpTo(index - count);
      else if (index < 0) jumpTo(index + count);
    };

    var go = function (dir) {
      if (animating || count < 2) return;
      animating = true;
      releaseTimer = setTimeout(settle, 700);
      /* Going back from the first card: teleport to the clone set first, then
         animate backwards out of it. */
      if (dir < 0 && index === 0) jumpTo(count);
      index += dir;
      apply();
    };

    track.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform') settle();
    });

    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });

    /* Swipe / drag */
    var startX = null;
    track.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    window.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) < 45) return;
      go(dx < 0 ? 1 : -1);
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { jumpTo(index % count); }, 120);
    });

    window.addEventListener('load', apply);
    apply();
  }

  /* Reviews are shown as an aggregate Google rating in the markup; there is no
     testimonial carousel to drive until real review text is added. */

  /* -------------------------------------------------------------- newsletter */
  var form = $('#newsForm');
  if (form) {
    var input = $('#newsEmail');
    var note  = document.createElement('p');
    note.style.cssText = 'margin:10px 0 0;font-size:13px;font-weight:300;';
    form.appendChild(note);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (input.value || '').trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

      input.classList.toggle('is-invalid', !ok);
      note.style.color = ok ? '#fdd201' : '#fa0108';
      note.textContent = ok
        ? 'Thanks — you are on the list.'
        : 'Please enter a valid email address.';

      if (ok) input.value = '';
    });
  }

  /* ----------------------------------------------------------- scroll reveal */
  var revealSelectors = [
    '.head', '.about__img', '.about__copy', '.scard', '.fcard',
    '.features__hero', '.promo__card', '.gallery__big', '.gallery__thumbs',
    '.rcard', '.news', '.footer__grid', '.plan', '.loc'
  ].join(',');

  var targets = $$(revealSelectors);
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced && 'IntersectionObserver' in window) {
    targets.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    targets.forEach(function (el) { io.observe(el); });
  }
})();
