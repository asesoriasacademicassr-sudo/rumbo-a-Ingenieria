import {CONFIG} from './config.js';import {Store} from './store.js';
const SESSION='rai_v200_session';
export const Auth={
 current(){try{return JSON.parse(sessionStorage.getItem(SESSION))}catch{return null}},
 async signIn({role,email,pin}){const db=Store.load();const user=db.profiles.find(p=>p.role===role&&p.status==='active'&&((email&&p.email.toLowerCase()===email.toLowerCase())||(pin&&p.pin===pin)));if(!user)throw new Error('Datos de acceso incorrectos.');const session={id:user.id,role:user.role,name:user.name,email:user.email,mode:CONFIG.mode};sessionStorage.setItem(SESSION,JSON.stringify(session));return session},
 signOut(){sessionStorage.removeItem(SESSION)},
 requireRole(...roles){const s=this.current();return s&&roles.includes(s.role)?s:null}
};
