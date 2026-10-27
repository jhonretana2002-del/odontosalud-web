'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const helpToggle = document.querySelector('.help-toggle');
const helpPanel = document.querySelector('#help-panel');
const helpClose = document.querySelector('.help-close');

function setMenu(open) {
  mobileNav.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

menuToggle.addEventListener('click', () => setMenu(mobileNav.hidden));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
const desktopMedia = window.matchMedia('(min-width: 761px)');
desktopMedia.addEventListener('change', event => {
  if (event.matches) setMenu(false);
});

function setHelp(open) {
  helpPanel.hidden = !open;
  helpToggle.setAttribute('aria-expanded', String(open));
  helpToggle.setAttribute('aria-label', open ? 'Cerrar ayuda de OdontoSalud' : 'Abrir ayuda de OdontoSalud');
  if (open) helpClose.focus();
  else helpToggle.focus();
}

helpToggle.addEventListener('click', () => setHelp(helpPanel.hidden));
helpClose.addEventListener('click', () => setHelp(false));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!helpPanel.hidden) setHelp(false);
  if (!mobileNav.hidden) {
    setMenu(false);
    menuToggle.focus();
  }
});

const topics = {
  cita: {
    answer: 'Escribe al WhatsApp 8844-5279 para consultar disponibilidad. El equipo confirma personalmente la fecha y la hora de tu cita.',
    message: 'Hola, quisiera consultar disponibilidad para una cita en OdontoSalud.',
    label: 'Consultar una cita'
  },
  estudio: {
    answer: 'Consulta con la clínica los estudios radiológicos disponibles y sus requisitos antes de tu visita. El equipo te orientará sobre cómo coordinar tu atención.',
    message: 'Hola, quisiera consultar los estudios radiológicos disponibles y sus requisitos.',
    label: 'Consultar radiología'
  },
  horario: {
    answer: 'Horario: lunes a viernes, de 8 a. m. a 6 p. m.; sábados, de 8 a. m. a 1 p. m. Consulta disponibilidad para tu cita antes de visitarnos.',
    message: 'Hola, quisiera confirmar el horario y la disponibilidad para una cita en OdontoSalud.',
    label: 'Confirmar disponibilidad'
  },
  ubicacion: {
    answer: 'Solicita la ubicación exacta por WhatsApp antes de salir. El equipo de OdontoSalud te compartirá las indicaciones para llegar.',
    message: 'Hola, ¿podrían compartirme la ubicación de OdontoSalud?',
    label: 'Solicitar ubicación'
  }
};

const answer = document.querySelector('#help-answer-text');
const contact = document.querySelector('#help-contact');
const topicButtons = document.querySelectorAll('[data-topic]');
topicButtons.forEach(button => button.addEventListener('click', () => {
  const topic = topics[button.dataset.topic];
  topicButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  answer.textContent = topic.answer;
  contact.href = 'https://wa.me/50688445279?text=' + encodeURIComponent(topic.message);
  contact.firstChild.textContent = topic.label + ' ';
}));

function initCareCarousel() {
  const section = document.querySelector('.care-carousel');
  if (!section || typeof EmblaCarousel !== 'function' || typeof EmblaCarouselAutoScroll !== 'function') return;

  const viewport = section.querySelector('.care-viewport');
  const slides = [...section.querySelectorAll('.care-slide')];
  const controls = section.querySelector('.care-controls');
  const pauseButton = section.querySelector('.care-pause');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const autoScroll = EmblaCarouselAutoScroll({
    speed: 0.65,
    startDelay: 1200,
    direction: 'forward',
    playOnInit: false,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
    stopOnFocusIn: true
  });
  const carousel = EmblaCarousel(viewport, { loop: true, align: 'start', dragFree: true }, [autoScroll]);
  const motion = carousel.plugins().autoScroll;
  let manuallyPaused = false;

  slides.forEach(slide => {
    slide.tabIndex = 0;
    const selectSlide = () => slides.forEach(item => item.classList.toggle('is-selected', item === slide));
    slide.addEventListener('focusin', selectSlide);
    slide.addEventListener('click', selectSlide);
  });

  controls.hidden = false;
  const moveWithControl = move => {
    const resumeAfterMove = !manuallyPaused && !reducedMotion.matches && !document.hidden;
    motion.stop();
    window.requestAnimationFrame(() => {
      move();
      if (resumeAfterMove) motion.play(1400);
    });
  };
  section.querySelector('.care-prev').addEventListener('click', () => moveWithControl(() => carousel.scrollPrev()));
  section.querySelector('.care-next').addEventListener('click', () => moveWithControl(() => carousel.scrollNext()));

  const syncMotion = () => {
    pauseButton.hidden = reducedMotion.matches;
    if (manuallyPaused || reducedMotion.matches || document.hidden) motion.stop();
    else motion.play();
    pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
    pauseButton.setAttribute('aria-label', (manuallyPaused ? 'Reanudar' : 'Pausar') + ' recorrido de las instalaciones');
    pauseButton.innerHTML = manuallyPaused ? 'REANUDAR <span aria-hidden="true">▶</span>' : 'PAUSAR <span aria-hidden="true">Ⅱ</span>';
  };

  pauseButton.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    syncMotion();
  });
  carousel.on('autoScroll:play', () => {
    if (manuallyPaused || reducedMotion.matches || document.hidden) motion.stop();
  });
  document.addEventListener('visibilitychange', syncMotion);
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
}

initCareCarousel();
