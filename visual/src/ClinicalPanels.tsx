import {useState} from 'react';
import type {SimulationStore} from './clinical/store';
import {facility,resourceAvailable,transferGuidance,type SimState} from './clinical/engine';
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
    <p className="oxygen-intro">Configura el soporte y después vuelve a medir la SpO₂. Elegir un flujo por sí solo no inicia el oxígeno.</p>
    <fieldset className="oxygen-step"><legend>1. Elegir y comprobar la fuente {o.checked?'✓':''}</legend>
      <label>Fuente de oxígeno<select aria-label="Fuente de oxígeno" disabled={locked} value={o.sourceId??''} onChange={e=>configure('select_source',e.target.value)}><option value="" disabled>¿De dónde proviene el oxígeno?</option><option value="station">Fuente local · {reserve(s,'station')} min</option><option value="transport">Transporte · fuente independiente</option></select></label>
      <button className="action-button" disabled={!active||s.oxygenStarted||!o.sourceId||o.checked} onClick={()=>store.act('check_oxygen')}>{o.checked?'✓ Fuente comprobada y operativa':'Comprobar fuente'}</button>
      {o.sourceId==='transport'&&<p className="step-help">Requiere receptor confirmado, equipo asistido y llegada del transporte.</p>}
      {o.sourceId==='station'&&reserve(s,'station')===0&&<p className="step-help warning-text">Fuente local sin reserva. Coordina una alternativa asistida desde Referencia.</p>}
    </fieldset>
    <fieldset className="oxygen-step"><legend>2. Elegir dispositivo y flujo {d&&o.flowLpm!==null?'✓':''}</legend>
      <div className="oxygen-settings"><label>Dispositivo<select aria-label="Dispositivo de oxígeno" disabled={locked} value={o.deviceId??''} onChange={e=>configure('select_device',e.target.value)}><option value="" disabled>Seleccionar dispositivo</option>{oxygenScript.devices.map(x=><option key={x.id} value={x.id}>{x.label.replace(' · control docente','')}</option>)}</select></label>
      <label>Flujo · L/min<select aria-label="Flujo en L/min" disabled={locked||!d} value={o.flowLpm??''} onChange={e=>configure('select_flow',Number(e.target.value))}><option value="" disabled>Elegir flujo</option>{d?.flows_lpm.map(n=><option key={n} value={n}>{n} L/min</option>)}</select></label></div>
      <p className="step-help">Controles ficticios del ejercicio; no son una recomendación clínica. VM-06 pendiente.</p>
    </fieldset>
    <fieldset className="oxygen-step"><legend>3. Iniciar y volver a medir</legend>
      {!s.oxygenStarted&&<button className="primary-button" disabled={!active||!o.checked||!d||o.flowLpm===null} onClick={()=>store.act('oxygen')}>Iniciar oxígeno al paciente</button>}
      <p className={supportActive(s)?'support-status operational':'support-status warning-text'} role="status">{oxygenStatus(s)}</p>
      {!s.oxygenStarted&&<p className="step-help">{!o.checked?'Primero comprueba la fuente del paso 1.':!d||o.flowLpm===null?'Completa el dispositivo y el flujo del paso 2.':'Configuración lista. Pulsa «Iniciar oxígeno al paciente».'}</p>}
      {s.oxygenStarted&&<><button className="primary-button" disabled={!active} onClick={()=>store.act('oximetry')}>Reevaluar SpO₂ con oxímetro</button><p className="step-help">{r?`El guion permite una lectura simulada a partir del minuto ${o.startedAt!+r.reevaluation_min}. Antes mostrará «Reevaluación pendiente».`:'Esta combinación no tiene respuesta escrita: se mostrará «Respuesta no validada».'}</p><p className="step-help">Último registro: {monitor(s).spo2Status}{o.reading.spo2!==null?` · ${o.reading.spo2} %`:''}. Una lectura simulada no demuestra estabilidad.</p></>}
    </fieldset>
    <div className="reserve-readout"><strong>RESERVA · MINUTOS DOCENTES</strong><p>Local: <b>{reserve(s,'station')} min</b> · transporte: <b>{reserve(s,'transport')} min</b> (independiente)</p><button className="action-button" disabled={!active} onClick={()=>store.act('check_reserve')}>Comprobar reserva</button></div>
    {s.oxygenStarted&&<button className="action-button" disabled={!active} onClick={()=>store.act('stop_oxygen')}>Detener para cambiar la configuración</button>}
    <details><summary>Variantes del ejercicio y límites VM-06</summary><label>Variante del guion<select aria-label="Variante del guion" disabled={locked||s.events.some(e=>e.kind==='oxygen'&&e.accepted)} value={o.variant} onChange={e=>configure('oxygen_variant',e.target.value)}>{oxygenScript.variants.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label><p>{oxygenScript.warning}</p><p>{oxygenScript.reserve_policy}</p></details>
  </div>;
}

export function TransferPanel({s,store}:{s:SimState;store:SimulationStore}){
  const guidance=transferGuidance(s),active=s.phase==='active';
  return <><p className="lead">Preparar la transferencia</p>{active&&guidance.length>0&&<div className="transfer-warning" role="alert"><strong>Antes de preparar el traslado</strong>{guidance.map(message=><p key={message}>{message}</p>)}<div className="warning-actions">{!supportActive(s)&&<button className="action-button" onClick={()=>store.select('oxygen')}>Configurar oxígeno →</button>}{s.referralAt===null&&<button className="action-button" onClick={()=>store.select('phone')}>Coordinar la emergencia →</button>}</div></div>}<p>Comprueba evaluación, soporte efectivo, receptor, recursos del transporte y entrega clínica actualizada.</p><button className="primary-button" disabled={!active} onClick={()=>store.act('prepare_transfer')}>Preparar traslado asistido</button><p className="panel-footnote">Termina como transferencia preparada. No equivale a estabilidad ni a traslado realizado; la SpO₂ por sí sola no autoriza la salida.</p><button className="danger-link" disabled={!active} onClick={()=>store.act('unassisted_exit')}>Proponer salida por medios propios</button></>;
}

const staffLabels:Record<string,string>={physician:'médico(s)',nurse:'enfermera(s)',nursing_technician:'técnico(s)',laboratory_staff:'laboratorista(s)',radiology_technologist:'tecnólogo(s) RX'};
export function FacilityContext({s}:{s:SimState}){
  const f=facility(s.facilityId),capacity=f.resources.filter(r=>r.authorized_in_scenario),declared=f.resources.filter(r=>r.available);
  const [tab,setTab]=useState<'staff'|'resources'|'transport'|null>(null);
  const tabs=[['staff','Personal de turno'],['resources','Recursos'],['transport','Transporte']] as const;
  return <section className="facility-context" aria-label="Contexto asistencial persistente" data-testid="facility-context">
    <div className="locality-pinned"><span className="eyebrow">LOCALIDAD · {f.category_reference}</span><strong>{f.label}</strong><p title={f.location_label}>Localidad ficticia · {f.altitude_m_asl} m s. n. m. · turno {f.case_local_time} · atención {f.opening_hours}</p></div>
    <div className="context-tabs" role="tablist" aria-label="Consultar el contexto del turno">{tabs.map(([id,label],index)=><button key={id} role="tab" id={`context-tab-${id}`} aria-controls={`context-panel-${id}`} aria-selected={tab===id} tabIndex={tab===id||tab===null&&index===0?0:-1} onClick={()=>setTab(tab===id?null:id)} onKeyDown={event=>{const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;if(next!==null){event.preventDefault();setTab(tabs[next][0]);document.getElementById(`context-tab-${tabs[next][0]}`)?.focus();}}}>{label}<span aria-hidden="true"> {tab===id?'−':'+'}</span></button>)}</div>
    {tabs.map(([id])=><div key={id} role="tabpanel" id={`context-panel-${id}`} aria-labelledby={`context-tab-${id}`} hidden={tab!==id} className="context-detail">
      {id==='staff'&&<><strong>Personal efectivo del turno</strong><p>{Object.entries(f.staff_on_duty).filter(([,n])=>n).map(([k,n])=>`${n} ${staffLabels[k]??k}`).join(' · ')}</p><p>Atención declarada: {f.opening_hours}. Localidad: nombre no consignado en el caso.</p></>}
      {id==='resources'&&<><strong>Capacidad y disponibilidad del escenario</strong><p>Capacidad declarada: {capacity.length} recursos autorizados. Disponibles en escenario: {declared.length}. La categoría no garantiza inventario.</p><p>Disponibilidad efectiva: evaluación básica {resourceAvailable(s,'basic_assessment')?'operativa':'no operativa'} · RX {resourceAvailable(s,'chest_xray')?'sí':'no'} · laboratorio {resourceAvailable(s,'cbc_urea')?'sí · sin resultados escritos':'no'}. O₂ local {reserve(s,'station')} min · {s.oxygen.variant==='empty'?'fuente vacía':resourceAvailable(s,'oxygen')?'recurso operativo':'no operativo'}.</p><p>Medicamentos: ceftriaxona {s.ceftriaxone} viales 1 g · azitromicina {s.azithromycin} tab. 500 mg · amoxicilina {f.resources.find(r=>r.id==='amoxicillin_500mg')?.quantity} tab. 500 mg. Inventario del guion, sin nueva indicación.</p></>}
      {id==='transport'&&<><strong>Transporte al hospital receptor H-01</strong><p>Movilización: {f.transport.dispatch_min} min · al hospital H-01: {f.transport.travel_min} min. Distancia no consignada.</p><p>{f.transport.assisted?'Asistido':'Sin asistencia'} · equipo entrenado {f.transport.trained_team?'sí':'no'} · oximetría {f.transport.oximetry?'sí':'no'} · O₂ independiente {reserve(s,'transport')} min.</p><p>{s.referralAt===null?'Coordinación pendiente.':'Receptor confirmado en el guion; no es una llamada real.'}</p></>}
      <button className="context-close" onClick={()=>{setTab(null);document.getElementById(`context-tab-${id}`)?.focus();}}>Cerrar consulta</button>
    </div>)}
  </section>;
}
