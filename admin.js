
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='rai_galileo_v092';
const OLD_KEY='rai_galileo_v091';
const seed={
 students:[
  {id:1,name:'Valeria M.',age:13,grade:'2° secundaria',subject:'Matemáticas',progress:68,goal:'Mejorar álgebra',notes:'Avanza bien con ejemplos visuales.'},
  {id:2,name:'Daniel R.',age:12,grade:'1° secundaria',subject:'Inglés',progress:44,goal:'Hablar con más confianza',notes:'Reforzar vocabulario cotidiano.'},
  {id:3,name:'Emiliano G.',age:14,grade:'3° secundaria',subject:'Física',progress:57,goal:'Comprender fuerzas',notes:'Practicar despeje de fórmulas.'}
 ],
 classes:[
  {id:1,student:'Valeria M.',subject:'Matemáticas',date:new Date(Date.now()+86400000).toISOString().slice(0,10),time:'18:00',duration:'90 min',status:'Pendiente',topic:'Ecuaciones lineales'},
  {id:2,student:'Daniel R.',subject:'Inglés',date:new Date(Date.now()+172800000).toISOString().slice(0,10),time:'17:00',duration:'60 min',status:'Pendiente',topic:'Present Simple'}
 ],
 payments:[
  {id:1,student:'Valeria M.',concept:'Paquete de 4 clases',amount:550,date:new Date().toISOString().slice(0,10),status:'Completado'},
  {id:2,student:'Daniel R.',concept:'Clase individual',amount:150,date:new Date().toISOString().slice(0,10),status:'Pendiente'}
 ]
};
let previous=JSON.parse(localStorage.getItem(OLD_KEY)||'null');
let data=JSON.parse(localStorage.getItem(KEY)||'null')||previous||seed;
data.students=data.students.map(s=>({...s,attendance:s.attendance||[],tasks:s.tasks||[],grades:s.grades||[],history:s.history||[{id:Date.now()+Math.random(),date:new Date().toISOString().slice(0,10),title:'Perfil creado',description:'Alumno registrado en Proyecto Galileo.'}]}));
let calendarCursor=new Date();
calendarCursor.setDate(1);
let selectedCalendarDate=new Date().toISOString().slice(0,10);
const MONTHS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function navigate(view){
 $$('.view').forEach(v=>v.classList.remove('active'));
 $(`#${view}-view`).classList.add('active');
 $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 const titles={dashboard:'Resumen general',students:'Administración de alumnos',classes:'Agenda de clases',payments:'Control de pagos',reports:'Reportes',athena:'Atenea Administrativa'};
 $('#viewTitle').textContent=titles[view];
 $('#sidebar').classList.remove('open');
 renderAll();
}
$$('.nav-item').forEach(b=>b.onclick=()=>navigate(b.dataset.view));
$$('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');
$('#themeToggle').onclick=()=>document.body.classList.toggle('light');

function renderDashboard(){
 $('#statStudents').textContent=data.students.length;
 const pendingClasses=data.classes.filter(c=>c.status==='Pendiente');
 $('#statClasses').textContent=pendingClasses.length;
 const pendingMoney=data.payments.filter(p=>p.status==='Pendiente').reduce((a,p)=>a+Number(p.amount),0);
 $('#statPending').textContent=money(pendingMoney);
 const avg=data.students.length?Math.round(data.students.reduce((a,s)=>a+Number(s.progress),0)/data.students.length):0;
 $('#statProgress').textContent=avg+'%';
 const sorted=[...pendingClasses].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,5);
 $('#upcomingList').innerHTML=sorted.length?sorted.map(c=>`<div class="list-item"><span><b>${esc(c.student)}</b><small>${esc(c.subject)} · ${esc(c.topic||'Tema por definir')}</small></span><span><b>${esc(c.date)}</b><small>${esc(c.time)}</small></span></div>`).join(''):'<div class="empty">No hay clases pendientes.</div>';
 let alerts=[];
 const debtors=data.payments.filter(p=>p.status==='Pendiente');
 if(debtors.length) alerts.push(`${debtors.length} pago(s) pendiente(s) por ${money(pendingMoney)}.`);
 const low=data.students.filter(s=>Number(s.progress)<40);
 if(low.length) alerts.push(`${low.length} alumno(s) requieren seguimiento prioritario.`);
 if(!alerts.length) alerts.push('Todo está en orden. No hay alertas importantes.');
 $('#alertsList').innerHTML=alerts.map(a=>`<div class="list-item"><span><b>${esc(a)}</b><small>Atenea recomienda revisarlo esta semana.</small></span></div>`).join('');
}
function renderStudents(){
 const q=$('#studentSearch').value.toLowerCase(), f=$('#studentFilter').value;
 const list=data.students.filter(s=>(f==='all'||s.subject===f)&&`${s.name} ${s.grade} ${s.subject}`.toLowerCase().includes(q));
 $('#studentsGrid').innerHTML=list.length?list.map(s=>`<article class="student-card"><div class="student-top"><div class="student-avatar">${esc(s.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><h3>${esc(s.name)}</h3><small>${esc(s.grade)} · ${esc(s.subject)}</small></div></div><p><b>Objetivo:</b> ${esc(s.goal||'Sin definir')}</p><div><small>Progreso ${s.progress}%</small><div class="progress"><i style="width:${s.progress}%"></i></div></div><p>${esc(s.notes||'Sin observaciones.')}</p><button class="profile-open" onclick="openStudentProfile(${s.id})">Ver perfil académico</button><div class="student-actions"><button onclick="editStudent(${s.id})">Editar</button><button onclick="deleteStudent(${s.id})">Eliminar</button></div></article>`).join(''):'<div class="empty">No se encontraron alumnos.</div>';
 updateStudentSelects();
}
$('#studentSearch').oninput=renderStudents; $('#studentFilter').onchange=renderStudents;
function updateStudentSelects(){
 $$('select[name="student"]').forEach(sel=>{const val=sel.value;sel.innerHTML='<option value="">Selecciona</option>'+data.students.map(s=>`<option>${esc(s.name)}</option>`).join('');sel.value=val});
}
$('#addStudentBtn').onclick=()=>{ $('#studentForm').reset(); $('#studentForm [name=id]').value=''; $('#studentDialog').showModal(); };
window.editStudent=id=>{const s=data.students.find(x=>x.id===id);if(!s)return;for(const [k,v] of Object.entries(s)){const el=$(`#studentForm [name="${k}"]`);if(el)el.value=v}$('#studentDialog').showModal()};
window.deleteStudent=id=>{if(confirm('¿Eliminar este alumno?')){data.students=data.students.filter(s=>s.id!==id);save();renderAll()}};
$('#saveStudent').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#studentForm')));if(!fd.name)return;const existing=data.students.find(s=>s.id===Number(fd.id));
const obj={...fd,id:fd.id?Number(fd.id):Date.now(),age:Number(fd.age),progress:Number(fd.progress),attendance:existing?.attendance||[],tasks:existing?.tasks||[],grades:existing?.grades||[],history:existing?.history||[{id:Date.now(),date:new Date().toISOString().slice(0,10),title:'Perfil creado',description:'Alumno registrado en Proyecto Galileo.'}]};const i=data.students.findIndex(s=>s.id===obj.id);i>=0?data.students[i]=obj:data.students.push(obj);save();$('#studentDialog').close();renderAll()};


function isoDate(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function renderCalendar(){
 const title=$('#calendarTitle'),grid=$('#calendarGrid');
 if(!title||!grid)return;
 const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();
 title.textContent=`${MONTHS[m]} de ${y}`;
 const first=new Date(y,m,1);
 const mondayIndex=(first.getDay()+6)%7;
 const start=new Date(y,m,1-mondayIndex);
 let cells='';
 for(let i=0;i<42;i++){
  const d=new Date(start);d.setDate(start.getDate()+i);
  const key=isoDate(d.getFullYear(),d.getMonth(),d.getDate());
  const events=data.classes.filter(c=>c.date===key).sort((a,b)=>a.time.localeCompare(b.time));
  const classes=events.slice(0,2).map(c=>`<span class="calendar-event ${c.status==='Completada'?'completed':c.status==='Cancelada'?'cancelled':''}">${esc(c.time)} · ${esc(c.student)}</span>`).join('');
  cells+=`<button class="calendar-day ${d.getMonth()!==m?'outside':''} ${key===new Date().toISOString().slice(0,10)?'today':''} ${key===selectedCalendarDate?'selected':''}" data-date="${key}">
   <span class="calendar-number">${d.getDate()}</span>
   <span class="day-events">${classes}${events.length>2?`<small class="more-events">+${events.length-2} más</small>`:''}</span>
  </button>`;
 }
 grid.innerHTML=cells;
 $$('.calendar-day').forEach(btn=>btn.onclick=()=>{selectedCalendarDate=btn.dataset.date;renderCalendar();renderSelectedDay()});
 renderSelectedDay();
}
function renderSelectedDay(){
 const container=$('#selectedDayClasses'),heading=$('#selectedDayTitle');
 if(!container||!heading)return;
 const [y,m,d]=selectedCalendarDate.split('-').map(Number);
 const label=new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(y,m-1,d));
 heading.textContent=label.charAt(0).toUpperCase()+label.slice(1);
 const list=data.classes.filter(c=>c.date===selectedCalendarDate).sort((a,b)=>a.time.localeCompare(b.time));
 container.innerHTML=list.map(c=>`<article class="day-class"><time>${esc(c.time)} · ${esc(c.duration)}</time><h4>${esc(c.student)}</h4><p>${esc(c.subject)} · ${esc(c.topic||'Tema pendiente')}</p><span class="badge-status ${c.status==='Completada'?'completed':c.status==='Cancelada'?'cancelled':'pending'}">${esc(c.status)}</span></article>`).join('')||'<div class="empty">No hay clases programadas para este día.</div>';
}
$('#prevMonth').onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderCalendar()};
$('#nextMonth').onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderCalendar()};
$('#todayMonth').onclick=()=>{calendarCursor=new Date();calendarCursor.setDate(1);selectedCalendarDate=new Date().toISOString().slice(0,10);renderCalendar()};

function renderClasses(){
 renderCalendar();
 $('#classesTable').innerHTML=`<table><thead><tr><th>Alumno</th><th>Materia</th><th>Fecha</th><th>Hora</th><th>Duración</th><th>Tema</th><th>Estado</th><th></th></tr></thead><tbody>${data.classes.map(c=>`<tr><td>${esc(c.student)}</td><td>${esc(c.subject)}</td><td>${esc(c.date)}</td><td>${esc(c.time)}</td><td>${esc(c.duration)}</td><td>${esc(c.topic)}</td><td><span class="badge-status ${c.status==='Pendiente'?'pending':c.status==='Completada'?'completed':'cancelled'}">${esc(c.status)}</span></td><td><button onclick="deleteClass(${c.id})">Eliminar</button></td></tr>`).join('')}</tbody></table>`;
}
$('#addClassBtn').onclick=()=>{updateStudentSelects();$('#classForm').reset();$('#classForm [name=date]').value=selectedCalendarDate;$('#classDialog').showModal()};
$('#saveClass').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#classForm')));if(!fd.student||!fd.date)return;data.classes.push({...fd,id:Date.now()});save();$('#classDialog').close();renderAll()};
window.deleteClass=id=>{if(confirm('¿Eliminar esta clase?')){data.classes=data.classes.filter(c=>c.id!==id);save();renderAll()}};


const PAYMENT_PRICES={
 'Primaria · Clase Estándar (1 h)':80,
 'Primaria · Clase Profunda (1 h 30 min)':100,
 'Primaria · Paquete Estándar (4 × 1 h)':300,
 'Primaria · Paquete Profundo (4 × 1 h 30 min)':350,
 'Secundaria · Clase Estándar (1 h)':120,
 'Secundaria · Clase Profunda (1 h 30 min)':150,
 'Secundaria · Paquete Estándar (4 × 1 h)':450,
 'Secundaria · Paquete Profundo (4 × 1 h 30 min)':550
};

function renderPayments(){
 $('#paymentsTable').innerHTML=`<div class="payment-price-grid">
 <article><small>Primaria · 1 h</small><strong>$80</strong></article>
 <article><small>Primaria · 1 h 30 min</small><strong>$100</strong></article>
 <article><small>Secundaria · 1 h</small><strong>$120</strong></article>
 <article><small>Secundaria · 1 h 30 min</small><strong>$150</strong></article>
 </div><table><thead><tr><th>Alumno</th><th>Concepto</th><th>Monto</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>${data.payments.map(p=>`<tr><td>${esc(p.student)}</td><td>${esc(p.concept)}</td><td>${money(p.amount)}</td><td>${esc(p.date)}</td><td><span class="badge-status ${p.status==='Completado'?'completed':'pending'}">${esc(p.status)}</span></td><td><button onclick="togglePayment(${p.id})">${p.status==='Completado'?'Marcar pendiente':'Marcar pagado'}</button> <button onclick="deletePayment(${p.id})">Eliminar</button></td></tr>`).join('')}</tbody></table>`;
}
function syncPaymentAmount(){
 const select=$('#paymentConcept'),option=select?.selectedOptions?.[0],price=option?.dataset?.price;
 if(price!==''){$('#paymentAmount').value=price;$('#paymentAmount').readOnly=true;$('#paymentHint').textContent='Precio establecido automáticamente para esta modalidad.'}
 else{$('#paymentAmount').value='';$('#paymentAmount').readOnly=false;$('#paymentHint').textContent='Escribe manualmente el monto del concepto personalizado.'}
}
$('#paymentConcept').onchange=syncPaymentAmount;
$('#addPaymentBtn').onclick=()=>{updateStudentSelects();$('#paymentForm').reset();$('#paymentForm [name=date]').value=new Date().toISOString().slice(0,10);syncPaymentAmount();$('#paymentDialog').showModal()};
$('#savePayment').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#paymentForm')));if(!fd.student||!fd.concept)return;const automatic=PAYMENT_PRICES[fd.concept];data.payments.push({...fd,id:Date.now(),amount:automatic??Number(fd.amount)});save();$('#paymentDialog').close();renderAll()};
window.togglePayment=id=>{const p=data.payments.find(x=>x.id===id);p.status=p.status==='Completado'?'Pendiente':'Completado';save();renderAll()};
window.deletePayment=id=>{if(confirm('¿Eliminar este registro?')){data.payments=data.payments.filter(p=>p.id!==id);save();renderAll()}};

function renderReports(){
 const subjects=['Matemáticas','Física','Inglés'];
 $('#subjectBars').innerHTML=subjects.map(sub=>{const arr=data.students.filter(s=>s.subject===sub);const avg=arr.length?Math.round(arr.reduce((a,s)=>a+s.progress,0)/arr.length):0;return `<div class="bar-row"><div><b>${sub}</b><span>${avg}%</span></div><div class="progress"><i style="width:${avg}%"></i></div></div>`}).join('');
 const income=data.payments.filter(p=>p.status==='Completado').reduce((a,p)=>a+Number(p.amount),0);
 $('#reportMetrics').innerHTML=`<div><span>Ingresos registrados</span><b>${money(income)}</b></div><div><span>Clases completadas</span><b>${data.classes.filter(c=>c.status==='Completada').length}</b></div><div><span>Clases pendientes</span><b>${data.classes.filter(c=>c.status==='Pendiente').length}</b></div><div><span>Alumnos activos</span><b>${data.students.length}</b></div>`;
 $('#reportStudents').innerHTML=`<div class="table-wrap"><table><thead><tr><th>Alumno</th><th>Grado</th><th>Materia</th><th>Progreso</th><th>Objetivo</th></tr></thead><tbody>${data.students.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.grade)}</td><td>${esc(s.subject)}</td><td>${s.progress}%</td><td>${esc(s.goal)}</td></tr>`).join('')}</tbody></table></div>`;
}
$('#printReport').onclick=()=>window.print();

function athenaAnswer(q){
 q=q.toLowerCase();
 if(q.includes('cuánt')&&q.includes('alumn'))return `Hay ${data.students.length} alumnos registrados.`;
 if(q.includes('clase')&&(q.includes('próxima')||q.includes('hoy')||q.includes('quién'))){const c=[...data.classes].filter(x=>x.status==='Pendiente').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];return c?`La próxima clase es de ${c.student}, ${c.subject}, el ${c.date} a las ${c.time}.`:'No hay clases pendientes.'}
 if(q.includes('cobrar')||q.includes('pago')){const n=data.payments.filter(p=>p.status==='Pendiente').reduce((a,p)=>a+Number(p.amount),0);return `Hay ${money(n)} pendientes por cobrar.`}
 if(q.includes('progreso')){const a=data.students.length?Math.round(data.students.reduce((x,s)=>x+s.progress,0)/data.students.length):0;return `El progreso promedio del grupo es ${a}%.`}
 return 'Puedo consultar alumnos, próximas clases, pagos pendientes y progreso promedio.';
}
function sendAthena(q){if(!q.trim())return;$('#athenaChat').insertAdjacentHTML('beforeend',`<p class="user">${esc(q)}</p><p class="bot">${esc(athenaAnswer(q))}</p>`);$('#athenaChat').scrollTop=$('#athenaChat').scrollHeight}
$('.quick-actions').onclick=e=>{if(e.target.tagName==='BUTTON')sendAthena(e.target.textContent)};
$('#athenaAdminForm').onsubmit=e=>{e.preventDefault();const i=$('#athenaAdminInput');sendAthena(i.value);i.value=''};


function studentStats(s){const attended=s.attendance.filter(x=>String(x.value).toLowerCase().includes('asist')).length,total=s.attendance.length,attendanceRate=total?Math.round(attended/total*100):0,completed=s.tasks.filter(x=>String(x.value).toLowerCase().includes('complet')).length,nums=s.grades.map(x=>Number(x.value)).filter(Number.isFinite),gradeAvg=nums.length?(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(1):'—';return{attendanceRate,completed,gradeAvg}}
function profileRecordPanel(s,type,title){const labels={attendance:'Registrar asistencia',tasks:'Nueva tarea',grades:'Nueva evaluación'},records=s[type]||[];return `<section class="profile-panel" data-profile-panel="${type}"><div class="academic-toolbar"><h3>${title}</h3><button onclick="openAcademicRecord(${s.id},'${type}')">+ ${labels[type]}</button></div><div class="record-list">${records.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(r=>`<article class="record-card"><div class="record-date">${esc(r.date)}</div><div><h4>${esc(r.title)}</h4><p>${esc(r.description||'')}</p></div><div><span class="record-value">${esc(r.value||'')}</span><button onclick="deleteAcademicRecord(${s.id},'${type}',${r.id})">Eliminar</button></div></article>`).join('')||'<div class="empty">Todavía no hay registros.</div>'}</div></section>`}
window.openStudentProfile=id=>{const s=data.students.find(x=>x.id===id);if(!s)return;const st=studentStats(s);$('#profileContent').innerHTML=`<div class="profile-shell"><header class="profile-header"><div class="student-avatar">${esc(s.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><p class="eyebrow">Expediente académico</p><h2>${esc(s.name)}</h2><p>${esc(s.grade)} · ${esc(s.subject)} · ${s.age} años</p></div><button class="profile-close" onclick="document.querySelector('#profileDialog').close()">×</button></header><div class="profile-stats"><article class="profile-stat"><span>Progreso</span><strong>${s.progress}%</strong></article><article class="profile-stat"><span>Asistencia</span><strong>${st.attendanceRate}%</strong></article><article class="profile-stat"><span>Tareas completadas</span><strong>${st.completed}</strong></article><article class="profile-stat"><span>Promedio</span><strong>${st.gradeAvg}</strong></article></div><div class="profile-tabs"><button class="profile-tab active" data-profile-tab="overview">Resumen</button><button class="profile-tab" data-profile-tab="attendance">Asistencia</button><button class="profile-tab" data-profile-tab="tasks">Tareas</button><button class="profile-tab" data-profile-tab="grades">Evaluaciones</button><button class="profile-tab" data-profile-tab="history">Historial</button></div><section class="profile-panel active" data-profile-panel="overview"><div class="notes-box"><h3>Objetivo actual</h3><p>${esc(s.goal||'Sin definir')}</p><h3>Observaciones</h3><p>${esc(s.notes||'Sin observaciones')}</p></div></section>${profileRecordPanel(s,'attendance','Asistencia')}${profileRecordPanel(s,'tasks','Tareas')}${profileRecordPanel(s,'grades','Evaluaciones')}<section class="profile-panel" data-profile-panel="history"><div class="academic-toolbar"><h3>Línea de tiempo</h3><button onclick="openAcademicRecord(${s.id},'history')">+ Añadir nota</button></div><div class="timeline">${(s.history||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)).map(r=>`<div class="timeline-item"><small>${esc(r.date)}</small><h4>${esc(r.title)}</h4><p>${esc(r.description||'')}</p></div>`).join('')||'<div class="empty">Sin eventos registrados.</div>'}</div></section></div>`;$$('.profile-tab').forEach(b=>b.onclick=()=>{$$('.profile-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('[data-profile-panel]').forEach(x=>x.classList.toggle('active',x.dataset.profilePanel===b.dataset.profileTab))});$('#profileDialog').showModal()};
window.openAcademicRecord=(studentId,type)=>{const titles={attendance:'Registrar asistencia',tasks:'Registrar tarea',grades:'Registrar evaluación',history:'Añadir evento al historial'},labels={attendance:'Estado (Asistió / Falta justificada / Falta)',tasks:'Estado (Pendiente / Completada)',grades:'Calificación (0 a 10)',history:'Dato adicional'};$('#recordDialogTitle').textContent=titles[type];$('#recordValueLabel').childNodes[0].nodeValue=labels[type];$('#academicRecordForm').reset();$('#academicRecordForm [name=studentId]').value=studentId;$('#academicRecordForm [name=recordType]').value=type;$('#academicRecordForm [name=date]').value=new Date().toISOString().slice(0,10);$('#academicRecordDialog').showModal()};
$('#saveAcademicRecord').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#academicRecordForm')));if(!fd.title||!fd.date)return;const s=data.students.find(x=>x.id===Number(fd.studentId));if(!s)return;const type=fd.recordType;s[type]=s[type]||[];s[type].push({id:Date.now(),title:fd.title,date:fd.date,value:fd.value,description:fd.description});if(type!=='history'){s.history=s.history||[];s.history.push({id:Date.now()+1,date:fd.date,title:`Nuevo registro: ${fd.title}`,description:`Se agregó un registro académico.`})}save();$('#academicRecordDialog').close();openStudentProfile(s.id);renderAll()};
window.deleteAcademicRecord=(studentId,type,id)=>{if(!confirm('¿Eliminar este registro?'))return;const s=data.students.find(x=>x.id===studentId);if(!s)return;s[type]=(s[type]||[]).filter(x=>x.id!==id);save();openStudentProfile(studentId);renderAll()};

function renderAll(){renderDashboard();renderStudents();renderClasses();renderPayments();renderReports()}
save();renderAll();
