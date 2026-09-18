import * as THREE from 'three';

// Local seeded art assets keep the scene repeatable and require no network services.
export function randomSource(seed=18){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const random=randomSource();
const textureCache=new Map();
export function surfaceTexture(kind){
 if(textureCache.has(kind))return textureCache.get(kind);
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
 const base=kind==='asphalt'?[77,86,90]:kind==='concrete'?[190,191,183]:kind==='roof'?[101,136,154]:[109,133,65];
 const data=ctx.createImageData(512,512);
 for(let i=0;i<data.data.length;i+=4){const n=(random()-.5)*(kind==='grass'?34:25);data.data[i]=base[0]+n;data.data[i+1]=base[1]+n;data.data[i+2]=base[2]+n;data.data[i+3]=255;}ctx.putImageData(data,0,0);
 if(kind==='grass'){for(let i=0;i<16000;i++){const x=random()*512,y=random()*512;ctx.strokeStyle=random()>.5?'#76925066':'#bbc07c50';ctx.lineWidth=.5+random();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*3-1.5,y-2-random()*4);ctx.stroke();}}
 if(kind==='roof'){for(let x=0;x<512;x+=32){ctx.fillStyle='#ffffff30';ctx.fillRect(x,0,3,512);ctx.fillStyle='#1d415e50';ctx.fillRect(x+4,0,2,512);}}
 if(kind==='concrete'){ctx.strokeStyle='#66747728';ctx.lineWidth=2;for(let x=0;x<513;x+=128){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke();ctx.beginPath();ctx.moveTo(0,x);ctx.lineTo(512,x);ctx.stroke();}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;textureCache.set(kind,t);return t;
}
export function surfaceMaterial(kind,repeatX=1,repeatY=1){const t=surfaceTexture(kind).clone();t.needsUpdate=true;t.repeat.set(repeatX,repeatY);return new THREE.MeshStandardMaterial({map:t,roughness:kind==='roof'?.58:.98,metalness:kind==='roof'?.35:0,bumpMap:t,bumpScale:kind==='asphalt'?.018:.035});}
export function groundHeight(x,z){
 const flat=Math.max(Math.abs(x)/16,Math.abs(z+1)/12);
 const ramp=THREE.MathUtils.smoothstep(flat,1,2.8);
 const h=ramp*(.7+Math.sin(x*.085)*1.7+Math.cos(z*.12)*1.1+Math.sin((x+z)*.15)*.6);
 const lake=Math.hypot((x-29)/23,(z+23)/14);
 const shore=1-THREE.MathUtils.smoothstep(lake,.9,1.15);
 const road=1-THREE.MathUtils.smoothstep(Math.abs(z-13),2.1,5);
 return THREE.MathUtils.lerp(THREE.MathUtils.lerp(h,-.7,shore),-.08,road)-.14;
}
export function addLandscape(scene){
 const terrain=new THREE.PlaneGeometry(220,180,160,130);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position;
 const vc=[];for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,groundHeight(x,z));const shade=.88+Math.sin(x*.28+z*.18)*.08+Math.cos(x*.63-z*.39)*.045;vc.push(shade,shade,shade*.96);}terrain.setAttribute('color',new THREE.Float32BufferAttribute(vc,3));terrain.computeVertexNormals();
 const grass=surfaceMaterial('grass',80,65);grass.vertexColors=true;
 const ground=new THREE.Mesh(terrain,grass);ground.receiveShadow=true;scene.add(ground);
 new THREE.TextureLoader().load('./assets/meadow.png',t=>{t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(65,55);t.anisotropy=8;grass.map=t;grass.bumpMap=t;grass.bumpScale=.045;grass.needsUpdate=true;const m=t.clone();m.repeat.set(7,5);m.needsUpdate=true;plot.material.map=m;plot.material.bumpMap=m;plot.material.needsUpdate=true;},undefined,()=>{/* Procedural grass is an intentional offline fallback. */});
 const plot=new THREE.Mesh(new THREE.PlaneGeometry(24,16),surfaceMaterial('grass',9,6));plot.rotation.x=-Math.PI/2;plot.position.y=-.09;plot.receiveShadow=true;scene.add(plot);
 const lakeGeo=new THREE.CircleGeometry(1,90);lakeGeo.rotateX(-Math.PI/2);const water=new THREE.Mesh(lakeGeo,new THREE.MeshPhysicalMaterial({color:0x468d9e,roughness:.21,metalness:.3,clearcoat:1,clearcoatRoughness:.12}));water.scale.set(22,1,13);water.position.set(29,-.34,-23);water.receiveShadow=true;scene.add(water);
 const ripples=new THREE.Group();scene.add(ripples);for(let i=0;i<42;i++){const x=10+random()*37,z=-32+random()*18;if(Math.hypot((x-29)/22,(z+23)/13)>.92)continue;const wave=new THREE.Mesh(new THREE.PlaneGeometry(.6+random()*2,.025),new THREE.MeshBasicMaterial({color:0xd4eced,transparent:true,opacity:.15+random()*.12,depthWrite:false}));wave.rotation.x=-Math.PI/2;wave.position.set(x,-.32,z);ripples.add(wave);}
 // Dense leaf clusters are instanced: thousands of details, only two foliage draw calls.
 const crowns=[],pineNeedles=[],trunks=[],branches=[];
 function tree(x,z,scale,pine){const y=groundHeight(x,z),height=(pine?4.1:3.4)*scale;trunks.push({x,y:y+height*.35,z,sx:.10*scale,sy:height*.7,sz:.10*scale});
  if(pine){for(let tier=0;tier<7;tier++){const radius=(1-tier/8)*1.12*scale,cy=y+(.95+tier*.43)*scale;for(let b=0;b<7;b++){const a=b/7*Math.PI*2+tier*.8;for(let j=0;j<4;j++){const f=(j+1)/4;pineNeedles.push({x:x+Math.cos(a)*radius*f,y:cy+.22*scale*(1-f)+(random()-.5)*.15,z:z+Math.sin(a)*radius*f,sx:(.31+.11*(1-f))*scale,sy:.17*scale,sz:.27*scale,ry:a,c:.72+random()*.35});}}}}
  else{for(let i=0;i<100;i++){const a=random()*Math.PI*2,rr=Math.sqrt(random())*1.12*scale,dy=(random()-.5)*1.7*scale;const radius=.2+random()*.21;crowns.push({x:x+Math.cos(a)*rr,y:y+height*.73+dy,z:z+Math.sin(a)*rr,sx:radius*scale,sy:radius*scale*.8,sz:radius*scale,ry:a,c:.65+random()*.55});}for(let i=0;i<3;i++)branches.push({x:x+Math.cos(i*2.1)*.25*scale,y:y+height*.55,z:z+Math.sin(i*2.1)*.25*scale,sx:.05*scale,sy:height*.33,sz:.05*scale,rz:(i-1)*.5});}
 }
 for(let i=0;i<290;i++){const x=(random()-.5)*106,z=-46+random()*82;if(Math.abs(x)<15.1&&z>-10.5&&z<19)continue;if(Math.abs(z-13)<4.1)continue;if(Math.hypot((x-29)/24,(z+23)/15)<1.06)continue;if(Math.abs(x)>39&&z>17)continue;tree(x,z,.72+random()*.74,random()>.46);}
 // Carefully placed trees frame the plot rather than hiding the buildings.
 for(const [x,z,s]of[[-14,-7,1.2],[-15,-2,.85],[-14,7,1.1],[14,-7,1],[15,3,.9],[16,9,1.15],[-17,18,1.3],[15,20,1.3]])tree(x,z,s,false);
 function instances(items,geometry,mat,cast=true){const m=new THREE.InstancedMesh(geometry,mat,items.length),o=new THREE.Object3D(),color=new THREE.Color();items.forEach((t,i)=>{o.position.set(t.x,t.y,t.z);o.rotation.set(0,t.ry||0,t.rz||0);o.scale.set(t.sx,t.sy,t.sz);o.updateMatrix();m.setMatrixAt(i,o.matrix);if(t.c){color.setScalar(t.c);m.setColorAt(i,color);}});m.castShadow=cast;m.receiveShadow=true;m.instanceMatrix.needsUpdate=true;scene.add(m);return m;}
 instances(trunks.concat(branches),new THREE.CylinderGeometry(.7,1,1,7),new THREE.MeshStandardMaterial({color:0x66503a,roughness:1}));
 const leafGeo=new THREE.IcosahedronGeometry(1,1);
 instances(crowns,leafGeo,new THREE.MeshStandardMaterial({color:0xb2cb92,map:surfaceTexture('grass'),bumpMap:surfaceTexture('grass'),bumpScale:.06,roughness:.92}));
 instances(pineNeedles,new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x355c37,roughness:.95}));
 const stones=[];for(let i=0;i<160;i++){const angle=random()*Math.PI*2;let x=29+Math.cos(angle)*(23+random()*1.4),z=-23+Math.sin(angle)*(14+random());if(x<14&&z>-10)continue;stones.push({x,y:groundHeight(x,z)+.15,z,sx:.22+random()*.6,sy:.15+random()*.26,sz:.2+random()*.5,ry:angle,c:.8+random()*.25});}
 for(let i=0;i<65;i++){const x=(random()-.5)*60,z=(random()-.5)*45;if(Math.abs(x)<14&&z>-10&&z<17||Math.abs(z-13)<4)continue;if(Math.hypot((x-29)/24,(z+23)/15)<1)continue;stones.push({x,y:groundHeight(x,z)+.16,z,sx:.3+random()*.4,sy:.3+random()*.3,sz:.3+random()*.5,ry:random()*6,c:.8+random()*.3});}
 instances(stones,new THREE.DodecahedronGeometry(1,1),new THREE.MeshStandardMaterial({color:0x929187,roughness:1}));
 const tufts=[];for(let i=0;i<1800;i++){const x=(random()-.5)*50,z=(random()-.5)*37;if(Math.abs(x)<12.8&&z>-9&&z<9.5||Math.abs(z-13)<2.4)continue;if(Math.hypot((x-29)/24,(z+23)/15)<1)continue;tufts.push({x,y:groundHeight(x,z)+.09,z,sx:.035+random()*.045,sy:.1+random()*.13,sz:.035,ry:random()*6,c:.7+random()*.6});}instances(tufts,new THREE.ConeGeometry(1,1,3),new THREE.MeshStandardMaterial({color:0x798640,roughness:1}),false);
 // Broad irregular ridges replace the isolated low-poly cones.
 for(let ridge=0;ridge<3;ridge++){const geo=new THREE.PlaneGeometry(180,22,90,12);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),fall=Math.max(0,1-Math.abs(z)/11);p.setY(i,fall*(8+ridge*2+Math.sin(x*.09+ridge)*4+Math.sin(x*.23)*2)+random()*.45);p.setZ(i,z-60-ridge*17);}geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:[0x738a80,0x859c9a,0x9cb0b0][ridge],roughness:1}));scene.add(m);}
 return{water,ripples};
}
