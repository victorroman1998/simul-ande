import type {SimulationStore} from './clinical/store';
import {caseData,facility,resourceAvailable,type SimState} from './clinical/engine';
import {monitor,oxygenScript,oxygenStatus,reserve,responseFor,supportActive} from './clinical/oxygen';

export function MonitorReadout({s}:{s:SimState}){
  const m=monitor(s);
  return <section className="monitor-readout" aria-label="Monitor de signos vitales" data-testid="vital-monitor">
    <div><span>SpO₂ · %</span><strong>{m.spo2}</strong><small>{m.spo2Alert}</small><small>{m.spo2Status}{s.oxygen.reading.at!==null?` · min ${s.oxygen.reading.at}`:''}</small></div>
    <div><span>FC · latidos/min</span><strong>{m.heart}</strong><small>{s.examined?'! Elevada · caso':'Medición pendiente'}</small></div>
    <div><span>FR · respiraciones/min</span><strong>{m.respiratory}</strong><small>{s.examined?'! Elevada · caso':'Medición pendiente'}</small></div>
    <div><span>PA · mmHg</span><strong>{m.bp}</strong><small>{m.examinedStatus}</small></div>
    <div><span>T · °C</span><strong>{m.temperature}</strong><small>{s.examined?'! Fiebre · caso':'Medición pendiente'}</small></div>
    <p>{m.support}<small>Lecturas intermitentes del guion. Panel docente, sin ECG ni señal fisiológica continua.</small></p>
  </section>;
}

export function OxygenPanel({s,store}:{s:SimState;store:SimulationStore}){
  const o=s.oxygen,active=s.phase==='active',locked=!active||s.oxygenStarted;
  const configure=(kind:'select_source'|'select_device'|'select_flow'|'oxygen_variant',value:string|number)=>store.act(kind,crypto.randomUUID(),value);
  const d=oxygenScript.devices.find(d=>d.id===o.deviceId),r=responseFor(s);
  return <div className="oxygen-panel">
    <p className="lead">Configuración del soporte</p>
    <label>Variante del guion<select aria-label="Variante del guion" disabled={locked||s.events.some(e=>e.kind==='oxygen'&&e.accepted)} value={o.variant} onChange={e=>configure('oxygen_variant',e.target.value)}>{oxygenScript.variants.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <label>Fuente de oxígeno<select aria-label="Fuente de oxígeno" disabled={locked} value={o.sourceId??''} onChange={e=>configure('select_source',e.target.value)}><option value="" disabled>Seleccionar fuente</option><option value="station">Fuente local del turno</option><option value="transport">Transporte · fuente independiente</option></select></label>
    <button className="action-button" disabled={!active||s.oxygenStarted||!o.sourceId} onClick={()=>store.act('check_oxygen')}>{o.checked?'✓ Fuente comprobada':'Comprobar disponibilidad y operación'}</button>
    {o.sourceId==='transport'&&<p>Requiere receptor confirmado, equipo asistido y movilización cumplida. No se presupone disponible antes.</p>}
    <label>Dispositivo<select aria-label="Dispositivo de oxígeno" disabled={locked} value={o.deviceId??''} onChange={e=>configure('select_device',e.target.value)}><option value="" disabled>Seleccionar dispositivo</option>{oxygenScript.devices.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <label>Flujo · L/min<select aria-label="Flujo en L/min" disabled={locked||!d} value={o.flowLpm??''} onChange={e=>configure('select_flow',Number(e.target.value))}><option value="" disabled>Seleccionar flujo docente</option>{d?.flows_lpm.map(n=><option key={n} value={n}>{n} L/min</option>)}</select></label>
    <button className="primary-button" disabled={!active||s.oxygenStarted||!o.checked||!d||o.flowLpm===null} onClick={()=>store.act('oxygen')}>Iniciar soporte configurado</button>
    <p className={supportActive(s)?'operational':'warning-text'} role="status">{oxygenStatus(s)}</p>
    {s.oxygenStarted&&<button className="action-button" disabled={!active} onClick={()=>store.act('stop_oxygen')}>Detener para gestionar alternativa</button>}
    <div className="reserve-readout"><strong>RESERVA · MINUTOS DOCENTES</strong><p>Local: <b>{reserve(s,'station')} min</b><br/>Transporte: <b>{reserve(s,'transport')} min</b> · independiente</p><button className="action-button" disabled={!active} onClick={()=>store.act('check_reserve')}>Comprobar reserva</button></div>
    <button className="action-button" disabled={!active} onClick={()=>store.select('oximeter')}>Ir al oxímetro para reevaluar →</button>
    <p className="clinical-note">{r?`${r.id}: lectura simulada tras ${r.reevaluation_min} min de soporte y una nueva oximetría. Revisión médica pendiente.`:'Respuesta no validada: esta combinación no tiene una lectura posterior escrita.'}</p>
    <details><summary>VM-06 · límites del guion</summary><p>{oxygenScript.warning}</p><p>{oxygenScript.reserve_policy}</p></details>
  </div>;
}

const staffLabels:Record<string,string>={physician:'médico(s)',nurse:'enfermera(s)',nursing_technician:'técnico(s)',laboratory_staff:'laboratorista(s)',radiology_technologist:'tecnólogo(s) RX'};
export function FacilityContext({s}:{s:SimState}){
  const f=facility(s.facilityId),capacity=f.resources.filter(r=>r.authorized_in_scenario),declared=f.resources.filter(r=>r.available);
  return <section className="facility-context" aria-label="Contexto asistencial persistente" data-testid="facility-context">
    <div><span className="eyebrow">CONTEXTO ASISTENCIAL · {f.category_reference}</span><strong>{f.label}</strong><p>{f.location_label}<br/>{f.altitude_m_asl} m s. n. m. · turno {f.case_local_time} · atención {f.opening_hours}</p></div>
    <div><span className="eyebrow">PERSONAL EFECTIVO DEL TURNO</span><p>{Object.entries(f.staff_on_duty).filter(([,n])=>n).map(([k,n])=>`${n} ${staffLabels[k]??k}`).join(' · ')}</p><p>Capacidad declarada: {capacity.length} recursos autorizados en este guion. Disponibles en escenario: {declared.length}. La categoría no garantiza inventario.</p></div>
    <div><span className="eyebrow">DISPONIBILIDAD EFECTIVA</span><p>Evaluación básica: {resourceAvailable(s,'basic_assessment')?'operativa':'no operativa'} · RX: {resourceAvailable(s,'chest_xray')?'sí':'no'} · laboratorio: {resourceAvailable(s,'cbc_urea')?'sí · sin resultados escritos':'no'}</p><p>O₂ local: {reserve(s,'station')} min · {s.oxygen.variant==='empty'?'fuente vacía':resourceAvailable(s,'oxygen')?'recurso operativo':'no operativo'}. {oxygenStatus(s)}</p><p>Medicamentos: ceftriaxona {s.ceftriaxone} viales 1 g · azitromicina {s.azithromycin} tab. 500 mg · amoxicilina {f.resources.find(r=>r.id==='amoxicillin_500mg')?.quantity} tab. 500 mg (inventario; sin nueva indicación).</p></div>
    <div><span className="eyebrow">RECURSOS DE TRANSPORTE</span><p>Movilización: {f.transport.dispatch_min} min · al hospital H-01: {f.transport.travel_min} min. Distancia no consignada.</p><p>{f.transport.assisted?'Asistido':'Sin asistencia'} · equipo entrenado {f.transport.trained_team?'sí':'no'} · oximetría {f.transport.oximetry?'sí':'no'} · O₂ independiente {reserve(s,'transport')} min.</p><p>{s.referralAt===null?'Coordinación pendiente.':'Receptor confirmado en el guion; no es una llamada real.'}</p></div>
  </section>;
}
