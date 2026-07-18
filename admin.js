
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='rai_galileo_v090';
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
let data=JSON.parse(localStorage.getItem(KEY)||'null')||seed;
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
 $('#studentsGrid').innerHTML=list.length?list.map(s=>`<article class="student-card"><div class="student-top"><div class="student-avatar">${esc(s.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><h3>${esc(s.name)}</h3><small>${esc(s.grade)} · ${esc(s.subject)}</small></div></div><p><b>Objetivo:</b> ${esc(s.goal||'Sin definir')}</p><div><small>Progreso ${s.progress}%</small><div class="progress"><i style="width:${s.progress}%"></i></div></div><p>${esc(s.notes||'Sin observaciones.')}</p><div class="student-actions"><button onclick="editStudent(${s.id})">Editar</button><button onclick="deleteStudent(${s.id})">Eliminar</button></div></article>`).join(''):'<div class="empty">No se encontraron alumnos.</div>';
 updateStudentSelects();
}
$('#studentSearch').oninput=renderStudents; $('#studentFilter').onchange=renderStudents;
function updateStudentSelects(){
 $$('select[name="student"]').forEach(sel=>{const val=sel.value;sel.innerHTML='<option value="">Selecciona</option>'+data.students.map(s=>`<option>${esc(s.name)}</option>`).join('');sel.value=val});
}
$('#addStudentBtn').onclick=()=>{ $('#studentForm').reset(); $('#studentForm [name=id]').value=''; $('#studentDialog').showModal(); };
window.editStudent=id=>{const s=data.students.find(x=>x.id===id);if(!s)return;for(const [k,v] of Object.entries(s)){const el=$(`#studentForm [name="${k}"]`);if(el)el.value=v}$('#studentDialog').showModal()};
window.deleteStudent=id=>{if(confirm('¿Eliminar este alumno?')){data.students=data.students.filter(s=>s.id!==id);save();renderAll()}};
$('#saveStudent').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#studentForm')));if(!fd.name)return;const obj={...fd,id:fd.id?Number(fd.id):Date.now(),age:Number(fd.age),progress:Number(fd.progress)};const i=data.students.findIndex(s=>s.id===obj.id);i>=0?data.students[i]=obj:data.students.push(obj);save();$('#studentDialog').close();renderAll()};

function renderClasses(){
 $('#classesTable').innerHTML=`<table><thead><tr><th>Alumno</th><th>Materia</th><th>Fecha</th><th>Hora</th><th>Duración</th><th>Tema</th><th>Estado</th><th></th></tr></thead><tbody>${data.classes.map(c=>`<tr><td>${esc(c.student)}</td><td>${esc(c.subject)}</td><td>${esc(c.date)}</td><td>${esc(c.time)}</td><td>${esc(c.duration)}</td><td>${esc(c.topic)}</td><td><span class="badge-status ${c.status==='Pendiente'?'pending':c.status==='Completada'?'completed':'cancelled'}">${esc(c.status)}</span></td><td><button onclick="deleteClass(${c.id})">Eliminar</button></td></tr>`).join('')}</tbody></table>`;
}
$('#addClassBtn').onclick=()=>{updateStudentSelects();$('#classForm').reset();$('#classDialog').showModal()};
$('#saveClass').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#classForm')));if(!fd.student||!fd.date)return;data.classes.push({...fd,id:Date.now()});save();$('#classDialog').close();renderAll()};
window.deleteClass=id=>{if(confirm('¿Eliminar esta clase?')){data.classes=data.classes.filter(c=>c.id!==id);save();renderAll()}};

function renderPayments(){
 $('#paymentsTable').innerHTML=`<table><thead><tr><th>Alumno</th><th>Concepto</th><th>Monto</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>${data.payments.map(p=>`<tr><td>${esc(p.student)}</td><td>${esc(p.concept)}</td><td>${money(p.amount)}</td><td>${esc(p.date)}</td><td><span class="badge-status ${p.status==='Completado'?'completed':'pending'}">${esc(p.status)}</span></td><td><button onclick="togglePayment(${p.id})">${p.status==='Completado'?'Marcar pendiente':'Marcar pagado'}</button> <button onclick="deletePayment(${p.id})">Eliminar</button></td></tr>`).join('')}</tbody></table>`;
}
$('#addPaymentBtn').onclick=()=>{updateStudentSelects();$('#paymentForm').reset();$('#paymentDialog').showModal()};
$('#savePayment').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#paymentForm')));if(!fd.student)return;data.payments.push({...fd,id:Date.now(),amount:Number(fd.amount)});save();$('#paymentDialog').close();renderAll()};
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

function renderAll(){renderDashboard();renderStudents();renderClasses();renderPayments();renderReports()}
save();renderAll();
