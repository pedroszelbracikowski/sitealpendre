(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  // The film is optional: the responsive photograph remains the first paint.
  const heroVideo = $('.hero-video');
  const smallScreen = matchMedia('(max-width: 800px)');
  const connection = navigator.connection;
  let heroInView = true;
  const filmAllowed = () => !reduceMotion.matches && !connection?.saveData;
  const filmShouldPlay = () => filmAllowed() && heroInView && !document.hidden;
  function syncFilmPlayback() {
    if (!heroVideo.getAttribute('src')) return;
    if (!filmShouldPlay()) { heroVideo.pause(); return; }
    heroVideo.play().then(() => {
      if (!filmShouldPlay()) heroVideo.pause();
    }).catch(() => { $('.hero-photo').classList.remove('video-ready'); });
  }
  function loadHeroFilm() {
    if (!filmAllowed()) {
      heroVideo.pause();
      heroVideo.removeAttribute('src');
      heroVideo.load();
      heroVideo.hidden = true;
      $('.hero-photo').classList.remove('video-ready');
      return;
    }
    const source = smallScreen.matches ? 'assets/hero-mobile.mp4' : 'assets/hero-desktop.mp4';
    if (heroVideo.getAttribute('src') === source) { syncFilmPlayback(); return; }
    $('.hero-photo').classList.remove('video-ready');
    heroVideo.hidden = false;
    heroVideo.muted = true;
    heroVideo.src = source;
    heroVideo.load();
    syncFilmPlayback();
  }
  heroVideo.addEventListener('playing', () => {
    $('.hero-photo').classList.add('video-ready');
  });
  heroVideo.addEventListener('error', () => {
    heroVideo.hidden = true;
    $('.hero-photo').classList.remove('video-ready');
  });
  document.addEventListener('visibilitychange', syncFilmPlayback);
  reduceMotion.addEventListener('change', loadHeroFilm);
  smallScreen.addEventListener('change', loadHeroFilm);
  connection?.addEventListener('change', loadHeroFilm);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      syncFilmPlayback();
    }, {threshold: 0.05}).observe($('#inicio'));
  }
  loadHeroFilm();

  const opening = $('.opening');
  const menu = $('#navigation');
  const menuTrigger = $('.menu-trigger');
  const focusOrigins = new WeakMap();
  let menuAnimation;
  let menuClosing = false;
  function closeMenu(destination) {
    if (!menu.open || menuClosing) return;
    menuClosing = true;
    menuAnimation?.kill();
    const finish = () => {
      if (destination) focusOrigins.delete(menu);
      menu.close();
      menuClosing = false;
      if (destination) {
        const section = $(destination);
        history.pushState(null, '', destination);
        section?.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
        const heading = $('h2', section);
        heading?.setAttribute('tabindex', '-1');
        heading?.focus({ preventScroll: true });
      }
    };
    if (!hasGSAP || reduceMotion.matches) { finish(); return; }
    menuAnimation = gsap.timeline({ onComplete: finish })
      .to('.navigation-body,.navigation-bottom', { opacity: 0, y: -16, duration: .22, ease: 'power2.in' })
      .to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .55, ease: 'power3.inOut' }, '-=.1');
  }
  function closeDialog(dialog) { if (dialog === menu) closeMenu(); else dialog.close(); }
  function openDialog(dialog) {
    focusOrigins.set(dialog, document.activeElement);
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      if (!$('dialog[open]')) document.body.classList.remove('dialog-open');
      if (dialog === menu) menuTrigger.setAttribute('aria-expanded', 'false');
      focusOrigins.get(dialog)?.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog);
    });
    const close = $('.dialog-close', dialog);
    close?.addEventListener('click', () => closeDialog(dialog));
  });
  menuTrigger.addEventListener('click', () => {
    if (menu.open) return;
    openDialog(menu);
    menuTrigger.setAttribute('aria-expanded', 'true');
    menuAnimation?.kill();
    if (!hasGSAP || reduceMotion.matches) return;
    gsap.set('.navigation-body,.navigation-bottom', { clearProps: 'opacity,transform' });
    menuAnimation = gsap.timeline()
      .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .75, ease: 'power3.inOut' })
      .fromTo('.navigation nav a', { y: 42, opacity: 0 }, { y: 0, opacity: 1, stagger: .07, duration: .65, ease: 'power3.out' }, '-=.4')
      .fromTo('.navigation-photo', { clipPath: 'inset(0 0 100% 0)', scale: 1.06 }, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: .85, ease: 'power3.out' }, '-=.7');
  });
  menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  $('.close-menu').addEventListener('click', () => closeDialog(menu));
  $$('#navigation nav a').forEach(link => link.addEventListener('click', event => { event.preventDefault(); closeMenu(link.getAttribute('href')); }));
  reduceMotion.addEventListener('change', () => {
    menuAnimation?.kill();
    if (hasGSAP) gsap.set('#navigation,#navigation nav a,.navigation-photo,.navigation-body,.navigation-bottom', { clearProps: 'all' });
    if (menuClosing) { menuClosing = false; menu.close(); }
  });
  $('.credits-open').addEventListener('click', () => openDialog($('#credits-dialog')));

  const projectData = {
    mata: { title: 'Casa da Mata', category: '01 / Paisagem como presença', photo: 'encontro-mobile', alt: 'Biblioteca de madeira, mesa de livros e vegetação tropical na Casa da Mata', text: 'O estudo parte de uma pergunta: como habitar sem afastar a paisagem? Planos abertos e espaços de convivência voltados ao jardim exploram a continuidade entre interior e exterior. A madeira aproxima a escala da casa à escala do corpo; a biblioteca guarda as histórias de quem vive ali.', facts: [['Partido', 'Continuidade com a paisagem'], ['Estratégia', 'Aberturas e espaços de transição'], ['Matéria', 'Madeira e concreto']], next: 'patio' },
    patio: { title: 'Casa do Pátio', category: '02 / A sombra como abrigo', photo: 'varanda-mobile', alt: 'Mesa de madeira e cadeiras de palhinha sob uma cobertura na Casa do Pátio', text: 'Um centro de encontro, aberto à vegetação. O pátio organiza o convívio e aproxima os ambientes da luz e do ar. Beirais e áreas cobertas são explorados como transições entre a casa e o jardim: espaços para uma conversa longa, uma mesa posta e o ritmo de uma tarde brasileira.', facts: [['Partido', 'Convívio ao redor do pátio'], ['Estratégia', 'Sombra e transições cobertas'], ['Matéria', 'Madeira, palhinha e concreto']], next: 'clara' },
    clara: { title: 'Casa Clara', category: '03 / O cotidiano em primeiro plano', photo: 'cozinha-mobile', alt: 'Cozinha iluminada com ilha de pedra e janelas para o jardim na Casa Clara', text: 'A arquitetura nasce dos rituais cotidianos. Cozinhar, receber e estar junto orientam ambientes integrados e percursos descomplicados. A luz natural encontra superfícies claras, enquanto madeira e pedra dão presença aos pequenos gestos. O luxo está no espaço que a vida ganha.', facts: [['Partido', 'Integração dos espaços de viver'], ['Estratégia', 'Luz natural e percursos claros'], ['Matéria', 'Madeira e pedra natural']], next: 'mata' }
  };
  const projectDialog = $('#project-dialog');
  function setProject(key) {
    const project = projectData[key];
    $('#project-dialog-title').textContent = project.title;
    $('#project-dialog-category').textContent = project.category;
    $('#project-dialog-photo').src = `assets/${project.photo}.webp`;
    $('#project-dialog-photo').alt = project.alt;
    $('#project-dialog-text').textContent = project.text;
    $('#project-dialog-facts').replaceChildren(...project.facts.map(([term, value]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = term; dd.textContent = value;
      row.append(dt, dd); return row;
    }));
    $('.dialog-next').dataset.next = project.next;
    projectDialog.scrollTop = 0;
  }
  $$('.project-open').forEach(button => button.addEventListener('click', () => {
    setProject(button.dataset.project);
    openDialog(projectDialog);
  }));
  $('.dialog-next').addEventListener('click', event => {
    setProject(event.currentTarget.dataset.next);
    $('#project-dialog-title').focus({ preventScroll: true });
  });
  const track = $('#project-track');
  const slides = $$('.project-slide', track);
  const previous = $('.carousel-prev');
  const next = $('.carousel-next');
  let projectIndex = 0;
  let carouselFrame;
  function slideOffset(index) { return slides[index].offsetLeft - slides[0].offsetLeft; }
  function updateCarousel() {
    let closest = 0;
    slides.forEach((slide, index) => {
      if (Math.abs(track.scrollLeft - slideOffset(index)) < Math.abs(track.scrollLeft - slideOffset(closest))) closest = index;
    });
    previous.disabled = closest === 0;
    next.disabled = closest === slides.length - 1;
    if (closest === projectIndex) return;
    projectIndex = closest;
    $('#project-current').textContent = String(closest + 1).padStart(2, '0');
    $('.carousel-progress span').style.transform = `translateX(${closest * 100}%)`;
    $('#carousel-status').textContent = `${projectData[slides[closest].dataset.project].title}, ${closest + 1} de ${slides.length}.`;
    if (hasGSAP && !reduceMotion.matches) {
      gsap.fromTo($('.project-image img', slides[closest]), { scale: 1.045 }, { scale: 1, duration: .9, ease: 'power2.out', overwrite: true });
    }
  }
  function goToProject(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({ left: slideOffset(target), behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => goToProject(projectIndex - 1));
  next.addEventListener('click', () => goToProject(projectIndex + 1));
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(carouselFrame);
    carouselFrame = requestAnimationFrame(updateCarousel);
  }, { passive: true });
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    goToProject(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : projectIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });
  const carouselResize = new ResizeObserver(() => {
    track.scrollTo({ left: slideOffset(projectIndex), behavior: 'instant' });
    updateCarousel();
  });
  carouselResize.observe(track);
  const captions = { madeira: 'Madeira / Textura e acolhimento', pedra: 'Pedra / Frescor e permanência', verde: 'Verde / Sombra e presença' };
  const materialDetails = $$('.material-list details');
  const materialPhotos = $$('.material-photo');
  const materialCaption = $('#material-caption');
  const materialAnimations = new Map();
  let currentMaterialPhoto = materialPhotos.find(photo => photo.classList.contains('active'));
  let requestedMaterialPhoto = currentMaterialPhoto;
  let materialPhotoAnimation;
  let materialPhotoRequest = 0;

  function settleMaterialPhoto(target) {
    materialPhotos.forEach(photo => {
      const active = photo === target;
      photo.classList.toggle('active', active);
      photo.setAttribute('aria-hidden', String(!active));
      if (hasGSAP) {
        gsap.set(photo, { clearProps: 'opacity,visibility,clipPath,zIndex' });
        gsap.set($('img', photo), { scale: 1.04, yPercent: 0 });
      }
    });
    currentMaterialPhoto = target;
    materialCaption.textContent = captions[target.dataset.photo];
    if (hasGSAP) gsap.set(materialCaption, { clearProps: 'opacity,visibility,transform' });
  }

  function showMaterialPhoto(key) {
    const target = materialPhotos.find(photo => photo.dataset.photo === key);
    if (!target) return;
    requestedMaterialPhoto = target;
    const request = ++materialPhotoRequest;
    // Finish one reveal, then use only the latest requested image.
    if (materialPhotoAnimation) return;
    const image = $('img', target);
    image.loading = 'eager';
    const ready = image.complete && image.naturalWidth ? Promise.resolve() : image.decode().catch(() => {});
    ready.then(() => {
      if (request !== materialPhotoRequest || materialPhotoAnimation || !image.naturalWidth) return;
      if (!hasGSAP || reduceMotion.matches || target === currentMaterialPhoto) {
        settleMaterialPhoto(target);
        return;
      }
      const previous = currentMaterialPhoto;
      materialPhotos.forEach(photo => {
        photo.classList.toggle('active', photo === target);
        photo.setAttribute('aria-hidden', String(photo !== target));
      });
      // The previous photograph stays opaque underneath the rising mask.
      gsap.set(previous, { autoAlpha: 1, zIndex: 1, clipPath: 'inset(0% 0% 0% 0%)' });
      gsap.set(target, { autoAlpha: 1, zIndex: 2, clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(image, { scale: 1.12, yPercent: 6 });
      materialPhotoAnimation = gsap.timeline({ onComplete: () => {
        materialPhotoAnimation = null;
        settleMaterialPhoto(target);
        if (requestedMaterialPhoto !== target) showMaterialPhoto(requestedMaterialPhoto.dataset.photo);
      } })
        .to(target, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'power3.inOut' }, 0)
        .to(image, { scale: 1.04, yPercent: 0, duration: 1.2, ease: 'power3.out' }, 0)
        .to(materialCaption, { autoAlpha: 0, y: -4, duration: .16, ease: 'power1.out' }, 0)
        .call(() => { materialCaption.textContent = captions[key]; }, null, .16)
        .fromTo(materialCaption, { y: 6 }, { autoAlpha: 1, y: 0, duration: .38, ease: 'power2.out' }, .18);
    });
  }

  function finishMaterialExpansion(detail) {
    const panel = $('.material-panel', detail);
    detail.open = detail.classList.contains('is-expanded');
    panel.inert = false;
    if (hasGSAP) {
      gsap.set(panel, { clearProps: 'height' });
      gsap.set($('p', panel), { clearProps: 'opacity,visibility,transform' });
    }
    materialAnimations.delete(detail);
    if (hasGSAP && !materialAnimations.size) ScrollTrigger.refresh();
  }

  function setMaterialExpanded(detail, expanded, animate = true) {
    const panel = $('.material-panel', detail);
    const copy = $('p', panel);
    const wasOpen = detail.open;
    const height = wasOpen ? panel.getBoundingClientRect().height : 0;
    materialAnimations.get(detail)?.kill();
    detail.classList.toggle('is-expanded', expanded);
    $('summary', detail).setAttribute('aria-expanded', String(expanded));
    panel.setAttribute('aria-hidden', String(!expanded));
    panel.inert = !expanded;
    if (!animate || !hasGSAP || reduceMotion.matches) {
      finishMaterialExpansion(detail);
      return;
    }
    if (expanded) detail.open = true;
    gsap.set(panel, { height });
    if (expanded && !wasOpen) gsap.set(copy, { autoAlpha: 0, y: 8 });
    const animation = gsap.timeline({ onComplete: () => finishMaterialExpansion(detail) })
      .to(panel, { height: expanded ? panel.scrollHeight : 0, duration: expanded ? .68 : .58, ease: 'power2.inOut' }, 0)
      .to(copy, { autoAlpha: expanded ? 1 : 0, y: expanded ? 0 : -5, duration: expanded ? .42 : .2, ease: 'power2.out' }, expanded ? .1 : 0);
    materialAnimations.set(detail, animation);
  }

  $('.material-list').classList.add('is-enhanced');
  materialDetails.forEach(detail => {
    detail.classList.toggle('is-expanded', detail.open);
    $('summary', detail).setAttribute('aria-expanded', String(detail.open));
    $('.material-panel', detail).setAttribute('aria-hidden', String(!detail.open));
    $('summary', detail).addEventListener('click', event => {
      event.preventDefault();
      const expanded = !detail.classList.contains('is-expanded');
      if (expanded) materialDetails.forEach(other => {
        if (other !== detail && other.classList.contains('is-expanded')) setMaterialExpanded(other, false);
      });
      setMaterialExpanded(detail, expanded);
      if (expanded) showMaterialPhoto(detail.dataset.material);
    });
    // Keep native expansion, including browser find-in-page, synchronized.
    detail.addEventListener('toggle', () => {
      if (materialAnimations.has(detail) || detail.open === detail.classList.contains('is-expanded')) return;
      const expanded = detail.open;
      if (expanded) materialDetails.forEach(other => {
        if (other !== detail && other.classList.contains('is-expanded')) setMaterialExpanded(other, false, false);
      });
      setMaterialExpanded(detail, expanded, false);
      if (expanded) showMaterialPhoto(detail.dataset.material);
    });
  });
  settleMaterialPhoto(currentMaterialPhoto);
  function settleMaterialPanels() {
    Array.from(materialAnimations.entries()).forEach(([detail, animation]) => {
      animation.kill();
      finishMaterialExpansion(detail);
    });
  }
  addEventListener('resize', settleMaterialPanels);
  reduceMotion.addEventListener('change', () => {
    if (!reduceMotion.matches) return;
    settleMaterialPanels();
    ++materialPhotoRequest;
    materialPhotoAnimation?.kill();
    materialPhotoAnimation = null;
    settleMaterialPhoto(currentMaterialPhoto);
    showMaterialPhoto(requestedMaterialPhoto.dataset.photo);
  });

  let scheduled = false;
  const updateHeader = () => {
    const hero = $('.hero').getBoundingClientRect();
    const closing = $('.closing').getBoundingClientRect();
    $('.site-header').classList.toggle('solid', hero.bottom < 100 && closing.top > 80);
    scheduled = false;
  };
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateHeader); } }, { passive: true });
  updateHeader();

  if (!hasGSAP) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    $$('.reveal').forEach(element => gsap.from(element, { y: 38, opacity: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 93%', once: true } }));
    return () => { opening.hidden = true; };
  });
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.to('.hero-photo', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.threshold-image', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.threshold', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.threshold-heading', { y: 50 }, { y: -70, ease: 'none', scrollTrigger: { trigger: '.threshold', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.memory-photo', { y: 60, ease: 'none', scrollTrigger: { trigger: '.manifesto-lower', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  $$('img').forEach(img => { if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }); });

  let viewed = false;
  try { viewed = sessionStorage.getItem('alpendre-entered') === 'true'; } catch { /* Storage is optional. */ }
  if (!viewed && !reduceMotion.matches && scrollY < 30 && !location.hash) {
    opening.hidden = false;
    opening.setAttribute('aria-hidden', 'false');
    let intro;
    const finish = () => {
      intro?.kill();
      gsap.set('.hero-content,.hero-wordmark,.hero-photo', { clearProps: 'opacity,transform' });
      if (opening.contains(document.activeElement)) menuTrigger.focus({ preventScroll: true });
      opening.hidden = true;
      opening.setAttribute('aria-hidden', 'true');
      try { sessionStorage.setItem('alpendre-entered', 'true'); } catch { /* Storage is optional. */ }
      document.removeEventListener('keydown', onEscape);
    };
    const onEscape = event => { if (event.key === 'Escape') finish(); };
    document.addEventListener('keydown', onEscape);
    $('.skip-opening').addEventListener('click', finish, { once: true });
    intro = gsap.timeline({ onComplete: finish });
    intro.from('.opening-sign svg', { opacity: 0, y: 15, duration: .65 })
      .from('.opening-sign>span,.opening-sign p', { opacity: 0, y: 15, duration: .55, stagger: .1 }, '-=.35')
      .to('.opening-sign,.skip-opening', { opacity: 0, duration: .4 }, '+=.25')
      .to('.door-left', { xPercent: -101, duration: 1.25, ease: 'power3.inOut' }, '-=.1')
      .to('.door-right', { xPercent: 101, duration: 1.25, ease: 'power3.inOut' }, '<')
      .from('.hero-photo', { scale: 1.16, duration: 1.7, ease: 'power2.out' }, '<')
      .from('.hero-content', { y: 30, opacity: 0, duration: .8 }, '-=1')
      .from('.hero-wordmark', { y: 40, opacity: 0, duration: .9 }, '-=.75');
    setTimeout(() => { if (!opening.hidden) finish(); }, 5000);
  }
})();
