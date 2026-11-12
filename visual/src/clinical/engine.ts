import source from '../data/case.json';
import { z } from 'zod';
import {oxygenSchema,newOxygen,oxygenAction,measureOximetry,consumeReserve,supportActive,reserve,sourceOperational,responseFor} from './oxygen';

export const caseData = source;
export type FacilityId = 'F_I2' | 'F_I4';
export type Target = 'patient' | 'oximeter' | 'stethoscope' | 'oxygen' | 'cabinet' | 'phone' | 'door' | 'xray' | 'lab' | 'clock';
export type Tool = 'oximeter' | 'stethoscope' | 'oxygen' | 'tx01';
export const actions = ['select_source','check_oxygen','select_device','select_flow','check_reserve','stop_oxygen','oxygen_variant','interview_symptoms','interview_safety','interview_context','oximetry','examine','oxygen','tx01','coordinate','handover','prepare_transfer','unassisted_exit','request_xray','request_lab','wait','finish'] as const;
export type ActionKind = typeof actions[number];
export type Action = { id: string; kind: ActionKind; value?:string|number };
const eventSchema = z.object({ id:z.string(), kind:z.enum(actions), value:z.union([z.string(),z.number()]).optional(), at:z.number().nonnegative(), duration:z.number().nonnegative(), accepted:z.boolean(), text:z.string(), critical:z.boolean() });
const legacySchema = z.object({
  version:z.literal(2), caseVersion:z.literal('0.1.0'), facilityId:z.enum(['F_I2','F_I4']), phase:z.enum(['active','completed']),
  minute:z.number().min(0).max(1440), avoidableDelay:z.number().nonnegative(),
  history:z.array(z.enum(['symptoms','safety','context'])), examined:z.boolean(), sensorAttached:z.boolean(), oxygenStarted:z.boolean(), txGiven:z.boolean(),
  ceftriaxone:z.number().int().nonnegative(), azithromycin:z.number().int().nonnegative(),
  referralAt:z.number().nullable(), ambulanceAt:z.number().nullable(), handoverSignature:z.string().nullable(), transferPrepared:z.boolean(),
  xrayRequestedAt:z.number().nullable(), xrayStatus:z.enum(['not_requested','pending','available']), labRequested:z.boolean(),
  criticalFlags:z.array(z.string()), events:z.array(eventSchema).max(1000)
});
const stateSchema=legacySchema.extend({version:z.literal(3),oxygen:oxygenSchema,migrationNotice:z.string().nullable()});
export type SimState = z.infer<typeof stateSchema>;
export type SimEvent = z.infer<typeof eventSchema>;
export const STORAGE_KEY = 'simul-ande:visual:v3';
export const LEGACY_STORAGE_KEY='simul-ande:visual:v2';
export function facility(id:FacilityId) { return caseData.facilities.find(f=>f.id===id)!; }
export function newState(id:FacilityId = 'F_I2',variant:'base'|'empty'='base'):SimState {
  const resources=facility(id).resources;
  return {version:3,oxygen:newOxygen(variant),migrationNotice:null,caseVersion:'0.1.0',facilityId:id,phase:'active',minute:0,avoidableDelay:0,history:[],examined:false,sensorAttached:false,oxygenStarted:false,txGiven:false,
    ceftriaxone:resources.find(r=>r.id==='ceftriaxone_1g')!.quantity,azithromycin:resources.find(r=>r.id==='azithromycin_500mg')!.quantity,
    referralAt:null,ambulanceAt:null,handoverSignature:null,transferPrepared:false,xrayRequestedAt:null,xrayStatus:'not_requested',labRequested:false,criticalFlags:[],events:[]};
}
export function handoverSignature(s:SimState) { return JSON.stringify([s.history.slice().sort(),s.examined,s.sensorAttached,supportActive(s),s.oxygen.sourceId,s.oxygen.deviceId,s.oxygen.flowLpm,s.oxygen.reading,s.txGiven,s.xrayStatus,s.labRequested]); }
export function resourceAvailable(s:SimState,id:string,quantity=1) {
  const r=facility(s.facilityId).resources.find(r=>r.id===id);
  return !!r && r.available && r.authorized_in_scenario && r.staff_present && r.supplies_present && r.quantity>=quantity;
}
export function missingTransfer(s:SimState):string[] {
  const missing:string[]=[];
  if(!s.sensorAttached) missing.push('registrar la oximetría');
  if(!s.examined) missing.push('exploración física');
  if(s.history.length<3) missing.push('completar la entrevista dirigida');
  if(!supportActive(s)) missing.push('soporte con oxígeno efectivo y comprobado');
  if(s.referralAt===null) missing.push('confirmar receptor y transporte');
  if(s.handoverSignature!==handoverSignature(s)) missing.push('entrega clínica actualizada');
  return missing;
}
export function transferGuidance(s:SimState):string[] {
  const messages:string[]=[];
  if(!supportActive(s))messages.push('Antes de preparar el traslado, intenta estabilizar al paciente con los recursos disponibles. En este caso falta comprobar e iniciar un soporte de oxígeno efectivo.');
  if(s.referralAt===null)messages.push('Coordina la emergencia con el hospital receptor del guion y confirma un transporte asistido con recursos suficientes. Puedes hacerlo en paralelo a la atención inicial.');
  return messages;
}
export function reduce(state:SimState, action:Action):SimState {
  if(state.phase==='completed' || state.events.length>=1000 || state.events.some(e=>e.id===action.id)) return state;
  const s:SimState=structuredClone(state);
  let duration=0, text='', accepted=true, critical=false;
  const block=(message:string,isCritical=false)=>{accepted=false;text=message;critical=isCritical;};
  switch(action.kind) {
    case 'interview_symptoms': case 'interview_safety': case 'interview_context': {
      const topic=action.kind.replace('interview_','') as 'symptoms'|'safety'|'context';
      if(s.history.includes(topic)) block('Esta parte de la entrevista ya está registrada.');
      else {s.history.push(topic);duration=1;text={symptoms:'Entrevista: evolución de fiebre, tos y disnea registrada.',safety:'Entrevista: niega alergias conocidas; sin antibióticos ni hospitalización en 90 días.',context:'Entrevista: tolera vía oral; antecedentes, TB/aspiración y apoyo familiar registrados.'}[topic];}
      break;
    }
    case 'oximetry':
      if(!resourceAvailable(s,'basic_assessment')) block('Oxímetro no operativo en este turno.');
      else {s.sensorAttached=true;duration=1;text=measureOximetry(s,s.minute+1);}
      break;
    case 'examine':
      if(!resourceAvailable(s,'basic_assessment')) block('Falta equipo de evaluación básica.');
      else {s.examined=true;duration=2;text='Exploración: FR 32/min, PA 112/68, FC 112/min, T 38,5 °C; crepitantes basales derechos. Datos iniciales del guion.';}
      break;
    case 'select_source':case 'check_oxygen':case 'select_device':case 'select_flow':case 'check_reserve':case 'stop_oxygen':case 'oxygen_variant':case 'oxygen': {
      const result=oxygenAction(s,action);accepted=result.accepted;text=result.text;duration=result.duration;critical=!!result.critical;break;
    }
    case 'tx01':
      if(s.txGiven) block('La primera dosis TX01 ya fue registrada; no se repite.');
      else if(s.history.length<3) block('Administración interceptada: completa alergias, tratamientos, tolerancia oral y antecedentes antes de preparar TX01.',true);
      else if(!resourceAvailable(s,'iv_administration') || !resourceAvailable(s,'ceftriaxone_1g',2) || !resourceAvailable(s,'azithromycin_500mg') || s.ceftriaxone<2 || s.azithromycin<1) block('Administración bloqueada: autorización, personal, insumos o stock insuficientes.',true);
      else {s.txGiven=true;s.ceftriaxone-=2;s.azithromycin-=1;duration=3;text='TX01: primera administración simulada; 2 viales de ceftriaxona 1 g y 1 tableta de azitromicina 500 mg. Adaptación VM-03 pendiente.';}
      break;
    case 'coordinate':
      if(s.referralAt!==null) block('Receptor y traslado ya confirmados en el guion.');
      else if(!facility(s.facilityId).reference_phone_available || !caseData.receiving_hospital.acceptance_available_in_script) block('No es posible confirmar receptor en este turno.',true);
      else {duration=2;s.referralAt=s.minute;s.ambulanceAt=s.minute+facility(s.facilityId).transport.dispatch_min;text='H-01 confirma recepción ficticia. Traslado asistido activado; oxígeno de transporte independiente confirmado.';}
      break;
    case 'handover':
      if(s.referralAt===null) block('Primero contacta al receptor desde este teléfono.');
      else {duration=1;s.handoverSignature=handoverSignature(s);text='Entrega clínica registrada con hallazgos disponibles, soporte, tratamientos y pendientes. Nuevos hallazgos requieren actualizarla.';}
      break;
    case 'prepare_transfer': {
      const missing=missingTransfer(s), t=facility(s.facilityId).transport;
      if(missing.length) block([...transferGuidance(s),'Traslado interceptado por seguridad: falta '+missing.join(', ')+'.'].join(' '),true);
      else if(!t.assisted || !t.trained_team || !t.oximetry || reserve(s,'transport')<t.travel_min+(s.oxygen.sourceId==='transport'?1:0) || (s.oxygen.sourceId==='station'&&reserve(s)<Math.max(1,s.ambulanceAt!-s.minute))) block('Soporte o reserva insuficientes para movilización y transporte: no preparar salida.',true);
      else {duration=1;s.transferPrepared=true;s.phase='completed';text='Transferencia preparada y caso educativo finalizado. No equivale a traslado realizado ni a mejoría clínica.';}
      break;
    }
    case 'unassisted_exit': block('Salida interceptada: el guion requiere traslado asistido con soporte y coordinación.',true);break;
    case 'request_xray':
      if(!resourceAvailable(s,'chest_xray')) block('No hay RX ni servicio autorizado en el inventario I-2. No se fabrica un resultado.');
      else if(s.xrayRequestedAt!==null) block('La radiografía ya está solicitada.');
      else {duration=1;s.xrayRequestedAt=s.minute;s.xrayStatus='pending';text='RX solicitada en paralelo. Informe sintético disponible tras 20 minutos docentes; no condiciona la referencia.';}
      break;
    case 'request_lab':
      if(!resourceAvailable(s,'cbc_urea')) block('No hay laboratorio disponible en este turno.');
      else if(s.labRequested) block('Laboratorio ya solicitado; no hay valores validados para mostrar.');
      else {duration=1;s.labRequested=true;text='Hemograma/urea solicitados: pendientes al receptor. No se inventan urea, leucocitos ni plaquetas.';}
      break;
    case 'wait': duration=5;if(!supportActive(s) || s.referralAt===null)s.avoidableDelay+=5;text='Avanzaron 5 minutos docentes. Reevaluar con oxímetro; ninguna lectura se actualiza sin medir.';break;
    case 'finish': s.phase='completed';text='Atención finalizada por el estudiante; se evalúan las acciones efectivamente registradas.';break;
  }
  if(!accepted)duration=0;
  duration=Math.min(duration,1440-s.minute);
  consumeReserve(s,duration);
  s.minute+=duration;
  if(s.oxygenStarted&&!supportActive(s))text+=' ¡Soporte interrumpido! Comprobar fuente y gestionar alternativa asistida.';
  if(s.xrayRequestedAt!==null && s.minute-s.xrayRequestedAt>=20)s.xrayStatus='available';
  if(critical && !s.criticalFlags.includes(action.kind))s.criticalFlags.push(action.kind);
  s.events.push({id:action.id,kind:action.kind,...(action.value!==undefined?{value:action.value}:{}),at:state.minute,duration,accepted,text,critical});
  return s;
}
export function restore(raw:string|null):SimState|null {
  try {
    let input=JSON.parse(raw??'null');
    if(input?.version===2){
      const old=legacySchema.parse(input),oxygen=newOxygen();
      if(old.sensorAttached&&!old.oxygenStarted)oxygen.reading={status:'baseline',spo2:caseData.patient.initial_vitals.spo2_percent,at:old.minute,responseId:null};
      input={...old,version:3,oxygen,oxygenStarted:false,transferPrepared:false,handoverSignature:null,migrationNotice:'Intento v0.2 migrado: se conservaron entrevista, examen, dosis y bitácora. El soporte anterior no declaraba fuente/dispositivo/flujo; debe comprobarse y configurarse de nuevo. Un cierre anterior permanece como registro histórico.'};
    }
    const parsed=stateSchema.parse(input); const fresh=newState(parsed.facilityId);
    if(parsed.ceftriaxone!==fresh.ceftriaxone-(parsed.txGiven?2:0) || parsed.azithromycin!==fresh.azithromycin-(parsed.txGiven?1:0))return null;
    if(new Set(parsed.history).size!==parsed.history.length || new Set(parsed.events.map(e=>e.id)).size!==parsed.events.length)return null;
    const o=parsed.oxygen,d=caseData.oxygen_simulation.devices.find(d=>d.id===o.deviceId);
    if((o.deviceId!==null&&!d)||(o.flowLpm!==null&&!d?.flows_lpm.includes(o.flowLpm)))return null;
    if(o.stationUsedMin>(facility(parsed.facilityId).resources.find(r=>r.id==='oxygen')?.autonomy_min??0)||o.transportUsedMin>facility(parsed.facilityId).transport.oxygen_autonomy_min)return null;
    if(parsed.oxygenStarted!==(o.startedAt!==null)||o.startedAt!==null&&o.startedAt>parsed.minute)return null;
    if(o.checked&&!sourceOperational(parsed))return null;
    if(parsed.oxygenStarted&&(!d||o.flowLpm===null||!o.sourceId))return null;
    if(o.reading.at!==null&&o.reading.at>parsed.minute)return null;
    if(o.reading.status==='baseline'&&(!parsed.sensorAttached||o.reading.spo2!==caseData.patient.initial_vitals.spo2_percent||parsed.oxygenStarted))return null;
    if(o.reading.status==='scripted'){
      const r=responseFor(parsed);
      if(!parsed.sensorAttached||!supportActive(parsed)||!r||o.reading.responseId!==r.id||o.reading.spo2!==r.simulated_spo2_percent||o.reading.at===null||o.reading.at-o.startedAt!<r.reevaluation_min)return null;
    }else if(o.reading.status!=='baseline'&&o.reading.spo2!==null)return null;
    if(parsed.transferPrepared && (parsed.phase!=='completed' || missingTransfer(parsed).length))return null;
    return parsed;
  } catch {return null;}
}
export type Domain = {name:string;score:number;max:number;notes:string[]};
export function evaluate(s:SimState):{domains:Domain[];total:number;critical:boolean} {
  const accepted=(kind:ActionKind)=>s.events.some(e=>e.kind===kind&&e.accepted);
  const early=s.referralAt!==null && s.referralAt<=5;
  const domains:Domain[]=[
    {name:'Razonamiento',max:25,score:(s.history.length===3?10:Math.floor(s.history.length/3*10))+(s.examined?10:0)+(s.sensorAttached?5:0),notes:[s.history.length===3?'Entrevista dirigida completa.':'Faltaron temas de la entrevista.',s.examined?'Examen inicial registrado; CRB-65 del guion = 2.':'No quedó registrada una exploración.', 'La urea y PaO₂/FiO₂ permanecen desconocidas; severidad ATS/IDSA incompleta.']},
    {name:'Seguridad',max:35,score:(supportActive(s)?15:0)+(s.txGiven?10:0)+(s.criticalFlags.length===0?10:0),notes:[supportActive(s)?'Soporte efectivo registrado. Las lecturas simuladas no determinan estabilidad; VM-06 pendiente.':'No hay soporte efectivo al cierre; gestionar alternativa asistida.',s.txGiven?'TX01 consumió exactamente 2 viales y 1 tableta; propuesta VM-03 pendiente.':'TX01 no fue administrado; la adaptación pretransferencia sigue pendiente de validación médica.',s.criticalFlags.length?'Hubo propuestas interceptadas: se conservan aunque completes el caso.':'No se registraron propuestas críticas interceptadas.']},
    {name:'Recursos',max:20,score:(s.events.some(e=>!e.accepted&&['request_xray','request_lab'].includes(e.kind))?0:10)+(supportActive(s)?5:0)+(s.txGiven?5:0),notes:['La categoría no garantiza stock ni autorización.',accepted('request_xray')?'RX solicitada en paralelo: no añade puntos por pedir más exámenes.':'Omitir RX en este guion no penaliza: puede completarse en el receptor.',`Stock restante: ${s.ceftriaxone} viales y ${s.azithromycin} tabletas. No hay sustituciones automáticas.`]},
    {name:'Referencia',max:20,score:(s.referralAt!==null?(early?10:5):0)+(s.handoverSignature===handoverSignature(s)?5:0)+(s.transferPrepared?5:0),notes:[s.referralAt===null?'No se confirmó receptor.':`Referencia activada en minuto ${s.referralAt}. ${early?'Coordinación temprana en este guion.':'Pudo iniciarse en paralelo antes.'}`, 'El corte de 5 min es una ponderación docente propuesta, no un plazo normativo.',s.transferPrepared?'Transferencia preparada, sin afirmar que se realizó.':'Preparación de referencia incompleta.']}
  ];
  return {domains,total:domains.reduce((n,d)=>n+d.score,0),critical:s.criticalFlags.length>0};
}
export function exportState(s:SimState) {return {product:'SIMUL-ANDE visual',fictional:true,medical_review:'pending',...s,evaluation:evaluate(s),unknowns:['urea','pao2_fio2','leucocitos','plaquetas','respuesta_fisiologica_posterior'],source_case_version:caseData.case_version};}
