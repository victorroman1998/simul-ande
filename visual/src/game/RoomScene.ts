import Phaser from 'phaser';
import type {SimulationStore} from '../clinical/store';
import {facility,type Target} from '../clinical/engine';

const C={ink:0x29483f,teal:0x177d75,mint:0x79c4ad,cream:0xf2f0dc,wall:0xe4e9d5,metal:0xc1d1cc,blue:0x7eabb1,skin:0xdcb18c,wood:0xb58c60,dark:0x17352e};
export class RoomScene extends Phaser.Scene {
  private unsubscribe?:()=>void;
  constructor(private store:SimulationStore){super('room');}
  create(){this.drawRoom();this.unsubscribe=this.store.subscribe(()=>this.drawRoom());this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.unsubscribe?.());this.events.once(Phaser.Scenes.Events.DESTROY,()=>this.unsubscribe?.());}
  private box(x:number,y:number,w:number,h:number,color:number,r=8,alpha=1){const g=this.add.graphics();g.fillStyle(color,alpha);g.fillRoundedRect(x,y,w,h,r);return g;}
  private text(x:number,y:number,text:string,size=16,color='#29483f',weight='normal'){return this.add.text(x,y,text,{fontFamily:'Arial, sans-serif',fontSize:size,color,fontStyle:weight,lineSpacing:4}).setResolution(2);}
  private line(points:number[],color:number,width=2,alpha=1){const g=this.add.graphics();g.lineStyle(width,color,alpha);g.beginPath();g.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);g.strokePath();return g;}
  private circle(x:number,y:number,r:number,color:number,alpha=1){return this.add.circle(x,y,r,color,alpha);}
  private hotspot(target:Target,x:number,y:number,w:number,h:number,label:string,labelY?:number){
    const v=this.store.getSnapshot();const ring=this.add.graphics();
    const draw=(hover=false)=>{ring.clear();if(hover||v.selected===target){ring.lineStyle(3,C.teal,hover?1:.7);ring.strokeRoundedRect(x-w/2,y-h/2,w,h,14);}};draw();
    this.add.zone(x,y,w,h).setInteractive({useHandCursor:true}).on('pointerover',()=>draw(true)).on('pointerout',()=>draw()).on('pointerup',()=>this.store.select(target));
    if(labelY!==undefined){this.box(x-64,labelY,128,24,0xffffff,12,.9);this.text(x,labelY+5,label,12).setOrigin(.5,0);}
  }
  private drawRoom(){
    this.tweens.killAll();this.children.removeAll(true);
    const v=this.store.getSnapshot(),s=v.simulation,f=facility(s.facilityId),i4=s.facilityId==='F_I4';
    this.cameras.main.setBackgroundColor('#dce5db');
    // Clinical room: coded original art, with separate walls, daylight and tiled floor.
    this.box(30,38,940,567,0x95aba2,18);
    this.box(35,30,930,555,C.cream,16);
    this.box(35,30,930,184,i4?0xd4e4df:0xe4e8d2,16);
    this.box(35,180,930,30,i4?0xa1c5b7:0xb9c9a5,0);
    const floor=this.add.graphics();floor.lineStyle(1,0x7e9a8a,.12);
    for(let x=55;x<960;x+=70){floor.lineBetween(x,212,x-75,582);}for(let y=235;y<590;y+=56){floor.lineBetween(35,y,965,y);}
    const light=this.add.graphics();light.fillStyle(0xffffff,.12);light.fillPoints([{x:685,y:170},{x:825,y:170},{x:960,y:530},{x:560,y:530}],true);
    this.text(325,59,i4?'CENTRO FICTICIO B':'PUESTO FICTICIO A',22,'#36564b','bold');
    this.text(326,88,`${f.category_reference}  ·  PRIMER NIVEL  ·  100 m s. n. m.`,12,'#658174');
    // Notice board, clock and an Andean foothill window (not a real IPRESS).
    this.box(322,119,195,51,0xfff9e5,4);this.text(333,129,'ATENCIÓN INICIAL\nY REFERENCIA SEGURA',11,'#66765c');
    this.circle(580,106,25,0xffffff);this.circle(580,106,22,0xe5ecde);this.line([580,106,580,91],C.ink,2);this.line([580,106,590,112],C.ink,2);this.circle(580,106,3,C.teal);this.hotspot('clock',580,106,64,64,'Reloj');
    this.box(657,48,190,121,0x698c7b,6);this.box(665,55,174,106,0xc8e5df,2);
    const mountains=this.add.graphics();mountains.fillStyle(0x87aa8b);mountains.fillTriangle(665,150,725,76,802,160);mountains.fillStyle(0xb1c1a0);mountains.fillTriangle(720,160,798,96,839,145);mountains.fillStyle(0x8cae8b);mountains.fillRect(665,141,174,20);
    this.line([751,55,751,161],0xffffff,5);this.line([665,109,839,109],0xffffff,5);
    // Supplies cupboard: stock derives from the clinical engine, not the drawing.
    this.box(75,62,182,151,0x769588,8);this.box(82,68,168,132,0xf9fbef,5);
    this.box(91,76,150,66,0xc5d9ce,2);this.line([166,76,166,140],0x91afa0,2);this.line([91,140,241,140],0x91afa0,2);
    for(let i=0;i<Math.min(20,s.ceftriaxone);i++){const x=(i4?97:102)+i*(i4?7:16),w=i4?5:10;this.box(x,108,w,24,0xf7fcf9,2);this.box(x,103,w,6,C.teal,1);}
    this.box(96,152,132,36,0xf5f6e8,3);this.text(110,164,`${s.ceftriaxone} viales · ${s.azithromycin} tab.`,12);
    this.text(101,80,'BOTIQUÍN DEL TURNO',10,'#476c5b','bold');this.hotspot('cabinet',166,134,190,156,'Botiquín',217);
    // Reference desk and operative telephone.
    this.add.ellipse(151,373,175,30,0x617d65,.13);this.box(65,309,180,24,C.wood,7);this.box(78,332,12,63,0x8c7956,3);this.box(217,332,12,63,0x8c7956,3);
    this.box(93,278,90,35,0x31534a,10);this.box(98,270,80,16,0x214438,8);this.box(116,291,35,14,0xa7d3bc,2);this.line([174,281,191,286,190,306,181,312],C.ink,3);
    this.box(197,287,24,26,0xf8f5df,2);this.line([201,294,216,294],0x829582,1);this.line([201,301,215,301],0x829582,1);
    if(s.referralAt!==null)this.circle(188,272,5,0x3cbe98);
    this.hotspot('phone',153,302,188,100,'Referencia',408);
    // Diagnostic equipment is physically present only in I-4.
    if(i4){this.box(738,229,145,92,0x8faaa2,6);this.box(746,236,129,70,0xe5f0e6,3);
      this.text(810,255,s.xrayStatus==='available'?'RX ✓':'RX',24,'#91ada0','bold').setOrigin(.5,0);this.text(774,312,'RX · 20 min',11);this.hotspot('xray',810,272,151,105,'Radiografía',337);
      this.box(76,479,150,70,0xc3d2c6,6);this.box(80,471,146,16,0x8bada1,3);this.box(111,435,35,39,0xe9f6ed,4);this.box(118,444,21,15,0x4e7e6d,2);this.line([128,435,128,418,144,414],C.ink,6);this.hotspot('lab',150,489,165,140,'Laboratorio',560);
    }else{this.box(76,478,153,67,0xe1e3cb,5);this.text(89,489,'RX / LABORATORIO\nNo disponibles\nen este turno',12,'#829178');}
    // Stethoscope on a separate instrument tray.
    this.add.ellipse(365,507,115,30,0x617d65,.14);this.box(303,443,118,20,0xa9bfb4,9);this.line([319,463,312,512],C.metal,5);this.line([404,463,411,512],C.metal,5);
    this.circle(345,438,14,0x3e6356);this.circle(345,438,8,0xbee0cc);this.line([346,422,345,403,357,394,373,400,379,422],0x344f45,4);this.circle(379,425,7,0x2a5e54);
    this.hotspot('stethoscope',363,432,122,88,'Estetoscopio',522);
    // Pulse oximeter trolley; values are a frozen script snapshot, never generated.
    this.add.ellipse(322,389,120,24,0x617d65,.14);this.line([280,364,280,393],C.metal,6);this.line([365,364,365,393],C.metal,6);
    this.circle(280,393,6,C.ink);this.circle(365,393,6,C.ink);this.box(264,351,115,16,0x8eafa0,6);
    this.box(280,285,85,65,0x5b7e6c,10);this.box(288,292,68,45,0x173e36,4);
    this.text(295,294,'SpO₂',9,'#8fb8a0');this.text(300,309,s.sensorAttached&&!s.oxygenStarted?'88 %':'—',24,'#b4efd2','bold');this.circle(351,340,3,C.mint);
    this.hotspot('oximeter',321,328,124,105,'Oxímetro',400);
    // Bed, mattress and recognisable human patient.
    this.add.ellipse(573,514,291,61,0x477e67,.15);this.box(438,209,276,298,0x8fa59a,24);this.box(444,193,264,295,0xfcfff6,25);
    this.box(458,214,235,261,0xdde7d7,20);this.box(485,218,177,82,0xf8f9e9,20);
    this.box(451,258,9,180,0xb0c4b7,4);this.box(691,258,9,180,0xb0c4b7,4);
    this.box(478,340,28,91,C.skin,14);this.box(645,337,27,86,C.skin,13);
    this.box(561,295,27,30,C.skin,9);
    const chest=this.add.container(575,350);const shirt=this.add.graphics();shirt.fillStyle(C.blue);shirt.fillRoundedRect(-64,-38,128,104,22);shirt.lineStyle(2,0x5f8f95,.7);shirt.lineBetween(0,-20,0,65);chest.add(shirt);
    this.box(482,394,185,92,0x7aa38e,16);this.line([495,404,654,404],0xb4ccb9,4);this.line([504,422,544,458,565,444,627,472],0x668e7c,2,.4);
    this.add.ellipse(575,266,87,94,C.skin);this.add.ellipse(575,234,82,36,0x92978d);this.box(536,233,10,40,0x92978d,4);this.box(605,233,9,39,0x92978d,4);
    this.line([551,261,563,259],0x646c5c,3);this.line([588,259,600,261],0x646c5c,3);
    const eyes=this.add.container(575,269);eyes.add([this.add.ellipse(-17,0,6,4,C.ink),this.add.ellipse(17,0,6,4,C.ink)]);
    this.line([575,268,571,280,579,280],0xba8e70,2);this.line([563,292,586,292],0x9c7865,2);
    if(s.sensorAttached){this.box(487,395,23,11,0xce6655,4);this.line([490,400,423,420,390,385,350,343],0x415b4a,2,.8);}
    if(s.oxygenStarted){this.line([551,281,563,286,586,286,600,280],0xe1f5df,3);this.line([602,281,652,295,694,368,788,425],0xb6dac7,3);this.text(534,500,'Soporte instalado',12,'#26705c','bold');}
    this.hotspot('patient',575,353,252,294,'Paciente',548);
    if(!v.reducedMotion){this.tweens.add({targets:chest,scaleY:1.012,duration:2000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});this.tweens.add({targets:eyes,alpha:0,duration:110,yoyo:true,repeat:-1,repeatDelay:4400});}
    // Single declared oxygen source; I-4 has a larger autonomy, not invented ICU.
    this.add.ellipse(817,502,97,31,0x477e67,.15);this.box(791,i4?343:368,55,i4?153:128,0x4f8873,22);this.box(804,i4?322:347,29,26,0xa9b6a4,7);
    this.line([819,i4?327:351,852,i4?327:351],0x657d6e,7);this.circle(855,i4?327:351,14,0xe5ecdc);this.line([855,i4?327:351,862,i4?320:344],C.teal,2);
    this.text(802,415,'O₂',24,'#e0f3e1','bold');this.text(797,453,i4?'360 min':'180 min',11,'#d3edda');this.hotspot('oxygen',819,424,97,176,'Oxígeno',525);
    // Exit is an action: prepares an assisted handover, never teleports a cured patient.
    this.box(879,65,73,160,0x8b9f82,6);this.box(887,72,58,148,0xaebe9c,4);this.box(902,84,27,44,0xdbe3c6,3);this.circle(932,163,4,C.ink);
    this.box(883,43,66,18,0x34785d,3);this.text(916,46,'SALIDA',10,'#f3fff0','bold').setOrigin(.5,0);this.hotspot('door',916,145,80,170,'Traslado',236);
    if(s.txGiven){this.box(616,485,68,21,0xd8eadb,9);this.text(650,490,'TX01 ✓',11,'#31745c','bold').setOrigin(.5,0);}
    this.text(45,614,'Sala ficticia  ·  Animación ambiental; no representa frecuencia respiratoria ni evolución.',11,'#688373');
    if(v.tool){this.box(290,578,430,31,0x173e36,15,.95);this.text(505,586,'INSTRUMENTO PREPARADO  →  Selecciona al paciente',12,'#e2f3e4','bold').setOrigin(.5,0);}
  }
}
