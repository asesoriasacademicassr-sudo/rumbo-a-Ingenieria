const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
window.addEventListener('load',()=>setTimeout(()=>$('#splash').classList.add('hide'),650));
const menu=$('.menu-button'),nav=$('.nav'); menu.addEventListener('click',()=>{const o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',o)}); $$('.nav a').forEach(a=>a.onclick=()=>nav.classList.remove('open'));
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.1}); $$('.reveal').forEach(e=>observer.observe(e));
$('#theme-toggle').onclick=()=>{document.body.classList.toggle('light');$('#theme-toggle').textContent=document.body.classList.contains('light')?'☾':'☀'};
const topBtn=$('#back-to-top'); addEventListener('scroll',()=>topBtn.classList.toggle('show',scrollY>500)); topBtn.onclick=()=>scrollTo({top:0,behavior:'smooth'});

const canvas=$('#stars'),ctx=canvas.getContext('2d');let stars=[];function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;stars=Array.from({length:Math.min(100,Math.floor(innerWidth/12))},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:(Math.random()*1.1+.2)*devicePixelRatio,a:Math.random()*.45+.12,s:(Math.random()*.012+.003)*devicePixelRatio}))}function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);stars.forEach(s=>{s.y+=s.s;if(s.y>canvas.height)s.y=0;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${s.a})`;ctx.fill()});requestAnimationFrame(draw)}addEventListener('resize',resize);resize();draw();

$$('[data-count]').forEach(el=>{const target=+el.dataset.count;let n=0;const t=setInterval(()=>{n+=Math.max(1,Math.ceil(target/40));if(n>=target){n=target;clearInterval(t)}el.textContent=n},35)});

const questions=[
{subject:'Matemáticas',text:'¿Cuál es el resultado de 18 + 27?',options:['35','45','55','65'],answer:1},
{subject:'Matemáticas',text:'¿Qué fracción equivale a 0.5?',options:['1/4','1/2','2/3','3/4'],answer:1},
{subject:'Matemáticas',text:'Si 3x = 21, ¿cuánto vale x?',options:['6','7','8','9'],answer:1},
{subject:'Matemáticas',text:'¿Cuál es el área de un rectángulo de 5 × 4?',options:['9','18','20','25'],answer:2},
{subject:'Física',text:'¿Qué magnitud mide qué tan rápido cambia la posición?',options:['Masa','Velocidad','Temperatura','Energía'],answer:1},
{subject:'Física',text:'¿Qué fuerza atrae los objetos hacia la Tierra?',options:['Magnética','Elástica','Gravedad','Fricción'],answer:2},
{subject:'Física',text:'La unidad de fuerza en el SI es:',options:['Joule','Watt','Newton','Pascal'],answer:2},
{subject:'Inglés',text:'Choose the correct option: She ___ a student.',options:['am','is','are','be'],answer:1},
{subject:'Inglés',text:'What is the opposite of “difficult”?',options:['Easy','Strong','Long','Fast'],answer:0},
{subject:'Inglés',text:'Choose the correct translation: “Yo estudio todos los días”.',options:['I studied every day','I study every day','I am study every day','I studies every day'],answer:1}
];
let qi=0,answers=Array(questions.length).fill(null);const stage=$('#question-stage'),next=$('#next-question'),prev=$('#prev-question');
function renderQuestion(){const q=questions[qi];stage.innerHTML=`<p class="eyebrow">${q.subject}</p><h3 class="question-title">${q.text}</h3><div class="options">${q.options.map((o,i)=>`<label class="option"><input type="radio" name="q" value="${i}" ${answers[qi]===i?'checked':''}><span>${String.fromCharCode(65+i)}) ${o}</span></label>`).join('')}</div>`;$('#question-counter').textContent=`Pregunta ${qi+1} de ${questions.length}`;const p=Math.round((qi+1)/questions.length*100);$('#progress-bar').style.width=p+'%';$('#progress-ring').style.background=`radial-gradient(circle,#0b1f3a 58%,transparent 59%),conic-gradient(var(--blue) ${p}%,rgba(148,163,184,.14) 0)`;$('#progress-ring strong').textContent=p+'%';prev.disabled=qi===0;next.textContent=qi===questions.length-1?'Ver resultados':'Siguiente'}
stage.addEventListener('change',e=>{if(e.target.name==='q')answers[qi]=+e.target.value});prev.onclick=()=>{if(qi>0){qi--;renderQuestion()}};next.onclick=()=>{if(answers[qi]===null){alert('Selecciona una respuesta para continuar.');return}if(qi<questions.length-1){qi++;renderQuestion()}else showReport()};
function showReport(){const scores={Matemáticas:[0,0],Física:[0,0],Inglés:[0,0]};questions.forEach((q,i)=>{scores[q.subject][1]++;if(answers[i]===q.answer)scores[q.subject][0]++});const values=Object.entries(scores).map(([name,[ok,total]])=>({name,p:Math.round(ok/total*100)}));const strongest=[...values].sort((a,b)=>b.p-a.p)[0],weakest=[...values].sort((a,b)=>a.p-b.p)[0],overall=Math.round(values.reduce((s,v)=>s+v.p,0)/values.length);let level=overall>=80?'Avanzado':overall>=60?'Intermedio':'Fundamentos';$('#diagnostic-form').hidden=true;$('.diagnostic-side').hidden=true;const r=$('#diagnostic-report');r.hidden=false;r.innerHTML=`<p class="eyebrow">Reporte de orientación</p><h3>Resultado general: ${overall}%</h3><div class="score-grid">${values.map(v=>`<div><span>${v.name}</span><strong>${v.p}%</strong></div>`).join('')}</div><p><b>Nivel sugerido:</b> ${level}</p><p><b>Mayor fortaleza:</b> ${strongest.name}</p><p><b>Área recomendada para reforzar:</b> ${weakest.name}</p><p>Recomendación: comenzar con una clase ${overall<65?'Profunda':'Estándar'} y realizar la EIA para crear una ruta personalizada.</p><button class="button secondary" id="restart-test">Repetir orientación</button>`;$('#restart-test').onclick=()=>{qi=0;answers.fill(null);r.hidden=true;$('#diagnostic-form').hidden=false;$('.diagnostic-side').hidden=false;renderQuestion()}}
renderQuestion();

const filters=$$('.filter'),cards=$$('.resource-card');filters.forEach(b=>b.onclick=()=>{filters.forEach(x=>x.classList.remove('active'));b.classList.add('active');const f=b.dataset.filter;cards.forEach(c=>c.hidden=f!=='all'&&c.dataset.category!==f)});$('#resource-search').oninput=e=>{const t=e.target.value.toLowerCase();cards.forEach(c=>c.hidden=!c.textContent.toLowerCase().includes(t))};

$('#contact-form').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.target);const text=[
'Hola, quiero solicitar información para una asesoría.','',
'━━━━━━━━━━━━━━━━━━━━','📘 RUMBO A INGENIERÍA','SOLICITUD DE INFORMACIÓN','━━━━━━━━━━━━━━━━━━━━','',
'👤 DATOS DEL ESTUDIANTE',`Nombre: ${d.get('nombre')}`,`Grado escolar: ${d.get('grado')}`,'',
'📚 ASESORÍA SOLICITADA',`Materia: ${d.get('materia')}`,`Modalidad: ${d.get('modalidad')||'Solicito recomendación'}`,`Horario preferido: ${d.get('horario')||'Por definir'}`,'',
'📝 INFORMACIÓN ADICIONAL',d.get('mensaje')||'Sin mensaje adicional','',
'Gracias. Quedo atento(a) a su respuesta.'
].join('\n');open(`https://wa.me/528713251593?text=${encodeURIComponent(text)}`,'_blank','noopener')});

const athena=$('#athena');$('#athena-toggle').onclick=()=>athena.classList.toggle('open');$('#athena-close').onclick=()=>athena.classList.remove('open');function answer(q){q=q.toLowerCase();if(q.includes('materia'))return'Ofrecemos Matemáticas, Física e Inglés para primaria y secundaria.';if(q.includes('precio')||q.includes('cuestan'))return'Primaria: $80 la clase Estándar y $100 la Profunda. Secundaria: $120 y $150.';if(q.includes('agendo')||q.includes('agendar'))return'Puedes completar el formulario de contacto o escribir al 871 325 1593.';if(q.includes('horario'))return'Atendemos de lunes a sábado de 5:00 a 9:00 pm y domingo de 2:00 a 8:00 pm.';return'Puedo ayudarte con materias, precios, horarios, modalidades y la primera clase gratuita.'}function addMsg(text,cls){const p=document.createElement('p');p.className=cls;p.textContent=text;$('#athena-messages').append(p);$('#athena-messages').scrollTop=9999}$$('.quick-questions button').forEach(b=>b.onclick=()=>{addMsg(b.textContent,'user');setTimeout(()=>addMsg(answer(b.textContent),'bot'),250)});$('#athena-form').onsubmit=e=>{e.preventDefault();const i=$('#athena-input'),q=i.value.trim();if(!q)return;addMsg(q,'user');i.value='';setTimeout(()=>addMsg(answer(q),'bot'),250)};
