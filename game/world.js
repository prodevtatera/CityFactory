import {LINKS,truckDuration} from './simulation.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { addLandscape, surfaceMaterial } from './landscape.js';

const colors={cream:0xf4f7f5,wall:0xe1e9e8,blue:0x58819d,trim:0x355c78,metal:0xc3cdd1,dark:0x354d50,amber:0xc9822c,concrete:0xbabeb2,grass:0x90ab6c};
const mats=new Map();
function material(c){if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:c===colors.metal?.22:.78,metalness:c===colors.metal?.88:0}));return mats.get(c);}
function mesh(g,geo,c,x=0,y=0,z=0){const m=new THREE.Mesh(geo,typeof c==='number'?material(c):c);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function box(g,w,h,d,c,x=0,y=0,z=0){return mesh(g,new THREE.BoxGeometry(w,h,d),c,x,y,z);}
function bevel(g,w,h,d,c,x=0,y=0,z=0,r=.04){return mesh(g,new RoundedBoxGeometry(w,h,d,2,r),c,x,y,z);}
function cyl(g,r,h,c,x=0,y=0,z=0,rt=r){return mesh(g,new THREE.CylinderGeometry(rt,r,h,40),c,x,y,z);}
function ball(g,r,c,x,y,z,s=1){const m=mesh(g,new THREE.IcosahedronGeometry(r,1),c,x,y,z);m.scale.y=s;return m;}
function pipe(g,points,r=.06,c=colors.metal){return mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.05),24,r,7,false),c);}
function ring(g,r,c,x,y,z){const m=mesh(g,new THREE.TorusGeometry(r,.025,8,40),c,x,y,z);m.rotation.x=Math.PI/2;return m;}
function labelTexture(text,bg='#edf0de',fg='#345149'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.font='600 56px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=fg;ctx.fillText(text,256,66);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t});}
function sign(g,text,x,y,z,w=2){return box(g,w,w/4,.035,labelTexture(text),x,y,z);}
function bottle(g,x,y,z,scale=1){const b=new THREE.Group();cyl(b,.075,.28,0xb98235,0,.14,0);cyl(b,.037,.11,0xc3914f,0,.335,0);cyl(b,.041,.035,0x385a54,0,.402,0);box(b,.153,.13,.115,0xf3e7c7,0,.145,.01);b.position.set(x,y,z);b.scale.setScalar(scale);g.add(b);return b;}
function carton(g,x,y,z,s=.4){box(g,s,s*.8,s*.8,0xcbad79,x,y+s*.4,z);box(g,s*.12,.007,s*.8,0xe7d6ae,x,y+s*.8+.005,z);box(g,s*.4,s*.24,.005,0xead9b6,x,y+s*.4,z+s*.401);}
function pallet(g,x,z,stack=1){for(let i=0;i<4;i++)box(g,.7,.05,.14,0x98724b,x,.15,z-.27+i*.18);for(let y=0;y<stack;y++)for(let ix=0;ix<2;ix++)for(let iz=0;iz<2;iz++)carton(g,x-.17+ix*.34,.2+y*.29,z-.16+iz*.32,.31);}
function shelf(g,x,z){for(let dx of [-.58,.58])for(let dz of [-.23,.23])box(g,.055,1.6,.055,colors.trim,x+dx,1,z+dz);for(let y of [.4,1,1.65]){box(g,1.3,.08,.6,colors.metal,x,y,z);for(let i=0;i<3;i++)carton(g,x-.4+i*.4,y+.05,z,.3);}}
function shell(g,w,d,title){
 box(g,w,.22,d,surfaceMaterial('concrete',2,2),0,.12);
 box(g,w-.18,.04,d-.18,0xe3e6df,0,.255);
 bevel(g,w,1.96,.16,colors.wall,0,1.28,-d/2+.08);
 // Cutaway side walls keep the working equipment visible from the main camera.
 box(g,.16,.58,d,colors.wall,-w/2+.08,.56);box(g,.16,.58,d,colors.wall,w/2-.08,.56);
 box(g,w,.18,.18,colors.trim,0,.38,-d/2+.18);
 for(const x of [-w/2+.1,w/2-.1])for(const z of [-d/2+.1,d/2-.1]){box(g,.16,2,.16,colors.cream,x,1.27,z);box(g,.21,.25,.21,colors.trim,x,.4,z);}
 // A standing-seam blue roof covers the rear service strip; the rest is deliberately cut away.
 const roof=box(g,w+.12,.13,1.12,surfaceMaterial('roof',2,1),0,2.34,-d/2+.43);roof.rotation.x=.06;
 box(g,w+.18,.14,.09,colors.trim,0,2.29,-d/2+1.02);
 box(g,w,.14,.16,colors.cream,0,2.23,d/2-.08);
 box(g,.16,.14,d,colors.cream,-w/2+.08,2.23,0);box(g,.16,.14,d,colors.cream,w/2-.08,2.23,0);
 for(let x=-w/2+.55;x<w/2-.25;x+=.78){box(g,.58,.67,.04,colors.trim,x,1.39,-d/2+.18);box(g,.48,.55,.02,new THREE.MeshPhysicalMaterial({color:0x8badbd,roughness:.15,metalness:.25,clearcoat:1}),x,1.4,-d/2+.206);box(g,.025,.56,.03,colors.cream,x,1.4,-d/2+.223);}
 for(let x=-w/2+.12;x<w/2;x+=.24)box(g,.014,1.7,.012,0xc5d2d3,x,1.18,-d/2-.007);
 for(const x of [-w/2+.12,w/2-.12])pipe(g,[[x,2.28,-d/2+.01],[x,1,-d/2+.01],[x,.3,-d/2+.16]],.036,0x7793a1);
 const name=sign(g,title,0,2.32,d/2+.015,Math.min(2.5,w-.35));name.material=labelTexture(title,'#fafcff','#325878');
 // Canopy lighting, wall vents and yellow safety bollards add recognizable industrial scale.
 for(let x=-w/2+.55;x<w/2-.3;x+=1.25)box(g,.52,.035,.14,0xf5dfae,x,2.16,.65);
 box(g,.55,.3,.08,0x778b92,w/2-.55,1.9,-d/2+.2);
 for(let i=0;i<4;i++)box(g,.43,.015,.012,0xcbd5d4,w/2-.55,1.81+i*.06,-d/2+.25);
 for(const x of [-w/2+.25,w/2-.25]){cyl(g,.055,.43,0xe1b344,x,.48,d/2-.22);cyl(g,.056,.075,0x3d494a,x,.6,d/2-.22);}
}
function tank(g,x,z,r=.63,h=1.55){
 for(let a=0;a<4;a++){const t=a*Math.PI/2;box(g,.1,.51,.1,colors.metal,x+Math.cos(t)*r*.7,.49,z+Math.sin(t)*r*.7);box(g,.19,.035,.19,colors.dark,x+Math.cos(t)*r*.7,.255,z+Math.sin(t)*r*.7);}
 const glass=new THREE.MeshPhysicalMaterial({color:0xdce8e6,roughness:.12,metalness:.05,transparent:true,opacity:.17,clearcoat:1,depthWrite:false});
 cyl(g,r,h,glass,x,h/2+.62,z);
 const liquid=cyl(g,r*.94,h*.59,new THREE.MeshPhysicalMaterial({color:0xb66a13,roughness:.18,metalness:.12,clearcoat:1,emissive:0x542700,emissiveIntensity:.12}),x,h*.295+.65,z);liquid.userData.liquid=true;
 cyl(g,r+.02,.19,colors.metal,x,.69,z);cyl(g,r+.02,.23,colors.metal,x,h+.51,z);
 const dome=mesh(g,new THREE.SphereGeometry(r,32,16,0,Math.PI*2,0,Math.PI/2),colors.metal,x,h+.64,z);dome.scale.y=.34;
 for(const y of [.62,1.04,h+.46,h+.66])ring(g,r+.025,colors.metal,x,y,z);
 cyl(g,.19,.19,colors.trim,x,h+.96,z);cyl(g,.12,.2,colors.metal,x,h+1.12,z);
 // Agitator, sample valve, sight gauge and an actual access ladder.
 cyl(g,.027,h+.24,colors.metal,x,h/2+.7,z);
 for(let n=0;n<2;n++){const paddle=box(g,r*1.55,.045,.1,colors.metal,x,.85+n*.5,z);paddle.userData.spin=true;}
 box(g,.15,.94,.055,colors.trim,x+r*.62,1.22,z+r*.81);box(g,.07,.8,.017,0xe4bf73,x+r*.62,1.22,z+r*.85);
 pipe(g,[[x,.75,z+r],[x,.75,z+r+.24],[x,.51,z+r+.24]],.054);
 const wheel=mesh(g,new THREE.TorusGeometry(.115,.018,6,18),0x3d7891,x,.8,z+r+.25);wheel.rotation.y=Math.PI/2;
 const gauge=cyl(g,.115,.042,colors.metal,x-r*.63,1.55,z+r*.85);gauge.rotation.x=Math.PI/2;
 const face=cyl(g,.09,.045,0xf3f3dc,x-r*.63,1.55,z+r*.875);face.rotation.x=Math.PI/2;box(g,.01,.075,.008,0x283b42,x-r*.63,1.57,z+r*.901);
 for(const dx of [-.2,.2])box(g,.034,h+.45,.034,colors.metal,x+r+.11+dx,h/2+.65,z-.3);
 for(let y=.42;y<h+.75;y+=.2)box(g,.44,.03,.035,colors.metal,x+r+.11,y,z-.3);
 pipe(g,[[x,h+1.23,z],[x,h+1.35,z],[x+.45,h+1.35,z],[x+.63,h+1.1,z]],.055);
}
function worker(g,x,z){const p=new THREE.Group();
 cyl(p,.11,.3,0x376582,0,.43,0);ball(p,.087,0xd1a080,0,.68,0);
 cyl(p,.115,.055,0xe7bd52,0,.766,0);const hat=ball(p,.095,0xf0c763,0,.775,0,.55);
 for(const dx of [-.065,.065]){box(p,.075,.24,.09,0x435b67,dx,.19,0);box(p,.09,.065,.17,0x293e49,dx,.055,.04);}
 for(const dx of [-.145,.145]){const arm=box(p,.065,.25,.07,0x497e97,dx,.43,0);arm.rotation.z=dx<0?-.18:.18;}
 box(p,.16,.13,.035,0xdfb64b,0,.45,.105);p.position.set(x,.25,z);g.add(p);return p;
}
export function makeModule(type){const g=new THREE.Group();g.userData.type=type;
 if(type==='roads'){box(g,24,.08,3,surfaceMaterial('asphalt',12,2),0,.13);box(g,24,.12,2.65,surfaceMaterial('concrete',12,2),0,.13,-2.83);for(let x=-11;x<12;x+=2.8){box(g,.065,.012,1.5,0xf8faf3,x,.205,-2.85);}for(const x of [-8,9]){box(g,2.1,.015,.065,0xdeb64b,x,.212,-3.48);for(let dx=-.9;dx<1;dx+=.3){const hatch=box(g,.07,.018,.48,0xe4be52,x+dx,.218,-3.24);hatch.rotation.y=-.55;}}box(g,24,.12,.2,0xd4d5bf,0,.18,-1.5);box(g,24,.12,.2,0xd4d5bf,0,.18,1.5);for(let x=-11;x<12;x+=1.4)box(g,.7,.01,.055,0xe1dbb6,x,.178);return g;}
 if(type==='utilities'){box(g,4,.18,4,surfaceMaterial('concrete',2,2),0,.14);cyl(g,.85,1.8,0x689fb2,-.75,1.22,-.5);cyl(g,.87,.25,0x72a9b9,-.75,2.2,-.5,.65);ring(g,.86,0xb8d3d4,-.75,.5,-.5);ring(g,.86,0xb8d3d4,-.75,1.94,-.5);cyl(g,.17,.14,colors.metal,-.75,2.4,-.5);box(g,1.2,1.5,1.3,0xd1d7c8,1,1,-.6);box(g,1.3,.12,1.4,0x759092,1,1.78,-.6);for(let i=0;i<6;i++)box(g,.65,.045,.02,0x889c92,1,.8+i*.1,.058);sign(g,'POWER',1,1.43,.065,.76);sign(g,'WATER',-.75,1.5,.36,1);pipe(g,[[-.7,.5,.35],[-.7,.5,1],[1,.5,1],[1,.3,1.8]],.1);return g;}
 if(type==='receiving'){shell(g,4,4,'RECEIVING');shelf(g,-1.13,-.7);shelf(g,.4,-1.1);for(let i=0;i<5;i++){const b=ball(g,.23,0xe2d3ac,-1+(i%2)*.45,.44+Math.floor(i/2)*.32,.8,.7);b.scale.x=1.1;}pallet(g,.7,.65,2);box(g,1.3,.12,.7,0x7f9290,1,.35,1.6);}
 if(type==='kitchen'){shell(g,5,4,'SYRUP KITCHEN');tank(g,-1.05,-.1,.72,1.7);tank(g,.85,-.1,.72,1.7);pipe(g,[[-1.05,.7,.63],[-1.05,.7,1.13],[.85,.7,1.13],[.85,.7,.63]],.085);box(g,.4,.7,.22,0x648a86,1.92,.92,.9);box(g,.25,.23,.02,0x9fc4ba,1.92,1.06,1.03);for(let i=0;i<6;i++)box(g,.45,.075,.18,colors.metal,-2,.4+i*.25,-1.1);box(g,4.35,.055,.45,colors.metal,0,.85,-1.23);for(let x=-2;x<2.3;x+=.65){box(g,.035,.68,.035,colors.metal,x,1.2,-1.44);}box(g,4.4,.04,.04,colors.metal,0,1.55,-1.44);}
 if(type==='quality'){shell(g,3,3,'QUALITY');box(g,2.2,.12,.68,0x7a9998,0,.93,-.6);for(let x of [-.85,.85])box(g,.1,.7,.48,colors.cream,x,.58,-.6);for(let i=0;i<4;i++){const b=cyl(g,.08,.25,i%2?0xc69240:0x87c1ba,-.65+i*.3,1.12,-.55,.035);b.material=material(i%2?0xc69240:0x87c1ba);}box(g,.4,.07,.36,colors.dark,.55,1.03,-.55);box(g,.08,.42,.08,colors.dark,.65,1.25,-.65);const tube=cyl(g,.065,.3,colors.cream,.54,1.45,-.58);tube.rotation.z=-.5;box(g,.55,.38,.07,colors.trim,-.5,1.18,.65);box(g,.46,.28,.01,0xa9c5b9,-.5,1.2,.69);cyl(g,.24,.12,0xb9cbaa,.8,.7,.5);cyl(g,.05,.55,colors.metal,.8,.39,.5);}
 if(type==='bottling'){shell(g,5,4,'BOTTLING');box(g,4.35,.15,.6,0x546b67,0,.86,.4);for(let x=-1.9;x<2;x+=.22){const r=cyl(g,.06,.57,colors.metal,x,.95,.4);r.rotation.x=Math.PI/2;}for(const x of [-1.7,0,1.7])for(const z of [.13,.68])box(g,.08,.65,.08,colors.metal,x,.53,z);box(g,2,.17,1,0x6e979e,-.35,1.92,.15);for(let x=-1;x<.8;x+=.5){box(g,.075,1.5,.075,colors.metal,x,.99,-.3);cyl(g,.06,.4,colors.metal,x,1.62,.4);}for(let i=0;i<11;i++){const b=bottle(g,-2+i*.37,.99,.4);b.userData.belt=true;b.userData.offset=i*.37;}box(g,.52,.8,.7,colors.blue,1.7,.64,-.8);pallet(g,-1.6,-.9,1);}
 if(type==='shipping'){shell(g,4,4,'SHIPPING');shelf(g,-1.15,-.7);pallet(g,.45,-.8,3);pallet(g,.5,.35,2);pallet(g,-.85,.8,2);box(g,1.8,.2,.9,0x81938f,.6,.29,1.8);for(let x=-.2;x<1.6;x+=.25)box(g,.13,.04,.1,0xc7a74c,x,.42,2.22);}
 if(type==='kitchen')worker(g,1.73,1.32);if(type==='receiving')worker(g,1.48,.65);if(type==='quality')worker(g,.52,.55);
 return g;}
function truck(color=0xf1f5f1){const g=new THREE.Group();
 bevel(g,1.3,.18,2.95,colors.dark,0,.4,0,.045);
 bevel(g,1.29,1.23,1.93,color,0,1.13,-.48,.055);
 box(g,1.3,.09,1.98,0xe9f0ee,0,1.79,-.48);
 // Corrugated trailer, side stripe and twin rear doors.
 for(const x of [-.656,.656]){box(g,.012,.2,1.81,0x447c91,x,.89,-.48);for(let z=-1.36;z<.43;z+=.14)box(g,.015,1.14,.018,0xb9c8cf,x,1.15,z);}
 for(const x of [-.32,.32]){box(g,.62,1.12,.035,0xdce4e4,x,1.13,-1.461);box(g,.025,.86,.04,0x6c828e,x,1.12,-1.486);box(g,.18,.045,.05,colors.dark,x,1.04,-1.52);}
 bevel(g,1.25,.84,.95,0xf3f6f2,0,.99,1.04,.12);bevel(g,1.25,.27,.87,0xf7f9f6,0,1.53,1.02,.1);
 const wind=new THREE.MeshPhysicalMaterial({color:0x39697e,roughness:.13,metalness:.3,clearcoat:1});
 bevel(g,1.08,.37,.045,wind,0,1.26,1.516,.04);
 for(const x of [-.636,.636]){box(g,.025,.33,.46,wind,x,1.28,1.06);box(g,.014,.025,.18,colors.trim,x,1.0,.81);box(g,.04,.055,.26,colors.dark,x*1.16,1.2,1.22);bevel(g,.09,.19,.12,0xf0f3f2,x*1.23,1.22,1.32,.02);}
 box(g,1.27,.11,.11,colors.metal,0,.59,1.54);box(g,.63,.18,.035,colors.dark,0,.85,1.52);for(let i=0;i<3;i++)box(g,.6,.015,.015,0xb8c4c5,0,.8+i*.055,1.55);
 for(const x of [-.47,.47]){bevel(g,.19,.17,.04,0xfbf0ca,x,.89,1.52,.03);box(g,.1,.075,.04,0xd5953d,x,1.03,1.52);box(g,.13,.12,.04,0xb94135,x,.65,-1.51);}
 for(const x of [-.67,.67])for(const z of [-1.08,-.5,1.05]){let w=cyl(g,.235,.17,0x29383d,x,.36,z);w.rotation.z=Math.PI/2;w=cyl(g,.13,.176,0xb3c4c8,x,.36,z);w.rotation.z=Math.PI/2;w=cyl(g,.055,.185,colors.dark,x,.36,z);w.rotation.z=Math.PI/2;}
 return g;
}
function forklift(){const g=new THREE.Group();box(g,.58,.45,.85,0xce9f42,0,.45);box(g,.4,.3,.4,0x405e56,0,.8);for(let x of [-.24,.24])box(g,.045,.9,.045,colors.dark,x,.9,.2);box(g,.6,.055,.55,colors.dark,0,1.35,.0);box(g,.6,.8,.08,colors.dark,0,.67,.55);for(let x of [-.19,.19])box(g,.075,.05,.58,colors.metal,x,.3,.85);for(let x of [-.32,.32])for(let z of [-.28,.28]){const w=cyl(g,.16,.1,colors.dark,x,.25,z);w.rotation.z=Math.PI/2;}carton(g,0,.36,.95,.5);return g;}

export function createWorld(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xc6dde9);scene.fog=new THREE.Fog(0xc6dde9,90,205);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.38;room.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,240);camera.position.set(31,30,37);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=23;controls.maxDistance=155;controls.maxPolarAngle=Math.PI*.42;controls.minPolarAngle=.25;controls.mouseButtons={LEFT:null,MIDDLE:THREE.MOUSE.PAN,RIGHT:THREE.MOUSE.ROTATE};controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
 scene.add(new THREE.HemisphereLight(0xdcefff,0x787453,1.15));const sun=new THREE.DirectionalLight(0xffe9c9,3.15);sun.position.set(-20,32,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-26,right:26,top:26,bottom:-26,near:.5,far:100});sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;scene.add(sun);
 const landscape=addLandscape(scene);
 // Main road and curbs; the road kit connects the factory plot to it.
 box(scene,130,.09,3.4,surfaceMaterial('asphalt',60,2),0,-.03,13);for(const z of [11.2,14.8])box(scene,130,.11,.24,0xc7c9ac,0,.02,z);for(let x=-64;x<65;x+=2.2)box(scene,1,.01,.07,0xe6dbaf,x,.022,13);for(const z of [11.55,14.45])box(scene,130,.012,.045,0xc6cbb7,0,.025,z);
 function fence(x,z,length,rotate=false){const g=new THREE.Group();for(let p=-length/2;p<=length/2;p+=1.5)box(g,.11,.7,.11,0xc7c9a5,p,.38);for(const y of [.3,.63])box(g,length,.06,.07,0xd6d8b4,0,y);g.position.set(x,0,z);if(rotate)g.rotation.y=Math.PI/2;scene.add(g);}
 fence(0,-8.6,25);fence(-12.6,0,17,true);fence(12.6,0,17,true);fence(-7.1,8.6,11);fence(7.1,8.6,11);
 for(const x of [-1.4,1.4]){box(scene,.25,1.45,.25,colors.cream,x,.7,9.1);ball(scene,.2,0xc1a475,x,1.5,9.1,.6);}sign(scene,'SYRUP VALLEY',-8,1.15,9.2,3);for(const x of [-9.1,-6.9])box(scene,.12,.9,.12,0x8b8669,x,.55,9.2);
 for(let i=0;i<12;i++){const x=-11+i*.48;ball(scene,.19,0x7b965a,x,.2,9.2);if(i%2===0)ball(scene,.08,0xdac587,x,.41,9.18);}
 const grid=new THREE.GridHelper(24,24,0xd1d9b1,0xc1cca2);grid.position.y=-.057;grid.scale.z=16/24;grid.material.transparent=true;grid.material.opacity=.36;scene.add(grid);
 const composer=new EffectComposer(renderer);composer.renderTarget1.samples=4;composer.renderTarget2.samples=4;composer.addPass(new RenderPass(scene,camera));
 const ao=new SSAOPass(scene,camera,canvas.clientWidth,canvas.clientHeight,12);ao.kernelRadius=7;ao.minDistance=.001;ao.maxDistance=.055;composer.addPass(ao);composer.addPass(new OutputPass());
 const buildings=new THREE.Group();scene.add(buildings);const labels=new Map(),models=new Map();let ghost=null,ghostType=null,ghostOutline=null;
 const footprint=box(scene,1,.035,1,new THREE.MeshBasicMaterial({color:0x88bbb1,transparent:true,opacity:.3}),0,.18);footprint.visible=false;
 const supply=truck(0xe9ede0);scene.add(supply);supply.visible=false;const delivery=truck(0xe8dfbf);scene.add(delivery);delivery.visible=false;const fork=forklift();scene.add(fork);fork.visible=false;
 const traffic=[truck(0xa3b2a3),truck(0xc9b48f)];traffic.forEach((t,i)=>{scene.add(t);t.scale.setScalar(.82);t.rotation.y=(i?1:-1)*Math.PI/2;t.position.z=i?12.2:13.8;});
 const flows=new THREE.Group();scene.add(flows);let showFlow=true;const packets=[];
 function rebuildFlow(state){
  flows.traverse(o=>{if(o.isMesh||o.isLine){o.geometry.dispose();o.material.dispose();}});flows.clear();packets.length=0;
  for(const [key]of LINKS){const route=state.routes?.[key];if(!route)continue;
   const colors={raw:0xdba84a,packs:0x6a9bea,syrup:0xed932d,goods:0x25ae92};
   const points=route.path.map(([x,z])=>new THREE.Vector3(x,.33,z));if(points.length<2)continue;
   const routeCurve=new THREE.CurvePath();for(let i=1;i<points.length;i++)routeCurve.add(new THREE.LineCurve3(points[i-1],points[i]));
   const line=new THREE.Mesh(new THREE.TubeGeometry(routeCurve,points.length*2,.055,5,false),new THREE.MeshBasicMaterial({color:colors[key]}));flows.add(line);
   // Each marker represents one real 100-unit lot, never decorative material.
   for(let i=0;i<3;i++){const p=box(flows,.5,.4,.5,colors[key],0,.4,0);packets.push({p,key,index:i,points});}
  }
 }
 function sync(state){for(const[id,obj]of models){if(!state.buildings.some(b=>b.id===id)){buildings.remove(obj);models.delete(id);labels.get(id)?.remove();labels.delete(id);}}
 for(const b of state.buildings){if(models.has(b.id)){const m=models.get(b.id);m.position.set(b.x,0,b.z);m.rotation.y=b.rot*Math.PI/2;continue;}const m=makeModule(b.type);m.position.set(b.x,0,b.z);m.rotation.y=b.rot*Math.PI/2;m.traverse(o=>o.userData.buildingId=b.id);buildings.add(m);models.set(b.id,m);if(b.type==='roads'){box(m,2.6,.09,4.7,surfaceMaterial('asphalt',2,3),0,.13,3.75);continue;}const el=document.createElement('button');el.className='world-label';el.textContent=b.type==='kitchen'?'Syrup Kitchen':b.type[0].toUpperCase()+b.type.slice(1);el.dataset.id=b.id;el.setAttribute('aria-label',`Inspect ${el.textContent}`);document.querySelector('#labels').append(el);labels.set(b.id,el);}
 rebuildFlow(state);grid.visible=state.phase==='build';
 }
 function setGhost(type,x,z,rot,valid,w,d){if(type!==ghostType){if(ghostOutline){scene.remove(ghostOutline);ghostOutline.geometry.dispose();ghostOutline.material.dispose();ghostOutline=null;}if(ghost){scene.remove(ghost);ghost.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}ghostType=type;ghost=type?makeModule(type):null;if(ghost){ghost.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshStandardMaterial({color:0x86c9ff,emissive:0x338bcb,emissiveIntensity:.6,transparent:true,opacity:.24,depthWrite:false});o.castShadow=false;}});scene.add(ghost);ghostOutline=new THREE.BoxHelper(ghost,0x86d5ff);scene.add(ghostOutline);}}
 footprint.visible=!!type;if(!ghost)return;ghost.position.set(x,0,z);ghost.rotation.y=rot*Math.PI/2;ghost.traverse(o=>{if(o.isMesh)o.material.color.set(valid?0x86c9ff:0xe8745f);});if(ghostOutline){ghostOutline.update();ghostOutline.material.color.set(valid?0x86d5ff:0xe8745f);}footprint.position.set(x,.19,z);footprint.scale.set(rot?d:w,1,rot?w:d);footprint.material.color.set(valid?0x609a8a:0xc16751);
 }
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
 function pick(clientX,clientY){const rect=canvas.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const p=new THREE.Vector3();ray.ray.intersectPlane(plane,p);const hits=ray.intersectObjects(buildings.children,true);return{x:Math.round(p.x*2)/2,z:Math.round(p.z*2)/2,id:hits[0]?.object.userData.buildingId};}
 // Trucks use the fixed road and a validated clear dock approach.
 function moveTruck(t,progress,building,arrival){if(!building){t.visible=false;return;}const points=arrival?[[-30,13],[0,13],[0,6.5],[building.x,6.5],[building.x,building.z+3.8]]:[[building.x,building.z+3.8],[building.x,6.5],[0,6.5],[0,13],[30,13]];const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));let distance=Math.max(0,Math.min(1,progress))*lengths.reduce((n,v)=>n+v,0),segment=0;while(segment<lengths.length-1&&distance>lengths[segment])distance-=lengths[segment++];const f=lengths[segment]?Math.min(1,distance/lengths[segment]):1,a=points[segment],b=points[segment+1];t.position.set(THREE.MathUtils.lerp(a[0],b[0],f),.08,THREE.MathUtils.lerp(a[1],b[1],f));t.rotation.y=arrival&&segment===points.length-2?0:Math.atan2(b[0]-a[0],b[1]-a[1]);t.visible=true;}
 let lastWidth=0,lastHeight=0;
 function render(state,time){const w=canvas.clientWidth,h=canvas.clientHeight;if(w!==lastWidth||h!==lastHeight){lastWidth=w;lastHeight=h;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();home();}controls.update();flows.visible=showFlow&&state.buildings.length>2;packets.forEach(({p,key,index,points})=>{const t=state.transfers.filter(t=>t.key===key)[index];p.visible=!!t;if(t){const fraction=Math.min(1,t.elapsed/state.routes[key].duration),n=fraction*(points.length-1),i=Math.min(points.length-2,Math.floor(n));p.position.copy(points[i]).lerp(points[i+1],n-i);p.position.y=.48;}});

 buildings.traverse(o=>{if(o.userData.spin&&state.phase==='mixing'&&!state.paused)o.rotation.y=time*2;if(o.userData.belt&&state.phase==='bottling'&&state.stock.bottleSyrup>0&&state.stock.bottlePacks>0&&!state.paused)o.position.x=-2+(time*.5+o.userData.offset)%4;});
 for(const[id,el]of labels){const obj=models.get(id);const v=obj.position.clone().add(new THREE.Vector3(0,obj.userData.type==='kitchen'?3.8:3.05,0)).project(camera);el.style.left=`${(v.x*.5+.5)*w}px`;el.style.top=`${(-v.y*.5+.5)*h}px`;el.style.display=v.z>1?'none':'';const active=({receiving:'receiving',mixing:'kitchen',bottling:'bottling',awaitingQuality:'quality',dispatching:'shipping'})[state.phase];el.classList.toggle('running',active===obj.userData.type);const type=obj.userData.type,stocks=state.stock;const counts={receiving:`${stocks.raw} ingredients · ${stocks.packs} kits`,kitchen:state.phase==='mixing'?`Mixing ${state.mixed} / 100`:`${stocks.kitchenRaw} ingredients`,bottling:`${stocks.held} held · ${stocks.bottleSyrup} syrup`,shipping:`${stocks.ready} ready · truck ${state.truck.load}/200`,quality:state.phase==='awaitingQuality'?'100 cartons need release':'Batch checks'};const title=type==='kitchen'?'Syrup Kitchen':type[0].toUpperCase()+type.slice(1);const label=title+(state.phase!=='build'&&counts[type]?`<small>${counts[type]}</small>`:'');if(obj.userData.labelText!==label){el.innerHTML=label;obj.userData.labelText=label;}}
 const receiving=state.buildings.find(b=>b.type==='receiving'),shipping=state.buildings.find(b=>b.type==='shipping');supply.visible=false;delivery.visible=false;fork.visible=false;
 if(state.phase!=='build'&&state.phase!=='complete'){
  const u=state.supply,t=state.truck;
  if(u.status==='approaching')moveTruck(supply,u.elapsed/truckDuration(state,'receiving'),receiving,true);
  if(u.status==='unloading')moveTruck(supply,1,receiving,true);
  if(u.status==='departing')moveTruck(supply,u.elapsed/truckDuration(state,'receiving'),receiving,false);
  if(t.status==='approaching')moveTruck(delivery,t.elapsed/truckDuration(state,'shipping'),shipping,true);
  if(['waiting','loading'].includes(t.status))moveTruck(delivery,1,shipping,true);
  if(t.status==='departing')moveTruck(delivery,t.elapsed/truckDuration(state,'shipping'),shipping,false);
  if(t.status==='loading'&&shipping){fork.visible=true;fork.position.set(shipping.x+1,.13,shipping.z+2.4+Math.sin(time*2)*.6);}
 }
 traffic.forEach((t,i)=>t.position.x=((time*(i?1.8:-1.5)+i*30+500)%100)-50);
 ao.enabled=!ghost;composer.render();
 }
 function home(){const factor=Math.max(1,Math.min(3,1.5/(canvas.clientWidth/canvas.clientHeight)));scene.fog.near=90*factor;scene.fog.far=205*factor;controls.target.set(-3,0,2);camera.position.set(13*factor-3,25*factor,37*factor+2);controls.update();}
 home();
 return{sync,previewRoutes:rebuildFlow,setGhost,pick,render,home,zoom(f){camera.position.sub(controls.target).multiplyScalar(f).add(controls.target);controls.update();},toggleFlow(){showFlow=!showFlow;return showFlow;},canvas,renderer,scene,camera};
}

export function thumbnails(){const r=new THREE.WebGLRenderer({antialias:true,alpha:true});r.setSize(240,150);r.setPixelRatio(1);r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;const s=new THREE.Scene();const pm=new THREE.PMREMGenerator(r),env=new RoomEnvironment();s.environment=pm.fromScene(env,.04).texture;s.environmentIntensity=.5;env.dispose();pm.dispose();s.add(new THREE.HemisphereLight(0xf4f8f8,0x7c866a,3));const l=new THREE.DirectionalLight(0xffedcc,4);l.position.set(-5,10,6);s.add(l);const c=new THREE.OrthographicCamera(-3.8,3.8,2.38,-2.38,.1,50);c.position.set(7,6,9);c.lookAt(0,.7,0);const out={};for(const type of ['roads','utilities','receiving','kitchen','quality','bottling','shipping']){const m=makeModule(type);if(type==='roads')m.scale.set(.24,1,.9);s.add(m);r.render(s,c);out[type]=r.domElement.toDataURL();s.remove(m);}r.dispose();return out;}
