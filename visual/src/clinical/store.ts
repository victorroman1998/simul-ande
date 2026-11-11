import {newState,reduce,restore,STORAGE_KEY,type SimState,type ActionKind,type FacilityId,type Target,type Tool} from './engine';
type ViewState={simulation:SimState;selected:Target|null;tool:Tool|null;message:string;storageWarning:boolean;reducedMotion:boolean};
export class SimulationStore {
  private listeners=new Set<()=>void>();
  private view:ViewState;
  constructor(private storage?:Pick<Storage,'getItem'|'setItem'>) {
    let saved:SimState|null=null,storageWarning=false;
    try {const raw=storage?.getItem(STORAGE_KEY)??null;saved=restore(raw);storageWarning=raw!==null&&!saved;}catch{storageWarning=true;}
    this.view={simulation:saved??newState(),selected:null,tool:null,message:'Selecciona al paciente o un instrumento de la sala.',storageWarning,reducedMotion:false};
  }
  getSnapshot=()=>this.view;
  subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};
  private emit(){this.listeners.forEach(fn=>fn());}
  select=(selected:Target)=>{
    const tool=this.view.tool;
    if(selected==='patient'&&tool){const kind:ActionKind=tool==='stethoscope'?'examine':tool==='oximeter'?'oximetry':tool;this.act(kind);this.view={...this.view,selected:'patient',tool:null};}
    else this.view={...this.view,selected};
    this.emit();
  };
  arm=(tool:Tool)=>{this.view={...this.view,tool,selected:null,message:'Instrumento preparado: haz clic en el paciente para utilizarlo.'};this.emit();};
  cancelTool=()=>{this.view={...this.view,tool:null};this.emit();};
  motion=()=>{this.view={...this.view,reducedMotion:!this.view.reducedMotion};this.emit();};
  act=(kind:ActionKind,id:string=crypto.randomUUID())=>{
    const simulation=reduce(this.view.simulation,{kind,id});
    if(simulation===this.view.simulation)return;
    let storageWarning=this.view.storageWarning;
    try{this.storage?.setItem(STORAGE_KEY,JSON.stringify(simulation));}catch{storageWarning=true;}
    this.view={...this.view,simulation,message:simulation.events.at(-1)!.text,storageWarning};this.emit();
  };
  reset=(id:FacilityId)=>{const simulation=newState(id);let storageWarning=false;try{this.storage?.setItem(STORAGE_KEY,JSON.stringify(simulation));}catch{storageWarning=true;}this.view={...this.view,simulation,selected:null,tool:null,message:'Nuevo turno. Selecciona al paciente o los recursos de la sala.',storageWarning};this.emit();};
}
