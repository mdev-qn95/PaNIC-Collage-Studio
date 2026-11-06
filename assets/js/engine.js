'use strict';
/* ===== Trạng thái ===== */
const STORE='panic-collage-v2';
const DEF={tpl:'dump',cat:'all',size:'fb',pal:'linen',fp:'didone',gap:14,margin:64,radius:0,tscale:1,demo:true,
  dpi:150,mult:1,fmt:'image/jpeg',custW:60,custH:90,cbg:null,ctext:null,caccent:null,filter:'none',grain:false,stamp:false,texts:{},seen:false};
let S=JSON.parse(JSON.stringify(DEF));
try{const o=JSON.parse(localStorage.getItem(STORE)||'null');if(o){const {mock,...settings}=o;S={...S,...settings,texts:{...(o.texts||{})}}}}catch(e){}
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(S))}catch(e){}};
let photos=[],slotState={},sel=null,lastSlots=[];
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

/* ===== Tiện ích ===== */
const $=s=>document.querySelector(s);
const hex=h=>{h=(h||'#000').replace('#','');if(h.length===3)h=[...h].map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255]};
const rgba=(h,a)=>{const[r,g,b]=hex(h);return`rgba(${r},${g},${b},${a})`};
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const lum=h=>{const[r,g,b]=hex(h);return(.299*r+.587*g+.114*b)/255};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function rng(seed){let s=seed%2147483647||7;return()=>(s=s*16807%2147483647)/2147483647}

function sz(){const z=SIZES[S.size]||SIZES.fb;return S.size==='custom'?{...z,w:+S.custW||60,h:+S.custH||90,sub:`${S.custW} × ${S.custH} cm`}:z}
const ratio=()=>{const z=sz();return z.h/z.w};
function pal(){const p={...(PALS[S.pal]||PALS.linen)};if(S.cbg)p.bg=S.cbg;if(S.ctext)p.text=S.ctext;if(S.caccent)p.accent=S.caccent;
  p.soft=mix(p.bg,p.text,.06);p.dark=lum(p.bg)<.4;return p}
function textsFor(cat,tpl){const f={...(TEXTS[cat]||TEXTS.daily),...((tpl&&tpl.t)||{}),...(S.texts[cat]||{})};
  if(!f.mono||!String(f.mono).trim()){const ini=s=>{const w=(s||'').trim().split(/\s+/);return(w[w.length-1]||'')[0]||''};f.mono=(ini(f.n1)+ini(f.n2)).toLocaleUpperCase('vi')}
  f.capList=String(f.caps||'').split(',').map(s=>s.trim()).filter(Boolean);return f}
function fam(k){const p=FP[S.fp]||FP.didone;switch(k){
  case'display':return[p.display,p.dw];case'serif':return[p.serif,400];case'script':return[p.script,p.script==='Dancing Script'?500:400];
  case'bold':return['Anton',400];case'hand':return['Patrick Hand',400];case'mono':return['Courier New',700];default:return['Montserrat',500]}}

/* ===== Ảnh mẫu (tạo bằng code, nạp theo từng dịp) ===== */
const NOISE=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),d=x.createImageData(128,128);
  for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=26}x.putImageData(d,0,0);return c})();
const DEMO_SETS={
  couple:[['#cdc6a6','#efe2bd','#3e4b2f','#fff4d6','#25311c'],['#e7ad86','#f7dcb6','#7d8b93','#fff1d4','#56636b'],['#ebe6dd','#f7f3ed','#ddd5c8','#ffffff','#cbbfae'],
    ['#e9d1ca','#f6e8e1','#bea197','#fff7f1','#a5847a'],['#4c1514','#8e2c23','#2a0c0a','#ffcf9a','#300e0c'],['#b8c5cd','#e3e9ea','#5f7174','#ffffff','#4a5b5e'],
    ['#a98d6c','#dcc6a3','#4b3b2b','#fff0d6','#3a2c20'],['#c3ccb6','#e8ecdf','#6c7e59','#fbfff2','#4f6040']],
  scene:[['#8fb3cf','#f3d8b4','#38506a','#fff3dc','#2b3d52'],['#f0b48a','#f9e3c4','#6f5a4c','#fff1d6','#4c3c33'],['#bcd3c4','#eef0e2','#4f6b55','#ffffff','#3b5242'],
    ['#2c3e66','#c86f6f','#1a2338','#ffd2a0','#141b2c'],['#d9c8b4','#f4ece1','#9c8670','#fffaf2','#7d6a56'],['#a7c7d9','#e9f1f4','#5d8197','#ffffff','#46667a'],
    ['#e3b6a4','#f6e2d6','#a3786a','#fff3ec','#7f5a4f'],['#9aa88a','#dfe3cf','#4e5c43','#fbfde9','#3a4632'],['#f2c46d','#fbe9bf','#9a6a33','#fff7df','#6b4824'],['#7e9aa6','#d5dfe0','#3e555e','#f6fbfc','#2e4048']],
  party:[['#2a1638','#6b2d5c','#140a1c','#ffb3d1','#ff6fa8'],['#1b2340','#3d4d8c','#0d1122','#ffe39a','#f6b73c'],['#3a1c14','#a8452e','#1f0e09','#ffd28a','#ff8a4c'],
    ['#172e2a','#2f6b5e','#0b1715','#c8ffe8','#5ce1b8'],['#2b1430','#7a3b8f','#160a19','#e7c6ff','#b66dff'],['#30230f','#8a6a2a','#18110a','#fff0b5','#ffd34d']],
};
const DEMO_CACHE={};
function demoSet(kind){if(DEMO_CACHE[kind])return DEMO_CACHE[kind];
  const r=rng(kind.length*977+13);DEMO_CACHE[kind]=DEMO_SETS[kind].map((c,k)=>makeDemo(kind,c,k,r));return DEMO_CACHE[kind]}
function makeDemo(kind,c,k,rnd){
  const land=k%3===1,w=land?880:660,h=land?640:880,cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const x=cv.getContext('2d');let gr;
  if(kind==='party'){
    gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,c[0]);gr.addColorStop(.6,c[1]);gr.addColorStop(1,c[2]);x.fillStyle=gr;x.fillRect(0,0,w,h);
    for(let i=0;i<60;i++){const bx=rnd()*w,by=rnd()*h*.85,br=6+rnd()*w*.07,col=[c[3],c[4],'#ffffff'][i%3];
      const g2=x.createRadialGradient(bx,by,0,bx,by,br);g2.addColorStop(0,rgba(col,.55*rnd()+.15));g2.addColorStop(.7,rgba(col,.18));g2.addColorStop(1,rgba(col,0));x.fillStyle=g2;x.fillRect(bx-br,by-br,br*2,br*2)}
    // dây đèn
    x.strokeStyle=rgba('#ffffff',.25);x.lineWidth=2;for(let l=0;l<2;l++){const y0=h*(.12+l*.16);x.beginPath();x.moveTo(0,y0);x.quadraticCurveTo(w/2,y0+h*.12,w,y0);x.stroke();
      for(let t=0;t<=1;t+=.08){const px=t*w,py=(1-t)*(1-t)*y0+2*(1-t)*t*(y0+h*.12)+t*t*y0;const g3=x.createRadialGradient(px,py+8,0,px,py+8,22);g3.addColorStop(0,rgba('#fff2c9',.95));g3.addColorStop(1,rgba('#ffd27a',0));x.fillStyle=g3;x.fillRect(px-22,py-14,44,44)}}
  }else{
    const studio=kind==='couple'&&(k===2||k===3),gy=h*(studio?.8:.70);
    gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,c[0]);gr.addColorStop(.62,c[1]);gr.addColorStop(1,c[2]);x.fillStyle=gr;x.fillRect(0,0,w,h);
    const sx=w*(.25+rnd()*.5),sy=h*(.22+rnd()*.2);
    gr=x.createRadialGradient(sx,sy,0,sx,sy,w*.75);gr.addColorStop(0,rgba(c[3],.95));gr.addColorStop(.35,rgba(c[3],.35));gr.addColorStop(1,rgba(c[3],0));x.fillStyle=gr;x.fillRect(0,0,w,h);
    if(!studio){for(let i=0;i<9;i++){const bx=rnd()*w,by=h*(.15+rnd()*.5),br=w*(.12+rnd()*.22),g2=x.createRadialGradient(bx,by,0,bx,by,br);g2.addColorStop(0,rgba(c[4],.5));g2.addColorStop(1,rgba(c[4],0));x.fillStyle=g2;x.fillRect(0,0,w,h)}}
    else{x.fillStyle=rgba(c[4],.18);x.fillRect(0,gy,w,h-gy)}
    if(kind==='scene'){ // dải đồi / mặt nước
      x.fillStyle=rgba(c[4],.55);x.beginPath();x.moveTo(0,gy);for(let i=0;i<=8;i++)x.lineTo(i*w/8,gy-h*(.04+rnd()*.09));x.lineTo(w,h);x.lineTo(0,h);x.closePath();x.fill();
      x.fillStyle=rgba(c[3],.18);for(let i=0;i<6;i++)x.fillRect(w*rnd(),gy+h*.03+i*h*.035,w*(.1+rnd()*.3),2);}
    for(let i=0;i<24;i++){x.fillStyle=rgba('#ffffff',.05+rnd()*.12);x.beginPath();x.arc(rnd()*w,rnd()*h*.7,4+rnd()*w*.03,0,7);x.fill()}
    gr=x.createLinearGradient(0,gy-h*.05,0,h);gr.addColorStop(0,rgba(c[2],0));gr.addColorStop(1,rgba(c[2],.9));x.fillStyle=gr;x.fillRect(0,gy-h*.05,w,h);
    if(kind==='couple')couple(x,w,h,gy,c,k,studio,rnd);
  }
  x.fillStyle=x.createPattern(NOISE,'repeat');x.fillRect(0,0,w,h);
  gr=x.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.22)');x.fillStyle=gr;x.fillRect(0,0,w,h);
  return cv;
}
function softLayer(w,h,fn){const sc=8,fc=document.createElement('canvas');fc.width=Math.ceil(w/sc);fc.height=Math.ceil(h/sc);const y=fc.getContext('2d');y.scale(1/sc,1/sc);fn(y);return fc}
function couple(x,w,h,gy,c,k,studio,rnd){
  const fc=softLayer(w,h,y=>{const cx=w*(.4+rnd()*.2),s=h*(studio?.6:.5),dark=k===4?'#24100c':'#23211f',dress=k===4?'#9e2a24':'#f7f2ea',G=gy+s*.02,gx=cx-s*.065;
    y.fillStyle=dark;y.beginPath();y.ellipse(gx,G-s*.92,s*.042,s*.052,0,0,7);y.fill();
    y.beginPath();y.moveTo(gx-s*.085,G-s*.80);y.quadraticCurveTo(gx-s*.06,G-s*.86,gx,G-s*.855);y.quadraticCurveTo(gx+s*.06,G-s*.86,gx+s*.085,G-s*.80);
    y.lineTo(gx+s*.07,G-s*.46);y.lineTo(gx+s*.05,G);y.lineTo(gx-s*.05,G);y.lineTo(gx-s*.07,G-s*.46);y.closePath();y.fill();
    const bx=cx+s*.055;y.fillStyle=k===4?'#1a0a08':'#3a2c22';y.beginPath();y.ellipse(bx,G-s*.845,s*.038,s*.048,0,0,7);y.fill();
    y.fillStyle=rgba('#ffffff',.35);y.beginPath();y.moveTo(bx+s*.01,G-s*.87);y.quadraticCurveTo(bx+s*.2,G-s*.5,bx+s*.26,G);y.lineTo(bx+s*.05,G);y.closePath();y.fill();
    y.fillStyle=dress;y.beginPath();y.moveTo(bx-s*.042,G-s*.79);y.quadraticCurveTo(bx,G-s*.81,bx+s*.042,G-s*.79);y.lineTo(bx+s*.03,G-s*.56);
    y.quadraticCurveTo(bx+s*.16,G-s*.12,bx+s*.21,G);y.lineTo(bx-s*.15,G);y.quadraticCurveTo(bx-s*.09,G-s*.2,bx-s*.03,G-s*.56);y.closePath();y.fill();
    y.fillStyle=k===4?'#f0d5b8':'#fbfbf6';for(let j=0;j<5;j++){y.beginPath();y.arc(bx-s*.075+Math.cos(j*1.3)*s*.028,G-s*.6+Math.sin(j*1.3)*s*.022,s*.026,0,7);y.fill()}});
  x.save();x.globalAlpha=.9;x.imageSmoothingQuality='high';x.drawImage(fc,0,0,w,h);x.restore();
}
function person(x,w,h,gy,c,k,rnd){
  const fc=softLayer(w,h,y=>{const cx=w*(.3+rnd()*.4),s=h*.36,G=gy+s*.04;y.fillStyle=rgba(c[4],.95);
    y.beginPath();y.ellipse(cx,G-s*.9,s*.06,s*.075,0,0,7);y.fill();
    y.beginPath();y.moveTo(cx-s*.11,G-s*.76);y.quadraticCurveTo(cx,G-s*.83,cx+s*.11,G-s*.76);y.lineTo(cx+s*.08,G-s*.35);y.lineTo(cx+s*.06,G);y.lineTo(cx-s*.06,G);y.lineTo(cx-s*.08,G-s*.35);y.closePath();y.fill()});
  x.save();x.globalAlpha=.85;x.drawImage(fc,0,0,w,h);x.restore();
}

/* ===== Bộ lọc ảnh ===== */
const FCACHE=new WeakMap();
function applyFilter(src,name){
  if(!name||name==='none')return src;
  let m=FCACHE.get(src);if(!m){m={};FCACHE.set(src,m)}if(m[name])return m[name];
  const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);
  const d=x.getImageData(0,0,c.width,c.height),a=d.data;
  for(let i=0;i<a.length;i+=4){let r=a[i],g=a[i+1],b=a[i+2];const l=.299*r+.587*g+.114*b;
    switch(name){
      case'bw':{let v=(l-128)*1.18+128;r=g=b=v;break}
      case'film':r=r*.92+l*.08+14;g=g*.92+l*.08+8;b=b*.86+l*.1+4;r=r*.9+18;g=g*.9+16;b=b*.9+20;break;
      case'warm':r=r*1.06+12;g=g*1.02+4;b=b*.88;break;
      case'cool':r=r*.9;g=g*.98+4;b=b*1.06+14;r=r*.92+16;g=g*.92+16;b=b*.92+18;break;
      case'vivid':r=l+(r-l)*1.35;g=l+(g-l)*1.35;b=l+(b-l)*1.35;r=(r-128)*1.08+128;g=(g-128)*1.08+128;b=(b-128)*1.08+128;break;
      case'fade':r=r*.82+38;g=g*.82+36;b=b*.82+40;r=l+(r-l)*.8;g=l+(g-l)*.8;b=l+(b-l)*.8;break;
      case'vintage':{const sr=l*1.07+28,sg=l*.95+14,sb=l*.78;r=r*.55+sr*.45;g=g*.55+sg*.45;b=b*.55+sb*.45;r=r*.88+20;g=g*.88+16;b=b*.88+14;break}
    }a[i]=r;a[i+1]=g;a[i+2]=b}
  x.putImageData(d,0,0);m[name]=c;return c;
}
const AVG=new WeakMap();
function avgColor(src){if(!src)return'#cccccc';if(AVG.has(src))return AVG.get(src);const c=document.createElement('canvas');c.width=c.height=6;const x=c.getContext('2d');x.drawImage(src,0,0,6,6);
  const d=x.getImageData(1,1,4,4).data;let r=0,g=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2]}const n=d.length/4;
  const h='#'+[r,g,b].map(v=>Math.round(v/n).toString(16).padStart(2,'0')).join('');AVG.set(src,h);return h}

/* ===== Nguồn ảnh cho từng khung ===== */
function demoFor(tpl){const k=tpl.demo||({wedding:'couple',birthday:'party',event:'party'}[tpl.cat])||'scene';return demoSet(k)}
function rawSrc(i,tpl){const st=slotState[i];
  if(st&&st.pid){const ph=photos.find(q=>q.id===st.pid);if(ph)return ph.src}
  if(photos.length)return photos[i%photos.length].src;
  if(S.demo){const d=demoFor(tpl);return d[i%d.length]}return null}
const resolveSrc=(i,tpl)=>{const s=rawSrc(i,tpl);return s?applyFilter(s,S.filter):null};

/* ===== Vẽ ===== */
function rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function scallop(ctx,x,y,w,h,n){const st=w/n,r=st*.28;ctx.moveTo(x,y);
  for(let i=0;i<n;i++){ctx.lineTo(x+i*st+st/2-r,y);ctx.arc(x+i*st+st/2,y,r,Math.PI,0,true)}ctx.lineTo(x+w,y);
  const m=Math.max(1,Math.round(h/st)),sv=h/m;for(let i=0;i<m;i++){ctx.lineTo(x+w,y+i*sv+sv/2-r);ctx.arc(x+w,y+i*sv+sv/2,r,-Math.PI/2,Math.PI/2,true)}ctx.lineTo(x+w,y+h);
  for(let i=n-1;i>=0;i--){ctx.lineTo(x+i*st+st/2+r,y+h);ctx.arc(x+i*st+st/2,y+h,r,0,Math.PI,true)}ctx.lineTo(x,y+h);
  for(let i=m-1;i>=0;i--){ctx.lineTo(x,y+i*sv+sv/2+r);ctx.arc(x,y+i*sv+sv/2,r,Math.PI/2,-Math.PI/2,true)}ctx.closePath()}
function shapePath(ctx,x,y,w,h,shape,r){ctx.beginPath();
  if(shape==='arch'){const a=w/2;ctx.moveTo(x,y+h);ctx.lineTo(x,y+a);ctx.arc(x+a,y+a,a,Math.PI,0);ctx.lineTo(x+w,y+h);ctx.closePath()}
  else if(shape==='circle'){ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2)}
  else if(shape==='heart'){const cx=x+w/2;ctx.moveTo(cx,y+h);ctx.bezierCurveTo(x-w*.1,y+h*.55,x,y-h*.05,cx,y+h*.25);ctx.bezierCurveTo(x+w,y-h*.05,x+w*1.1,y+h*.55,cx,y+h)}
  else if(r>0)rr(ctx,x,y,w,h,r);else ctx.rect(x,y,w,h)}
function coverGeom(e,src,st){const iw=src.width,ih=src.height,z=st.z||1,s=Math.max(e.w/iw,e.h/ih)*z,dw=iw*s,dh=ih*s,ex=dw-e.w,ey=dh-e.h;
  return{dw,dh,ex,ey,dx:-ex*(.5-(st.ox||0)/2),dy:-ey*(.5-(st.oy||0)/2)}}
let GRAIN=null;
function stampText(){const d=new Date();return`'${String(d.getFullYear()).slice(2)}  ${String(d.getMonth()+1).padStart(2,' ')}  ${String(d.getDate()).padStart(2,' ')}`}

function drawSlot(ctx,e,i,P,o,tpl){
  const st=slotState[i]||{},src=resolveSrc(i,tpl);
  ctx.save();ctx.translate(e.x+e.w/2,e.y+e.h/2);if(e.rot)ctx.rotate(e.rot);ctx.translate(-e.w/2,-e.h/2);
  if(e.frame){const pd=e.frame,fb=e.frameB??pd*4.2;ctx.save();ctx.shadowColor='rgba(30,20,10,.24)';ctx.shadowBlur=24;ctx.shadowOffsetY=9;ctx.fillStyle=e.frameColor||'#fffdf9';ctx.fillRect(-pd,-pd,e.w+2*pd,e.h+pd+fb);ctx.restore();
    if(e.cap){drawText(ctx,{t:'text',text:e.cap,x:e.w/2,y:e.h+fb*.5,font:'hand',size:e.capSize||30,color:'#2b2622',fit:e.w},P,e._u)}}
  if(e.stampBg){const pd=e.stampBg;ctx.save();ctx.shadowColor='rgba(30,20,10,.2)';ctx.shadowBlur=14;ctx.shadowOffsetY=5;ctx.fillStyle='#fffdf8';ctx.beginPath();scallop(ctx,-pd,-pd,e.w+2*pd,e.h+pd*3.4,Math.max(6,Math.round((e.w+2*pd)/24)));ctx.fill();ctx.restore();
    if(e.cap)drawText(ctx,{t:'text',text:e.cap,x:e.w/2,y:e.h+pd*1.75,font:'serif',italic:1,size:e.capSize||22,color:'#3a2a1c',fit:e.w},P,e._u)}
  if(e.drop){ctx.save();shapePath(ctx,0,0,e.w,e.h,e.shape,e.r||0);ctx.fillStyle='#ffffff';ctx.shadowColor='rgba(30,20,10,.28)';ctx.shadowBlur=26;ctx.shadowOffsetY=10;ctx.fill();ctx.restore()}
  if(e.ring){ctx.save();ctx.beginPath();shapePath(ctx,-e.ring,-e.ring,e.w+2*e.ring,e.h+2*e.ring,e.shape,0);ctx.fillStyle=e.ringColor==='accent'?P.accent:'#ffffff';ctx.shadowColor='rgba(0,0,0,.18)';ctx.shadowBlur=18;ctx.fill();ctx.restore()}
  const r=e.bleed||['arch','circle','heart'].includes(e.shape)?0:(e.r??S.radius);
  if(e.mask&&src){ // chữ đục lỗ lấy ảnh
    const sc=ctx.getTransform().a,ow=Math.max(2,Math.round(e.w*sc)),oh=Math.max(2,Math.round(e.h*sc)),oc=document.createElement('canvas');oc.width=ow;oc.height=oh;const ox=oc.getContext('2d');ox.scale(ow/e.w,oh/e.h);
    const m=e.mask,[fa,fw]=fam(m.font||'bold');let size=m.size;ox.font=`${fw} ${size}px "${fa}"`;let tw=ox.measureText(m.text).width;if(tw>e.w*.98){size*=e.w*.98/tw}ox.font=`${fw} ${size}px "${fa}"`;
    ox.textAlign='center';ox.textBaseline='middle';ox.fillText(m.text,e.w/2,e.h/2+size*.04);ox.globalCompositeOperation='source-in';
    const G=coverGeom(e,src,st);ox.drawImage(src,G.dx,G.dy,G.dw,G.dh);
    if(m.outline){ctx.save();ctx.font=`${fw} ${size}px "${fa}"`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.strokeStyle=m.outline;ctx.lineWidth=size*.07;ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=size*.12;ctx.strokeText(m.text,e.w/2,e.h/2+size*.04);ctx.restore()}
    ctx.drawImage(oc,0,0,e.w,e.h);
  }else{
    shapePath(ctx,0,0,e.w,e.h,e.shape,r);ctx.save();ctx.clip();
    if(src){const G=coverGeom(e,src,st);ctx.drawImage(src,G.dx,G.dy,G.dw,G.dh);
      if(S.grain){if(!GRAIN)GRAIN=ctx.createPattern(NOISE,'repeat');try{GRAIN.setTransform(new DOMMatrix().scale(1.4))}catch(_){}ctx.globalCompositeOperation='overlay';ctx.fillStyle=GRAIN;ctx.globalAlpha=.9;ctx.fillRect(0,0,e.w,e.h);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
      if(S.stamp&&!e.noStamp){const s=Math.min(e.w,e.h)*.075;ctx.font=`700 ${s}px "Courier New",monospace`;ctx.textAlign='right';ctx.textBaseline='alphabetic';ctx.fillStyle='#ff9b3d';ctx.shadowColor='rgba(255,120,30,.85)';ctx.shadowBlur=s*.5;ctx.fillText(stampText(),e.w-s*.8,e.h-s*.75);ctx.shadowBlur=0}
    }else{ctx.fillStyle=P.soft;ctx.fillRect(0,0,e.w,e.h);
      if(o.preview){const s=Math.min(e.w,e.h)*.14,cx=e.w/2,cy=e.h/2-s*.3;ctx.strokeStyle=rgba(P.text,.35);ctx.lineWidth=s*.08;ctx.beginPath();ctx.moveTo(cx-s/2,cy);ctx.lineTo(cx+s/2,cy);ctx.moveTo(cx,cy-s/2);ctx.lineTo(cx,cy+s/2);ctx.stroke();
        ctx.fillStyle=rgba(P.text,.4);ctx.font=`500 ${Math.max(9,s*.3)}px "Be Vietnam Pro"`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Chạm để thêm ảnh',cx,cy+s*.95)}}
    ctx.restore();
    if(e.border){shapePath(ctx,0,0,e.w,e.h,e.shape,r);ctx.lineWidth=e.border;ctx.strokeStyle=e.borderColor==='accent'?P.accent:e.borderColor||'#fff';ctx.stroke()}
  }
  if(o.preview&&o.sel===i){shapePath(ctx,0,0,e.w,e.h,e.shape,r);ctx.lineWidth=3/o.sc;ctx.strokeStyle='#d9bf8c';ctx.setLineDash([10/o.sc,6/o.sc]);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(217,191,140,.14)';ctx.fill()}
  ctx.restore();
}

function wrap(s,maxW,meas){const out=[];s.split('\n').forEach(par=>{const ws=par.split(/\s+/);let cur='';
  ws.forEach(w=>{const t=cur?cur+' '+w:w;if(meas(t)>maxW&&cur){out.push(cur);cur=w}else cur=t});out.push(cur)});return out}
function colorOf(c,P){return c==='accent'?P.accent:c==='bg'?P.bg:c==='soft'?P.soft:c&&c[0]==='#'?c:P.text}
function drawText(ctx,e,P,u){
  let s=e.text;if(s==null||s==='')return;s=String(s).normalize('NFC');if(e.upper)s=s.toLocaleUpperCase('vi');
  const[family,w0]=fam(e.font);let size=e.size*(u||1)*(e.noScale?1:S.tscale);
  const setF=()=>ctx.font=`${e.italic?'italic ':''}${e.weight||w0} ${size}px "${family}"`;setF();
  const meas=t=>ctx.measureText(t).width+(e.ls||0)*size*Math.max(0,[...t].length-1);
  let lines=e.maxW?wrap(s,e.maxW,meas):s.split('\n');
  if(e.fit){const mw=Math.max(...lines.map(meas));if(mw>e.fit){size*=e.fit/mw;setF();if(e.maxW)lines=wrap(s,e.maxW,meas)}}
  if(e.maxLines&&lines.length>e.maxLines){lines=lines.slice(0,e.maxLines);lines[lines.length-1]=lines[lines.length-1].replace(/[\s,.;—-]*$/,'')+'…'}
  const ls=(e.ls||0)*size,lh=size*(e.lh||1.2),tot=lines.length*lh;
  ctx.save();ctx.translate(e.x,e.y);if(e.rot)ctx.rotate(e.rot);
  ctx.globalAlpha=e.alpha??1;ctx.textBaseline='middle';ctx.textAlign='left';
  const y0=e.valign==='top'?lh/2:e.valign==='bottom'?-tot+lh/2:-tot/2+lh/2;
  if(e.pill){const mw=Math.max(...lines.map(meas)),px=size*.7,py=size*.38,bx=e.align==='center'?-mw/2:e.align==='right'?-mw:0;
    ctx.fillStyle=colorOf(e.pill,P);ctx.beginPath();rr(ctx,bx-px,y0-lh/2-py+lh*.08,mw+2*px,tot+2*py-lh*.16,(tot+2*py)/2);ctx.fill()}
  if(e.shadow){ctx.shadowColor=e.shadow===true?'rgba(0,0,0,.4)':e.shadow;ctx.shadowBlur=size*.22}
  ctx.fillStyle=colorOf(e.color,P);
  lines.forEach((ln,i)=>{const w=meas(ln);let x=e.align==='center'?-w/2:e.align==='right'?-w:0;const y=y0+i*lh;
    const draw=(t,xx)=>{if(e.stroke){ctx.lineWidth=e.stroke*size;ctx.strokeStyle=colorOf(e.strokeColor||e.color,P);ctx.lineJoin='round';ctx.strokeText(t,xx,y);if(e.fillNone)return}ctx.fillText(t,xx,y)};
    if(!ls)draw(ln,x);else for(const ch of ln){draw(ch,x);x+=ctx.measureText(ch).width+ls}});
  ctx.restore();
}

function drawDecor(ctx,e,P,W,H){
  ctx.save();
  switch(e.t){
    case'line':ctx.strokeStyle=colorOf(e.color,P);ctx.globalAlpha=e.alpha??1;ctx.lineWidth=e.lw||1.5;if(e.dash)ctx.setLineDash(e.dash);ctx.beginPath();ctx.moveTo(e.x1,e.y1);ctx.lineTo(e.x2,e.y2);ctx.stroke();break;
    case'path':ctx.strokeStyle=colorOf(e.color,P);ctx.lineWidth=e.lw||3;ctx.lineCap='round';if(e.dash)ctx.setLineDash(e.dash);ctx.beginPath();e.pts.forEach((p,i)=>{if(!i)ctx.moveTo(p[0],p[1]);else{const q=e.pts[i-1],my=(q[1]+p[1])/2;ctx.bezierCurveTo(q[0],my,p[0],my,p[0],p[1])}});ctx.stroke();break;
    case'fade':{const gr=ctx.createLinearGradient(0,e.y,0,e.y+e.h),c=colorOf(e.color||'bg',P),a=rgba(c,0),b=rgba(c,e.alpha??1);
      if(e.dir==='down'){gr.addColorStop(0,a);gr.addColorStop(.85,b);gr.addColorStop(1,b)}else{gr.addColorStop(0,b);gr.addColorStop(.15,b);gr.addColorStop(1,a)}ctx.fillStyle=gr;ctx.fillRect(e.x,e.y,e.w,e.h);break}
    case'band':{const gr=ctx.createLinearGradient(0,e.y,0,e.y+e.h);gr.addColorStop(0,rgba(P.bg,0));gr.addColorStop(.3,rgba(P.bg,.93));gr.addColorStop(.72,rgba(P.bg,.93));gr.addColorStop(1,rgba(P.bg,0));ctx.fillStyle=gr;ctx.fillRect(e.x,e.y,e.w,e.h);break}
    case'card':case'rect':{if(e.rot){ctx.translate(e.x+e.w/2,e.y+e.h/2);ctx.rotate(e.rot);e={...e,x:-e.w/2,y:-e.h/2}}ctx.globalAlpha=e.alpha??1;ctx.fillStyle=colorOf(e.fill||'soft',P);if(e.shadow){ctx.shadowColor='rgba(20,15,10,.22)';ctx.shadowBlur=30;ctx.shadowOffsetY=12}
      ctx.beginPath();const r=e.r??(e.t==='card'?S.radius:0);if(r)rr(ctx,e.x,e.y,e.w,e.h,r);else ctx.rect(e.x,e.y,e.w,e.h);
      if(e.notch){const ny=e.notch,nr=e.notchR||22;ctx.moveTo(e.x+nr,ny);ctx.arc(e.x,ny,nr,0,Math.PI*2);ctx.moveTo(e.x+e.w+nr,ny);ctx.arc(e.x+e.w,ny,nr,0,Math.PI*2);ctx.fill('evenodd')}else ctx.fill();
      if(e.stroke){ctx.shadowColor='transparent';ctx.lineWidth=e.stroke;ctx.strokeStyle=colorOf(e.strokeColor||'accent',P);ctx.stroke()}break}
    case'tape':{ctx.translate(e.x,e.y);ctx.rotate(e.rot||0);ctx.fillStyle=e.color||rgba('#f3e3b5',.78);ctx.shadowColor='rgba(0,0,0,.08)';ctx.shadowBlur=4;
      const w=e.w,h=e.h,z=h/6;ctx.beginPath();ctx.moveTo(-w/2,-h/2);for(let i=0;i<=6;i++)ctx.lineTo(-w/2+(i%2?z*.6:0),-h/2+i*z);ctx.lineTo(w/2,h/2);for(let i=6;i>=0;i--)ctx.lineTo(w/2-(i%2?z*.6:0),-h/2+i*z);ctx.closePath();ctx.fill();break}
    case'confetti':{const r=rng(e.seed||5),cols=e.colors||[P.accent,mix(P.accent,'#ffffff',.4),'#f6c344','#7cc6c0','#e98aa4'];
      for(let i=0;i<e.n;i++){const x=e.x+r()*e.w,y=e.y+r()*e.h,s=(e.s||12)*(.5+r()*.9);ctx.fillStyle=cols[i%cols.length];ctx.globalAlpha=.85;
        ctx.save();ctx.translate(x,y);ctx.rotate(r()*6);if(i%3===0){ctx.beginPath();ctx.arc(0,0,s*.45,0,7);ctx.fill()}else ctx.fillRect(-s/2,-s*.2,s,s*.4);ctx.restore()}break}
    case'balloon':{const{x,y,r}=e,col=colorOf(e.color||'accent',P);ctx.strokeStyle=rgba(P.text,.35);ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y+r*1.15);ctx.bezierCurveTo(x-r*.3,y+r*1.8,x+r*.3,y+r*2.3,x-r*.1,y+r*(e.tail||3.2));ctx.stroke();
      const gr=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r*1.15);gr.addColorStop(0,mix(col,'#ffffff',.55));gr.addColorStop(.5,col);gr.addColorStop(1,mix(col,'#000000',.25));
      ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(x,y,r*.9,r*1.08,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(x-r*.12,y+r*1.18);ctx.lineTo(x+r*.12,y+r*1.18);ctx.lineTo(x,y+r*1.04);ctx.fill();break}
    case'sprockets':{ctx.fillStyle=colorOf(e.color||'#f4efe6',P);ctx.globalAlpha=.92;const n=e.n,sp=(e.vertical?e.h:e.w)/n;
      for(let i=0;i<n;i++){ctx.beginPath();if(e.vertical)rr(ctx,e.x,e.y+i*sp+sp*.25,e.w,sp*.5,e.w*.2);else rr(ctx,e.x+i*sp+sp*.25,e.y,sp*.5,e.h,e.h*.2);ctx.fill()}break}
    case'torn':{const r=rng(e.seed||3);ctx.fillStyle=colorOf(e.fill||'bg',P);ctx.shadowColor='rgba(0,0,0,.18)';ctx.shadowBlur=14;ctx.shadowOffsetY=4;ctx.beginPath();
      const st=W/40;ctx.moveTo(-10,e.y+r()*e.j);for(let x=0;x<=W+st;x+=st)ctx.lineTo(x,e.y+r()*e.j);for(let x=W+st;x>=-st;x-=st)ctx.lineTo(x,e.y+e.h-r()*e.j);ctx.closePath();ctx.fill();break}
    case'barcode':{ctx.fillStyle=colorOf(e.color,P);const r=rng(9);let x=e.x;while(x<e.x+e.w){const bw=(r()>.6?3:1.4)*(e.k||1);ctx.fillRect(x,e.y,bw,e.h);x+=bw+(1.2+r()*2.2)*(e.k||1)}break}
    case'doodle':{ctx.strokeStyle=colorOf(e.color||'accent',P);ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=e.lw||3;ctx.lineCap=ctx.lineJoin='round';ctx.translate(e.x,e.y);ctx.rotate(e.rot||0);const s=e.s;ctx.beginPath();
      if(e.kind==='star'){for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr2=i%2?s*.42:s;ctx.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}ctx.closePath();e.fill?ctx.fill():ctx.stroke()}
      else if(e.kind==='heart'){ctx.moveTo(0,s*.9);ctx.bezierCurveTo(-s*1.3,0,-s*.6,-s*1.1,0,-s*.35);ctx.bezierCurveTo(s*.6,-s*1.1,s*1.3,0,0,s*.9);e.fill?ctx.fill():ctx.stroke()}
      else if(e.kind==='spark'){for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.moveTo(Math.cos(a)*s*.25,Math.sin(a)*s*.25);ctx.lineTo(Math.cos(a)*s,Math.sin(a)*s)}ctx.stroke()}
      else if(e.kind==='arrow'){ctx.moveTo(-s,0);ctx.quadraticCurveTo(0,-s*.6,s,0);ctx.moveTo(s*.6,-s*.3);ctx.lineTo(s,0);ctx.lineTo(s*.55,s*.25);ctx.stroke()}
      else if(e.kind==='plane'){ctx.beginPath();ctx.moveTo(-s,s*.1);ctx.lineTo(s*.9,-s*.05);ctx.quadraticCurveTo(s*1.15,0,s*.9,s*.05);ctx.lineTo(-s,s*.1);ctx.moveTo(s*.1,0);ctx.lineTo(-s*.35,-s*.7);ctx.lineTo(-s*.15,-s*.7);ctx.lineTo(s*.45,0);ctx.moveTo(s*.1,s*.06);ctx.lineTo(-s*.35,s*.75);ctx.lineTo(-s*.15,s*.75);ctx.lineTo(s*.45,s*.06);ctx.moveTo(-s*.75,s*.08);ctx.lineTo(-s*.95,-s*.35);ctx.lineTo(-s*.8,-s*.35);ctx.lineTo(-s*.55,s*.08);ctx.fill()}
      else if(e.kind==='laurel'){for(let side=-1;side<=1;side+=2)for(let i=0;i<6;i++){const a=Math.PI/2+side*(.35+i*.32),px=Math.cos(a)*s,py=Math.sin(a)*s;ctx.save();ctx.translate(px,py);ctx.rotate(a+side*1.2);ctx.beginPath();ctx.ellipse(0,0,s*.16,s*.06,0,0,7);ctx.fill();ctx.restore()}}
      break}
    case'swatch':{const c=e.color;ctx.fillStyle=c;ctx.shadowColor='rgba(0,0,0,.15)';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,7);ctx.fill();ctx.shadowBlur=0;
      drawText(ctx,{t:'text',text:c.toUpperCase(),x:e.x,y:e.y+e.r+e.r*.55,font:'sans',size:e.r*.38,ls:.08,noScale:1},P,1);break}
    case'postmark':{ctx.strokeStyle=colorOf(e.color||'accent',P);ctx.globalAlpha=.75;ctx.lineWidth=2.4;ctx.translate(e.x,e.y);ctx.rotate(e.rot||-.2);ctx.beginPath();ctx.arc(0,0,e.r,0,7);ctx.stroke();ctx.beginPath();ctx.arc(0,0,e.r*.78,0,7);ctx.stroke();
      for(let i=0;i<4;i++){ctx.beginPath();const y=-e.r*.45+i*e.r*.3;ctx.moveTo(e.r*1.15,y);for(let x=e.r*1.15;x<e.r*3.2;x+=e.r*.3)ctx.quadraticCurveTo(x+e.r*.075,y-e.r*.12,x+e.r*.15,y),ctx.quadraticCurveTo(x+e.r*.225,y+e.r*.12,x+e.r*.3,y);ctx.stroke()}
      ctx.globalAlpha=.85;drawText(ctx,{t:'text',text:e.text,x:0,y:0,font:'sans',size:e.r*.22,ls:.12,upper:1,color:e.color||'accent',maxW:e.r*1.4,lh:1.25,noScale:1},P,1);break}
    case'shade':{const gr=ctx.createLinearGradient(0,e.y,0,e.y+e.h);const a=e.alpha??.55;if(e.dir==='down'){gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)')}else{gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,`rgba(0,0,0,${a})`)}ctx.fillStyle=gr;ctx.fillRect(e.x,e.y,e.w,e.h);break}
    case'curve':{ctx.strokeStyle=colorOf(e.color,P);ctx.globalAlpha=e.alpha??.55;ctx.lineWidth=e.lw||2;ctx.beginPath();ctx.moveTo(e.x1,e.y1);ctx.quadraticCurveTo((e.x1+e.x2)/2,(e.y1+e.y2)/2+2*e.sag,e.x2,e.y2);ctx.stroke();break}
    case'bunting':{const cols=e.colors||[P.accent,'#f6c344','#7cc6c0','#e98aa4',mix(P.accent,'#ffffff',.45)],q=t=>[e.x1+(e.x2-e.x1)*t,e.y1+(e.y2-e.y1)*t+4*e.sag*t*(1-t)];
      ctx.strokeStyle=rgba(P.text,.4);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x1,e.y1);ctx.quadraticCurveTo((e.x1+e.x2)/2,(e.y1+e.y2)/2+2*e.sag,e.x2,e.y2);ctx.stroke();
      for(let i=0;i<e.n;i++){const a=q((i+.15)/e.n),b=q((i+.85)/e.n),mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,len=Math.hypot(b[0]-a[0],b[1]-a[1]);
        ctx.fillStyle=cols[i%cols.length];ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(mx,my+len*1.1);ctx.closePath();ctx.fill()}break}
    case'dots':{ctx.fillStyle=rgba(P.text,e.alpha||.12);for(let y=e.y;y<e.y+e.h;y+=e.s)for(let x=e.x;x<e.x+e.w;x+=e.s){ctx.beginPath();ctx.arc(x,y,e.r||1.6,0,7);ctx.fill()}break}
  }
  ctx.restore();
}

/* ===== Bố cục tự động (justified mosaic) ===== */
function mosaic(x,y,w,h,n,g,asp){
  if(n<=0)return[];let best=null;
  for(let rows=1;rows<=n;rows++){const per=[];let k=0;for(let r=0;r<rows;r++){const c=Math.round((n-k)/(rows-r));per.push(c);k+=c}
    let idx=0,tot=0;const rs=per.map(c=>{const a=[];for(let j=0;j<c;j++)a.push(asp(idx++));const s=a.reduce((p,q)=>p+q,0);const rh=(w-(c-1)*g)/s;tot+=rh;return{a,rh}});
    tot+=(rows-1)*g;const err=Math.abs(Math.log(tot/h));if(!best||err<best.err)best={err,rs,tot}}
  const k=(h-(best.rs.length-1)*g)/(best.tot-(best.rs.length-1)*g),out=[];let cy=y;
  best.rs.forEach(r=>{const rh=r.rh*k,s=r.a.reduce((p,q)=>p+q,0);let cx=x;r.a.forEach(a=>{const cw=(w-(r.a.length-1)*g)*a/s;out.push([cx,cy,cw,rh]);cx+=cw+g});cy+=rh+g});
  return out}

/* ===== Dựng & render ===== */
const tplById=id=>TPL.find(t=>t.id===id)||TPL[0];
function layout(W,H,tpl,fieldsHook){
  const u=Math.min(1,Math.max(Math.min(H,W*1.6)/1600,W>H?.5:0)),p=v=>v*u,m=S.margin*Math.max(.72,u),g=S.gap;
  const f=fieldsHook||textsFor(tpl.cat,tpl);
  const nP=photos.length||(tpl.demoN||7);
  const asp=i=>{const s=rawSrc(i,tpl);return s?s.width/s.height:1};
  return tpl.b({W,H,m,g,u,p,f,P:pal(),nP,asp,land:W>H*1.05}).map(e=>({...e,_u:u}));
}
function render(ctx,pxW,pxH,o={}){
  const tpl=o.tpl?tplById(o.tpl):tplById(S.tpl),W=1000,H=1000*pxH/pxW,sc=pxW/W*(o.dpr||1),P=pal();
  ctx.setTransform(sc,0,0,sc,0,0);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);
  const els=layout(W,H,tpl);let si=0;const slots=[];
  for(const e of els){
    if(e.t==='img'){const idx=e.same!=null?e.same:si;drawSlot(ctx,e,idx,P,{...o,sc},tpl);slots.push({...e,_i:idx});if(e.same==null)si++}
    else if(e.t==='text')drawText(ctx,e,P,e._u);
    else if(e.t==='swatchRow'){for(let k=0;k<e.n;k++){const s=resolveSrc(k,tpl);drawDecor(ctx,{t:'swatch',x:e.x+k*e.step,y:e.y,r:e.r,color:avgColor(s)},P,W,H)}}
    else drawDecor(ctx,e,P,W,H);
  }
  return slots;
}
function usedFields(tpl){const keys=new Set(),base=textsFor(tpl.cat,tpl);
  const f=new Proxy(base,{get(t,k){if(typeof k==='string'){keys.add(k==='capList'?'caps':k);if(k==='mono'){keys.add('n1');keys.add('n2')}}return t[k]}});
  try{layout(1000,1600,tpl,f)}catch(e){}return[...keys].filter(k=>k in LABELS._)}
