import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {newState,reduce,restore,facility,caseData,LEGACY_STORAGE_KEY,STORAGE_KEY,type SimState,type ActionKind} from '../src/clinical/engine';
import {SimulationStore} from '../src/clinical/store';
import {monitor,reserve,supportActive} from '../src/clinical/oxygen';
import {MonitorReadout,FacilityContext} from '../src/ClinicalPanels';
let serial=0;
const act=(s:SimState,kind:ActionKind,value?:string|number)=>reduce(s,{kind,value,id:`v3-${++serial}`});
function setup(s=newState(),flow=2,device='nasal',source='station'){
  for(const [kind,value] of [['select_source',source],['check_oxygen',undefined],['select_device',device],['select_flow',flow]] as const)s=act(s,kind,value);
  return s;
}
describe('Visual v0.3 · monitor, scripted oxygen and persistence',()=>{
  it('hides every unmeasured vital in the engine projection and accessible monitor',()=>{
    const s=newState(),m=monitor(s),html=renderToStaticMarkup(<MonitorReadout s={s}/>);
    expect([m.spo2,m.heart,m.respiratory,m.bp,m.temperature]).toEqual(['—','—','—','—','—']);
    expect(html).toContain('Medición pendiente');expect(html).not.toContain('112/68');expect(html).not.toContain('38,5');
  });
  it('updates only measured values from original case data',()=>{
    let s=act(newState(),'oximetry');expect(monitor(s).spo2).toBe('88');expect(monitor(s).heart).toBe('—');
    s=act(s,'examine');expect(monitor(s)).toMatchObject({heart:'112',respiratory:'32',bp:'112/68',temperature:'38,5'});
    expect(renderToStaticMarkup(<MonitorReadout s={s}/>)).toContain('! Fiebre');
  });
  it('requires a checked source, device and permitted flow; records configuration values in journal',()=>{
    let s=act(newState(),'oxygen');expect(s.oxygenStarted).toBe(false);
    s=setup(s);expect(s.oxygen).toMatchObject({sourceId:'station',checked:true,deviceId:'nasal',flowLpm:2});
    expect(s.events.at(-1)).toMatchObject({kind:'select_flow',value:2,accepted:true});
    const rejected=act(s,'select_flow',100);expect(rejected.oxygen.flowLpm).toBe(2);expect(rejected.events.at(-1)?.accepted).toBe(false);
    s=act(s,'select_device','mask');expect(s.oxygen.flowLpm).toBeNull();s=act(s,'select_flow',2);expect(s.events.at(-1)?.accepted).toBe(false);
  });
  it('uses only an explicit JSON response after elapsed script time and new oximetry',()=>{
    let s=act(setup(),'oxygen');s=act(s,'oximetry');expect(s.oxygen.reading.status).toBe('pending');
    s=act(s,'wait');expect(s.oxygen.reading.spo2).toBeNull();s=act(s,'oximetry');
    expect(s.oxygen.reading).toMatchObject({spo2:94,status:'scripted',responseId:'NAC-DEMO-A'});
    expect(monitor(s).spo2Status).toContain('VM-06');expect(s.events.at(-1)?.text).toContain('No demuestra estabilidad');
    expect(s.transferPrepared).toBe(false);expect(restore(JSON.stringify(s))).toEqual(s);
  });
  it('distinguishes insufficient response and unvalidated combinations without interpolating',()=>{
    let s=act(setup(newState(),1),'oxygen');s=act(s,'wait');s=act(s,'oximetry');expect(s.oxygen.reading.spo2).toBe(89);expect(monitor(s).spo2Alert).toContain('Insuficiente');
    s=act(setup(newState(),4),'oxygen');s=act(s,'wait');s=act(s,'oximetry');expect(s.oxygen.reading.spo2).toBeNull();expect(s.oxygen.reading.status).toBe('unvalidated');
  });
  it('does not reuse the initial saturation as a new measurement after stopping oxygen',()=>{
    let s=act(setup(),'oxygen');s=act(s,'wait');s=act(s,'oximetry');s=act(s,'stop_oxygen');s=act(s,'oximetry');
    expect(s.oxygen.reading.status).toBe('unvalidated');expect(s.oxygen.reading.spo2).toBeNull();
  });
  it('fails empty source while keeping base scenario intact and allows an arrived assisted transport alternative',()=>{
    let s=setup(newState('F_I2','empty'));expect(s.oxygen.checked).toBe(false);expect(reserve(s)).toBe(0);
    s=act(s,'oxygen');expect(s.oxygenStarted).toBe(false);expect(s.criticalFlags).toContain('check_oxygen');
    s=act(s,'coordinate');s=act(s,'select_source','transport');s=act(s,'check_oxygen');expect(s.oxygen.checked).toBe(false);
    for(let i=0;i<6;i++)s=act(s,'wait');s=act(s,'check_oxygen');expect(s.oxygen.checked).toBe(true);
    s=act(s,'oxygen');expect(supportActive(s)).toBe(true);expect(reserve(s,'station')).toBe(0);expect(reserve(s,'transport')).toBe(179);
    for(const kind of ['interview_symptoms','interview_safety','interview_context','oximetry','examine','tx01','handover','prepare_transfer'] as ActionKind[])s=act(s,kind);
    expect(s.transferPrepared).toBe(true);expect(newState().oxygen.variant).toBe('base');
  });
  it('consumes only elapsed support minutes, never twice for replay, selection, duplicate starts or reserve checks',()=>{
    let s=setup();const start={kind:'oxygen' as const,id:'start'};s=reduce(s,start);expect(reserve(s)).toBe(179);
    expect(reduce(s,start)).toBe(s);s=act(s,'oxygen');expect(reserve(s)).toBe(179);s=act(s,'check_reserve');expect(reserve(s)).toBe(179);
    s=act(s,'wait');expect(reserve(s)).toBe(174);expect(s.oxygen.stationUsedMin).toBe(6);
    const reloaded=restore(JSON.stringify(s))!;expect(reserve(reloaded)).toBe(174);expect(reloaded).toEqual(s);
  });
  it('invalidates stale readings and blocks transfer after source depletion',()=>{
    let s=act(setup(),'oxygen');for(let i=0;i<36;i++)s=act(s,'wait');
    expect(reserve(s)).toBe(0);expect(supportActive(s)).toBe(false);expect(s.criticalFlags).toContain('oxygen_exhausted');
    s=act(s,'oximetry');expect(s.oxygen.reading.spo2).toBeNull();s=act(s,'prepare_transfer');expect(s.transferPrepared).toBe(false);expect(restore(JSON.stringify(s))).toEqual(s);
  });
  it('migrates v2 without inventing flow or repeating medication, leaves old storage intact',()=>{
    let old:any=act(newState(),'interview_safety');delete old.oxygen;delete old.migrationNotice;old.version=2;old.oxygenStarted=true;
    const values=new Map([[LEGACY_STORAGE_KEY,JSON.stringify(old)]]),storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}};
    const a=new SimulationStore(storage),s=a.getSnapshot().simulation;expect(s.version).toBe(3);expect(s.history).toEqual(['safety']);expect(s.oxygenStarted).toBe(false);expect(s.oxygen.flowLpm).toBeNull();expect(s.migrationNotice).toContain('migrado');
    expect(values.has(LEGACY_STORAGE_KEY)).toBe(true);expect(values.has(STORAGE_KEY)).toBe(true);expect(new SimulationStore(storage).getSnapshot().simulation).toEqual(s);
  });
  it('rejects fabricated readings, impossible devices, consumption or an unconfigured active source',()=>{
    const s=newState();expect(restore(JSON.stringify({...s,oxygen:{...s.oxygen,deviceId:'fake'}}))).toBeNull();
    expect(restore(JSON.stringify({...s,oxygen:{...s.oxygen,stationUsedMin:999}}))).toBeNull();
    expect(restore(JSON.stringify({...s,oxygenStarted:true}))).toBeNull();
    expect(restore(JSON.stringify({...s,oxygen:{...s.oxygen,reading:{status:'pending',spo2:99,at:null,responseId:null}}}))).toBeNull();
  });
  it('keeps original 100 m altitude, staff, diagnostic and transport differences',()=>{
    expect(caseData.patient.altitude_m_asl).toBe(100);
    for(const id of ['F_I2','F_I4'] as const){const f=facility(id),html=renderToStaticMarkup(<FacilityContext s={newState(id)}/>);expect(f.altitude_m_asl).toBe(100);expect(html).toContain('100 m s. n. m.');expect(html).toContain(`${f.transport.travel_min} min`);}
    expect(facility('F_I2').staff_on_duty.physician).toBe(1);expect(facility('F_I4').staff_on_duty.physician).toBe(2);
  });
  it('never lets a scripted improvement override inadequate transport resources',()=>{
    const t=facility('F_I2').transport,original=t.oxygen_autonomy_min;
    try{t.oxygen_autonomy_min=10;let s=act(setup(),'oxygen');s=act(s,'wait');s=act(s,'oximetry');
      for(const kind of ['coordinate','interview_symptoms','interview_safety','interview_context','examine','handover','prepare_transfer'] as ActionKind[])s=act(s,kind);
      expect(s.oxygen.reading.spo2).toBe(94);expect(s.transferPrepared).toBe(false);
    }finally{t.oxygen_autonomy_min=original;}
  });
});
