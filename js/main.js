/**
 * Deejay Distilleries - Main jQuery & JavaScript
 * Includes:
 * 1. Active parallax scroll effect for About Us barrel warehouse image
 * 2. Touch & button-driven Flavour Brands Carousel / Slider
 * 3. Video sound & mobile navigation
 */

$(document).ready(function () {
  'use strict';

  // 1. Initialize High-Performance Smooth Scrolling Engine (Lenis)
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
      autoResize: true
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync with GSAP ScrollTrigger if present
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  // Smooth Scroll Helper Function
  function smoothScrollTo(target, offset) {
    const targetOffset = typeof offset !== 'undefined' ? offset : -70;
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, {
        offset: targetOffset,
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      const elTop = $(target).offset() ? $(target).offset().top : 0;
      $('html, body').stop().animate({
        scrollTop: Math.max(0, elTop + targetOffset)
      }, 850);
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

  // 4. Global Floating 3D Bottle - Multi-stage Section Journey, Sticking & Image Morphing
  function initGlobalFloatingBottle() {
    const $bottleWrap = $('#pageGlobalBottleWrap');
    const $layerA = $('#pageBottleLayerA');
    const $layerB = $('#pageBottleLayerB');

    const $aboutDockedSlot = $('#aboutDockedBottleSlot');
    const $benefitsDockedSlot = $('#benefitsDockedBottleSlot');
    const $stackDocked1 = $('#stackDockedBottle1');
    const $stackDocked2 = $('#stackDockedBottle2');
    const $stackDocked3 = $('#stackDockedBottle3');
    const $showcaseLandingCard = $('#showcaseBottleLandingCard');

    if (!$bottleWrap.length || (!$layerA.length && !$layerB.length)) return;

    const wrapEl = $bottleWrap.get(0);
    let currentImageSrc = 'assets/images/black_blue.png';
    let activeLayer = 'A';

    function setBottleImage(newSrc) {
      if (!newSrc || newSrc === currentImageSrc) return;
      currentImageSrc = newSrc;

      if (activeLayer === 'A') {
        $layerB.attr('src', newSrc);
        $layerB.addClass('active');
        $layerA.removeClass('active');
        activeLayer = 'B';
      } else {
        $layerA.attr('src', newSrc);
        $layerA.addClass('active');
        $layerB.removeClass('active');
        activeLayer = 'A';
      }
    }

    function setDockedState($el, isDocked) {
      if (!$el || !$el.length) return;
      if (isDocked) {
        if (!$el.hasClass('docked')) $el.addClass('docked');
      } else {
        if ($el.hasClass('docked')) $el.removeClass('docked');
      }
    }

    function updateBottlePosition() {
      const scrollY = lenis ? lenis.scroll : (window.pageYOffset || document.documentElement.scrollTop);
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth;
      const isMobile = windowWidth <= 767;
      const isTablet = windowWidth <= 991;

      // Section references
      const $heroSection = $('#hero-banner');
      const $aboutSection = $('#about');
      const $benefitsSection = $('#benefits');
      const $stackSection = $('#craft-beer-stack');
      const $showcaseSection = $('#showcase');

      // Check if near footer section to fade out
      const $footer = $('.site-footer');
      if ($footer.length && $footer.is(':visible')) {
        const footerTop = $footer.offset().top;
        if (footerTop > windowHeight && (scrollY + (windowHeight * 0.6) > footerTop)) {
          wrapEl.style.opacity = '0';
          return;
        }
      }

      // Max horizontal travel for Section 2 (About)
      const maxLeftX = isMobile ? -(windowWidth * 0.18) : (isTablet ? -(windowWidth * 0.26) : -(windowWidth * 0.32));

      // Calculate section boundaries
      const aboutTop = $aboutSection.length ? $aboutSection.offset().top : windowHeight;
      const aboutHeight = $aboutSection.length ? $aboutSection.outerHeight() : windowHeight;
      const aboutBottom = aboutTop + aboutHeight;
      const heroHoldEnd = 50;
      const aboutArrive = Math.min(aboutTop - (windowHeight * 0.22), 380);
      const aboutHoldEnd = aboutBottom - (windowHeight * 0.35);

      const benefitsTop = $benefitsSection.length ? $benefitsSection.offset().top : aboutBottom + 500;
      const benefitsHeight = $benefitsSection.length ? $benefitsSection.outerHeight() : windowHeight;
      const benefitsBottom = benefitsTop + benefitsHeight;

      const stackTop = $stackSection.length ? $stackSection.offset().top : benefitsBottom + 500;
      const stackHeight = $stackSection.length ? $stackSection.outerHeight() : windowHeight;
      const stackBottom = stackTop + stackHeight;

      const showcaseTop = $showcaseSection.length ? $showcaseSection.offset().top : stackBottom + 500;
      const showcaseHeight = $showcaseSection.length ? $showcaseSection.outerHeight() : windowHeight;
      const showcaseBottom = showcaseTop + showcaseHeight;

      let targetX = 0;
      let targetY = 0;
      let scale = 1.0;
      let targetImageSrc = 'assets/images/black_blue.png';
      let showFloatingBottle = true;

      // ================= SECTION 5: STYLE SHOWCASE =================
      if ($showcaseSection.length && scrollY + windowHeight >= showcaseTop) {
        // Check if user scrolled completely past showcase -> END of animation
        if (scrollY > showcaseBottom - (windowHeight * 0.2)) {
          showFloatingBottle = false;
          setDockedState($showcaseLandingCard, true);
          setDockedState($stackDocked3, true);
          setDockedState($stackDocked2, true);
          setDockedState($stackDocked1, true);
          setDockedState($benefitsDockedSlot, true);
          setDockedState($aboutDockedSlot, true);
          wrapEl.style.opacity = '0';
          return;
        }

        targetImageSrc = 'assets/images/proimg1.png';
        setDockedState($stackDocked3, true);
        setDockedState($stackDocked2, true);
        setDockedState($stackDocked1, true);
        setDockedState($benefitsDockedSlot, true);
        setDockedState($aboutDockedSlot, true);

        if ($showcaseLandingCard.length) {
          const cardEl = $showcaseLandingCard.get(0);
          const cardRect = cardEl.getBoundingClientRect();
          const cardCenterX = cardRect.left + (cardRect.width / 2);
          const cardCenterY = cardRect.top + (cardRect.height / 2);

          const cardTargetX = cardCenterX - (windowWidth / 2);
          const cardTargetY = cardCenterY - (windowHeight / 2);

          // Fast-acting single-scroll docking interpolation into card center
          const dockProgress = Math.min(Math.max((scrollY + (windowHeight * 0.78) - showcaseTop) / (windowHeight * 0.45), 0), 1);
          const easeDock = 1 - Math.pow(1 - dockProgress, 3);

          targetX = easeDock * cardTargetX;
          targetY = easeDock * cardTargetY;
          scale = 1.05 - (easeDock * (isMobile ? 0.28 : 0.22));

          if (dockProgress >= 0.88) {
            setDockedState($showcaseLandingCard, true);
            showFloatingBottle = false;
          } else {
            setDockedState($showcaseLandingCard, false);
            showFloatingBottle = true;
          }
        } else {
          targetX = 0;
          targetY = 0;
          scale = 0.82;
        }
      }
      // ================= SECTION 4: CRAFT BEER STACK =================
      else if ($stackSection.length && scrollY + windowHeight >= stackTop) {
        setDockedState($showcaseLandingCard, false);
        setDockedState($benefitsDockedSlot, true);
        setDockedState($aboutDockedSlot, true);

        const stackProgress = Math.min(Math.max((scrollY + (windowHeight * 0.45) - stackTop) / stackHeight, 0), 1);

        if (stackProgress < 0.33) {
          // Card 1 Active (Pilsner)
          targetImageSrc = 'assets/images/recent_launch_vodka1.png';
          setDockedState($stackDocked1, false);
          setDockedState($stackDocked2, false);
          setDockedState($stackDocked3, false);
        } else if (stackProgress < 0.66) {
          // Card 2 Active (Strawberry Vodka) - Card 1 is locked/docked
          targetImageSrc = 'assets/images/recent_launch_vodka2.png';
          setDockedState($stackDocked1, true);
          setDockedState($stackDocked2, false);
          setDockedState($stackDocked3, false);
        } else {
          // Card 3 Active (Dark Lager) - Cards 1 and 2 are locked/docked
          targetImageSrc = 'assets/images/recent_launch_vodka3.png';
          setDockedState($stackDocked1, true);
          setDockedState($stackDocked2, true);
          setDockedState($stackDocked3, false);
        }

        targetX = 0;
        targetY = 0;
        scale = isMobile ? 0.95 : 1.05;
      }
      // ================= SECTION 3: MODERN SOLUTIONS & BENEFITS =================
      else if ($benefitsSection.length && scrollY + windowHeight >= benefitsTop) {
        setDockedState($showcaseLandingCard, false);
        setDockedState($stackDocked1, false);
        setDockedState($stackDocked2, false);
        setDockedState($stackDocked3, false);
        setDockedState($aboutDockedSlot, true);

        targetImageSrc = 'assets/images/dist2.png';
        targetX = 0;
        targetY = 0;
        scale = 0.95;

        // If scrolling near exit towards Stack, dock Section 3
        if (scrollY >= benefitsBottom - (windowHeight * 0.25)) {
          setDockedState($benefitsDockedSlot, true);
        } else {
          setDockedState($benefitsDockedSlot, false);
        }
      }
      // ================= SECTION 2: ABOUT SECTION & HERO TRANSITION =================
      else if ($aboutSection.length) {
        setDockedState($showcaseLandingCard, false);
        setDockedState($stackDocked1, false);
        setDockedState($stackDocked2, false);
        setDockedState($stackDocked3, false);
        setDockedState($benefitsDockedSlot, false);

        let aboutSlotX = maxLeftX;
        if ($aboutDockedSlot.length && $aboutDockedSlot.is(':visible')) {
          const slotEl = $aboutDockedSlot.get(0);
          const slotRect = slotEl.getBoundingClientRect();
          if (slotRect.width > 0) {
            const slotCenterX = slotRect.left + (slotRect.width / 2);
            aboutSlotX = slotCenterX - (windowWidth / 2);
          }
        }

        if (scrollY <= heroHoldEnd) {
          // Hero Fix Plateau (Center)
          targetImageSrc = 'assets/images/black_blue.png';
          targetX = 0;
          targetY = 0;
          scale = 1.0;
          setDockedState($aboutDockedSlot, false);
        } else if (scrollY > heroHoldEnd && scrollY < aboutArrive) {
          // Fast single-scroll glide to About position
          targetImageSrc = 'assets/images/black_blue.png';
          const t = Math.min(Math.max((scrollY - heroHoldEnd) / (aboutArrive - heroHoldEnd), 0), 1);
          const easeT = 1 - Math.pow(1 - t, 3);
          targetX = easeT * aboutSlotX;
          targetY = 0;
          scale = 1.0 - (easeT * 0.12);
          setDockedState($aboutDockedSlot, false);
        } else if (scrollY >= aboutArrive && scrollY <= aboutHoldEnd) {
          // About Fix Plateau (Holds fixed at Left side of Section 2)
          targetImageSrc = 'assets/images/black_blue.png';
          targetX = aboutSlotX;
          targetY = 0;
          scale = 0.88;
          setDockedState($aboutDockedSlot, false);
        } else {
          // Release from About (Section 2 locks its bottle, new bottle emerges towards Benefits)
          setDockedState($aboutDockedSlot, true);
          targetImageSrc = 'assets/images/dist2.png';

          const returnT = Math.min(Math.max((scrollY - aboutHoldEnd) / (Math.max(benefitsTop - aboutHoldEnd, 1)), 0), 1);
          const easeReturn = 1 - Math.pow(1 - returnT, 3);
          targetX = (1 - easeReturn) * aboutSlotX;
          targetY = 0;
          scale = 0.88 + (easeReturn * 0.07);
        }
      }

      setBottleImage(targetImageSrc);

      if (isMobile) {
        scale *= 0.85;
      } else if (isTablet) {
        scale *= 0.92;
      }

      wrapEl.style.opacity = showFloatingBottle ? '1' : '0';
      wrapEl.style.transform = `translate3d(calc(-50% + ${targetX.toFixed(2)}px), calc(-50% + ${targetY.toFixed(2)}px), 0px) scale(${scale.toFixed(3)})`;
    }

    if (lenis) {
      lenis.on('scroll', updateBottlePosition);
    } else {
      let isTicking = false;
      window.addEventListener('scroll', function () {
        if (!isTicking) {
          window.requestAnimationFrame(function () {
            updateBottlePosition();
            isTicking = false;
          });
          isTicking = true;
        }
      }, { passive: true });
    }

    window.addEventListener('resize', updateBottlePosition);
    setTimeout(updateBottlePosition, 100);
  }

  // initGlobalFloatingBottle();

  // 4b. Hero Mountain Interactive Scroll & Hover Parallax Engine
  function initHeroMountainParallax() {
    const $mountainSection = $('#hero-banner');
    const $mountainImg = $('#heroMountainImg');
    const $fog1 = $('.fog-layer-1');
    const $fog2 = $('.fog-layer-2');
    const $light = $('.mountain-light-sweep');

    if (!$mountainSection.length || !$mountainImg.length) return;

    const imgEl = $mountainImg.get(0);
    const fog1El = $fog1.length ? $fog1.get(0) : null;
    const fog2El = $fog2.length ? $fog2.get(0) : null;
    const lightEl = $light.length ? $light.get(0) : null;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let isHovering = false;

    // Mouse Hover & Move Listener (Desktop & Tablet)
    $mountainSection.on('mousemove', function (e) {
      isHovering = true;
      const rect = this.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      targetMouseX = (mouseX / rect.width) - 0.5;
      targetMouseY = (mouseY / rect.height) - 0.5;
    });

    $mountainSection.on('mouseenter', function () {
      isHovering = true;
    });

    $mountainSection.on('mouseleave', function () {
      isHovering = false;
      targetMouseX = 0;
      targetMouseY = 0;
    });

    function renderMountainScene() {
      const scrollY = lenis ? lenis.scroll : (window.pageYOffset || document.documentElement.scrollTop);
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollProgress = Math.min(Math.max(scrollY / (windowHeight * 1.1), 0), 1);

      // Snappy smooth mouse interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.085;
      currentMouseY += (targetMouseY - currentMouseY) * 0.085;

      // 1. Mountain Background Zoom, Elevation & 3D Tilt
      const mountainScale = 1.05 + (scrollProgress * 0.18) + (isHovering ? 0.05 : 0);
      const mountainX = currentMouseX * -65;
      const mountainY = (currentMouseY * -42) - (scrollProgress * 50);
      const tiltX = currentMouseY * -6.5;
      const tiltY = currentMouseX * 7.5;
      
      imgEl.style.transform = `translate3d(calc(-50% + ${mountainX.toFixed(2)}px), calc(-50% + ${mountainY.toFixed(2)}px), 0px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale(${mountainScale.toFixed(3)})`;

      // 2. Foreground Mountain Fog Layer 1 (Strong Depth Shift)
      if (fog1El) {
        const fog1X = (currentMouseX * -110) - (scrollProgress * 160);
        const fog1Y = (currentMouseY * -55) - (scrollProgress * 35);
        const fog1Opacity = (isHovering ? 0.70 : 0.48) + (scrollProgress * 0.20);
        fog1El.style.transform = `translate3d(${fog1X.toFixed(2)}px, ${fog1Y.toFixed(2)}px, 0px) scale(${isHovering ? 1.05 : 1.0})`;
        fog1El.style.opacity = Math.min(fog1Opacity, 0.90).toFixed(2);
      }

      // 3. Midground Mountain Fog Layer 2 (Opposing Depth Shift)
      if (fog2El) {
        const fog2X = (currentMouseX * 80) + (scrollProgress * 120);
        const fog2Y = (currentMouseY * 38) - (scrollProgress * 25);
        const fog2Opacity = (isHovering ? 0.60 : 0.38) + (scrollProgress * 0.18);
        fog2El.style.transform = `translate3d(${fog2X.toFixed(2)}px, ${fog2Y.toFixed(2)}px, 0px) scale(${isHovering ? 1.04 : 1.0})`;
        fog2El.style.opacity = Math.min(fog2Opacity, 0.85).toFixed(2);
      }

      // 4. Sunlight Sweep & Spotlight Shimmer (Follows Cursor)
      if (lightEl) {
        const lightX = currentMouseX * 110;
        const lightY = currentMouseY * 55;
        const lightOpacity = isHovering ? 0.75 : (0.30 + (scrollProgress * 0.25));
        lightEl.style.transform = `translate3d(${lightX.toFixed(2)}px, ${lightY.toFixed(2)}px, 0px) scale(${(1.0 + scrollProgress * 0.12 + (isHovering ? 0.08 : 0)).toFixed(2)})`;
        lightEl.style.opacity = lightOpacity.toFixed(2);
      }

      requestAnimationFrame(renderMountainScene);
    }

    renderMountainScene();
  }

  // initHeroMountainParallax();

  // 4c. Hero Animated Smoke & Mist Particle Canvas
  function initHeroSmokeCanvas() {
    const canvas = document.getElementById('heroSmokeCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;

    // Mouse tracking for fluid smoke interaction
    const mouse = {
      x: -9999,
      y: -9999,
      vx: 0,
      vy: 0,
      lastX: -9999,
      lastY: -9999,
      isHovering: false
    };

    const $heroSection = $('#hero-banner');

    $heroSection.on('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      const newX = (e.clientX - rect.left) * (width / rect.width);
      const newY = (e.clientY - rect.top) * (height / rect.height);
      if (mouse.lastX !== -9999) {
        mouse.vx = newX - mouse.lastX;
        mouse.vy = newY - mouse.lastY;
      }
      mouse.x = newX;
      mouse.y = newY;
      mouse.lastX = newX;
      mouse.lastY = newY;
      mouse.isHovering = true;
    });

    $heroSection.on('mouseleave', function () {
      mouse.isHovering = false;
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.vx = 0;
      mouse.vy = 0;
      mouse.lastX = -9999;
      mouse.lastY = -9999;
    });

    // Create offscreen smoke puff sprite templates for ultra-fast rendering
    function createSmokePuffSprite(tint) {
      const spriteSize = 256;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = spriteSize;
      offCanvas.height = spriteSize;
      const offCtx = offCanvas.getContext('2d');

      const center = spriteSize / 2;
      const grad = offCtx.createRadialGradient(center, center, 0, center, center, center);

      if (tint === 'gold') {
        grad.addColorStop(0, 'rgba(255, 220, 140, 0.45)');
        grad.addColorStop(0.35, 'rgba(235, 190, 110, 0.22)');
        grad.addColorStop(0.7, 'rgba(200, 160, 90, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (tint === 'warm') {
        grad.addColorStop(0, 'rgba(255, 245, 230, 0.40)');
        grad.addColorStop(0.35, 'rgba(240, 225, 210, 0.20)');
        grad.addColorStop(0.7, 'rgba(210, 200, 190, 0.06)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        // Pure atmospheric white / cool mountain mist
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(0.35, 'rgba(240, 245, 255, 0.22)');
        grad.addColorStop(0.7, 'rgba(200, 215, 235, 0.07)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      offCtx.fillStyle = grad;
      offCtx.beginPath();
      offCtx.arc(center, center, center, 0, Math.PI * 2);
      offCtx.fill();

      return offCanvas;
    }

    const sprites = {
      white: createSmokePuffSprite('white'),
      warm: createSmokePuffSprite('warm'),
      gold: createSmokePuffSprite('gold')
    };

    const spriteKeys = ['white', 'white', 'warm', 'gold'];

    // Particle class
    class SmokeParticle {
      constructor(isInitial = false) {
        this.reset(isInitial);
      }

      reset(isInitial = false) {
        this.spriteKey = spriteKeys[Math.floor(Math.random() * spriteKeys.length)];
        this.sprite = sprites[this.spriteKey];

        // Distribution across canvas
        this.x = Math.random() * (width || window.innerWidth);
        this.y = isInitial ? (Math.random() * (height || window.innerHeight)) : ((height || window.innerHeight) + (Math.random() * 80));

        // Velocities
        this.baseVx = (Math.random() - 0.48) * 0.45;
        this.baseVy = -0.35 - (Math.random() * 0.55);
        this.vx = this.baseVx;
        this.vy = this.baseVy;

        // Size expansion
        this.size = 140 + (Math.random() * 180);
        this.maxSize = this.size * (1.6 + Math.random() * 0.8);
        this.growthRate = 0.25 + (Math.random() * 0.35);

        // Rotation
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.006;

        // Alpha & Lifetime
        this.maxAlpha = 0.25 + (Math.random() * 0.35);
        this.alpha = isInitial ? (Math.random() * this.maxAlpha) : 0;
        this.fadeInRate = 0.008 + (Math.random() * 0.008);
        this.fadeOutRate = 0.004 + (Math.random() * 0.004);
        this.state = isInitial ? 'active' : 'fade-in';

        // Organic wobble
        this.wobbleAngle = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.015 + (Math.random() * 0.02);
      }

      update(scrollEffect) {
        // Lifecycle
        if (this.state === 'fade-in') {
          this.alpha += this.fadeInRate;
          if (this.alpha >= this.maxAlpha) {
            this.alpha = this.maxAlpha;
            this.state = 'active';
          }
        } else if (this.state === 'active') {
          if (this.y < height * 0.25) {
            this.state = 'fade-out';
          }
        } else if (this.state === 'fade-out') {
          this.alpha -= this.fadeOutRate;
          if (this.alpha <= 0) {
            this.reset();
            return;
          }
        }

        // Size expansion
        if (this.size < this.maxSize) {
          this.size += this.growthRate;
        }

        // Wobble & rotation
        this.wobbleAngle += this.wobbleSpeed;
        const wobbleX = Math.sin(this.wobbleAngle) * 0.35;
        this.rotation += this.rotSpeed;

        // Interactive mouse disturbance / swirl force
        if (mouse.isHovering && mouse.x > 0 && mouse.y > 0) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distSq = (dx * dx) + (dy * dy);
          const maxDist = 220;
          const maxDistSq = maxDist * maxDist;

          if (distSq < maxDistSq && distSq > 10) {
            const dist = Math.sqrt(distSq);
            const force = (1 - (dist / maxDist)) * 0.85;
            const normX = dx / dist;
            const normY = dy / dist;

            // Push outward and swirl around cursor
            this.vx += (normX * force * 1.8) + (mouse.vx * 0.04);
            this.vy += (normY * force * 1.8) + (mouse.vy * 0.04);
          }
        }

        // Damping velocity back to atmospheric baseline
        this.vx += (this.baseVx + wobbleX - this.vx) * 0.04;
        this.vy += (this.baseVy - (scrollEffect * 1.2) - this.vy) * 0.04;

        this.x += this.vx;
        this.y += this.vy;

        // Out of bounds check
        if (this.y < -this.size || this.x < -this.size || this.x > width + this.size) {
          this.reset();
        }
      }

      draw(context) {
        if (this.alpha <= 0.005) return;
        context.save();
        context.globalAlpha = this.alpha;
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.drawImage(this.sprite, -this.size / 2, -this.size / 2, this.size, this.size);
        context.restore();
      }
    }

    // Initialize particles
    let particles = [];
    const particleCount = window.innerWidth <= 767 ? 26 : 48;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width || window.innerWidth;
      height = rect.height || (window.innerHeight * 1.1);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new SmokeParticle(true));
      }
    }

    resize();
    window.addEventListener('resize', resize);

    // Scroll listener for viewport visibility & responsiveness
    let lastScrollY = 0;
    let scrollVelocity = 0;

    function renderSmoke() {
      const scrollY = lenis ? lenis.scroll : (window.pageYOffset || document.documentElement.scrollTop);
      const windowHeight = window.innerHeight;

      // Check if hero is visible in viewport
      if (scrollY > windowHeight * 1.25) {
        if (isVisible) isVisible = false;
        requestAnimationFrame(renderSmoke);
        return;
      }

      isVisible = true;

      scrollVelocity = Math.min(Math.max((scrollY - lastScrollY) * 0.08, 0), 2.5);
      lastScrollY = scrollY;

      // Clear previous frame
      ctx.clearRect(0, 0, width, height);

      // Decay mouse velocity
      mouse.vx *= 0.85;
      mouse.vy *= 0.85;

      // Update and draw all smoke particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(scrollVelocity);
        particles[i].draw(ctx);
      }

      requestAnimationFrame(renderSmoke);
    }

    renderSmoke();
  }

  // initHeroSmokeCanvas();

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

  // 6. Interactive Scroll Transition: Team Images Fly from Inline Text to Middle Position (Slow & Seamless Text Collapse)
  function initTeamImagesScrollTransition() {
    const section = document.getElementById('about');
    const card1 = document.getElementById('aboutTeamCard1');
    const card2 = document.getElementById('aboutTeamCard2');
    const slot1 = document.getElementById('inlineTeamSlot1');
    const slot2 = document.getElementById('inlineTeamSlot2');

    if (!section || !card1 || !card2 || !slot1 || !slot2) return;

    const pairs = [
      { card: card1, slot: slot1 },
      { card: card2, slot: slot2 }
    ];

    let metrics = [];

    function measure() {
      // Temporarily restore natural DOM layout to measure original geometry
      pairs.forEach(function (p) {
        p.card.style.transform = 'none';
        p.slot.style.width = '';
        p.slot.style.margin = '';
        p.slot.style.opacity = '';
      });

      metrics = pairs.map(function (p) {
        const sRect = p.slot.getBoundingClientRect();
        const cRect = p.card.getBoundingClientRect();
        return {
          deltaX: sRect.left - cRect.left,
          deltaY: sRect.top - cRect.top,
          slotWidth: sRect.width || 78,
          slotMargin: 8,
          scaleX: cRect.width > 0 ? (sRect.width || 78) / cRect.width : 0.3,
          scaleY: cRect.height > 0 ? (sRect.height || 44) / cRect.height : 0.22,
          slotRadius: 10,
          cardRadius: 18
        };
      });

      update();
    }

    function update() {
      if (!metrics.length) return;

      const secRect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Slow, extended scroll window (from section entering at 85% of viewport down past top)
      const animStart = windowHeight * 0.85;
      const animEnd = -windowHeight * 0.10;
      const scrollRange = animStart - animEnd;

      const currentScroll = animStart - secRect.top;
      let rawProgress = scrollRange > 0 ? currentScroll / scrollRange : 1;
      rawProgress = Math.max(0, Math.min(1, rawProgress));

      // Gentle, smooth easing for a slow, high-end motion
      const progress = rawProgress < 0.5
        ? 2 * rawProgress * rawProgress
        : -1 + (4 - 2 * rawProgress) * rawProgress;

      // Collapse inline text space smoothly as images move down (no patch or leftover gap)
      const collapseFactor = Math.max(0, Math.min(1, progress * 1.5));

      pairs.forEach(function (p, idx) {
        const m = metrics[idx];
        if (!m) return;

        // Animate card position & scale down to the team row
        const curX = m.deltaX * (1 - progress);
        const curY = m.deltaY * (1 - progress);
        const curScaleX = m.scaleX + (1 - m.scaleX) * progress;
        const curScaleY = m.scaleY + (1 - m.scaleY) * progress;

        const curRadius = m.slotRadius + (m.cardRadius - m.slotRadius) * progress;
        const effectiveRadius = curRadius / Math.min(curScaleX, curScaleY);

        p.card.style.transformOrigin = '0 0';
        p.card.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0px) scale(${curScaleX.toFixed(4)}, ${curScaleY.toFixed(4)})`;
        p.card.style.borderRadius = `${effectiveRadius.toFixed(1)}px`;

        // Elevation shadow effect as it expands and lands in its final card place
        const shadowAlpha = (0.02 + 0.06 * progress).toFixed(3);
        const shadowY = Math.round(3 + 7 * progress);
        const shadowBlur = Math.round(6 + 19 * progress);
        p.card.style.boxShadow = `0 ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha})`;

        // Smoothly close the gap in the lead text paragraph
        const curWidth = (m.slotWidth * (1 - collapseFactor)).toFixed(1);
        const curMargin = (m.slotMargin * (1 - collapseFactor)).toFixed(1);
        p.slot.style.width = curWidth + 'px';
        p.slot.style.margin = `0 ${curMargin}px`;
        p.slot.style.opacity = (1 - collapseFactor).toFixed(2);
      });
    }

    if (lenis) {
      lenis.on('scroll', update);
    } else {
      let isTicking = false;
      window.addEventListener('scroll', function () {
        if (!isTicking) {
          window.requestAnimationFrame(function () {
            update();
            isTicking = false;
          });
          isTicking = true;
        }
      }, { passive: true });
    }

    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    // Initial setup after brief layout settle
    setTimeout(measure, 120);
    setTimeout(measure, 600);
  }

  initTeamImagesScrollTransition();

  // 6b. Scroll-Driven Text Progressive Color Fill (Muted Gray -> Solid Black)
  function initScrollTextFill() {
    const leadElem = document.querySelector('.about-overview-lead');
    if (!leadElem) return;

    // Process nodes to wrap individual words into spans while preserving inline slots
    function prepareWords(container) {
      const childNodes = Array.from(container.childNodes);
      const wordSpans = [];

      childNodes.forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (!text.trim()) return;

          const fragment = document.createDocumentFragment();
          const tokens = text.split(/(\s+)/);

          tokens.forEach(function (token) {
            if (/\S/.test(token)) {
              const span = document.createElement('span');
              span.className = 'scroll-fill-word';
              span.textContent = token;
              fragment.appendChild(span);
              wordSpans.push(span);
            } else if (token) {
              fragment.appendChild(document.createTextNode(token));
            }
          });

          container.replaceChild(fragment, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList.contains('about-inline-slot')) {
            // Keep inline slots intact
            return;
          } else {
            const subSpans = prepareWords(node);
            wordSpans.push.apply(wordSpans, subSpans);
          }
        }
      });

      return wordSpans;
    }

    const words = prepareWords(leadElem);
    if (!words.length) return;

    function updateFill() {
      const rect = leadElem.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Smooth scroll range from entering viewport to upper reading line
      const startY = windowHeight * 0.85;
      const endY = windowHeight * 0.20;
      const scrollRange = startY - endY;

      const rawProgress = (startY - rect.top) / scrollRange;
      const progress = Math.max(0, Math.min(1, rawProgress));

      const totalWords = words.length;
      const spread = 0.06; // continuous word transition window

      words.forEach(function (wordSpan, index) {
        const wordStart = (index / totalWords) * (1 - spread);
        const wordEnd = wordStart + spread;

        let wordProgress = 0;
        if (progress >= wordEnd) {
          wordProgress = 1;
        } else if (progress <= wordStart) {
          wordProgress = 0;
        } else {
          wordProgress = (progress - wordStart) / spread;
        }

        // Smoothly interpolate from muted 0.22 to bold black 1.00
        const opacity = (0.22 + 0.78 * wordProgress).toFixed(3);
        wordSpan.style.opacity = opacity;
      });
    }

    if (lenis) {
      lenis.on('scroll', updateFill);
    } else {
      let isTicking = false;
      window.addEventListener('scroll', function () {
        if (!isTicking) {
          window.requestAnimationFrame(function () {
            updateFill();
            isTicking = false;
          });
          isTicking = true;
        }
      }, { passive: true });
    }

    window.addEventListener('resize', updateFill);
    updateFill();
  }

  initScrollTextFill();

  // 7. Active Smooth Parallax Effect on About Us Image
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

  // 7.1 Pinned Horizontal Scroll for Modern Solutions & Benefits Section
  function initStickyBenefitsScroll() {
    const $section = $('#benefits');
    const $track = $('#benefitsSliderTrack');
    const $wrapper = $('#benefitsSliderWrapper');
    const $progressBar = $('#benefitsProgressBar');

    if (!$section.length || !$track.length || !$wrapper.length) return;

    const trackEl = $track.get(0);
    const wrapperEl = $wrapper.get(0);
    const sectionEl = $section.get(0);
    const progressEl = $progressBar.length ? $progressBar.get(0) : null;

    function getMaxHorizontal() {
      return Math.max(0, trackEl.scrollWidth - wrapperEl.clientWidth);
    }

    function updateBenefitsScroll() {
      const rect = sectionEl.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollableDistance = rect.height - windowHeight;

      if (scrollableDistance <= 0) {
        trackEl.style.transform = 'translate3d(0px, 0px, 0px)';
        if (progressEl) progressEl.style.width = '20%';
        return;
      }

      // When the top of the section reaches or passes the top of viewport
      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
      const maxHorizontal = getMaxHorizontal();
      const currentX = progress * maxHorizontal;

      trackEl.style.transform = `translate3d(-${currentX.toFixed(2)}px, 0px, 0px)`;

      if (progressEl) {
        const fillPercent = 20 + progress * 80;
        progressEl.style.width = `${fillPercent.toFixed(1)}%`;
      }
    }

    if (lenis) {
      lenis.on('scroll', updateBenefitsScroll);
    } else {
      let isTicking = false;
      window.addEventListener('scroll', function () {
        if (!isTicking) {
          window.requestAnimationFrame(function () {
            updateBenefitsScroll();
            isTicking = false;
          });
          isTicking = true;
        }
      }, { passive: true });
    }

    window.addEventListener('resize', updateBenefitsScroll);
    // Initial call
    setTimeout(updateBenefitsScroll, 100);
  }

  initStickyBenefitsScroll();

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

  // 10. Style Showcase Filter & Single-Scroll Smooth Cards Animation
  function initStyleShowcase() {
    const $tabs = $('.filter-pill-btn');
    const section = document.getElementById('showcase');
    const track = document.getElementById('styleShowcaseTrack');
    const outer = document.querySelector('.style-wine-triptych-track-outer');

    $tabs.on('click', function () {
      $tabs.removeClass('active');
      $(this).addClass('active');

      const filter = $(this).attr('data-filter');
      const $items = $('.wine-triptych-item');
      if (!filter || filter === 'all') {
        $items.css({ opacity: '1', transform: 'scale(1)' });
      } else {
        $items.each(function () {
          const category = $(this).attr('data-category');
          if (category === filter) {
            $(this).css({ opacity: '1', transform: 'scale(1)' });
          } else {
            $(this).css({ opacity: '0.35', transform: 'scale(0.95)' });
          }
        });
      }
    });

    if (!section || !track || !outer) return;

    let targetX = 0;
    let currentX = 0;
    let isRunning = false;
    let isSingleScrollAnimating = false;

    function getMaxTranslateX() {
      return Math.max(0, track.scrollWidth - outer.clientWidth);
    }

    function calculateTarget() {
      if (isSingleScrollAnimating) return;

      const secRect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      const totalScrollable = section.offsetHeight - windowHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -secRect.top;
      let progress = currentScroll / totalScrollable;
      progress = Math.max(0, Math.min(1, progress));

      const maxTranslateX = getMaxTranslateX();
      if (maxTranslateX <= 0) return;

      targetX = - (progress * maxTranslateX);

      if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(renderLoop);
      }
    }

    function renderLoop() {
      const delta = targetX - currentX;

      if (Math.abs(delta) < 0.05) {
        currentX = targetX;
        track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
        isRunning = false;
        return;
      }

      currentX += delta * 0.07;
      track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
      requestAnimationFrame(renderLoop);
    }

    if (lenis) {
      lenis.on('scroll', calculateTarget);
    }
    window.addEventListener('scroll', calculateTarget, { passive: true });
    window.addEventListener('resize', calculateTarget, { passive: true });

    calculateTarget();
    setTimeout(calculateTarget, 150);
  }

  initStyleShowcase();

  // 10.2 Interactive 3D 360-Degree Mouse Hover Parallax for Hero Banner Background
  function init3DBannerHover() {
    const banner = document.getElementById('heroMountainWrap') || document.querySelector('.hero-single-banner-wrap');
    const bgImg = document.getElementById('heroMountainImg') || document.querySelector('.hero-mountain-img');

    if (!banner || !bgImg) return;

    let bounds = banner.getBoundingClientRect();

    function updateBounds() {
      bounds = banner.getBoundingClientRect();
    }
    window.addEventListener('resize', updateBounds, { passive: true });
    window.addEventListener('scroll', updateBounds, { passive: true });

    banner.addEventListener('mousemove', function (e) {
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      // Normalized coordinates from center (-1.0 to +1.0)
      const percentX = (mouseX / bounds.width - 0.5) * 2;
      const percentY = (mouseY / bounds.height - 0.5) * 2;

      // Horizontal left-right movement only
      const translateX = percentX * 22; // Smooth 22px left/right move

      if (window.gsap) {
        gsap.to(bgImg, {
          x: translateX,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1.05,
          ease: "power2.out",
          duration: 0.9,
          overwrite: "auto"
        });
      } else {
        bgImg.style.transform = `translate(-50%, -50%) translate3d(${translateX.toFixed(2)}px, 0, 0) scale(1.05)`;
      }
    });

    banner.addEventListener('mouseleave', function () {
      if (window.gsap) {
        gsap.to(bgImg, {
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1.02,
          ease: "power3.out",
          duration: 1.1,
          overwrite: "auto"
        });
      } else {
        bgImg.style.transform = `translate(-50%, -50%) translate3d(0, 0, 0) scale(1.02)`;
      }
    });
  }

  init3DBannerHover();

  // 10.1 Interactive Scroll Stacking Effect for Craft Beer Cards
  function initBeerStackScroll() {
    const $cards = $('.beer-stack-card');
    if ($cards.length < 2) return;

    function updateStacking() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      $cards.each(function (index) {
        if (index === $cards.length - 1) return; // Top/last card does not scale down

        const nextCard = $cards.get(index + 1);
        if (!nextCard) return;

        const nextRect = nextCard.getBoundingClientRect();

        // Progress of NEXT card sliding over THIS card (0 = next card entering viewport bottom, 1 = next card at top)
        const progress = Math.min(Math.max((windowHeight - nextRect.top) / windowHeight, 0), 1);

        // Smooth brightness tinting (scaling removed per design)
        const brightness = 1 - progress * 0.3;

        this.style.transform = 'none';
        this.style.filter = `brightness(${brightness.toFixed(3)})`;
      });
    }

    if (lenis) {
      lenis.on('scroll', updateStacking);
    } else {
      let isTicking = false;
      window.addEventListener('scroll', function () {
        if (!isTicking) {
          window.requestAnimationFrame(function () {
            updateStacking();
            isTicking = false;
          });
          isTicking = true;
        }
      }, { passive: true });
    }

    window.addEventListener('resize', updateStacking);
    setTimeout(updateStacking, 100);
  }

  initBeerStackScroll();

  // 11. Interactive Rising Effervescent Bubbles System for Footer
  function initFooterBubbles() {
    const canvas = document.getElementById('footerBubblesCanvas');
    const footer = document.querySelector('.site-footer');
    if (!canvas || !footer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let bubbles = [];
    let animationFrameId = null;
    let isVisible = true;
    let mouse = { x: -1000, y: -1000, active: false };

    function resize() {
      const rect = footer.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || 450;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createBubble(isInitial) {
      const r = Math.random();
      // Radius distribution: mostly fine effervescent beads (2-7px) with occasional lush statement bubbles (8-18px)
      let radius;
      if (r < 0.6) {
        radius = 2 + Math.random() * 4;
      } else if (r < 0.9) {
        radius = 6 + Math.random() * 6;
      } else {
        radius = 12 + Math.random() * 8;
      }

      // Buoyancy: larger bubbles rise faster with realistic fluid dynamics
      const baseSpeed = 0.6 + (radius * 0.12) + Math.random() * 0.8;
      const startY = isInitial ? Math.random() * height : height + radius + Math.random() * 50;

      // Color variation: Crystal White with subtle Warm Champagne Gold accents
      const isGold = Math.random() > 0.45;

      return {
        x: Math.random() * width,
        y: startY,
        radius: radius,
        baseRadius: radius,
        speedY: baseSpeed,
        swaySpeed: 0.015 + Math.random() * 0.025,
        swayAmp: 0.8 + (radius * 0.18) + Math.random() * 1.5,
        swayOffset: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.25 + Math.random() * 0.55,
        isGold: isGold,
        wobble: 0
      };
    }

    function initParticles() {
      bubbles = [];
      // Dynamic count based on screen width
      const bubbleCount = width < 768 ? 35 : 65;
      for (let i = 0; i < bubbleCount; i++) {
        bubbles.push(createBubble(true));
      }
    }

    function drawBubble(b) {
      // Calculate horizontal wobble
      b.phase += b.swaySpeed;
      const swayX = Math.sin(b.phase + b.swayOffset) * b.swayAmp;
      const curX = b.x + swayX;
      const curY = b.y;
      const rad = b.radius;

      if (curY < -rad * 2 || curY > height + rad * 2) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(b.opacity, 0.9));

      // 1. Soft Outer Atmosphere Glow
      const glowGrad = ctx.createRadialGradient(curX, curY, rad * 0.2, curX, curY, rad * 1.35);
      if (b.isGold) {
        glowGrad.addColorStop(0, 'rgba(235, 205, 120, 0.25)');
        glowGrad.addColorStop(0.7, 'rgba(212, 175, 55, 0.1)');
        glowGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
        glowGrad.addColorStop(0.7, 'rgba(200, 220, 255, 0.08)');
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(curX, curY, rad * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Translucent Glass Shell
      const shellGrad = ctx.createRadialGradient(
        curX - rad * 0.35, curY - rad * 0.35, rad * 0.1,
        curX, curY, rad
      );
      if (b.isGold) {
        shellGrad.addColorStop(0, 'rgba(255, 250, 220, 0.45)');
        shellGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.15)');
        shellGrad.addColorStop(0.9, 'rgba(180, 140, 40, 0.35)');
        shellGrad.addColorStop(1, 'rgba(255, 235, 160, 0.85)');
      } else {
        shellGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
        shellGrad.addColorStop(0.5, 'rgba(220, 235, 255, 0.12)');
        shellGrad.addColorStop(0.9, 'rgba(160, 195, 240, 0.35)');
        shellGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
      }

      ctx.beginPath();
      ctx.arc(curX, curY, rad, 0, Math.PI * 2);
      ctx.fillStyle = shellGrad;
      ctx.fill();

      // 3. Crisp Glass Border Rim
      ctx.strokeStyle = b.isGold ? 'rgba(255, 235, 160, 0.7)' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = Math.max(0.6, rad * 0.08);
      ctx.stroke();

      // 4. Specular Gleam / Light Highlight (Top-Left)
      const highlightX = curX - rad * 0.38;
      const highlightY = curY - rad * 0.38;
      const highlightRad = Math.max(0.8, rad * 0.28);

      ctx.beginPath();
      ctx.arc(highlightX, highlightY, highlightRad, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fill();

      // Secondary micro gleam
      if (rad > 6) {
        ctx.beginPath();
        ctx.arc(curX + rad * 0.3, curY + rad * 0.32, rad * 0.14, 0, Math.PI * 2);
        ctx.fillStyle = b.isGold ? 'rgba(255, 230, 140, 0.65)' : 'rgba(255, 255, 255, 0.65)';
        ctx.fill();
      }

      ctx.restore();
    }

    function startAnimation() {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    function stopAnimation() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    function animate() {
      if (!isVisible) {
        stopAnimation();
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        // Move upward
        b.y -= b.speedY;

        // Subtle mouse repulsion / interactive drift
        if (mouse.active) {
          const dx = b.x - mouse.x;
          const dy = b.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && dist > 0) {
            const force = (100 - dist) / 100;
            b.x += (dx / dist) * force * 1.5;
            b.y -= force * 1.2;
          }
        }

        // Keep inside bounds horizontally
        if (b.x < 0) b.x = width;
        if (b.x > width) b.x = 0;

        // Reset if reached above top
        if (b.y < -b.radius * 2) {
          const fresh = createBubble(false);
          bubbles[i] = fresh;
        }

        drawBubble(b);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    // Interactive mouse spawn on hover
    footer.addEventListener('mousemove', function (e) {
      const rect = footer.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;

      // Occasionally add sparkling micro-effervescence near cursor
      if (Math.random() < 0.25 && bubbles.length < 90) {
        const microBubble = createBubble(false);
        microBubble.x = mouse.x + (Math.random() - 0.5) * 30;
        microBubble.y = mouse.y + (Math.random() - 0.5) * 20;
        microBubble.radius = 1.5 + Math.random() * 3.5;
        microBubble.speedY = 1.2 + Math.random() * 1.8;
        bubbles.push(microBubble);
        if (bubbles.length > 95) bubbles.shift();
      }
    });

    footer.addEventListener('mouseleave', function () {
      mouse.active = false;
    });

    // Touch support for mobile devices
    footer.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) {
        const rect = footer.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }
    }, { passive: true });

    footer.addEventListener('touchend', function () {
      mouse.active = false;
    });

    // IntersectionObserver to pause rendering when footer is not in view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(footer);
    }

    window.addEventListener('resize', function () {
      resize();
    });

    resize();
    initParticles();
    startAnimation();
  }

  initFooterBubbles();

  // 12. Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      once: true,
      offset: 50,
      delay: 0
    });

    window.addEventListener('resize', function () {
      AOS.refresh();
    });
    window.addEventListener('load', function () {
      AOS.refresh();
    });
  }

  // 13. Interactive Button Text Wave Effect on Hover
  function initButtonWaveEffect() {
    const selectors = [
      '.btn-nav-contact',
      '.btn-hero-solid',
      '.btn-hero-outline',
      '.btn-lime-pill',
      '.btn-shop-pill',
      '.flavour-cta-btn',
      '.zoom-banner-btn',
      '.product-news-cta-btn',
      '.blogs-view-all-btn',
      '.btn-contact-submit',
      '.footer-newsletter-btn',
      '.filter-pill-btn',
      '.btn-wave',
      '.btn'
    ].join(', ');

    $(selectors).each(function () {
      const $btn = $(this);
      if ($btn.hasClass('has-wave-effect')) return;
      $btn.addClass('has-wave-effect');

      function processNode(node, counter) {
        const childNodes = Array.from(node.childNodes);
        childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const rawVal = child.nodeValue || '';
            const text = rawVal.replace(/\s+/g, ' ').trim();
            if (text.length > 0) {
              const fragment = document.createDocumentFragment();
              for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                const span = document.createElement('span');
                span.className = 'wave-char';
                if (ch === ' ') {
                  span.textContent = ' ';
                  span.classList.add('wave-space');
                } else {
                  span.textContent = ch;
                }
                span.style.setProperty('--char-idx', counter.val++);
                fragment.appendChild(span);
              }
              node.replaceChild(fragment, child);
            } else if (rawVal.length > 0) {
              node.removeChild(child);
            }
          } else if (child.nodeType === Node.ELEMENT_NODE && !$(child).is('i, svg, img, input, textarea')) {
            processNode(child, counter);
          }
        });
      }

      const counter = { val: 0 };
      processNode(this, counter);
    });

    // Replay wave animation crisply on every hover entry
    $(document).on('mouseenter', '.has-wave-effect, .btn-wave', function () {
      const chars = this.querySelectorAll('.wave-char');
      if (!chars.length) return;
      chars.forEach((c) => {
        c.style.animation = 'none';
      });
      void this.offsetWidth; // Force DOM reflow
      chars.forEach((c) => {
        c.style.animation = '';
      });
    });
  }

  initButtonWaveEffect();

  // 14. Multi-Video Hero Banner Slider (Manual Arrow, Indicator Dot & Swipe Controls)
  function initHeroVideoSlider() {
    const $sliderWrap = $('#heroVideoSlider');
    if (!$sliderWrap.length) return;

    const $track = $sliderWrap.find('.hero-slider-track');
    const $slides = $sliderWrap.find('.hero-video-slide');
    const totalSlides = $slides.length;
    if (!totalSlides) return;

    let currentSlide = 0;

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;

      currentSlide = index;

      const translatePct = -(currentSlide * 25);
      $track.css('transform', `translate3d(${translatePct}%, 0, 0)`);

      $slides.removeClass('active').eq(currentSlide).addClass('active');
      $('.hero-slider-dot').removeClass('active').eq(currentSlide).addClass('active');
      $('#heroSlideNum').text(String(currentSlide + 1).padStart(2, '0'));
    }

    // Arrow button controls
    $('.hero-prev-arrow').on('click', function (e) {
      e.preventDefault();
      goToSlide(currentSlide - 1);
    });

    $('.hero-next-arrow').on('click', function (e) {
      e.preventDefault();
      goToSlide(currentSlide + 1);
    });

    // Indicator dot controls
    $(document).on('click', '.hero-slider-dot', function (e) {
      e.preventDefault();
      const targetIndex = parseInt($(this).attr('data-slide'), 10);
      if (!isNaN(targetIndex)) {
        goToSlide(targetIndex);
      }
    });

    // Mouse Drag / Touch Swipe Navigation
    let startX = 0;
    let isDragging = false;

    $sliderWrap.on('touchstart mousedown', function (e) {
      startX = e.type === 'touchstart' ? e.originalEvent.touches[0].clientX : e.clientX;
      isDragging = true;
    });

    $sliderWrap.on('touchend mouseup', function (e) {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.type === 'touchend' ? e.originalEvent.changedTouches[0].clientX : e.clientX;
      const diffX = startX - endX;

      if (Math.abs(diffX) > 40) {
        if (diffX > 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
      }
    });

    goToSlide(0);
  }

  initHeroVideoSlider();
});


