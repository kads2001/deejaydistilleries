/**
 * Deejay Distilleries - Main jQuery & JavaScript
 * Includes:
 * 1. Active parallax scroll effect for About Us barrel warehouse image
 * 2. Touch & button-driven Flavour Brands Carousel / Slider
 * 3. Video sound & mobile navigation
 */

$(document).ready(function () {
  'use strict';

  // 1. Initialize Smooth Scrolling Engine (Lenis + Native Smooth Fallback)
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth Scroll Helper Function
  function smoothScrollTo(target, offset) {
    const targetOffset = typeof offset !== 'undefined' ? offset : -70;
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, { offset: targetOffset, duration: 1.2 });
    } else {
      const elTop = $(target).offset() ? $(target).offset().top : 0;
      $('html, body').stop().animate({
        scrollTop: Math.max(0, elTop + targetOffset)
      }, 700);
    }
  }

  // 2. Navbar Scroll Transition
  function handleNavScroll() {
    const scrollPos = lenis ? lenis.scroll : $(window).scrollTop();
    if (scrollPos > 40) {
      $('.site-header').addClass('scrolled');
    } else {
      $('.site-header').removeClass('scrolled');
    }
  }

  if (lenis) {
    lenis.on('scroll', handleNavScroll);
  } else {
    $(window).on('scroll', handleNavScroll);
  }

  // 3. Mobile Navigation Toggle
  $('#mobileMenuOpen').on('click', function () {
    $('#mobileNavDrawer').addClass('active');
    $('body').css('overflow', 'hidden');
    if (lenis) lenis.stop();
  });

  $('#mobileMenuClose, .mobile-nav-menu .nav-custom-link, .mobile-nav-menu .btn-nav-contact').on('click', function () {
    $('#mobileNavDrawer').removeClass('active');
    $('body').css('overflow', 'auto');
    if (lenis) lenis.start();
  });

  // 4. Hero Video Switcher Cards & Play/Pause Controls
  const $heroVideo = $('#heroBgVideo');
  const $videoCards = $('.hero-video-card');
  const $videoToggleBtn = $('#heroVideoToggle');

  if ($heroVideo.length) {
    const videoEl = $heroVideo.get(0);

    // Switch video when clicking any card
    $videoCards.on('click', function () {
      const $card = $(this);
      if ($card.hasClass('active')) return;

      const videoSrc = $card.attr('data-video-src');
      if (!videoSrc) return;

      $videoCards.removeClass('active');
      $card.addClass('active');

      // Smooth opacity cross-fade
      $heroVideo.css({ transition: 'opacity 0.35s ease', opacity: 0 });

      setTimeout(function () {
        // Change source and load
        $heroVideo.attr('src', videoSrc);
        videoEl.load();
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.then(function () {
            $heroVideo.css('opacity', 1);
            if ($videoToggleBtn.length) {
              $videoToggleBtn.html('<i class="bi bi-pause-fill"></i>');
            }
          }).catch(function () {
            $heroVideo.css('opacity', 1);
          });
        } else {
          $heroVideo.css('opacity', 1);
        }
      }, 350);
    });

    // Toggle Play/Pause on Gold Circular Button
    if ($videoToggleBtn.length) {
      $videoToggleBtn.on('click', function () {
        if (videoEl.paused) {
          videoEl.play();
          $videoToggleBtn.html('<i class="bi bi-pause-fill"></i>');
        } else {
          videoEl.pause();
          $videoToggleBtn.html('<i class="bi bi-play-fill"></i>');
        }
      });
    }
  }

  // 5. Universal Smooth Anchor Scrolling (Local & Cross-Page Hashes)
  $(document).on('click', 'a[href*="#"]', function (e) {
    const href = $(this).attr('href');
    if (!href || href === '#' || href === '#!') return;

    // Determine target selector
    let targetSelector = '';
    if (href.startsWith('#')) {
      targetSelector = href;
    } else if (href.includes('#')) {
      const parts = href.split('#');
      const pagePart = parts[0];
      const hashPart = '#' + parts[1];
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      if (pagePart === '' || pagePart === currentPath || (pagePart === 'index.html' && (currentPath === '' || currentPath === 'index.html'))) {
        targetSelector = hashPart;
      }
    }

    if (targetSelector && $(targetSelector).length) {
      e.preventDefault();
      smoothScrollTo(targetSelector, -70);

      // Close mobile nav drawer if open
      $('#mobileNavDrawer').removeClass('active');
      $('body').css('overflow', 'auto');
      if (lenis) lenis.start();

      // Update URL hash without jump
      if (history.pushState) {
        history.pushState(null, null, targetSelector);
      }
    }
  });

  // Handle URL hash on initial page load with smooth scroll
  if (window.location.hash) {
    setTimeout(function () {
      const $initialTarget = $(window.location.hash);
      if ($initialTarget.length) {
        smoothScrollTo($initialTarget.get(0), -70);
      }
    }, 250);
  }

  // 6. Active Smooth Parallax Effect on About Us Image
  function initParallax() {
    const parallaxWrappers = document.querySelectorAll('.about-parallax-wrapper');
    if (!parallaxWrappers.length) return;

    function handleParallax() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      parallaxWrappers.forEach(function (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        const img = wrapper.querySelector('.about-parallax-img');
        if (!img) return;

        // Check if wrapper is in or crossing viewport
        if (rect.bottom >= 0 && rect.top <= windowHeight) {
          const totalDistance = windowHeight + rect.height;
          // Progress goes smoothly from 0.0 (entering bottom) to 1.0 (exiting top)
          const progress = Math.min(Math.max((windowHeight - rect.top) / totalDistance, 0), 1);
          
          // Move from -120px to +120px for high-impact, smooth depth
          const translateY = ((progress - 0.5) * 240).toFixed(2);

          img.style.transform = `translate3d(0px, ${translateY}px, 0px) scale(1.08)`;
        }
      });
    }

    if (lenis) {
      lenis.on('scroll', handleParallax);
    } else {
      let isTicking = false;
      window.addEventListener('scroll', function () {
        if (!isTicking) {
          window.requestAnimationFrame(function () {
            handleParallax();
            isTicking = false;
          });
          isTicking = true;
        }
      }, { passive: true });
    }

    window.addEventListener('resize', handleParallax);
    handleParallax();
  }

  initParallax();

  // 7. Luxury Pinned / Sticky Horizontal Scroll for 8 Brand Cards
  function initStickyFlavourScroll() {
    const $section = $('#brands');
    const $track = $('#flavourSliderTrack');
    const $wrapper = $('#flavourSliderWrapper');
    const $prevBtn = $('#flavourPrevBtn');
    const $nextBtn = $('#flavourNextBtn');

    if (!$section.length || !$track.length || !$wrapper.length) return;

    const trackEl = $track.get(0);
    const wrapperEl = $wrapper.get(0);
    const sectionEl = $section.get(0);

    function getStepWidth() {
      const firstCard = trackEl.querySelector('.flavour-card');
      return (firstCard ? firstCard.offsetWidth : 300) + 16;
    }

    function getMaxHorizontal() {
      return Math.max(0, trackEl.scrollWidth - wrapperEl.clientWidth);
    }

    function updateStickyScroll() {
      const rect = sectionEl.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollableDistance = rect.height - windowHeight;

      if (scrollableDistance <= 0) return;

      // When the top of the section reaches the top of the viewport
      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
      const maxHorizontal = getMaxHorizontal();
      const currentX = progress * maxHorizontal;

      trackEl.style.transition = 'none';
      trackEl.style.transform = `translate3d(-${currentX.toFixed(2)}px, 0px, 0px)`;

      if ($prevBtn.length) {
        $prevBtn.css('opacity', progress <= 0.02 ? '0.4' : '1');
      }
      if ($nextBtn.length) {
        $nextBtn.css('opacity', progress >= 0.98 ? '0.4' : '1');
      }
    }

    if (lenis) {
      lenis.on('scroll', updateStickyScroll);
    } else {
      let isTicking = false;
      window.addEventListener('scroll', function () {
        if (!isTicking) {
          window.requestAnimationFrame(function () {
            updateStickyScroll();
            isTicking = false;
          });
          isTicking = true;
        }
      }, { passive: true });
    }

    window.addEventListener('resize', updateStickyScroll);
    updateStickyScroll();

    // Next / Prev buttons scroll smoothly down/up through the pinned section
    if ($nextBtn.length) {
      $nextBtn.on('click', function () {
        const rect = sectionEl.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const scrollableDistance = rect.height - windowHeight;
        const maxHorizontal = getMaxHorizontal();
        if (maxHorizontal <= 0) return;

        const step = getStepWidth();
        const stepScroll = (step / maxHorizontal) * scrollableDistance;

        const currentScroll = lenis ? lenis.scroll : (window.pageYOffset || document.documentElement.scrollTop);
        const sectionTop = currentScroll + rect.top;
        const targetScroll = Math.min(sectionTop + scrollableDistance, currentScroll + stepScroll);

        if (lenis) {
          lenis.scrollTo(targetScroll, { duration: 0.8 });
        } else {
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
      });
    }

    if ($prevBtn.length) {
      $prevBtn.on('click', function () {
        const rect = sectionEl.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const scrollableDistance = rect.height - windowHeight;
        const maxHorizontal = getMaxHorizontal();
        if (maxHorizontal <= 0) return;

        const step = getStepWidth();
        const stepScroll = (step / maxHorizontal) * scrollableDistance;

        const currentScroll = lenis ? lenis.scroll : (window.pageYOffset || document.documentElement.scrollTop);
        const sectionTop = currentScroll + rect.top;
        const targetScroll = Math.max(sectionTop, currentScroll - stepScroll);

        if (lenis) {
          lenis.scrollTo(targetScroll, { duration: 0.8 });
        } else {
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
      });
    }
  }

  initStickyFlavourScroll();

  // 7. Minimalist Contact Form Submission Handler
  const $contactForm = $('#minimalContactForm');
  if ($contactForm.length) {
    $contactForm.on('submit', function (e) {
      e.preventDefault();
      const name = $('#contactName').val();
      alert('Thank you, ' + name + '! Your message has been sent to Deejay Distilleries. Our team will contact you shortly.');
      $contactForm.get(0).reset();
    });
  }

  // 8. Footer Newsletter Form Submission Handler
  const $newsletterForm = $('#footerNewsletterForm');
  if ($newsletterForm.length) {
    $newsletterForm.on('submit', function (e) {
      e.preventDefault();
      const email = $('#newsletterEmail').val();
      alert('Thank you for subscribing! Updates from Deejay Distilleries will be sent to ' + email);
      $newsletterForm.get(0).reset();
    });
  }

  // 9. Interactive Smooth Scroll Zoom Effect for Zoom Banner Section
  function initZoomBanner() {
    const zoomSections = document.querySelectorAll('.zoom-banner-section');
    if (!zoomSections.length) return;

    function handleZoom() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      zoomSections.forEach(function (section) {
        const rect = section.getBoundingClientRect();
        const img = section.querySelector('.zoom-banner-img');
        if (!img) return;

        // When section enters the viewport
        if (rect.bottom >= 0 && rect.top <= windowHeight) {
          const totalDistance = windowHeight + rect.height;
          // Progress from 0.0 to 1.0
          const progress = Math.min(Math.max((windowHeight - rect.top) / totalDistance, 0), 1);
          
          // Smoothly scale from 1.0 to 1.25 as user scrolls down
          const scale = (1.0 + progress * 0.22).toFixed(3);
          img.style.transform = `scale(${scale})`;
        }
      });
    }

    if (lenis) {
      lenis.on('scroll', handleZoom);
    } else {
      let isTicking = false;
      window.addEventListener('scroll', function () {
        if (!isTicking) {
          window.requestAnimationFrame(function () {
            handleZoom();
            isTicking = false;
          });
          isTicking = true;
        }
      }, { passive: true });
    }

    window.addEventListener('resize', handleZoom);
    handleZoom();
  }

  initZoomBanner();

  // 10. Style Showcase Filter & Arrows Controls
  function initStyleShowcase() {
    const $tabs = $('.filter-pill-btn');
    const $grid = $('.style-gallery-grid');
    const $prevBtn = $('#showcasePrev');
    const $nextBtn = $('#showcaseNext');

    $tabs.on('click', function () {
      $tabs.removeClass('active');
      $(this).addClass('active');
    });

    if ($grid.length && $prevBtn.length && $nextBtn.length) {
      const scrollAmount = 300;
      $prevBtn.on('click', function () {
        $grid.get(0).scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
      $nextBtn.on('click', function () {
        $grid.get(0).scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
  }

  initStyleShowcase();

  // 10. Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 0
    });

    if (lenis) {
      lenis.on('scroll', function () {
        AOS.refresh();
      });
    }
  }
});

