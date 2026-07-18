
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const form = document.querySelector('#contact-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const text = [
    'Hola, quiero solicitar información para una asesoría.',
    '━━━━━━━━━━━━━━━━━━━━',
    'SOLICITUD DE INFORMACIÓN',
    'Rumbo a Ingeniería',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '👤 DATOS DEL ESTUDIANTE',
    `• Nombre: ${data.get('nombre')}`,
    `• Grado escolar: ${data.get('grado')}`,
    '',
    '📚 ASESORÍA SOLICITADA',
    `• Materia: ${data.get('materia')}`,
    `• Modalidad: ${data.get('modalidad') || 'Solicito recomendación'}`,
    `• Horario preferido: ${data.get('horario') || 'Por definir'}`,
    '',
    '📝 INFORMACIÓN ADICIONAL',
    `${data.get('mensaje') || 'Sin mensaje adicional'}`,
    '',
    'Gracias. Quedo atento(a) a su respuesta.'
  ].join('\\n');

  window.open(`https://wa.me/528713251593?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

// Fondo espacial sutil: baja opacidad y movimiento muy lento.
const canvas = document.querySelector('#stars');
const ctx = canvas.getContext('2d');
let width = 0;
let height = 0;
let stars = [];

function resize() {
  width = canvas.width = window.innerWidth * devicePixelRatio;
  height = canvas.height = window.innerHeight * devicePixelRatio;
  stars = Array.from({length: Math.min(85, Math.floor(window.innerWidth / 15))}, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: (Math.random() * 1.1 + 0.3) * devicePixelRatio,
    speed: (Math.random() * 0.018 + 0.005) * devicePixelRatio,
    alpha: Math.random() * 0.45 + 0.18
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  for (const star of stars) {
    star.y += star.speed;
    if (star.y > height) {
      star.y = -4;
      star.x = Math.random() * width;
    }
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
draw();


// Calculadora de promedio
const gradeInput = document.querySelector('#grade-input');
const gradeButton = document.querySelector('#grade-button');
const gradeResult = document.querySelector('#grade-result');

if (gradeButton) {
  gradeButton.addEventListener('click', () => {
    const values = gradeInput.value
      .split(',')
      .map(value => Number(value.trim()))
      .filter(value => Number.isFinite(value) && value >= 0 && value <= 100);

    if (!values.length) {
      gradeResult.innerHTML = '<span>Escribe al menos una calificación válida entre 0 y 100.</span>';
      return;
    }

    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    let message = 'Podemos ayudarte a crear un plan para mejorar.';
    if (average >= 90) message = '¡Excelente trabajo! Sigue reforzando tus conocimientos.';
    else if (average >= 80) message = 'Vas muy bien. Con práctica puedes avanzar todavía más.';
    else if (average >= 70) message = 'Estás cerca. Conviene identificar los temas que necesitan refuerzo.';

    gradeResult.innerHTML = `<strong>Promedio: ${average.toFixed(1)}</strong><br><span>${message}</span>`;
  });
}

// Diagnóstico rápido de demostración
const diagnosticForm = document.querySelector('#quick-diagnostic');
const diagnosticResult = document.querySelector('#diagnostic-result');

if (diagnosticForm) {
  diagnosticForm.addEventListener('submit', event => {
    event.preventDefault();

    const data = new FormData(diagnosticForm);
    const answers = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];

    if (answers.some(name => !data.has(name))) {
      diagnosticResult.innerHTML = '<span>Responde las diez preguntas antes de ver tu orientación.</span>';
      return;
    }

    const math = ['q1','q2','q3','q4'].reduce((sum, q) => sum + Number(data.get(q)), 0);
    const physics = ['q5','q6','q7'].reduce((sum, q) => sum + Number(data.get(q)), 0);
    const english = ['q8','q9','q10'].reduce((sum, q) => sum + Number(data.get(q)), 0);

    const scores = [
      { name: 'Matemáticas', value: math / 4 },
      { name: 'Física', value: physics / 3 },
      { name: 'Inglés', value: english / 3 }
    ];

    const lowest = [...scores].sort((a, b) => a.value - b.value)[0];
    const total = math + physics + english;
    const percent = Math.round((total / 10) * 100);

    diagnosticResult.innerHTML = `
      <strong>Resultado general: ${percent}%</strong><br>
      <span>Área sugerida para reforzar primero: ${lowest.name}.</span><br>
      <span>Este resultado es orientativo. La EIA permite conocer al estudiante con mayor profundidad.</span>
    `;
  });
}
