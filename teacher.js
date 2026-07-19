
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY='rai_horizonte_v120',OLD='rai_horizonte_v110';
let data=JSON.parse(localStorage.getItem(KEY)||'null')||JSON.parse(localStorage.getItem(OLD)||'null'),teacher=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
setTimeout(()=>$('#teacherSplash').classList.add('hide'),1400);setTimeout(()=>$('#teacherSplash').remove(),2100);
if(!data){$('#teacherError').textContent='Abre primero el Panel Galileo para inicializar la plataforma.'}
else{
 data.teachers=data.teachers||[];data.resources=data.resources||[];
 $('#teacherSelect').innerHTML=data.teachers.filter(t=>t.status==='Activo').map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
 if(!data.teachers.length)$('#teacherError').textContent='Todavía no hay profesores registrados.';
}
function studentList(){return data.students.filter(s=>(teacher.studentIds||[]).includes(s.id))}
function attendance(s){const a=s.attendance||[],ok=a.filter(x=>String(x.value).toLowerCase().includes('asisti')).length;return a.length?Math.round(ok/a.length*100):0}
function grades(s){const n=(s.grades||[]).map(x=>Number(x.value)).filter(Number.isFinite);return n.length?(n.reduce((a,b)=>a+b,0)/n.length).toFixed(1):'—'}
$('#teacherLoginForm').onsubmit=e=>{e.preventDefault();teacher=data.teachers.find(t=>t.id===Number($('#teacherSelect').value)&&t.pin===$('#teacherPin').value.trim()&&t.status==='Activo');if(!teacher)return $('#teacherError').textContent='PIN incorrecto o acceso no disponible.';sessionStorage.setItem('teacher_session',teacher.id);openTeacher()};
const saved=Number(sessionStorage.getItem('teacher_session'));if(saved&&data?.teachers){teacher=data.teachers.find(t=>t.id===saved&&t.status==='Activo');if(teacher)openTeacher()}
function openTeacher(){
 $('#teacherLogin').classList.add('hidden');$('#teacherApp').classList.remove('hidden');$('#teacherName').textContent=teacher.name;$('#teacherInstitution').textContent=data.settings?.institution||'Rumbo a Ingeniería';renderTeacher();
}
function renderTeacher(){
 const students=studentList(),names=students.map(s=>s.name),classes=data.classes.filter(c=>names.includes(c.student)||c.teacher===teacher.name).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)),upcoming=classes.filter(c=>c.status==='Pendiente');
 $('#summary-teacher-page').innerHTML=`<div class="hero-card"><div><p class="eyebrow">Horizonte Docente</p><h1>Hola, ${esc(teacher.name)}</h1><p>${esc(teacher.subject)} · ${esc(teacher.availability||'Disponibilidad no registrada')}</p></div></div><div class="portal-grid"><article class="card metric"><span>Alumnos asignados</span><b>${students.length}</b></article><article class="card metric"><span>Clases próximas</span><b>${upcoming.length}</b></article><article class="card metric"><span>Materia</span><b style="font-size:1.1rem">${esc(teacher.subject)}</b></article><article class="card wide"><h3>Próximas clases</h3><div class="list">${upcoming.slice(0,5).map(c=>`<div class="list-item"><span><b>${esc(c.student)}</b><small>${esc(c.subject)} · ${esc(c.topic||'Tema por definir')}</small></span><span>${esc(c.date)} · ${esc(c.time)}</span></div>`).join('')||'<div class="empty">No hay clases próximas.</div>'}</div></article></div>`;
 $('#students-teacher-page').innerHTML=`<div class="card"><h3>Mis alumnos</h3><div class="badge-grid">${students.map(s=>`<article class="badge" style="text-align:left"><h3>${esc(s.name)}</h3><p>${esc(s.level||'Nivel no definido')}</p><small>Progreso: ${s.progress}% · Asistencia: ${attendance(s)}% · Promedio: ${grades(s)}</small></article>`).join('')||'<div class="empty">No hay alumnos asignados.</div>'}</div></div>`;
 $('#schedule-teacher-page').innerHTML=`<div class="card"><h3>Agenda docente</h3><div class="list">${classes.map(c=>`<div class="list-item"><span><b>${esc(c.student)}</b><small>${esc(c.subject)} · ${esc(c.topic||'Tema por definir')}</small></span><span>${esc(c.date)} · ${esc(c.time)}<small>${esc(c.status)}</small></span></div>`).join('')||'<div class="empty">No hay clases registradas.</div>'}</div></div>`;
 $('#followup-teacher-page').innerHTML=`<div class="portal-grid">${students.map(s=>`<article class="card"><h3>${esc(s.name)}</h3><p>Progreso general: <b>${s.progress}%</b></p><p>Asistencia: <b>${attendance(s)}%</b></p><p>Promedio: <b>${grades(s)}</b></p><small>${esc(s.goal||'Sin objetivo registrado')}</small></article>`).join('')||'<div class="empty">No hay información de seguimiento.</div>'}</div>`;
 const resources=data.resources.filter(r=>r.subject===teacher.subject||r.subject==='General'||teacher.subject==='Multidisciplinario');
 $('#resources-teacher-page').innerHTML=`<div class="card"><h3>Recursos académicos</h3><div class="badge-grid">${resources.map(r=>`<article class="badge" style="text-align:left"><span class="status">${esc(r.subject)}</span><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p><small>${esc(r.type)} · ${esc(r.level)}</small></article>`).join('')||'<div class="empty">No hay recursos disponibles.</div>'}</div></div>`;
}
const titles={summary:'Resumen',students:'Mis alumnos',schedule:'Mis clases',followup:'Seguimiento',resources:'Recursos'};
$$('[data-teacher-page]').forEach(b=>b.onclick=()=>{$$('.teacher-page').forEach(p=>p.classList.remove('active'));$('#'+b.dataset.teacherPage+'-teacher-page').classList.add('active');$$('[data-teacher-page]').forEach(x=>x.classList.toggle('active',x===b));$('#teacherTitle').textContent=titles[b.dataset.teacherPage];$('.teacher-app>aside').classList.remove('open')});
$('#teacherMenu').onclick=()=>$('.teacher-app>aside').classList.toggle('open');
$('#teacherLogout').onclick=()=>{sessionStorage.removeItem('teacher_session');location.reload()};
