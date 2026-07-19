

const adminBootStarted=performance.now();
window.addEventListener('load',()=>{
 const remaining=Math.max(0,1350-(performance.now()-adminBootStarted));
 setTimeout(()=>{
  document.body.classList.remove('admin-booting');
  document.body.classList.add('admin-ready');
  const splash=$('#adminSplash');splash?.classList.add('hide');
  setTimeout(()=>splash?.remove(),900);
 },remaining);
});
setTimeout(()=>{
 if(document.body.classList.contains('admin-booting')){
  document.body.classList.remove('admin-booting');
  document.body.classList.add('admin-ready');
  $('#adminSplash')?.classList.add('hide');
 }
},3800);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='rai_horizonte_v100';
const OLD_KEY='rai_galileo_v095';
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
  {id:1,student:'Valeria M.',concept:'Secundaria · Paquete Profundo (4 × 1 h 30 min)',amount:550,date:new Date().toISOString().slice(0,10),status:'Completado',method:'Transferencia'},
  {id:2,student:'Daniel R.',concept:'Secundaria · Clase Profunda (1 h 30 min)',amount:150,date:new Date().toISOString().slice(0,10),status:'Pendiente',method:'Efectivo'}
 ],
 expenses:[
  {id:1,concept:'Material de práctica',category:'Material educativo',amount:120,date:new Date().toISOString().slice(0,10),method:'Efectivo',notes:'Impresiones y hojas de ejercicios.'}
 ]
};
let previous=JSON.parse(localStorage.getItem(OLD_KEY)||'null');
let data=JSON.parse(localStorage.getItem(KEY)||'null')||previous||seed;
data.expenses=Array.isArray(data.expenses)?data.expenses:[];
data.payments=(data.payments||[]).map(p=>({...p,method:p.method||'No registrado'}));
data.athenaHistory=Array.isArray(data.athenaHistory)?data.athenaHistory:[];
data.settings={institution:'Rumbo a Ingeniería',teacher:'',phone:'',email:'',hours:'Lunes a sábado, 5:00–9:00 pm',currency:'MXN',...(data.settings||{})};
data.packages=Array.isArray(data.packages)?data.packages:[];
data.notifications=Array.isArray(data.notifications)?data.notifications:[];
data.certificates=Array.isArray(data.certificates)?data.certificates:[];
data.portalUsers=Array.isArray(data.portalUsers)?data.portalUsers:[];
data.students.forEach(s=>{
 if(!data.portalUsers.some(u=>u.studentId===s.id)){
  data.portalUsers.push({studentId:s.id,pin:String(1000+(Number(s.id)%9000)),active:true});
 }
});

data.students=data.students.map(s=>({...s,attendance:s.attendance||[],tasks:s.tasks||[],grades:s.grades||[],history:s.history||[{id:Date.now()+Math.random(),date:new Date().toISOString().slice(0,10),title:'Perfil creado',description:'Alumno registrado en Proyecto Galileo.'}]}));
let calendarCursor=new Date();
calendarCursor.setDate(1);
let selectedCalendarDate=new Date().toISOString().slice(0,10);
const MONTHS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
function toast(message,type='success'){
 const region=$('#toastRegion');if(!region)return;
 const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;region.appendChild(el);
 setTimeout(()=>el.remove(),3200);
}
function duplicateStudent(name,id=null){const n=normalizeText(name);return data.students.some(s=>normalizeText(s.name)===n&&s.id!==id)}
function duplicateClass(fd){return data.classes.some(c=>c.student===fd.student&&c.date===fd.date&&c.time===fd.time&&c.status!=='Cancelada')}

const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function navigate(view){
 $$('.view').forEach(v=>v.classList.remove('active'));
 $(`#${view}-view`).classList.add('active');
 $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 const titles={dashboard:'Resumen general',students:'Administración de alumnos',classes:'Agenda de clases',payments:'Centro financiero',packages:'Paquetes de clases',notifications:'Centro de notificaciones',certificates:'Certificados y diplomas',reports:'Reportes',athena:'Atenea Administrativa'};
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
 const month=new Date().toISOString().slice(0,7);
 const monthIncome=data.payments.filter(p=>p.status==='Completado'&&p.date?.startsWith(month)).reduce((a,p)=>a+Number(p.amount),0);
 const monthExpenses=data.expenses.filter(x=>x.date?.startsWith(month)).reduce((a,x)=>a+Number(x.amount),0);
 alerts.push(`Utilidad del mes: ${money(monthIncome-monthExpenses)}.`);
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
$('#saveStudent').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#studentForm')));if(!fd.name)return toast('Escribe el nombre del alumno.','error');const currentId=fd.id?Number(fd.id):null;if(duplicateStudent(fd.name,currentId))return toast('Ya existe un alumno con ese nombre.','error');const existing=data.students.find(s=>s.id===currentId);
const obj={...fd,id:currentId||Date.now(),age:Number(fd.age),progress:Number(fd.progress),attendance:existing?.attendance||[],tasks:existing?.tasks||[],grades:existing?.grades||[],history:existing?.history||[{id:Date.now(),date:new Date().toISOString().slice(0,10),title:'Perfil creado',description:'Alumno registrado en Proyecto Galileo.'}]};const i=data.students.findIndex(s=>s.id===obj.id);i>=0?data.students[i]=obj:data.students.push(obj);save();$('#studentDialog').close();renderAll();toast(i>=0?'Alumno actualizado.':'Alumno registrado.')};


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
$('#saveClass').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#classForm')));if(!fd.student||!fd.date)return toast('Completa alumno y fecha.','error');if(duplicateClass(fd))return toast('Ya existe una clase para ese alumno en la misma fecha y hora.','error');data.classes.push({...fd,id:Date.now()});save();$('#classDialog').close();renderAll();toast('Clase programada.')};
window.deleteClass=id=>{if(confirm('¿Eliminar esta clase?')){data.classes=data.classes.filter(c=>c.id!==id);save();renderAll()}};


const PAYMENT_PRICES={
 'Primaria · Clase Estándar (1 h)':80,
 'Primaria · Clase Profunda (1 h 30 min)':100,
 'Primaria · Paquete Estándar (4 × 1 h)':300,
 'Primaria · Paquete Profundo (4 × 1 h 30 min)':360,
 'Secundaria · Clase Estándar (1 h)':120,
 'Secundaria · Clase Profunda (1 h 30 min)':150,
 'Secundaria · Paquete Estándar (4 × 1 h)':450,
 'Secundaria · Paquete Profundo (4 × 1 h 30 min)':550
};


function monthKey(dateString){return String(dateString||'').slice(0,7)}
function selectedFinanceMonth(){
 const input=$('#financeMonth');
 if(!input.value)input.value=new Date().toISOString().slice(0,7);
 return input.value;
}
function financePeriodLabel(month){
 const [y,m]=month.split('-').map(Number);
 return new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
}
function financeData(month=selectedFinanceMonth()){
 const payments=data.payments.filter(p=>monthKey(p.date)===month);
 const expenses=data.expenses.filter(x=>monthKey(x.date)===month);
 const paid=payments.filter(p=>p.status==='Completado');
 const pending=payments.filter(p=>p.status==='Pendiente');
 return {
  payments,expenses,paid,pending,
  income:paid.reduce((a,p)=>a+Number(p.amount||0),0),
  expenseTotal:expenses.reduce((a,x)=>a+Number(x.amount||0),0),
  pendingTotal:pending.reduce((a,p)=>a+Number(p.amount||0),0)
 };
}
function renderFinanceChart(month){
 const [year,monthNum]=month.split('-').map(Number);
 const days=new Date(year,monthNum,0).getDate();
 const buckets=days<=28?4:5;
 const groups=Array.from({length:buckets},(_,i)=>({label:`Sem. ${i+1}`,income:0,expense:0}));
 const f=financeData(month);
 f.paid.forEach(p=>{const day=Number(p.date.slice(8,10));groups[Math.min(buckets-1,Math.floor((day-1)/7))].income+=Number(p.amount)});
 f.expenses.forEach(x=>{const day=Number(x.date.slice(8,10));groups[Math.min(buckets-1,Math.floor((day-1)/7))].expense+=Number(x.amount)});
 const max=Math.max(1,...groups.flatMap(g=>[g.income,g.expense]));
 $('#financeChart').innerHTML=`<div class="finance-legend"><span><i class="income-dot"></i>Ingresos</span><span><i class="expense-dot"></i>Egresos</span></div>`+
 groups.map(g=>`<div class="finance-bar-row"><span>${g.label}</span><div><div class="finance-bar-track"><i class="finance-bar-income" style="width:${g.income/max*100}%"></i></div><div class="finance-bar-track" style="margin-top:4px"><i class="finance-bar-expense" style="width:${g.expense/max*100}%"></i></div></div><b>${money(g.income-g.expense)}</b></div>`).join('');
}
function renderIncomeBreakdown(month){
 const paid=financeData(month).paid;
 const sums={};
 paid.forEach(p=>sums[p.concept]=(sums[p.concept]||0)+Number(p.amount));
 const rows=Object.entries(sums).sort((a,b)=>b[1]-a[1]);
 const total=rows.reduce((a,[,v])=>a+v,0)||1;
 $('#incomeBreakdown').innerHTML=rows.length?rows.map(([name,value])=>`<div class="breakdown-item"><div class="breakdown-head"><span title="${esc(name)}">${esc(name)}</span><b>${money(value)}</b></div><div class="breakdown-track"><i style="width:${value/total*100}%"></i></div></div>`).join(''):'<div class="empty">No hay ingresos cobrados en este periodo.</div>';
}
function financeTransactions(month){
 const incomes=data.payments.filter(p=>monthKey(p.date)===month).map(p=>({
  id:p.id,type:p.status==='Completado'?'income':'pending',label:p.status==='Completado'?'Ingreso':'Pendiente',
  person:p.student,concept:p.concept,category:'Servicios educativos',date:p.date,amount:Number(p.amount),method:p.method||'No registrado',source:'payment'
 }));
 const expenses=data.expenses.filter(x=>monthKey(x.date)===month).map(x=>({
  id:x.id,type:'expense',label:'Egreso',person:'—',concept:x.concept,category:x.category,date:x.date,amount:Number(x.amount),method:x.method||'No registrado',source:'expense'
 }));
 return [...incomes,...expenses].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
}
function renderPayments(){
 const month=selectedFinanceMonth();
 const f=financeData(month);
 $('#financeIncome').textContent=money(f.income);
 $('#financeExpenses').textContent=money(f.expenseTotal);
 $('#financeProfit').textContent=money(f.income-f.expenseTotal);
 $('#financePending').textContent=money(f.pendingTotal);
 $('#financeIncomeCount').textContent=`${f.paid.length} movimiento${f.paid.length===1?'':'s'}`;
 $('#financeExpenseCount').textContent=`${f.expenses.length} movimiento${f.expenses.length===1?'':'s'}`;
 $('#financePendingCount').textContent=`${f.pending.length} pago${f.pending.length===1?'':'s'} pendiente${f.pending.length===1?'':'s'}`;
 renderFinanceChart(month);
 renderIncomeBreakdown(month);
 const q=($('#financeSearch')?.value||'').toLowerCase();
 const type=$('#financeTypeFilter')?.value||'all';
 const rows=financeTransactions(month).filter(t=>(type==='all'||t.type===type)&&`${t.person} ${t.concept} ${t.category} ${t.method}`.toLowerCase().includes(q));
 $('#financeTransactions').innerHTML=rows.length?`<table><thead><tr><th>Tipo</th><th>Fecha</th><th>Alumno / beneficiario</th><th>Concepto</th><th>Categoría</th><th>Método</th><th>Monto</th><th></th></tr></thead><tbody>${rows.map(t=>`<tr><td><span class="finance-table-type ${t.type}">${t.label}</span></td><td>${esc(t.date)}</td><td>${esc(t.person)}</td><td>${esc(t.concept)}</td><td>${esc(t.category)}</td><td>${esc(t.method)}</td><td class="finance-amount ${t.type}">${t.type==='expense'?'-':t.type==='income'?'+':''}${money(t.amount)}</td><td>${t.source==='payment'?`<button onclick="togglePayment(${t.id})">${t.type==='pending'?'Marcar cobrado':'Marcar pendiente'}</button> <button onclick="deletePayment(${t.id})">Eliminar</button>`:`<button onclick="deleteExpense(${t.id})">Eliminar</button>`}</td></tr>`).join('')}</tbody></table>`:`<div class="empty-finance">No hay movimientos que coincidan con los filtros en ${esc(financePeriodLabel(month))}.</div>`;
}
function syncPaymentAmount(){
 const select=$('#paymentConcept'),option=select?.selectedOptions?.[0],price=option?.dataset?.price;
 if(price!==''){$('#paymentAmount').value=price;$('#paymentAmount').readOnly=true;$('#paymentHint').textContent='Precio establecido automáticamente para esta modalidad.'}
 else{$('#paymentAmount').value='';$('#paymentAmount').readOnly=false;$('#paymentHint').textContent='Escribe manualmente el monto del concepto personalizado.'}
}
$('#paymentConcept').onchange=syncPaymentAmount;
$('#addPaymentBtn').onclick=()=>{updateStudentSelects();$('#paymentForm').reset();$('#paymentForm [name=date]').value=new Date().toISOString().slice(0,10);syncPaymentAmount();$('#paymentDialog').showModal()};
$('#savePayment').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#paymentForm')));if(!fd.student||!fd.concept)return;const automatic=PAYMENT_PRICES[fd.concept];data.payments.push({...fd,id:Date.now(),amount:automatic??Number(fd.amount),method:fd.method||'No registrado'});save();$('#paymentDialog').close();renderAll();toast('Ingreso registrado.')};
window.togglePayment=id=>{const p=data.payments.find(x=>x.id===id);if(!p)return;p.status=p.status==='Completado'?'Pendiente':'Completado';save();renderAll()};
window.deletePayment=id=>{if(confirm('¿Eliminar este ingreso?')){data.payments=data.payments.filter(p=>p.id!==id);save();renderAll()}};
$('#addExpenseBtn').onclick=()=>{$('#expenseForm').reset();$('#expenseForm [name=date]').value=new Date().toISOString().slice(0,10);$('#expenseDialog').showModal()};
$('#saveExpense').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#expenseForm')));if(!fd.concept||!Number(fd.amount))return;data.expenses.push({...fd,id:Date.now(),amount:Number(fd.amount)});save();$('#expenseDialog').close();renderAll();toast('Egreso registrado.')};
window.deleteExpense=id=>{if(confirm('¿Eliminar este egreso?')){data.expenses=data.expenses.filter(x=>x.id!==id);save();renderAll()}};
$('#financeMonth').value=new Date().toISOString().slice(0,7);
$('#financeMonth').onchange=renderPayments;
$('#financeSearch').oninput=renderPayments;
$('#financeTypeFilter').onchange=renderPayments;
$('#financeCurrentMonth').onclick=()=>{$('#financeMonth').value=new Date().toISOString().slice(0,7);renderPayments()};
$('#exportFinanceBtn').onclick=()=>{
 const month=selectedFinanceMonth(),rows=financeTransactions(month);
 const csv=[['Tipo','Fecha','Alumno o beneficiario','Concepto','Categoría','Método','Monto'],...rows.map(t=>[t.label,t.date,t.person,t.concept,t.category,t.method,t.type==='expense'?-t.amount:t.amount])]
  .map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
 const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=`finanzas-galileo-${month}.csv`;a.click();URL.revokeObjectURL(url);
};

function renderReports(){
 const subjects=['Matemáticas','Física','Inglés'];
 $('#subjectBars').innerHTML=subjects.map(sub=>{const arr=data.students.filter(s=>s.subject===sub);const avg=arr.length?Math.round(arr.reduce((a,s)=>a+s.progress,0)/arr.length):0;return `<div class="bar-row"><div><b>${sub}</b><span>${avg}%</span></div><div class="progress"><i style="width:${avg}%"></i></div></div>`}).join('');
 const income=data.payments.filter(p=>p.status==='Completado').reduce((a,p)=>a+Number(p.amount),0);
 const expenses=data.expenses.reduce((a,x)=>a+Number(x.amount),0);
 $('#reportMetrics').innerHTML=`<div><span>Ingresos registrados</span><b>${money(income)}</b></div><div><span>Egresos registrados</span><b>${money(expenses)}</b></div><div><span>Utilidad acumulada</span><b>${money(income-expenses)}</b></div><div><span>Clases completadas</span><b>${data.classes.filter(c=>c.status==='Completada').length}</b></div><div><span>Clases pendientes</span><b>${data.classes.filter(c=>c.status==='Pendiente').length}</b></div><div><span>Alumnos activos</span><b>${data.students.length}</b></div>`;
 $('#reportStudents').innerHTML=`<div class="table-wrap"><table><thead><tr><th>Alumno</th><th>Grado</th><th>Materia</th><th>Progreso</th><th>Objetivo</th></tr></thead><tbody>${data.students.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.grade)}</td><td>${esc(s.subject)}</td><td>${s.progress}%</td><td>${esc(s.goal)}</td></tr>`).join('')}</tbody></table></div>`;
}
$('#printReport').onclick=()=>window.print();


function normalizeText(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function localDate(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return d.toISOString().slice(0,10)}
function dateLabel(date){
 const [y,m,d]=String(date).split('-').map(Number);
 return new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long'}).format(new Date(y,m-1,d));
}
function findStudentInQuestion(q){
 const nq=normalizeText(q);
 return data.students.find(s=>{
  const full=normalizeText(s.name), parts=full.split(/\s+/).filter(x=>x.length>2);
  return nq.includes(full)||parts.some(x=>nq.includes(x));
 });
}
function attendanceSummary(s){
 const records=s.attendance||[],attended=records.filter(x=>normalizeText(x.value).includes('asisti')).length;
 return {total:records.length,rate:records.length?Math.round(attended/records.length*100):null};
}
function taskSummary(s){
 const records=s.tasks||[],completed=records.filter(x=>normalizeText(x.value).includes('complet')).length;
 return {total:records.length,completed,pending:records.length-completed};
}
function gradeSummary(s){
 const nums=(s.grades||[]).map(x=>Number(x.value)).filter(Number.isFinite);
 return nums.length?(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(1):null;
}
function classesAnswer(date){
 const rows=data.classes.filter(c=>c.date===date&&c.status!=='Cancelada').sort((a,b)=>a.time.localeCompare(b.time));
 if(!rows.length)return `No hay clases programadas para ${dateLabel(date)}.`;
 return `Clases para ${dateLabel(date)}:\n${rows.map(c=>`• ${c.time} — ${c.student}, ${c.subject}${c.topic?` (${c.topic})`:''}`).join('\n')}`;
}
function studentAttentionList(){
 return data.students.map(s=>{
  const a=attendanceSummary(s),t=taskSummary(s),reasons=[];
  if(Number(s.progress)<50)reasons.push(`progreso de ${s.progress}%`);
  if(a.rate!==null&&a.rate<75)reasons.push(`asistencia de ${a.rate}%`);
  if(t.pending>=2)reasons.push(`${t.pending} tareas pendientes`);
  return {s,reasons};
 }).filter(x=>x.reasons.length).sort((a,b)=>b.reasons.length-a.reasons.length);
}
function athenaSnapshot(){
 const month=new Date().toISOString().slice(0,7),f=financeData(month);
 const today=data.classes.filter(c=>c.date===localDate()&&c.status!=='Cancelada').length;
 const attention=studentAttentionList().length;
 const el=$('#athenaSnapshot');if(!el)return;
 el.innerHTML=`<div class="athena-mini"><span>Clases hoy</span><b>${today}</b></div><div class="athena-mini"><span>Por cobrar</span><b>${money(f.pendingTotal)}</b></div><div class="athena-mini"><span>Utilidad mes</span><b>${money(f.income-f.expenseTotal)}</b></div><div class="athena-mini"><span>Por atender</span><b>${attention}</b></div>`;
}
function athenaAnswer(question){
 const q=normalizeText(question),student=findStudentInQuestion(question);
 if(student){
  const a=attendanceSummary(student),t=taskSummary(student),g=gradeSummary(student);
  const pending=data.payments.filter(p=>p.student===student.name&&p.status==='Pendiente').reduce((sum,p)=>sum+Number(p.amount),0);
  const next=data.classes.filter(c=>c.student===student.name&&c.status==='Pendiente'&&c.date>=localDate()).sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time))[0];
  if(q.includes('pago')||q.includes('debe')||q.includes('cobrar'))return pending?`${student.name} tiene ${money(pending)} pendiente por pagar.`:`${student.name} no tiene pagos pendientes.`;
  if(q.includes('clase')||q.includes('proxima'))return next?`La próxima clase de ${student.name} es el ${dateLabel(next.date)} a las ${next.time}, de ${next.subject}${next.topic?`, tema: ${next.topic}`:''}.`:`${student.name} no tiene clases pendientes.`;
  return `Resumen de ${student.name}:
• Materia: ${student.subject}
• Grado: ${student.grade}
• Progreso: ${student.progress}%
• Asistencia: ${a.rate===null?'sin registros':a.rate+'%'}
• Tareas: ${t.completed} completadas y ${t.pending} pendientes
• Promedio: ${g===null?'sin evaluaciones':g}
• Pago pendiente: ${money(pending)}
• Objetivo: ${student.goal||'sin definir'}`;
 }
 if(q.includes('hoy')&&q.includes('clase'))return classesAnswer(localDate());
 if(q.includes('manana')&&q.includes('clase'))return classesAnswer(localDate(1));
 if((q.includes('semana')||q.includes('proximas'))&&q.includes('clase')){
  const end=localDate(7),rows=data.classes.filter(c=>c.date>=localDate()&&c.date<=end&&c.status==='Pendiente').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  return rows.length?`Próximas clases:\n${rows.map(c=>`• ${c.date} ${c.time} — ${c.student}, ${c.subject}`).join('\n')}`:'No hay clases pendientes durante los próximos siete días.';
 }
 if(q.includes('pendiente')&&(q.includes('pago')||q.includes('quien'))||q.includes('cobrar')){
  const rows=data.payments.filter(p=>p.status==='Pendiente');
  return rows.length?`Pagos pendientes (${money(rows.reduce((a,p)=>a+Number(p.amount),0))}):\n${rows.map(p=>`• ${p.student}: ${money(p.amount)} — ${p.concept}`).join('\n')}`:'No hay pagos pendientes.';
 }
 if(q.includes('ganancia')||q.includes('utilidad')||q.includes('ingreso')||q.includes('egreso')){
  const month=new Date().toISOString().slice(0,7),f=financeData(month);
  return `Finanzas del mes:
• Ingresos cobrados: ${money(f.income)}
• Egresos: ${money(f.expenseTotal)}
• Utilidad neta: ${money(f.income-f.expenseTotal)}
• Por cobrar: ${money(f.pendingTotal)}`;
 }
 if(q.includes('atencion')||q.includes('prioridad')||q.includes('necesitan')){
  const rows=studentAttentionList();
  return rows.length?`Alumnos que conviene revisar:\n${rows.map(x=>`• ${x.s.name}: ${x.reasons.join(', ')}`).join('\n')}`:'No detecté alumnos con alertas académicas importantes.';
 }
 if(q.includes('progreso')){
  const avg=data.students.length?Math.round(data.students.reduce((a,s)=>a+Number(s.progress),0)/data.students.length):0;
  return `El progreso promedio es ${avg}%. El alumno con mayor avance es ${[...data.students].sort((a,b)=>b.progress-a.progress)[0]?.name||'ninguno'}.`;
 }
 if(q.includes('resumen')||q.includes('general')){
  const month=new Date().toISOString().slice(0,7),f=financeData(month);
  return `Resumen general:
• Alumnos activos: ${data.students.length}
• Clases pendientes: ${data.classes.filter(c=>c.status==='Pendiente').length}
• Clases hoy: ${data.classes.filter(c=>c.date===localDate()&&c.status!=='Cancelada').length}
• Pagos por cobrar: ${money(f.pendingTotal)}
• Utilidad del mes: ${money(f.income-f.expenseTotal)}
• Alumnos por atender: ${studentAttentionList().length}`;
 }
 return `No identifiqué exactamente la consulta. Prueba con:
• “¿Qué clases tengo mañana?”
• “Muéstrame el progreso de [nombre]”
• “¿Quién tiene pagos pendientes?”
• “¿Cuánto gané este mes?”
• “¿Qué alumnos necesitan atención?”`;
}
function renderAthenaHistory(){
 const chat=$('#athenaChat');if(!chat)return;
 if(!data.athenaHistory.length){
  chat.innerHTML=`<div class="athena-message bot"><div class="athena-bubble"><strong>Hola, soy Atenea.</strong>\nPuedo analizar alumnos, clases, pagos, tareas, asistencia y finanzas.<span class="athena-time">Ahora</span></div></div>`;
  return;
 }
 chat.innerHTML=data.athenaHistory.map(m=>`<div class="athena-message ${m.role}"><div class="athena-bubble">${esc(m.text)}<span class="athena-time">${esc(m.time||'')}</span></div></div>`).join('');
 chat.scrollTop=chat.scrollHeight;
}
function sendAthena(q){
 if(!q.trim())return;
 const time=new Intl.DateTimeFormat('es-MX',{hour:'2-digit',minute:'2-digit'}).format(new Date());
 data.athenaHistory.push({role:'user',text:q,time},{role:'bot',text:athenaAnswer(q),time});
 data.athenaHistory=data.athenaHistory.slice(-40);
 save();renderAthenaHistory();athenaSnapshot();
}
$('#athenaSuggestions').onclick=e=>{const b=e.target.closest('button');if(b)sendAthena(b.dataset.question||b.textContent)};
$('#athenaAdminForm').onsubmit=e=>{e.preventDefault();const i=$('#athenaAdminInput');sendAthena(i.value);i.value='';i.focus()};
$('#clearAthenaHistory').onclick=()=>{if(confirm('¿Limpiar la conversación con Atenea?')){data.athenaHistory=[];save();renderAthenaHistory()}};


function studentStats(s){const attended=s.attendance.filter(x=>String(x.value).toLowerCase().includes('asist')).length,total=s.attendance.length,attendanceRate=total?Math.round(attended/total*100):0,completed=s.tasks.filter(x=>String(x.value).toLowerCase().includes('complet')).length,nums=s.grades.map(x=>Number(x.value)).filter(Number.isFinite),gradeAvg=nums.length?(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(1):'—';return{attendanceRate,completed,gradeAvg}}
function profileRecordPanel(s,type,title){const labels={attendance:'Registrar asistencia',tasks:'Nueva tarea',grades:'Nueva evaluación'},records=s[type]||[];return `<section class="profile-panel" data-profile-panel="${type}"><div class="academic-toolbar"><h3>${title}</h3><button onclick="openAcademicRecord(${s.id},'${type}')">+ ${labels[type]}</button></div><div class="record-list">${records.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(r=>`<article class="record-card"><div class="record-date">${esc(r.date)}</div><div><h4>${esc(r.title)}</h4><p>${esc(r.description||'')}</p></div><div><span class="record-value">${esc(r.value||'')}</span><button onclick="deleteAcademicRecord(${s.id},'${type}',${r.id})">Eliminar</button></div></article>`).join('')||'<div class="empty">Todavía no hay registros.</div>'}</div></section>`}
window.openStudentProfile=id=>{const s=data.students.find(x=>x.id===id);if(!s)return;const st=studentStats(s);$('#profileContent').innerHTML=`<div class="profile-shell"><header class="profile-header"><div class="student-avatar">${esc(s.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><p class="eyebrow">Expediente académico</p><h2>${esc(s.name)}</h2><p>${esc(s.grade)} · ${esc(s.subject)} · ${s.age} años</p></div><button class="profile-close" onclick="document.querySelector('#profileDialog').close()">×</button></header><div class="profile-stats"><article class="profile-stat"><span>Progreso</span><strong>${s.progress}%</strong></article><article class="profile-stat"><span>Asistencia</span><strong>${st.attendanceRate}%</strong></article><article class="profile-stat"><span>Tareas completadas</span><strong>${st.completed}</strong></article><article class="profile-stat"><span>Promedio</span><strong>${st.gradeAvg}</strong></article></div><div class="profile-tabs"><button class="profile-tab active" data-profile-tab="overview">Resumen</button><button class="profile-tab" data-profile-tab="attendance">Asistencia</button><button class="profile-tab" data-profile-tab="tasks">Tareas</button><button class="profile-tab" data-profile-tab="grades">Evaluaciones</button><button class="profile-tab" data-profile-tab="history">Historial</button></div><section class="profile-panel active" data-profile-panel="overview"><div class="notes-box"><h3>Objetivo actual</h3><p>${esc(s.goal||'Sin definir')}</p><h3>Observaciones</h3><p>${esc(s.notes||'Sin observaciones')}</p></div></section>${profileRecordPanel(s,'attendance','Asistencia')}${profileRecordPanel(s,'tasks','Tareas')}${profileRecordPanel(s,'grades','Evaluaciones')}<section class="profile-panel" data-profile-panel="history"><div class="academic-toolbar"><h3>Línea de tiempo</h3><button onclick="openAcademicRecord(${s.id},'history')">+ Añadir nota</button></div><div class="timeline">${(s.history||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)).map(r=>`<div class="timeline-item"><small>${esc(r.date)}</small><h4>${esc(r.title)}</h4><p>${esc(r.description||'')}</p></div>`).join('')||'<div class="empty">Sin eventos registrados.</div>'}</div></section></div>`;$$('.profile-tab').forEach(b=>b.onclick=()=>{$$('.profile-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('[data-profile-panel]').forEach(x=>x.classList.toggle('active',x.dataset.profilePanel===b.dataset.profileTab))});$('#profileDialog').showModal()};
window.openAcademicRecord=(studentId,type)=>{const titles={attendance:'Registrar asistencia',tasks:'Registrar tarea',grades:'Registrar evaluación',history:'Añadir evento al historial'},labels={attendance:'Estado (Asistió / Falta justificada / Falta)',tasks:'Estado (Pendiente / Completada)',grades:'Calificación (0 a 10)',history:'Dato adicional'};$('#recordDialogTitle').textContent=titles[type];$('#recordValueLabel').childNodes[0].nodeValue=labels[type];$('#academicRecordForm').reset();$('#academicRecordForm [name=studentId]').value=studentId;$('#academicRecordForm [name=recordType]').value=type;$('#academicRecordForm [name=date]').value=new Date().toISOString().slice(0,10);$('#academicRecordDialog').showModal()};
$('#saveAcademicRecord').onclick=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData($('#academicRecordForm')));if(!fd.title||!fd.date)return;const s=data.students.find(x=>x.id===Number(fd.studentId));if(!s)return;const type=fd.recordType;s[type]=s[type]||[];s[type].push({id:Date.now(),title:fd.title,date:fd.date,value:fd.value,description:fd.description});if(type!=='history'){s.history=s.history||[];s.history.push({id:Date.now()+1,date:fd.date,title:`Nuevo registro: ${fd.title}`,description:`Se agregó un registro académico.`})}save();$('#academicRecordDialog').close();openStudentProfile(s.id);renderAll()};
window.deleteAcademicRecord=(studentId,type,id)=>{if(!confirm('¿Eliminar este registro?'))return;const s=data.students.find(x=>x.id===studentId);if(!s)return;s[type]=(s[type]||[]).filter(x=>x.id!==id);save();openStudentProfile(studentId);renderAll()};


function applySettings(){
 const s=data.settings||{};
 const brand=$('.brand strong');if(brand&&s.institution)brand.textContent=s.institution;
 document.title=`${s.institution||'Rumbo a Ingeniería'} · Galileo`;
}
$('#settingsBtn').onclick=()=>{
 const f=$('#settingsForm');Object.entries(data.settings).forEach(([k,v])=>{const el=f.elements[k];if(el)el.value=v||''});
 $('#settingsDialog').showModal();
};
$('#saveSettings').onclick=e=>{
 e.preventDefault();const fd=Object.fromEntries(new FormData($('#settingsForm')));
 data.settings={...data.settings,...fd};save();applySettings();$('#settingsDialog').close();toast('Configuración guardada.');
};
$('#backupBtn').onclick=()=>{
 const payload={version:'0.9.5',exportedAt:new Date().toISOString(),data};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=`respaldo-galileo-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);toast('Respaldo descargado.');
};
$('#restoreInput').onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const parsed=JSON.parse(await file.text()),incoming=parsed.data||parsed;
  if(!incoming.students||!incoming.classes||!incoming.payments)throw new Error('Formato inválido');
  if(!confirm('La restauración reemplazará los datos actuales. ¿Continuar?'))return;
  data={...seed,...incoming,expenses:incoming.expenses||[],athenaHistory:incoming.athenaHistory||[],settings:{...data.settings,...(incoming.settings||{})}};
  save();applySettings();renderAll();$('#settingsDialog').close();toast('Respaldo restaurado.');
 }catch(err){toast('No se pudo restaurar: archivo inválido.','error')}
 e.target.value='';
};
$('#resetDataBtn').onclick=()=>{
 const first=confirm('¿Reiniciar todos los datos de Galileo? Esta acción borrará alumnos, clases y finanzas.');
 if(!first)return;
 const phrase=prompt('Escribe REINICIAR para confirmar:');
 if(phrase!=='REINICIAR')return toast('Reinicio cancelado.','info');
 data=JSON.parse(JSON.stringify(seed));data.expenses=data.expenses||[];data.athenaHistory=[];data.settings={institution:'Rumbo a Ingeniería',teacher:'',phone:'',email:'',hours:'Lunes a sábado, 5:00–9:00 pm',currency:'MXN'};
 save();applySettings();renderAll();$('#settingsDialog').close();toast('Datos reiniciados.');
};

let notificationFilter='all';
function packageRemaining(pkg){return Math.max(0,Number(pkg.total||0)-Number(pkg.used||0))}
function renderPackages(){
 const rows=[...data.packages].sort((a,b)=>(b.purchaseDate||'').localeCompare(a.purchaseDate||''));
 const active=rows.filter(p=>p.status==='Activo'&&packageRemaining(p)>0);
 $('#pkgActive').textContent=active.length;
 $('#pkgRemaining').textContent=active.reduce((a,p)=>a+packageRemaining(p),0);
 $('#pkgLow').textContent=active.filter(p=>packageRemaining(p)<=1).length;
 $('#packagesTable').innerHTML=rows.length?`<table><thead><tr><th>Alumno</th><th>Paquete</th><th>Uso</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows.map(p=>{
  const rem=packageRemaining(p),pct=Math.min(100,Math.round(Number(p.used||0)/Number(p.total||1)*100));
  return `<tr><td><b>${esc(p.student)}</b></td><td>${esc(p.name)}<small>${esc(p.duration||'')}</small></td><td><b>${p.used||0}/${p.total}</b><div class="package-progress"><i style="width:${pct}%"></i></div><small>${rem} restantes</small></td><td>${esc(p.expires||'Sin vencimiento')}</td><td><span class="status-pill ${rem<=1?'low':''}">${esc(rem===0?'Finalizado':p.status)}</span></td><td><button data-use-package="${p.id}" ${rem===0?'disabled':''}>Usar sesión</button> <button data-delete-package="${p.id}">Eliminar</button></td></tr>`;
 }).join('')}</tbody></table>`:'<div class="empty">Todavía no hay paquetes asignados.</div>';
}
function populateHorizonSelects(){
 const options=data.students.map(s=>`<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('');
 if($('#packageStudent'))$('#packageStudent').innerHTML=options;
 if($('#certificateStudent'))$('#certificateStudent').innerHTML=options;
}
function generateNotifications(){
 const generated=[],today=localDate(),tomorrow=localDate(1);
 data.classes.filter(c=>c.status==='Pendiente'&&(c.date===today||c.date===tomorrow)).forEach(c=>generated.push({
  id:`class-${c.id}-${c.date}`,type:'academic',icon:'📅',title:c.date===today?'Clase programada hoy':'Clase programada mañana',
  message:`${c.student} · ${c.subject} a las ${c.time}.`,date:today,read:false
 }));
 data.payments.filter(p=>p.status==='Pendiente').forEach(p=>generated.push({
  id:`pay-${p.id}`,type:'financial',icon:'💳',title:'Pago pendiente',message:`${p.student} tiene ${money(p.amount)} pendiente por ${p.concept}.`,date:today,read:false
 }));
 data.packages.filter(p=>p.status==='Activo'&&packageRemaining(p)<=1).forEach(p=>generated.push({
  id:`pkg-${p.id}-${packageRemaining(p)}`,type:'academic',icon:'📦',title:'Paquete próximo a terminar',message:`A ${p.student} le quedan ${packageRemaining(p)} sesiones.`,date:today,read:false
 }));
 data.students.filter(s=>Number(s.progress)<45).forEach(s=>generated.push({
  id:`progress-${s.id}-${s.progress}`,type:'academic',icon:'📊',title:'Seguimiento académico',message:`${s.name} registra ${s.progress}% de progreso.`,date:today,read:false
 }));
 generated.forEach(n=>{if(!data.notifications.some(x=>x.id===n.id))data.notifications.unshift(n)});
 save();
}
function renderNotifications(){
 let rows=data.notifications;
 if(notificationFilter==='unread')rows=rows.filter(n=>!n.read);
 else if(notificationFilter!=='all')rows=rows.filter(n=>n.type===notificationFilter);
 $('#notificationsList').innerHTML=rows.length?rows.map(n=>`<article class="notification-card ${n.read?'':'unread'}"><div class="notification-icon">${n.icon||'🔔'}</div><div><b>${esc(n.title)}</b><p>${esc(n.message)}</p><small>${esc(n.date||'')}</small></div><button data-read-notification="${esc(n.id)}">${n.read?'Marcar no leída':'Marcar leída'}</button></article>`).join(''):'<div class="empty">No hay notificaciones en esta categoría.</div>';
}
function renderCertificates(){
 $('#certificatesGrid').innerHTML=data.certificates.length?data.certificates.map(c=>`<article class="certificate-card"><p class="eyebrow">${esc(c.type)}</p><h3>${esc(c.title)}</h3><b>${esc(c.student)}</b><p>${esc(c.description)}</p><small>${esc(c.subject||'Formación académica')} · ${esc(c.date)}</small><div class="certificate-actions"><button data-print-certificate="${c.id}">Imprimir</button><button data-delete-certificate="${c.id}">Eliminar</button></div></article>`).join(''):'<div class="empty">Todavía no se han creado certificados.</div>';
}
function printCertificate(id){
 const c=data.certificates.find(x=>x.id===id);if(!c)return;
 const institution=esc(data.settings.institution||'Rumbo a Ingeniería'),teacher=esc(data.settings.teacher||'Dirección académica');
 const w=window.open('','_blank','width=1000,height=700');
 w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(c.title)}</title><style>
 body{font-family:Georgia,serif;margin:0;display:grid;place-items:center;min-height:100vh;background:#eef4fb}.cert{width:900px;box-sizing:border-box;padding:65px;border:12px double #174a78;background:white;text-align:center;position:relative}.cert:after{content:"✦";font-size:70px;color:#d3aa32;position:absolute;right:45px;top:25px}.brand{letter-spacing:.18em;color:#174a78}.student{font-size:42px;margin:28px;border-bottom:2px solid #d3aa32;padding-bottom:12px}.desc{font-size:20px;line-height:1.6}.footer{display:flex;justify-content:space-around;margin-top:55px}.line{border-top:1px solid #333;padding-top:8px;width:250px}@media print{body{background:white}.cert{width:100%;min-height:95vh}}</style></head><body><main class="cert"><p class="brand">${institution}</p><h1>${esc(c.title)}</h1><p>Se otorga el presente reconocimiento a</p><div class="student">${esc(c.student)}</div><p class="desc">${esc(c.description)}</p><p><b>${esc(c.subject||'Formación académica')}</b></p><div class="footer"><div class="line">${teacher}</div><div class="line">${esc(c.date)}</div></div></main><script>window.onload=()=>window.print()<\/script></body></html>`);
 w.document.close();
}
$('#newPackageBtn').onclick=()=>{populateHorizonSelects();const f=$('#packageForm');f.reset();f.elements.purchaseDate.value=localDate();$('#packageDialog').showModal()};
$('#packageForm').onsubmit=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));data.packages.push({...fd,id:Date.now(),total:Number(fd.total),used:0});save();$('#packageDialog').close();generateNotifications();renderAll();toast('Paquete asignado.')};
$('#packagesTable').onclick=e=>{
 const use=e.target.closest('[data-use-package]'),del=e.target.closest('[data-delete-package]');
 if(use){const p=data.packages.find(x=>x.id===Number(use.dataset.usePackage));if(p&&packageRemaining(p)>0){p.used=Number(p.used||0)+1;if(packageRemaining(p)===0)p.status='Finalizado';save();generateNotifications();renderAll();toast('Sesión descontada del paquete.')}}
 if(del&&confirm('¿Eliminar este paquete?')){data.packages=data.packages.filter(x=>x.id!==Number(del.dataset.deletePackage));save();renderAll();toast('Paquete eliminado.','info')}
};
$('#generateNotificationsBtn').onclick=()=>{generateNotifications();renderNotifications();toast('Notificaciones actualizadas.')};
$$('[data-notification-filter]').forEach(b=>b.onclick=()=>{notificationFilter=b.dataset.notificationFilter;$$('[data-notification-filter]').forEach(x=>x.classList.toggle('active',x===b));renderNotifications()});
$('#notificationsList').onclick=e=>{const b=e.target.closest('[data-read-notification]');if(!b)return;const n=data.notifications.find(x=>String(x.id)===b.dataset.readNotification);if(n){n.read=!n.read;save();renderNotifications()}};
$('#newCertificateBtn').onclick=()=>{populateHorizonSelects();const f=$('#certificateForm');f.reset();f.elements.date.value=localDate();$('#certificateDialog').showModal()};
$('#certificateForm').onsubmit=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));data.certificates.unshift({...fd,id:Date.now()});save();$('#certificateDialog').close();renderAll();toast('Certificado creado.')};
$('#certificatesGrid').onclick=e=>{
 const print=e.target.closest('[data-print-certificate]'),del=e.target.closest('[data-delete-certificate]');
 if(print)printCertificate(Number(print.dataset.printCertificate));
 if(del&&confirm('¿Eliminar este certificado?')){data.certificates=data.certificates.filter(x=>x.id!==Number(del.dataset.deleteCertificate));save();renderAll();toast('Certificado eliminado.','info')}
};
$$('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
function renderAll(){renderDashboard();renderStudents();renderClasses();renderPayments();renderPackages();renderNotifications();renderCertificates();renderReports();renderAthenaHistory();athenaSnapshot();populateHorizonSelects();applySettings()}
save();generateNotifications();
renderAll();
