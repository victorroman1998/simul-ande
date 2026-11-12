import {describe,it,expect} from 'vitest';
import {newState,reduce,restore,evaluate,facility,STORAGE_KEY,type ActionKind,type FacilityId,type SimState} from '../src/clinical/engine';
import {SimulationStore} from '../src/clinical/store';

let serial=0;
function run(s:SimState,k:ActionKind){
  if(k==='oxygen'&&!s.oxygen.sourceId){for(const [kind,value] of [['select_source','station'],['check_oxygen',undefined],['select_device','nasal'],['select_flow',2]] as const)s=reduce(s,{kind,value,id:`setup-${++serial}`});}
  return reduce(s,{kind:k,id:`test-${++serial}`});
}
const interview:ActionKind[]=['interview_symptoms','interview_safety','interview_context'];
function permutations<T>(values:T[]):T[][]{return values.length===0?[[]]:values.flatMap((x,i)=>permutations(values.filter((_,j)=>j!==i)).map(p=>[x,...p]));}
function complete(id:FacilityId='F_I2'){
  let s=newState(id);for(const k of ['coordinate',...interview,'oximetry','examine','oxygen','tx01','handover','prepare_transfer'] as ActionKind[])s=run(s,k);return s;
}
describe('free-order clinical engine',()=>{
  it('supports 1440 complete safe orders across two facilities, without sequential D1–D6',()=>{
    const orders=permutations([...interview,'oximetry','examine','oxygen'] as ActionKind[]);
    expect(orders).toHaveLength(720);
    for(const id of ['F_I2','F_I4'] as FacilityId[])for(const order of orders){
      let s=run(newState(id),'coordinate');for(const k of [...order,'tx01','handover','prepare_transfer'] as ActionKind[])s=run(s,k);
      expect(s.phase).toBe('completed');expect(s.transferPrepared).toBe(true);expect(evaluate(s).total).toBe(100);expect(s.criticalFlags).toEqual([]);
      expect(s.ceftriaxone).toBe(id==='F_I2'?2:18);expect(s.azithromycin).toBe(id==='F_I2'?3:9);
    }
  });
  it('does not execute duplicate IDs or duplicate doses',()=>{
    let s=newState();for(const k of interview)s=run(s,k);
    const action={id:'dose-once',kind:'tx01' as const};s=reduce(s,action);expect(reduce(s,action)).toBe(s);
    const repeat=run(s,'tx01');expect(repeat.ceftriaxone).toBe(2);expect(repeat.azithromycin).toBe(3);expect(repeat.events.at(-1)?.accepted).toBe(false);
  });
  it('intercepts medication before complete allergies, oral tolerance and history',()=>{
    let s=run(newState(),'interview_safety');s=run(s,'tx01');expect(s.txGiven).toBe(false);expect(s.ceftriaxone).toBe(4);expect(s.minute).toBe(1);expect(s.criticalFlags).toContain('tx01');
  });
  it.each(['authorized_in_scenario','available','staff_present','supplies_present'] as const)('blocks medication without %s without stock loss',(key)=>{
    const r=facility('F_I2').resources.find(r=>r.id==='ceftriaxone_1g')!;const before=r[key];
    try{r[key]=false;let s=newState();for(const k of interview)s=run(s,k);s=run(s,'tx01');expect(s.txGiven).toBe(false);expect(s.ceftriaxone).toBe(4);}finally{r[key]=before;}
  });
  it('blocks insufficient stock without points or consumption',()=>{let s=newState();for(const k of interview)s=run(s,k);s.ceftriaxone=1;const n=run(s,'tx01');expect(n.ceftriaxone).toBe(1);expect(n.txGiven).toBe(false);});
  it('does not fabricate an xray in I-2; I-4 obtains only the authored result at 20 min',()=>{
    const i2=run(newState(),'request_xray');expect(i2.xrayStatus).toBe('not_requested');expect(i2.events.at(-1)?.accepted).toBe(false);
    let i4=run(newState('F_I4'),'request_xray');expect(i4.xrayStatus).toBe('pending');for(let i=0;i<4;i++)i4=run(i4,'wait');expect(i4.xrayStatus).toBe('available');
  });
  it('has no invented physiology or immediate post-support readings',()=>{
    const s=run(run(newState(),'oxygen'),'oximetry');expect(s.events.at(-1)?.text).toContain('Reevaluación pendiente');expect(s.oxygen.reading.spo2).toBeNull();expect(s).not.toHaveProperty('survival');
  });
  it('allows early coordination, rejects unsafe exit and retains its critical flag',()=>{
    let s=run(newState(),'unassisted_exit');for(const k of ['coordinate',...interview,'oxygen','oximetry','examine','tx01','handover','prepare_transfer'] as ActionKind[])s=run(s,k);
    expect(s.transferPrepared).toBe(true);expect(evaluate(s).critical).toBe(true);expect(evaluate(s).total).toBeLessThan(100);
  });
  it('requires updated handover when new findings follow an early handover',()=>{
    let s=run(newState(),'coordinate');s=run(s,'handover');for(const k of [...interview,'oxygen','oximetry','examine'] as ActionKind[])s=run(s,k);
    s=run(s,'prepare_transfer');expect(s.phase).toBe('active');s=run(s,'handover');s=run(s,'prepare_transfer');expect(s.phase).toBe('completed');
  });
  it('blocks all clinical state changes after finishing',()=>{const s=complete();expect(run(s,'wait')).toBe(s);expect(run(s,'tx01')).toBe(s);});
  it('does not reward extra tests or require waiting for transport or xray',()=>{
    const noTests=complete('F_I4');expect(evaluate(noTests).total).toBe(100);expect(noTests.ambulanceAt!>noTests.minute).toBe(true);expect(noTests.xrayStatus).toBe('not_requested');
  });
  it('restores valid progress and rejects corrupt versions, duplicate IDs or impossible stock',()=>{
    const s=complete();expect(restore(JSON.stringify(s))).toEqual(s);expect(restore('{')).toBeNull();expect(restore(JSON.stringify({...s,version:99}))).toBeNull();expect(restore(JSON.stringify({...s,ceftriaxone:500}))).toBeNull();expect(restore(JSON.stringify({...s,events:[s.events[0],s.events[0]]}))).toBeNull();
  });
  it('persists engine actions through the store and a new session; UI selection costs no clinical time',()=>{
    const map=new Map<string,string>(),storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};
    const a=new SimulationStore(storage);a.select('phone');expect(a.getSnapshot().simulation.minute).toBe(0);a.act('coordinate','coordinate');a.arm('oximeter');a.select('patient');expect(a.getSnapshot().simulation.sensorAttached).toBe(true);
    const b=new SimulationStore(storage);expect(b.getSnapshot().simulation).toEqual(a.getSnapshot().simulation);expect(map.has(STORAGE_KEY)).toBe(true);b.reset('F_I4');expect(b.getSnapshot().simulation.events).toEqual([]);expect(b.getSnapshot().simulation.ceftriaxone).toBe(20);
  });
  it('survives denied storage without losing the usable session',()=>{const store=new SimulationStore({getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('denied');}});store.act('coordinate');expect(store.getSnapshot().simulation.referralAt).toBe(0);expect(store.getSnapshot().storageWarning).toBe(true);});
});
