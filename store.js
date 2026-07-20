const KEY='rai_v200_cloud_cache';
const seed={
 profiles:[
  {id:'admin-1',role:'admin',name:'Santiago Ramírez',email:'admin@rumboaingenieria.mx',pin:'2607',status:'active'},
  {id:'teacher-1',role:'teacher',name:'Luis Hernández',email:'luis@demo.mx',pin:'5832',status:'active'},
  {id:'student-1',role:'student',name:'Valeria Soto',email:'valeria@demo.mx',pin:'1001',status:'active',progress:78},
  {id:'parent-1',role:'parent',name:'María Soto',email:'maria@demo.mx',pin:'7001',status:'active'}],
 links:[{parentId:'parent-1',studentId:'student-1'}],
 courses:[{id:'course-1',title:'Álgebra esencial',subject:'Matemáticas',teacherId:'teacher-1',studentIds:['student-1'],status:'active'}],
 assignments:[{id:'as-1',courseId:'course-1',title:'Ecuaciones lineales',instructions:'Resuelve y explica el procedimiento.',dueDate:'2026-07-28',points:100,status:'published'}],
 submissions:[],classes:[{id:'cl-1',courseId:'course-1',teacherId:'teacher-1',studentIds:['student-1'],date:'2026-07-24',time:'18:00',duration:60,status:'scheduled',meetingUrl:''}],
 attendance:[],resources:[{id:'res-1',title:'Guía de ecuaciones',subject:'Matemáticas',level:'Secundaria',type:'PDF',url:'',description:'Ejemplos y ejercicios.',createdBy:'teacher-1'}],messages:[],payments:[],notifications:[],athenaHistory:[]
};
export const Store={
 load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch{return structuredClone(seed)}},
 save(data){localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent('rai:update'));},
 reset(){localStorage.removeItem(KEY);return this.load()},
 uid(prefix='id'){return `${prefix}-${crypto.randomUUID?.()||Date.now()}`}
};
