import {z} from 'zod';
import data from '../data/case.json';
import type {SimState,Action} from './engine';

export const oxygenScript=data.oxygen_simulation;
export const oxygenSchema=z.object({
  variant:z.enum(['base','empty']),sourceId:z.enum(['station','transport']).nullable(),checked:z.boolean(),
  deviceId:z.string().nullable(),flowLpm:z.number().nullable(),startedAt:z.number().nonnegative().nullable(),
  stationUsedMin:z.number().nonnegative(),transportUsedMin:z.number().nonnegative(),
  reading:z.object({status:z.enum(['unmeasured','baseline','pending','unvalidated','scripted']),spo2:z.number().min(0).max(100).nullable(),at:z.number().nonnegative().nullable(),responseId:z.string().nullable()})
});
export function newOxygen(variant:'base'|'empty'='base'):z.infer<typeof oxygenSchema>{return {variant,sourceId:null,checked:false,deviceId:null,flowLpm:null,startedAt:null,stationUsedMin:0,transportUsedMin:0,reading:{status:'unmeasured',spo2:null,at:null,responseId:null}};}
const f=(s:SimState)=>data.facilities.find(f=>f.id===s.facilityId)!;
export function reserve(s:SimState,sourceId=s.oxygen.sourceId){
  if(sourceId==='transport')return Math.max(0,f(s).transport.oxygen_autonomy_min-s.oxygen.transportUsedMin);
  if(sourceId==='station')return s.oxygen.variant==='empty'?0:Math.max(0,(f(s).resources.find(r=>r.id==='oxygen')?.autonomy_min??0)-s.oxygen.stationUsedMin);
  return 0;
}
export function sourceOperational(s:SimState){
  if(s.oxygen.sourceId==='transport'){const t=f(s).transport;return s.referralAt!==null&&s.ambulanceAt!==null&&s.minute>=s.ambulanceAt&&t.assisted&&t.trained_team&&t.oximetry&&reserve(s)>0;}
  const r=f(s).resources.find(r=>r.id==='oxygen');
  return s.oxygen.sourceId==='station'&&s.oxygen.variant==='base'&&!!r&&r.available&&r.authorized_in_scenario&&r.staff_present&&r.supplies_present&&r.quantity>0&&reserve(s)>0;
}
export function supportActive(s:SimState){return s.oxygenStarted&&s.oxygen.startedAt!==null&&s.oxygen.checked&&sourceOperational(s);}
export function responseFor(s:SimState){return oxygenScript.responses.find(r=>r.device_id===s.oxygen.deviceId&&r.flow_lpm===s.oxygen.flowLpm&&r.source_status==='operational');}
export function oxygenStatus(s:SimState){return supportActive(s)?`Activo · ${s.oxygen.deviceId==='nasal'?'cánula':'mascarilla'} · ${s.oxygen.flowLpm} L/min`:s.oxygenStarted?'¡Soporte interrumpido!':'Sin soporte activo';}
export function measureOximetry(s:SimState,at:number){
  const o=s.oxygen;
  if(!s.oxygenStarted){
    if(s.events.some(e=>e.kind==='oxygen'&&e.accepted)){
      o.reading={status:'unvalidated',spo2:null,at,responseId:null};return 'Respuesta no validada después de retirar el soporte. El valor basal no se reutiliza como nueva medición.';
    }
    o.reading={status:'baseline',spo2:data.patient.initial_vitals.spo2_percent,at,responseId:null};return 'SpO₂ basal 88 % al aire ambiente · dato inicial del caso sintético.';
  }
  const response=responseFor(s);
  if(!supportActive(s)||!response){o.reading={status:'unvalidated',spo2:null,at,responseId:null};return 'Respuesta no validada: no hay soporte efectivo o guion para esta combinación. No se fabrica SpO₂.';}
  if(at-o.startedAt!<response.reevaluation_min){o.reading={status:'pending',spo2:null,at,responseId:null};return `Reevaluación pendiente: guion ${response.id}, a partir del minuto ${o.startedAt!+response.reevaluation_min}.`;} 
  o.reading={status:'scripted',spo2:response.simulated_spo2_percent,at,responseId:response.id};
  return `SpO₂ ${response.simulated_spo2_percent} % SIMULADA · ${response.id} · VM-06 pendiente. ${response.interpretation}`;
}
export function oxygenAction(s:SimState,a:Action):{accepted:boolean;text:string;duration:number;critical?:boolean}{
  const o=s.oxygen,ok=(text:string,duration=0)=>({accepted:true,text,duration}),no=(text:string,critical=false)=>({accepted:false,text,duration:0,critical});
  if(a.kind==='check_reserve')return ok(`Reserva: fuente local ${reserve(s,'station')} min; transporte ${reserve(s,'transport')} min (independiente). Autonomía docente; sin presión ni volumen inferidos.`);
  if(a.kind==='stop_oxygen'){
    if(!s.oxygenStarted)return no('No hay soporte iniciado para detener.');
    s.oxygenStarted=false;o.startedAt=null;o.checked=false;o.reading={status:'unvalidated',spo2:null,at:null,responseId:null};
    return ok('Soporte detenido por el estudiante. Reevaluar y gestionar soporte alternativo; no se asume seguridad sin oxígeno.');
  }
  if(s.oxygenStarted)return no('Detén el soporte antes de cambiar la configuración. El inicio repetido no consume reserva.');
  if(a.kind==='oxygen_variant'){
    if(s.events.some(e=>e.kind==='oxygen'&&e.accepted))return no('La variante solo puede elegirse antes del primer soporte.');
    if(a.value!=='base'&&a.value!=='empty')return no('Variante inexistente.');
    o.variant=a.value;o.checked=false;return ok(`Variante ficticia: ${a.value==='base'?'fuente operativa':'fuente vacía'}.`);
  }
  if(a.kind==='select_source'){
    if(a.value!=='station'&&a.value!=='transport')return no('Fuente inexistente.');
    o.sourceId=a.value;o.checked=false;return ok(`Fuente seleccionada: ${a.value==='station'?'local':'transporte independiente'}. Debe comprobarse antes de iniciar.`);
  }
  if(a.kind==='check_oxygen'){
    o.checked=false;
    if(!sourceOperational(s))return no('Falla de fuente: sin reserva, no operativa o transporte aún no disponible. Coordina alternativas y referencia; una salida sin soporte no es segura.',true);
    o.checked=true;return ok(`Fuente comprobada y operativa. Reserva declarada restante ${reserve(s)} min.`);
  }
  if(a.kind==='select_device'){
    if(!oxygenScript.devices.some(d=>d.id===a.value))return no('Dispositivo no disponible en el guion.');
    o.deviceId=String(a.value);o.flowLpm=null;return ok('Dispositivo registrado; selecciona un flujo habilitado por el guion docente.');
  }
  if(a.kind==='select_flow'){
    const d=oxygenScript.devices.find(d=>d.id===o.deviceId);
    if(typeof a.value!=='number'||!d?.flows_lpm.includes(a.value))return no('Flujo fuera de los controles permitidos para el dispositivo.');
    o.flowLpm=a.value;return ok(`Flujo registrado: ${a.value} L/min · configuración ficticia pendiente de VM-06.`);
  }
  if(a.kind==='oxygen'){
    if(!o.checked||!sourceOperational(s))return no('Comprueba una fuente operativa con reserva antes de iniciar soporte.',true);
    const d=oxygenScript.devices.find(d=>d.id===o.deviceId);
    if(!d||o.flowLpm===null||!d.flows_lpm.includes(o.flowLpm))return no('Selecciona dispositivo y flujo permitidos antes de iniciar.');
    s.oxygenStarted=true;o.startedAt=s.minute;o.reading={status:'pending',spo2:null,at:null,responseId:null};
    return ok(`Soporte iniciado: ${d.label}, ${o.flowLpm} L/min. Reevaluar con oxímetro. VM-06 pendiente; sin respuesta calculada.`,1);
  }
  return no('Acción de oxígeno desconocida.');
}
export function consumeReserve(s:SimState,duration:number){
  if(!s.oxygenStarted||duration<=0)return;
  if(s.oxygen.sourceId==='station')s.oxygen.stationUsedMin+=Math.min(duration,reserve(s));
  if(s.oxygen.sourceId==='transport')s.oxygen.transportUsedMin+=Math.min(duration,reserve(s));
  if(!sourceOperational(s)){s.oxygen.checked=false;s.oxygen.reading={status:'unvalidated',spo2:null,at:null,responseId:null};if(!s.criticalFlags.includes('oxygen_exhausted'))s.criticalFlags.push('oxygen_exhausted');}
}
export function monitor(s:SimState){
  const v=data.patient.initial_vitals,r=s.oxygen.reading;
  return {spo2:r.spo2===null?'—':String(r.spo2),spo2Status:{unmeasured:'Medición pendiente',baseline:'Basal · aire ambiente',pending:'Reevaluación pendiente',unvalidated:'Respuesta no validada',scripted:'SIMULADA · VM-06 pendiente'}[r.status],
    heart:s.examined?`${v.heart_rate_per_min}`:'—',respiratory:s.examined?`${v.respiratory_rate_per_min}`:'—',bp:s.examined?`${v.systolic_bp_mmhg}/${v.diastolic_bp_mmhg}`:'—',temperature:s.examined?`${v.temperature_c}`.replace('.',','):'—',support:oxygenStatus(s),
    spo2Alert:r.status==='baseline'?'! Bajo · caso':r.status==='scripted'?(responseFor(s)?.insufficient?'! Insuficiente · guion':'SIM · sin juicio de estabilidad'):'PENDIENTE',
    examinedStatus:s.examined?'Registro inicial del caso':'Medición pendiente'};
}
