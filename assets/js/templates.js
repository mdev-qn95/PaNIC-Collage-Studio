'use strict';
/* ===== Thư viện mẫu ghép =====
   Mỗi mẫu trả về danh sách phần tử (ảnh, chữ, trang trí) trên khung rộng 1000 đơn vị. */
const I=(x,y,w,h,o={})=>({t:'img',x,y,w,h,...o});
const T=(text,x,y,o={})=>({t:'text',text,x,y,align:'center',...o});
const Ln=(x1,y1,x2,y2,o={})=>({t:'line',x1,y1,x2,y2,...o});
const Fd=(x,y,w,h,dir)=>({t:'fade',x,y,w,h,dir});
const Cd=(x,y,w,h)=>({t:'card',x,y,w,h});
const R90=Math.PI/2,DEG=Math.PI/180;

const TPL=[
/* ---------- HẰNG NGÀY ---------- */
{id:'dump',cat:'daily',n:'Photo dump',best:'Mọi size',land:1,demoN:9,b({W,H,m,g,p,f,land}){
  const e=[],pad=m*.6,capH=p(120),gg=Math.max(4,g*.45),cols=land?4:3,aw=W-2*pad,ah=H-pad-capH;
  const cw=(aw-(cols-1)*gg)/cols,rows=clamp(Math.round((ah+gg)/(cw*1.22+gg)),1,7),ch=(ah-(rows-1)*gg)/rows;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)e.push(I(pad+c*(cw+gg),pad+r*(ch+gg),cw,ch));
  const cy=H-capH/2;
  e.push(T(f.head,pad,cy,{font:'serif',italic:1,size:46,align:'left',fit:aw*.58}));
  e.push(T(f.date,W-pad,cy,{font:'sans',size:20,ls:.18,align:'right',fit:aw*.38}));
  return e}},
{id:'fourcut',cat:'daily',n:'4-cut photobooth',best:'Hot trend',land:1,demoN:4,b({W,H,p,f,land,g}){
  const e=[{t:'rect',x:0,y:0,w:W,h:H,fill:'text'}];
  if(land){const pad=W*.03,aw=W*.68,gap=pad*.5,cw=(aw-gap)/2,ch=(H-2*pad-gap)/2;
    for(let k=0;k<4;k++)e.push(I(pad+(k%2)*(cw+gap),pad+Math.floor(k/2)*(ch+gap),cw,ch,{bleed:1}));
    const tx=pad+aw+(W-pad-aw)/2;
    e.push(T(f.head,tx,H*.42,{font:'hand',size:110,color:'bg',fit:W-aw-pad*3,noScale:1}));
    e.push(T(f.date,tx,H*.56,{font:'sans',size:30,ls:.25,color:'bg',fit:W-aw-pad*3,noScale:1}));
    e.push({t:'doodle',kind:'heart',x:tx,y:H*.72,s:22,color:'accent',fill:1});return e}
  const strips=clamp(Math.round(W/H*2.6),1,2),pad=W*.045/strips+8,sw=(W-pad*(strips+1))/strips,fh=Math.max(p(170),H*.1),tp=pad*1.2,gap=Math.max(6,pad*.45);
  const ch=(H-tp-fh-3*gap)/4;
  for(let s=0;s<strips;s++){const x0=pad+s*(sw+pad);
    for(let k=0;k<4;k++)e.push(I(x0,tp+k*(ch+gap),sw,ch,s?{same:k,bleed:1}:{bleed:1}));
    e.push(T(f.head,x0+sw/2,H-fh*.56,{font:'hand',size:54,color:'bg',fit:sw*.9}));
    e.push(T(f.date,x0+sw/2,H-fh*.22,{font:'sans',size:17,ls:.22,color:'bg',fit:sw*.9}))}
  return e}},
{id:'film',cat:'daily',n:'Cuộn film 35mm',best:'Mọi size',land:1,demoN:5,b({W,H,m,p,f,land}){
  const e=[],FILM='#16130f',HOLE='#f1ebe0',ORG='#e98a3a';
  if(!land){const capH=p(200),fx=m*.55,fw=W-2*fx,fy=m*.55,fh=H-fy-capH,sw=fw*.085;
    e.push({t:'rect',x:fx,y:fy,w:fw,h:fh,fill:FILM,r:6});
    const nH=Math.round(fh/(sw*1.05));
    e.push({t:'sprockets',x:fx+sw*.3,y:fy,w:sw*.4,h:fh,n:nH,vertical:1,color:HOLE});
    e.push({t:'sprockets',x:fx+fw-sw*.7,y:fy,w:sw*.4,h:fh,n:nH,vertical:1,color:HOLE});
    const iw=fw-2*sw,n=clamp(Math.round(fh/(iw*.72)),2,8),gap=sw*.42,ih=(fh-gap*(n+1))/n;
    for(let k=0;k<n;k++){const y=fy+gap+k*(ih+gap);e.push(I(fx+sw,y,iw,ih,{bleed:1}));
      e.push(T(`${k+1}A   ▸   PaNIC 400`,fx+sw+4,y+ih+gap/2,{font:'mono',size:sw*.22,align:'left',color:ORG,noScale:1}))}
    e.push(T(f.script,W/2,H-capH*.58,{font:'script',size:80,color:'accent',fit:W-2*m}));
    e.push(T(f.date,W/2,H-capH*.2,{font:'sans',size:20,ls:.3}));return e}
  const capW=W*.24,fy=H*.08,fh=H-2*fy,fx=0,fw=W-capW,sh=fh*.11;
  e.push({t:'rect',x:fx,y:fy,w:fw,h:fh,fill:FILM});
  const nW=Math.round(fw/(sh*1.05));
  e.push({t:'sprockets',x:fx,y:fy+sh*.3,w:fw,h:sh*.4,n:nW,color:HOLE});e.push({t:'sprockets',x:fx,y:fy+fh-sh*.7,w:fw,h:sh*.4,n:nW,color:HOLE});
  const ih=fh-2*sh,n=clamp(Math.round(fw/(ih*1.45)),2,8),gap=sh*.45,iw=(fw-gap*(n+1))/n;
  for(let k=0;k<n;k++)e.push(I(fx+gap+k*(iw+gap),fy+sh,iw,ih,{bleed:1}));
  e.push(T(f.script,fw+capW/2,H*.44,{font:'script',size:90,color:'accent',fit:capW*.9,noScale:1}));
  e.push(T(f.date,fw+capW/2,H*.58,{font:'sans',size:22,ls:.25,fit:capW*.85,noScale:1}));return e}},
{id:'scrap',cat:'daily',n:'Scrapbook',best:'Story · 4:5',pal:'kraft',demoN:5,b({W,H,m,p,f}){
  const e=[{t:'dots',x:12,y:12,w:W,h:H,s:30,r:1.8,alpha:.13}];
  e.push(T(f.head,m,m+p(70),{font:'hand',size:100,align:'left',fit:W*.6,rot:-.04}));
  e.push(T(f.date,m+p(10),m+p(150),{font:'hand',size:34,align:'left',color:'accent'}));
  e.push({t:'doodle',kind:'star',x:W-m-p(70),y:m+p(70),s:p(34),color:'accent',lw:3});
  e.push({t:'doodle',kind:'spark',x:W-m-p(150),y:m+p(130),s:p(18),color:'accent',lw:3});
  const top=m+p(210),av=H-top-m-p(20),n=clamp(Math.round(av/(W*.36)),2,7),rowH=av/n,pw=W*.56,iw=pw*.86,fr=pw*.035,tapes=[];
  for(let i=0;i<n;i++){const L=i%2,cx=(L?W*.635:W*.365)+(i%3-1)*W*.02,cy=top+i*rowH+rowH*.44,ih=Math.min(iw*.82,rowH*.98-fr*4.4),rot=(L?1:-1)*(2+(i*7)%4)*DEG;
    e.push(I(cx-iw/2,cy-ih/2,iw,ih,{rot,frame:fr,frameB:fr*3.6,cap:f.capList[i]||'',capSize:34,bleed:1}));
    tapes.push({t:'tape',x:cx+(L?-1:1)*iw*.28,y:cy-ih/2-fr*.6,w:pw*.3,h:pw*.075,rot:(L?.5:-.45),color:L?'rgba(243,227,181,.82)':'rgba(206,229,222,.82)'});
    if(i===1)e.push(T(f.quote,L?W*.17:W*.83,cy+rowH*.18,{font:'hand',size:30,maxW:W*.26,lh:1.15,rot:(L?-4:4)*DEG,maxLines:5,color:'accent'}));
    if(i===2)e.push({t:'doodle',kind:'heart',x:L?W*.13:W*.87,y:cy-rowH*.2,s:p(22),color:'accent',fill:1})}
  return e.concat(tapes)}},
{id:'torn',cat:'daily',n:'Giấy xé',best:'Story',demoN:3,b({W,H,p,f}){
  const e=[I(0,0,W,H*.47,{bleed:1}),I(0,H*.47,W,H*.33,{bleed:1}),I(0,H*.78,W,H*.22,{bleed:1})];
  e.push({t:'torn',y:H*.405,h:H*.115,j:16,seed:3});e.push({t:'torn',y:H*.762,h:H*.055,j:12,seed:8});
  e.push(T(f.head,W/2,H*.458,{font:'bold',size:128,upper:1,fit:W*.84}));
  e.push(T(f.script,W*.66,H*.497,{font:'script',size:64,color:'accent',rot:-.06,fit:W*.5}));
  e.push(T(`${f.place}   ·   ${f.date}`,W/2,H*.789,{font:'hand',size:38,fit:W*.8}));
  return e}},
{id:'mood',cat:'daily',n:'Mood board màu',best:'4:5 · Story',demoN:5,b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[];
  e.push(T(f.script,m,m+p(70),{font:'script',size:86,align:'left',color:'accent',fit:cw*.7}));
  e.push(T(f.head,m+p(4),m+p(152),{font:'sans',size:19,upper:1,ls:.3,align:'left',fit:cw*.6}));
  e.push(T(f.date,W-m,m+p(152),{font:'sans',size:19,ls:.15,align:'right'}));
  const y1=m+p(200),sw=p(175),av=H-m-y1-sw-g,a=av*.62,bw=cw*.6;
  e.push(I(m,y1,bw,a));const rw=cw-bw-g,rh=(a-g)/2;e.push(I(m+bw+g,y1,rw,rh));e.push(I(m+bw+g,y1+rh+g,rw,rh));
  const y2=y1+a+g,h2=av-a-g;e.push(I(m,y2,cw*.38,h2));e.push(I(m+cw*.38+g,y2,cw*.62-g,h2));
  const r=Math.min(sw*.27,cw/14);e.push({t:'swatchRow',n:5,x:m+r,step:(cw-2*r)/4,y:H-m-sw*.62,r});
  return e}},
{id:'auto',cat:'daily',n:'Tự động · mọi ảnh',best:'Mọi size',land:1,demoN:7,b({W,H,m,g,p,f,nP,asp}){
  const capH=p(96),pad=m*.6,e=[];
  mosaic(pad,pad,W-2*pad,H-2*pad-capH,Math.min(nP,30),Math.max(4,g*.6),asp).forEach(c=>e.push(I(...c)));
  e.push(T(`${f.head}   ·   ${f.date}`,W/2,H-pad-capH/2,{font:'serif',italic:1,size:32,fit:W-2*pad}));return e}},
{id:'thennow',cat:'daily',n:'Trước & sau',best:'Mọi size',land:1,demoN:2,b({W,H,m,g,p,f,land}){
  const e=[],pad=m*.6,lb={font:'sans',size:20,upper:1,ls:.25,pill:'bg',align:'left'};
  if(land){const w=(W-2*pad-g)/2,h=H-2*pad;e.push(I(pad,pad,w,h));e.push(I(pad+w+g,pad,w,h));
    e.push(T(f.l1,pad+p(40),H-pad-p(50),lb));e.push(T(f.l2,pad+w+g+p(40),H-pad-p(50),lb))}
  else{const h=(H-2*pad-g)/2,w=W-2*pad;e.push(I(pad,pad,w,h));e.push(I(pad,pad+h+g,w,h));
    e.push(T(f.l1,pad+p(40),pad+h-p(50),lb));e.push(T(f.l2,pad+p(40),H-pad-p(50),lb))}
  e.push(T(f.script,W/2,H/2,{font:'script',size:56,pill:'bg',color:'accent'}));return e}},
{id:'year',cat:'daily',n:'Một năm nhìn lại',best:'Mọi size',land:1,demoN:12,t:{head:'một năm nhìn lại'},b({W,H,m,g,p,f,land}){
  const cols=land?6:3,rows=land?2:4,top=m+p(205),e=[];
  e.push(T(f.big,W/2,m+p(72),{font:'bold',size:132,color:'accent',fit:W-2*m,ls:.04}));
  e.push(T(f.head,W/2,m+p(163),{font:'serif',italic:1,size:40,fit:W-2*m}));
  const cw=(W-2*m-(cols-1)*g)/cols,ch=(H-m-top-(rows-1)*g)/rows;
  for(let k=0;k<12;k++){const x=m+(k%cols)*(cw+g),y=top+Math.floor(k/cols)*(ch+g);e.push(I(x,y,cw,ch));
    e.push(T(`Th ${k+1}`,x+p(26),y+p(30),{font:'sans',size:15,ls:.1,pill:'bg',align:'left'}))}
  return e}},

/* ---------- SINH NHẬT ---------- */
{id:'bmag',cat:'birthday',n:'Bìa tạp chí',best:'4:5 · Story',demoN:1,b({W,H,m,p,f,u}){
  const e=[I(0,0,W,H,{bleed:1}),{t:'shade',x:0,y:0,w:W,h:H*.38,dir:'down',alpha:.5},{t:'shade',x:0,y:H*.55,w:W,h:H*.45,dir:'up',alpha:.6}];
  e.push(T(`${f.sub}   ·   ${f.date}`,W/2,m*.6+p(12),{font:'sans',size:18,upper:1,ls:.3,color:'#ffffff',fit:W-2*m}));
  e.push(T(f.head,W/2,m*.6+p(125),{font:'bold',size:210,upper:1,color:'#ffffff',fit:W-m*1.1,shadow:'rgba(0,0,0,.25)'}));
  e.push(T(f.script,m,H*.56,{font:'script',size:72,align:'left',color:'#ffffff',shadow:true,fit:W*.58}));
  e.push(T(f.quote,m,H*.56+p(62),{font:'sans',size:22,align:'left',color:'#ffffff',maxW:W*.46,lh:1.45,valign:'top',maxLines:4,shadow:true}));
  e.push(T(f.big,W-m,H-m-p(170),{font:'display',size:Math.min(340,H*.22/u),align:'right',color:'#ffffff',shadow:true}));
  e.push(T(f.fn1||f.n1,W-m,H-m-p(18),{font:'sans',size:26,upper:1,ls:.3,align:'right',color:'#ffffff',fit:W*.5}));
  e.push({t:'barcode',x:m,y:H-m-p(64),w:p(140),h:p(56),color:'#ffffff',k:Math.max(.6,p(1.6))});
  return e}},
{id:'bage',cat:'birthday',n:'Tuổi mới',best:'4:5 · vuông',demoN:3,b({W,H,m,p,f,u}){
  const e=[{t:'confetti',x:0,y:0,w:W,h:H,n:80,s:16,seed:4}];
  e.push(T(f.big,W/2,H*.52,{font:'bold',size:Math.min(H*.7,W*1.05)/u,fit:W*.96,color:'accent',stroke:.02,fillNone:1,noScale:1}));
  e.push(T(f.head,W/2,m+p(70),{font:'script',size:96,fit:W-2*m}));
  const r0=m+p(160),r1=H-m-p(170),rh=r1-r0,pw=W*.42,ih=Math.min(pw*.82,rh*.4),fr=pw*.035,pos=[[.33,.2,-6],[.67,.5,5],[.38,.8,-3]];
  pos.forEach(([x,y,a])=>e.push(I(W*x-pw/2,r0+rh*y-ih/2,pw,ih,{rot:a*DEG,frame:fr,frameB:fr*3,bleed:1})));
  e.push(T(f.fn1||f.n1,W/2,H-m-p(95),{font:'bold',size:72,upper:1,ls:.05,fit:W-2*m}));
  e.push(T(`${f.date}   ·   ${f.tag}`,W/2,H-m-p(28),{font:'sans',size:19,ls:.25,fit:W-2*m}));
  return e}},
{id:'bparty',cat:'birthday',n:'Bóng bay & confetti',best:'4:5 · Story',pal:'party',demoN:4,b({W,H,m,g,p,f}){
  const e=[{t:'confetti',x:0,y:0,w:W,h:m+p(300),n:46,s:15,seed:8}],tail=2.4;
  [[m+p(35),m+p(95),58,'accent'],[m+p(125),m+p(55),46,'#f6c344'],[W-m-p(40),m+p(90),60,'#7cc6c0'],[W-m-p(135),m+p(52),44,'accent']].forEach(([x,y,r,c])=>e.push({t:'balloon',x,y,r:p(r),color:c,tail}));
  e.push(T(f.head,W/2,m+p(120),{font:'script',size:100,color:'accent',fit:W*.58}));
  e.push(T(f.fn1||f.n1,W/2,m+p(232),{font:'bold',size:66,upper:1,ls:.05,fit:W-2*m}));
  const top=m+p(310),bot=H-m-p(90),cw=(W-2*m-g)/2,ch=(bot-top-g)/2;
  for(let k=0;k<4;k++)e.push(I(m+(k%2)*(cw+g),top+Math.floor(k/2)*(ch+g),cw,ch,{r:Math.max(S.radius,18),border:p(10)}));
  e.push(T(`${f.date}   ·   ${f.tag}`,W/2,H-m-p(40),{font:'sans',size:20,ls:.2,fit:W-2*m}));
  return e}},

/* ---------- SỰ KIỆN ---------- */
{id:'erecap',cat:'event',n:'Event recap',best:'Mọi size',land:1,demoN:6,b({W,H,m,g,p,f,nP,asp,land}){
  const e=[],gg=Math.max(4,g*.7);
  if(land){const pw=W*.3;e.push({t:'rect',x:0,y:0,w:pw,h:H,fill:'text'});const tx=m*.7,tw=pw-2*tx;
    e.push(T(f.sub,tx,H*.3,{font:'sans',size:16,upper:1,ls:.3,align:'left',color:'accent',fit:tw,noScale:1}));
    e.push(T(f.head,tx,H*.42,{font:'bold',size:70,upper:1,align:'left',color:'bg',maxW:tw,lh:1.02,fit:tw,noScale:1}));
    e.push(T(f.date,tx,H*.62,{font:'sans',size:18,align:'left',color:'bg',fit:tw,noScale:1}));
    e.push(T(f.place,tx,H*.68,{font:'sans',size:18,align:'left',color:'bg',fit:tw,noScale:1}));
    e.push(T(f.tag,tx,H*.86,{font:'sans',size:18,ls:.12,align:'left',color:'accent',fit:tw,noScale:1}));
    mosaic(pw+gg,gg,W-pw-2*gg,H-2*gg,Math.min(nP,12),gg,asp).forEach(c=>e.push(I(...c)));return e}
  const hh=p(300)+m*.5;e.push({t:'rect',x:0,y:0,w:W,h:hh,fill:'text'});
  e.push(T(f.sub,m,m*.5+p(55),{font:'sans',size:20,upper:1,ls:.32,align:'left',color:'accent'}));
  e.push(T(f.head,m,m*.5+p(145),{font:'bold',size:112,upper:1,align:'left',color:'bg',fit:W-2*m}));
  e.push(T(`${f.date}   ·   ${f.place}`,m,m*.5+p(238),{font:'sans',size:21,ls:.08,align:'left',color:'bg',fit:W-2*m}));
  const fy=p(90);mosaic(m*.5,hh+gg,W-m,H-hh-gg-fy,Math.min(nP,12),gg,asp).forEach(c=>e.push(I(...c)));
  e.push(T(f.tag,W/2,H-fy/2,{font:'sans',size:22,ls:.2,color:'accent'}));return e}},
{id:'eticket',cat:'event',n:'Vé mời',best:'Story · 4:5',demoN:1,b({W,H,m,p,f}){
  const e=[{t:'rect',x:0,y:0,w:W,h:H,fill:'accent'},{t:'confetti',x:0,y:0,w:W,h:H,n:30,s:10,seed:21,colors:['#ffffff']}];
  const cx=m,cy=m,cw=W-2*m,ch=H-2*m,ny=cy+ch*.72,pad=cw*.07;
  e.push({t:'card',x:cx,y:cy,w:cw,h:ch,fill:'bg',r:28,notch:ny,notchR:p(30),shadow:1});
  e.push(I(cx+pad,cy+pad,cw-2*pad,ch*.44,{r:18}));
  e.push(T(f.sub,cx+pad,cy+pad+ch*.44+p(55),{font:'sans',size:18,upper:1,ls:.3,align:'left',color:'accent'}));
  e.push(T(f.head,cx+pad,cy+pad+ch*.44+p(130),{font:'bold',size:92,upper:1,align:'left',fit:cw-2*pad}));
  e.push(T(`${f.date}`,cx+pad,ny-ch*.075,{font:'sans',size:22,align:'left',fit:cw*.45}));
  e.push(T(`${f.place}`,cx+cw-pad,ny-ch*.075,{font:'sans',size:22,align:'right',fit:cw*.45}));
  e.push(Ln(cx+p(40),ny,cx+cw-p(40),ny,{lw:3,dash:[12,12],alpha:.35}));
  e.push(T('ADMIT ONE',cx+pad,ny+(ch*.28)*.38,{font:'bold',size:52,align:'left',color:'accent'}));
  e.push(T(f.tag,cx+pad,ny+(ch*.28)*.66,{font:'sans',size:20,ls:.15,align:'left',fit:cw*.5}));
  e.push({t:'barcode',x:cx+cw-pad-cw*.3,y:ny+ch*.28*.25,w:cw*.3,h:ch*.28*.5,k:Math.max(.8,cw/700)});
  return e}},
{id:'egala',cat:'event',n:'Gala đêm hội',best:'Story · standee',pal:'noir',demoN:3,b({W,H,m,p,f}){
  const e=[],o=m*.45,cw=W-2*m;
  e.push({t:'rect',x:o,y:o,w:W-2*o,h:H-2*o,fill:'bg',stroke:1.6});e.push({t:'rect',x:o+p(12),y:o+p(12),w:W-2*o-p(24),h:H-2*o-p(24),fill:'bg',stroke:.8});
  e.push(T(f.sub,W/2,m+p(70),{font:'sans',size:19,upper:1,ls:.42,color:'accent'}));
  e.push(T(f.head,W/2,m+p(165),{font:'display',size:100,upper:1,fit:cw,ls:.02}));
  e.push(T(f.script,W/2,m+p(255),{font:'script',size:72,color:'accent',fit:cw}));
  const top=m+p(330),bot=H-m-p(175),h=bot-top,cwid=cw*.4,swid=cw*.27,gap=(cw-cwid-2*swid)/2;
  e.push(I(m,top+h*.14,swid,h*.86,{shape:'arch'}));e.push(I(m+swid+gap,top,cwid,h,{shape:'arch'}));e.push(I(W-m-swid,top+h*.14,swid,h*.86,{shape:'arch'}));
  e.push(T(`${f.date}   ·   ${f.place}`,W/2,H-m-p(100),{font:'serif',italic:1,size:30,color:'accent',fit:cw}));
  e.push(T(f.n1,W/2,H-m-p(42),{font:'sans',size:17,upper:1,ls:.35,fit:cw}));
  return e}},

/* ---------- DU LỊCH ---------- */
{id:'tpost',cat:'travel',n:'Bưu thiếp',best:'Ngang · 15×10',land:1,demoN:2,b({W,H,m,p,f,land}){
  const e=[I(0,0,W,H,{bleed:1}),{t:'shade',x:0,y:0,w:W,h:H,dir:'up',alpha:.3},{t:'shade',x:0,y:0,w:W,h:H*.3,dir:'down',alpha:.25}];
  e.push(T(f.head,m,land?H*.17:m+p(70),{font:'script',size:land?150:96,align:'left',color:'#ffffff',shadow:true,rot:-.05,noScale:land,fit:W*.62}));
  const mh=land?H*.48:Math.min(H*.24,W*.42),my=land?H*.56:H*.47,place=String(f.place||'').toLocaleUpperCase('vi');
  e.push(I(m*.5,my-mh/2,W-m,mh,{mask:{text:place,font:'bold',size:mh*.98,outline:'#ffffff'}}));
  e.push(T(`${f.date}   ·   ${f.sub}`,W/2,H-m*.8-p(10),{font:'sans',size:land?26:22,ls:.25,upper:1,color:'#ffffff',shadow:true,fit:W-2*m,noScale:land}));
  e.push({t:'postmark',x:W-m-(land?H*.32:p(190)),y:land?H*.18:m+p(110),r:land?H*.1:p(68),text:f.date,color:'#ffffff'});
  return e}},
{id:'tstamp',cat:'travel',n:'Bộ tem du lịch',best:'4:5 · 10×15',demoN:6,b({W,H,m,g,p,f}){
  const e=[];
  e.push(T(f.head,W/2,m+p(45),{font:'script',size:60,color:'accent'}));
  e.push(T(f.place,W/2,m+p(135),{font:'display',size:100,upper:1,fit:W-2*m}));
  e.push(T(f.sub,W/2,m+p(212),{font:'sans',size:19,upper:1,ls:.3}));
  const top=m+p(285),bot=H-m-p(20),cols=H/W<1.15?3:2,gx=g*2.2,cw=(W-2*m-(cols-1)*gx)/cols,rows=clamp(Math.round((bot-top)/(cw*1.25)),1,5),gy=g*2,ch=(bot-top-(rows-1)*gy)/rows,pd=cw*.06;
  for(let i=0;i<rows*cols;i++){const x=m+(i%cols)*(cw+gx),y=top+Math.floor(i/cols)*(ch+gy);
    e.push(I(x+pd,y+pd,cw-2*pd,ch-pd*4.4,{stampBg:pd,cap:f.capList[i]||'',capSize:Math.min(24,cw*.075/1),bleed:1,rot:((i*5)%3-1)*1.2*DEG}))}
  e.push({t:'postmark',x:m+cw*.78,y:top+p(30),r:Math.min(p(62),cw*.2),text:f.date,color:'accent'});
  return e}},
{id:'troute',cat:'travel',n:'Hành trình',best:'Story · 4:5',demoN:5,b({W,H,m,p,f}){
  const e=[];
  e.push(T(f.place,m,m+p(78),{font:'display',size:110,upper:1,align:'left',fit:W*.62}));
  e.push(T(f.sub,m+p(4),m+p(165),{font:'sans',size:19,upper:1,ls:.3,align:'left',color:'accent'}));
  e.push(T(f.script,W-m,m+p(78),{font:'script',size:58,align:'right',color:'accent',fit:W*.3}));
  e.push(T(f.date,W-m,m+p(165),{font:'sans',size:18,align:'right'}));
  const top=m+p(240),av=H-m-top,n=clamp(Math.round(av/(W*.3)),3,6),st=av/n,pts=[];
  for(let i=0;i<n;i++)pts.push([i%2?W*.68:W*.32,top+st*(i+.5)]);
  e.push({t:'path',pts,color:'accent',lw:p(5),dash:[1,p(16)]});
  pts.forEach(([cx,cy],i)=>{const r=Math.min(W*.17,st*.42);e.push(I(cx-r,cy-r,2*r,2*r,{shape:'circle',ring:p(9)}));
    const tx=i%2?cx-r-p(30):cx+r+p(30),al=i%2?'right':'left';
    e.push(T(`0${i+1}`,tx,cy-p(34),{font:'sans',size:16,ls:.25,color:'accent',align:al}));
    e.push(T(f.capList[i]||`Điểm ${i+1}`,tx,cy+p(8),{font:'hand',size:42,align:al,fit:W*.3}))});
  return e}},

/* ---------- TỐT NGHIỆP ---------- */
{id:'gclass',cat:'grad',n:'Class of',best:'4:5 · Story',demoN:4,b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[];
  e.push(T(f.head,W/2,m+p(70),{font:'display',size:84,upper:1,fit:cw,ls:.02}));
  e.push(T(f.n1,W/2,m+p(178),{font:'script',size:74,color:'accent',fit:cw*.8}));
  e.push(T(f.sub,W/2,m+p(272),{font:'sans',size:18,upper:1,ls:.3,fit:cw}));
  const top=m+p(320),bot=H-m-p(95),h=bot-top,a=h*.64;
  e.push(I(m+cw*.14,top,cw*.72,a,{shape:'arch'}));
  const rw=(cw-2*g)/3;for(let k=0;k<3;k++)e.push(I(m+k*(rw+g),top+a+g,rw,h-a-g));
  e.push(T(f.date,W/2,H-m-p(40),{font:'serif',italic:1,size:30}));
  return e}},
{id:'gyear',cat:'grad',n:'Kỷ yếu bạn bè',best:'Mọi size',land:1,demoN:9,b({W,H,m,g,p,f,land}){
  const e=[];
  e.push(T(f.head,W/2,m+p(66),{font:'bold',size:110,upper:1,color:'accent',fit:W-2*m}));
  e.push(T(f.sub,W/2,m+p(150),{font:'sans',size:19,upper:1,ls:.3,fit:W-2*m}));
  const cols=land?5:3,top=m+p(205),cw=(W-2*m-(cols-1)*g)/cols,av=H-m-top,rows=clamp(Math.round(av/(cw*1.28)),1,6),ch=av/rows,cap=p(64),d=Math.min(cw*.84,ch-cap-p(10));
  for(let i=0;i<rows*cols;i++){const cx=m+(i%cols)*(cw+g)+cw/2,y=top+Math.floor(i/cols)*ch+(ch-d-cap)/2;
    e.push(I(cx-d/2,y,d,d,{shape:'circle',ring:p(6),ringColor:'accent'}));
    e.push(T(f.capList[i]||`Bạn ${i+1}`,cx,y+d+cap*.6,{font:'hand',size:36,fit:cw}))}
  return e}},

/* ---------- SINH NHẬT (thêm) ---------- */
{id:'bnum',cat:'birthday',n:'Số tuổi lồng ảnh',best:'Story · 4:5',pal:'party',demoN:4,b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[{t:'confetti',x:0,y:0,w:W,h:H,n:70,s:13,seed:12}];
  e.push(T(f.head,W/2,m+p(70),{font:'script',size:92,color:'accent',fit:cw}));
  const ny=m+p(140),nh=Math.min(H*.42,W*.95);
  e.push(I(m*.4,ny,W-m*.8,nh,{mask:{text:String(f.big||'25'),font:'bold',size:nh*1.1},bleed:1}));
  const y2=ny+nh+p(20);
  e.push(T(f.fn1||f.n1,W/2,y2+p(40),{font:'bold',size:66,upper:1,ls:.06,fit:cw}));
  e.push(T(`${f.date}   ·   ${f.tag}`,W/2,y2+p(100),{font:'sans',size:19,ls:.25,fit:cw}));
  const ry=y2+p(150),rh=H-m-ry,rw=(cw-2*g)/3;
  if(rh>40)for(let k=0;k<3;k++)e.push(I(m+k*(rw+g),ry,rw,rh,{r:Math.max(S.radius,16)}));
  return e}},
{id:'bgarland',cat:'birthday',n:'Dây ảnh treo',best:'Story · 4:5',pal:'party',demoN:6,b({W,H,m,p,f}){
  const e=[{t:'bunting',x1:-20,y1:m*.3,x2:W+20,y2:m*.3,sag:p(46),n:14}];
  e.push(T(f.head,W/2,m+p(150),{font:'script',size:100,color:'accent',fit:W-2*m}));
  e.push(T(f.fn1||f.n1,W/2,m+p(245),{font:'bold',size:58,upper:1,ls:.06,fit:W-2*m}));
  const top=m+p(320),av=H-top-m-p(70),rows=clamp(Math.round(av/(W*.42)),1,4),rh=av/rows,pw=W*.27,pad=pw*.06,iw=pw-2*pad,ih=Math.min(iw*1.08,rh*.62);
  for(let r=0;r<rows;r++){const y0=top+r*rh+p(10),sag=p(34);e.push({t:'curve',x1:-10,y1:y0,x2:W+10,y2:y0,sag,lw:2});
    [.19,.5,.81].forEach((t,k)=>{const x=W*t,yc=y0+4*sag*t*(1-t),rot=((k+r)%2?1:-1)*(3+k)*DEG;
      e.push(I(x-iw/2,yc+p(16),iw,ih,{rot,frame:pad,frameB:pad*3.2,bleed:1}));
      e.push({t:'rect',x:x-p(7),y:yc-p(6),w:p(14),h:p(36),fill:'#b98a5c',r:3,rot})})}
  e.push(T(f.date,W/2,H-m-p(30),{font:'sans',size:20,ls:.3}));return e}},
{id:'binvite',cat:'birthday',n:'Thiệp mời tiệc',best:'Story · 4:5',pal:'butter',demoN:3,b({W,H,m,g,p,f}){
  const cw=W-2*m,o=m*.45,e=[{t:'rect',x:o,y:o,w:W-2*o,h:H-2*o,fill:'bg',stroke:2},{t:'rect',x:o+p(14),y:o+p(14),w:W-2*o-p(28),h:H-2*o-p(28),fill:'bg',stroke:.8}];
  e.push(T("You're invited",W/2,m+p(80),{font:'script',size:76,color:'accent'}));
  e.push(T(f.head,W/2,m+p(170),{font:'display',size:62,upper:1,fit:cw,ls:.04}));
  const ay=m+p(230),ah=H*.42,aw=Math.min(cw*.66,ah*.8);
  e.push(I(W/2-aw/2,ay,aw,ah,{shape:'arch'}));
  e.push({t:'doodle',kind:'spark',x:W/2-aw/2-p(30),y:ay+p(40),s:p(22),color:'accent',lw:3});
  e.push({t:'doodle',kind:'spark',x:W/2+aw/2+p(26),y:ay+ah*.6,s:p(16),color:'accent',lw:3});
  const ty=ay+ah+p(70);
  e.push(T(f.n1,W/2,ty,{font:'script',size:72,fit:cw}));
  e.push(T(f.date,W/2,ty+p(80),{font:'display',size:40,ls:.08}));
  e.push(Ln(W/2-p(60),ty+p(120),W/2+p(60),ty+p(120),{lw:1.4,color:'accent'}));
  e.push(T(f.place||f.tag,W/2,ty+p(158),{font:'sans',size:19,upper:1,ls:.28,fit:cw}));
  const by=ty+p(205),bh=H-m-by;if(bh>60){const bw=(cw*.8-g)/2;e.push(I(W/2-bw-g/2,by,bw,bh,{r:12}));e.push(I(W/2+g/2,by,bw,bh,{r:12}))}
  return e}},
{id:'bbaby',cat:'birthday',n:'Bé yêu tròn tuổi',best:'4:5 · Story',pal:'sky',demoN:4,b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[{t:'confetti',x:0,y:0,w:W,h:m+p(160),n:26,s:12,seed:31}];
  e.push(T(f.head,W/2,m+p(60),{font:'sans',size:21,upper:1,ls:.38,color:'accent'}));
  const d=Math.min(W*.62,H*.36),cy=m+p(110)+d/2;
  e.push(I(W/2-d/2,cy-d/2,d,d,{shape:'circle',ring:p(14),ringColor:'accent'}));
  e.push(T(String(f.big),W/2+d*.36,cy+d*.36,{font:'bold',size:86,pill:'accent',color:'bg'}));
  e.push(T(f.n1,W/2,cy+d/2+p(85),{font:'script',size:96,fit:cw}));
  if(f.nick)e.push(T(`“${f.nick}”`,W/2,cy+d/2+p(152),{font:'hand',size:40,color:'accent'}));
  e.push(T(f.date,W/2,cy+d/2+p(202),{font:'sans',size:20,ls:.3}));
  const info=f.capList.slice(0,3),iy=cy+d/2+p(270),cwi=cw/Math.max(1,info.length);
  info.forEach((it,i)=>{const [a,b]=it.includes(':')?it.split(':'):['',it];const x=m+cwi*(i+.5);
    if(a)e.push(T(a.trim(),x,iy,{font:'sans',size:15,upper:1,ls:.25,color:'accent',fit:cwi*.9}));
    e.push(T(b.trim(),x,iy+p(42),{font:'hand',size:36,fit:cwi*.92}));
    if(i)e.push(Ln(m+cwi*i,iy-p(16),m+cwi*i,iy+p(58),{lw:1,alpha:.25}))});
  const by=iy+p(100),bh=H-m-by;if(bh>50){const bw=(cw-2*g)/3;for(let k=0;k<3;k++)e.push(I(m+k*(bw+g),by,bw,bh,{r:Math.max(S.radius,20)}))}
  return e}},

/* ---------- DU LỊCH (thêm) ---------- */
{id:'tboard',cat:'travel',n:'Boarding pass',best:'Story · 4:5',pal:'sky',demoN:2,b({W,H,m,p,f}){
  const e=[{t:'rect',x:0,y:0,w:W,h:H,fill:'accent'},{t:'confetti',x:0,y:0,w:W,h:H,n:24,s:9,seed:44,colors:['#ffffff']}];
  const cx=m*.8,cy=m*.8,cw=W-2*cx,ch=H-2*cy,ny=cy+ch*.76,pad=cw*.07;
  e.push({t:'card',x:cx,y:cy,w:cw,h:ch,fill:'bg',r:30,notch:ny,notchR:p(32),shadow:1});
  e.push({t:'rect',x:cx,y:cy,w:cw,h:p(96),fill:'text',r:30});e.push({t:'rect',x:cx,y:cy+p(60),w:cw,h:p(36),fill:'text'});
  e.push(T('BOARDING PASS',cx+pad,cy+p(50),{font:'bold',size:34,align:'left',color:'bg',ls:.06}));
  e.push({t:'doodle',kind:'plane',x:cx+cw-pad-p(24),y:cy+p(48),s:p(24),color:'bg'});
  const y1=cy+p(96)+p(95);
  e.push(T(f.from,cx+pad,y1,{font:'bold',size:116,align:'left',fit:cw*.36}));
  e.push(T(f.to,cx+cw-pad,y1,{font:'bold',size:116,align:'right',color:'accent',fit:cw*.36}));
  e.push({t:'line',x1:cx+cw*.4,y1:y1,x2:cx+cw*.6,y2:y1,lw:2,dash:[6,8],alpha:.5});
  e.push({t:'doodle',kind:'plane',x:cx+cw/2,y:y1,s:p(20),color:'accent'});
  e.push(T('KHỞI HÀNH',cx+pad,y1+p(70),{font:'sans',size:15,align:'left',ls:.25,alpha:.6}));
  e.push(T(f.place,cx+cw-pad,y1+p(70),{font:'sans',size:15,align:'right',ls:.25,upper:1,alpha:.6,fit:cw*.4}));
  const py=y1+p(110),ph=ny-p(150)-py;
  e.push(I(cx+pad,py,cw-2*pad,ph,{r:18}));
  const dy=ny-p(80),cols=[['NGÀY',f.date],['HÀNH TRÌNH',f.sub],['HÀNH KHÁCH',f.n1||'Bạn & tôi']],cc=(cw-2*pad)/3;
  cols.forEach(([a,b],i)=>{e.push(T(a,cx+pad+cc*i,dy-p(18),{font:'sans',size:13,ls:.25,align:'left',alpha:.55}));e.push(T(b,cx+pad+cc*i,dy+p(20),{font:'sans',size:21,weight:600,align:'left',fit:cc*.92}))});
  e.push(Ln(cx+p(44),ny,cx+cw-p(44),ny,{lw:3,dash:[12,12],alpha:.3}));
  e.push({t:'barcode',x:cx+pad,y:ny+(ch*.24)*.24,w:cw-2*pad,h:(ch*.24)*.4,k:Math.max(.8,cw/650)});
  e.push(T(f.tag,W/2,ny+(ch*.24)*.8,{font:'sans',size:17,ls:.3}));
  return e}},
{id:'tmag',cat:'travel',n:'Tạp chí du lịch',best:'4:5 · Story',demoN:3,b({W,H,m,g,p,f,u}){
  const e=[I(0,0,W,H,{bleed:1}),{t:'shade',x:0,y:0,w:W,h:H*.32,dir:'down',alpha:.45},{t:'shade',x:0,y:H*.55,w:W,h:H*.45,dir:'up',alpha:.6}];
  e.push(T(String(f.place).toLocaleUpperCase('vi'),W/2,m*.6+p(105),{font:'display',size:200,color:'#ffffff',fit:W-m,ls:.02,shadow:'rgba(0,0,0,.2)'}));
  e.push(T(`${f.date}   ·   ${f.sub}`,W/2,m*.6+p(215),{font:'sans',size:17,upper:1,ls:.32,color:'#ffffff',fit:W-2*m}));
  e.push(T(f.script,m,H*.68,{font:'script',size:80,align:'left',color:'#ffffff',shadow:true,fit:W*.55}));
  e.push(T(f.quote,m,H*.68+p(62),{font:'sans',size:21,align:'left',color:'#ffffff',maxW:W*.48,lh:1.45,valign:'top',maxLines:4,shadow:true}));
  const iw=W*.27,ih=iw*1.22,ix=W-m-iw;e.push(I(ix,H-m-2*ih-g*2,iw,ih,{border:p(10),r:4}));e.push(I(ix,H-m-ih,iw,ih,{border:p(10),r:4}));
  e.push(T(f.tag,m,H-m-p(10),{font:'sans',size:17,ls:.2,align:'left',color:'#ffffff'}));
  return e}},
{id:'tdiary',cat:'travel',n:'Nhật ký từng ngày',best:'Story · 4:5',demoN:6,b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[];
  e.push(T(f.place,m,m+p(70),{font:'display',size:96,upper:1,align:'left',fit:cw*.62}));
  e.push(T(f.script,W-m,m+p(62),{font:'script',size:54,align:'right',color:'accent',fit:cw*.36}));
  e.push(T(f.date,W-m,m+p(122),{font:'sans',size:17,align:'right',ls:.15}));
  e.push(Ln(m,m+p(160),W-m,m+p(160),{lw:1.2,alpha:.3}));
  const top=m+p(190),n=3,rh=(H-m-top-(n-1)*g*1.6)/n,lw=cw*.2;
  for(let i=0;i<n;i++){const y=top+i*(rh+g*1.6);
    e.push(T(`0${i+1}`,m,y+p(52),{font:'bold',size:100,align:'left',color:'accent'}));
    e.push(T('NGÀY',m+p(4),y+p(122),{font:'sans',size:14,align:'left',ls:.35}));
    e.push(T(f.capList[i]||'',m+p(4),y+p(170),{font:'hand',size:30,align:'left',maxW:lw-p(10),lh:1.1,maxLines:3}));
    const x0=m+lw,aw=cw-lw,a=i%2?aw*.42:aw*.58;e.push(I(x0,y,a-g/2,rh));e.push(I(x0+a+g/2,y,aw-a-g/2,rh))}
  return e}},

/* ---------- PHÁ CÁCH · CHUYÊN NGHIỆP ---------- */
{id:'swiss',cat:'event',n:'Poster Swiss',best:'4:5 · Story',pal:'white',demoN:4,b({W,H,m,g,p,f}){
  const e=[],bw=W*.36,bh=H*.56;
  const RED='#e4402f';e.push({t:'rect',x:0,y:0,w:bw,h:bh,fill:RED});
  e.push(T(f.head,bw/2,bh/2,{font:'bold',size:240,upper:1,rot:-R90,color:'#ffffff',fit:bh*.92}));
  e.push(I(bw+g,0,W-bw-g,bh,{bleed:1}));
  const y2=bh+g,h2=H*.25,c3=(W-2*g)/3;for(let k=0;k<3;k++)e.push(I(k*(c3+g),y2,c3,h2,{bleed:1}));
  const ty=y2+h2+p(20),x=m*.5;
  e.push(Ln(x,ty,W-x,ty,{lw:3}));
  e.push(T(f.big,x,ty+p(75),{font:'bold',size:120,align:'left',color:RED}));
  e.push(T(f.sub,W*.42,ty+p(45),{font:'sans',size:19,upper:1,ls:.2,align:'left',weight:600,fit:W*.55}));
  e.push(T(`${f.date} — ${f.place}`,W*.42,ty+p(85),{font:'sans',size:19,align:'left',fit:W*.55}));
  e.push(T(f.tag,W*.42,ty+p(125),{font:'sans',size:19,align:'left',color:RED,fit:W*.55}));
  return e}},
{id:'editorial',cat:'daily',n:'Editorial tạp chí',best:'4:5 · Story',pal:'ivory',demoN:3,t:{head:'Slow days'},b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[];
  e.push(T('VOL. 11',m,m+p(14),{font:'sans',size:15,ls:.3,align:'left'}));
  e.push(T(f.sub,W/2,m+p(14),{font:'sans',size:15,ls:.3,upper:1,fit:cw*.5}));
  e.push(T(f.date,W-m,m+p(14),{font:'sans',size:15,ls:.2,align:'right'}));
  e.push(Ln(m,m+p(40),W-m,m+p(40),{lw:1.2}));
  const py=m+p(64),ph=H*.5;e.push(I(m,py,cw,ph));
  e.push(T(f.head,m-p(4),py+ph+p(10),{font:'display',italic:1,size:170,align:'left',fit:cw,lh:1}));
  const ty=py+ph+p(115),colw=(cw-g*2)/2;
  e.push(T(f.quote,m,ty,{font:'serif',size:24,align:'left',maxW:colw,lh:1.5,valign:'top',maxLines:8}));
  e.push(I(m+colw+g*2,ty,colw,H-m-p(40)-ty));
  e.push(Ln(m,H-m-p(20),W-m,H-m-p(20),{lw:1.2}));
  e.push(T(f.tag,m,H-m+p(6),{font:'sans',size:14,ls:.25,align:'left'}));
  e.push(T('— 07',W-m,H-m+p(6),{font:'sans',size:14,ls:.2,align:'right'}));
  return e}},
{id:'sticker',cat:'daily',n:'Nhãn dán vui',best:'4:5 · vuông',pal:'butter',demoN:5,b({W,H,m,p,f}){
  const e=[{t:'dots',x:14,y:14,w:W,h:H,s:34,r:2,alpha:.14}],b=p(13);
  e.push(T(f.head,W/2,m+p(70),{font:'hand',size:104,rot:-.04,fit:W-2*m}));
  const k=Math.min(W,H*.8),sp=[[.52,.4,.62,'heart',4],[.25,.7,.36,'circle',-6],[.77,.74,.33,'circle',8],[.22,.32,.27,null,-9],[.8,.25,.26,null,10]];
  sp.forEach(([x,y,s,shape,rot])=>{const w=k*s,h=shape?w:w*1.15;e.push(I(W*x-w/2,H*y-h/2,w,h,{shape:shape||undefined,r:shape?0:p(26),border:b,borderColor:'#ffffff',drop:1,rot:rot*DEG}))});
  e.push({t:'doodle',kind:'star',x:W*.1,y:H*.52,s:p(26),color:'accent',fill:1});
  e.push({t:'doodle',kind:'spark',x:W*.9,y:H*.5,s:p(22),color:'accent',lw:3});
  e.push({t:'doodle',kind:'heart',x:W*.5,y:H*.9,s:p(18),color:'accent',fill:1});
  e.push(T(f.date,W/2,H-m-p(10),{font:'hand',size:34,color:'accent'}));
  return e}},
{id:'duo',cat:'daily',n:'Khối màu tương phản',best:'Mọi size',land:1,demoN:2,b({W,H,m,p,f,land}){
  const e=[];
  if(land){e.push({t:'rect',x:0,y:0,w:W*.42,h:H,fill:'accent'});
    e.push(T(f.head,m*.6,H*.42,{font:'bold',size:110,upper:1,align:'left',color:'bg',maxW:W*.36,lh:.98,fit:W*.36,noScale:1}));
    e.push(T(f.date,m*.6,H*.82,{font:'sans',size:20,ls:.25,align:'left',color:'bg',noScale:1}));
    e.push(I(W*.42,0,W*.58,H,{bleed:1}));e.push(I(W*.42-W*.12,H*.5,W*.22,H*.4,{border:10}));return e}
  e.push({t:'rect',x:0,y:0,w:W,h:H*.4,fill:'accent'});
  e.push(T(f.head,m,H*.16,{font:'bold',size:170,upper:1,align:'left',color:'bg',maxW:W*.8,lh:.96,fit:W-2*m}));
  e.push(T(f.script,m,H*.33,{font:'script',size:64,align:'left',color:'bg',fit:W*.5}));
  e.push(I(0,H*.4,W,H*.6,{bleed:1}));
  const iw=W*.36,ih=iw*1.25;e.push(I(W-m-iw,H*.4-ih*.55,iw,ih,{border:p(12),drop:1}));
  e.push(T(f.date,m,H-m*.6,{font:'sans',size:19,ls:.25,align:'left',color:'#ffffff',shadow:true}));
  return e}},

/* ---------- CƯỚI HỎI ---------- */
{id:'lovestory',cat:'wedding',n:'Love Story',best:'Standee',b({W,H,m,g,p,f}){
  const cw=W-2*m,lw=(cw-g)*.42,rw=cw-g-lw,xL=m,xR=m+lw+g,topH=H*.40-m,e=[];
  e.push(I(xR,m,rw,topH));const tH=topH*.62;
  e.push(T(f.head,xL,m+p(2),{font:'display',size:54,upper:1,align:'left',maxW:lw,lh:1.1,valign:'top'}));
  e.push(T(f.script,xL+p(6),m+tH*.58,{font:'script',size:54,align:'left',color:'accent',fit:lw}));
  e.push(Ln(xL+p(4),m+tH*.69,xL+p(4),m+tH*.88,{lw:1.6}));
  e.push(T(f.date,xL,m+tH*.97,{font:'sans',size:21,align:'left',ls:.08}));
  const sy=m+topH*.66,sh=topH-topH*.66,sw=(lw-g)/2;e.push(I(xL,sy,sw,sh));e.push(I(xL+sw+g,sy,sw,sh));
  const y0=m+topH+g,bh=H-m-y0,av=bh-2*g;let y=y0;
  [.36,.30,.34].forEach(k=>{const h=av*k;e.push(I(xL,y,lw,h));y+=h+g});
  y=y0;const vw=p(66);[.42,.28,.30].forEach((k,i)=>{const h=av*k;e.push(I(xR,y,i?rw-vw:rw,h));y+=h+g});
  const vy=y0+av*.42+g,vh=bh-av*.42-g;
  e.push(T(f.tag,xR+rw-vw/2+p(6),vy+vh/2,{font:'sans',size:25,upper:1,ls:.34,rot:R90,fit:vh}));return e}},
{id:'classic3',cat:'wedding',n:'Ba khung cổ điển',best:'Standee',b({W,H,m,g,p,f}){
  const cw=W-2*m,ta=Math.max(H*.25,p(400)),ph=(H-m-ta-2*g)/3,e=[];
  for(let i=0;i<3;i++)e.push(I(m,m+i*(ph+g),cw,ph));const t0=H-ta;
  e.push(T(f.head,W/2,t0+ta*.17,{font:'sans',size:25,ls:.22,upper:1,maxW:620,lh:1.6}));
  e.push(T(f.date,W/2,t0+ta*.35,{font:'sans',size:21,ls:.14}));
  e.push(T(f.n1,W/2,t0+ta*.54,{font:'display',size:88,upper:1,ls:.02,fit:cw}));
  e.push(T('*',W/2,t0+ta*.685,{font:'display',size:60}));
  e.push(T(f.n2,W/2,t0+ta*.82,{font:'display',size:88,upper:1,ls:.02,fit:cw}));return e}},
{id:'welcome',cat:'wedding',n:'Welcome thanh lịch',best:'Standee',b({W,H,m,g,p,f}){
  const cw=W-2*m,xi=m+p(28),ci=cw-p(56),e=[];
  e.push(T(f.head,W/2,m+p(28),{font:'display',size:56,upper:1,maxW:ci,lh:1.08,valign:'top'}));
  e.push(T(`${f.n1} & ${f.n2}`,W/2,m+p(200),{font:'script',size:60,color:'accent',fit:ci}));
  const y1=m+p(268),av=H-m-y1-2*g,bigH=av*.40,midH=av*.36,botH=av-bigH-midH;e.push(I(xi,y1,ci,bigH));
  const y2=y1+bigH+g,cw2=(ci-g)/2,xr=xi+cw2+g;e.push(I(xr,y2,cw2,midH*.62));
  e.push(T(f.tag,xi+cw2/2,y2+midH*.085,{font:'sans',size:18,upper:1,ls:.2,fit:cw2}));
  e.push(T(f.date,xi+cw2/2,y2+midH*.175,{font:'sans',size:32,ls:.04,fit:cw2}));
  const py=y2+midH*.27,ph=(midH*.73-g)/2;e.push(I(xi,py,cw2,ph));e.push(I(xi,py+ph+g,cw2,ph));
  e.push(T(f.script,xr+cw2/2,y2+midH*.62+(midH*.38)/2,{font:'script',size:56,maxW:cw2,lh:1,fit:cw2}));
  e.push(I(xi,y2+midH+g,ci,botH));return e}},
{id:'arch',cat:'wedding',n:'Vòm cổ điển',best:'Standee',b({W,H,m,g,p,f}){
  const cw=W-2*m,aw=cw-p(110),ah=H*.36,e=[];e.push(I(m+(cw-aw)/2,m+p(16),aw,ah,{shape:'arch'}));
  let y=m+p(16)+ah+g*2.4;const g2=g*1.5,rh=(H-m-y-2*g2)/3;
  e.push(T(f.quote,m+cw*.21,y+rh/2,{font:'serif',italic:1,size:24,maxW:cw*.39,lh:1.4,maxLines:7}));
  e.push(I(m+cw*.44,y,cw*.56,rh));y+=rh+g2;e.push(I(m,y,cw*.56,rh));
  const nx=m+cw*.78,ny=y+rh/2;
  e.push(T(f.n1,nx,ny-p(56),{font:'display',size:52,upper:1,fit:cw*.42}));
  e.push(T('and',nx,ny,{font:'script',size:40,color:'accent'}));
  e.push(T(f.n2,nx,ny+p(56),{font:'display',size:52,upper:1,fit:cw*.42}));y+=rh+g2;
  e.push(T(f.tag,m+cw*.11,y+rh/2,{font:'display',size:44,upper:1,rot:R90,ls:.04,fit:rh}));
  e.push(I(m+cw*.24,y,cw*.76,rh));return e}},
{id:'fade',cat:'wedding',n:'Hoà sắc mềm',best:'Mọi size',b({W,H,p,f}){
  const e=[],h1=H*.52;e.push(I(0,0,W,h1,{bleed:1}));e.push(Fd(0,h1*.58,W,h1*.42,'down'));
  e.push(I(0,H*.5,W,H*.5,{bleed:1}));e.push(Fd(0,H*.5,W,H*.17,'up'));
  e.push(T(`${f.n1}  ·  ${f.n2}`,W/2,H*.5-p(118),{font:'sans',size:21,upper:1,ls:.32,fit:W-p(160)}));
  e.push(T(f.quote,W/2,H*.5,{font:'script',size:36,maxW:W-p(180),lh:1.3,maxLines:3}));
  e.push(T(f.date,W/2,H*.5+p(120),{font:'serif',italic:1,size:28}));return e}},
{id:'hero4',cat:'wedding',n:'Ảnh lớn + lưới 4',best:'Mọi size',b({W,H,m,g,p,f}){
  const cw=W-2*m,bh=H*.40,e=[];e.push(I(m,m,cw,bh));const ty=m+bh+p(112);
  e.push(T(f.head,W/2,ty-p(60),{font:'serif',italic:1,size:30,fit:cw}));
  e.push(T(`${f.n1} & ${f.n2}`,W/2,ty,{font:'display',size:54,upper:1,fit:cw}));
  e.push(T(`${f.date}   ·   ${f.tag}`,W/2,ty+p(56),{font:'serif',size:25,fit:cw}));
  const gy=m+bh+p(222),gh=(H-m-gy-g)/2,gw=(cw-g)/2;
  for(let r=0;r<2;r++)for(let c=0;c<2;c++)e.push(I(m+c*(gw+g),gy+r*(gh+g),gw,gh));return e}},
{id:'monogram',cat:'wedding',n:'Monogram',best:'Mọi size',b({W,H,m,g,p,f}){
  const cw=W-2*m,my=m+p(140),L=[...f.mono],e=[];
  if(L.length===2){e.push(T(L[0],W/2-p(46),my-p(20),{font:'display',size:240,italic:1}));e.push(T(L[1],W/2+p(50),my+p(26),{font:'display',size:240}))}
  else e.push(T(f.mono,W/2,my,{font:'display',size:210,fit:cw}));
  e.push(T(`${f.n1}  ·  ${f.n2}`,W/2,m+p(298),{font:'sans',size:19,upper:1,ls:.32,fit:cw}));
  const y1=m+p(342),av=H-m-y1-2*g,r1=av*.27,r2=av*.27,r3=av-r1-r2,hw=(cw-g)/2;
  e.push(I(m,y1,hw,r1));e.push(I(m+hw+g,y1,hw,r1));e.push(I(m,y1+r1+g,cw,r2));e.push(I(m,y1+r1+r2+2*g,cw,r3));return e}},
{id:'script',cat:'wedding',n:'Wedding script',best:'Standee',b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[];
  e.push(T(f.head,W/2,m+p(58),{font:'sans',size:23,upper:1,ls:.28,fit:cw}));
  e.push(T(f.script,W/2,m+p(178),{font:'script',size:140,fit:cw}));
  e.push(T(f.n1,W/2-p(52),m+p(312),{font:'display',size:40,upper:1,align:'right',ls:.04,fit:cw/2-p(60)}));
  e.push(T('and',W/2,m+p(304),{font:'script',size:40,color:'accent'}));
  e.push(T(f.n2,W/2+p(52),m+p(312),{font:'display',size:40,upper:1,align:'left',ls:.04,fit:cw/2-p(60)}));
  const y1=m+p(388),av=H-m-y1-2*g,r1=av*.36,r2=av*.25,r3=av-r1-r2,hw=(cw-g)/2;
  e.push(I(m,y1,hw,r1));e.push(I(m+hw+g,y1,hw,r1));const y2=y1+r1+g;
  e.push(T(f.tag,m+cw*.105,y2+r2/2,{font:'display',italic:1,size:34,upper:1,maxW:cw*.2,lh:1.08}));
  e.push(I(m+cw*.23,y2,cw*.77,r2));e.push(I(m,y2+r2+g,cw,r3));return e}},
{id:'magazine',cat:'wedding',n:'Tạp chí 3 cột',best:'Mọi size',b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[];
  e.push(T('&',W/2+p(8),m+p(168),{font:'script',size:130,color:'accent',alpha:.32}));
  e.push(T(f.n1,W/2,m+p(92),{font:'display',size:116,color:'accent',fit:cw}));
  e.push(T(f.n2,W/2,m+p(226),{font:'display',size:116,color:'accent',fit:cw}));
  const gt=m+p(322),bot=p(104),c3=(cw-2*g)/3,av=H-m-bot-gt,rows=clamp(Math.round((av+g)/(c3*1.42+g)),1,7),ch=(av-(rows-1)*g)/rows;
  for(let r=0;r<rows;r++)for(let c=0;c<3;c++)e.push(I(m+c*(c3+g),gt+r*(ch+g),c3,ch));
  e.push(T(f.date,W/2,H-m-bot/2+p(6),{font:'sans',size:21,ls:.3}));return e}},
{id:'light',cat:'wedding',n:'Lời yêu + lưới đôi',best:'Standee',b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[];
  e.push(T(f.head,W/2,m+p(82),{font:'display',size:50,upper:1,fit:cw,ls:.02}));
  e.push(T(f.script,W/2,m+p(162),{font:'script',size:70,color:'accent',fit:cw}));
  e.push(T(f.quote,W/2,m+p(226),{font:'serif',italic:1,size:25,maxW:cw-p(60),lh:1.5,valign:'top',maxLines:4}));
  const gt=m+p(420),gw=(cw-g)/2,av=H-m-p(30)-gt,rows=clamp(Math.round((av+g)/(gw*1.18+g)),1,6),ch=(av-(rows-1)*g)/rows;
  for(let r=0;r<rows;r++)for(let c=0;c<2;c++)e.push(I(m+c*(gw+g),gt+r*(ch+g),gw,ch));return e}},
{id:'groombride',cat:'wedding',n:'Chú rể · Cô dâu',best:'Standee',b({W,H,m,g,p,f}){
  const cw=W-2*m,e=[];
  e.push(T(f.tag,W/2,m+p(76),{font:'display',size:64,upper:1,ls:.06,fit:cw}));
  e.push(T(f.date,W/2,m+p(150),{font:'sans',size:25,ls:.1}));
  const y1=m+p(210),av=H-m-y1-3*g,a=av*.27,b=av*.22,c=av*.22,d=av-a-b-c;e.push(I(m,y1,cw,a));let y=y1+a+g;const lx=m+cw*.26;
  e.push(T(f.l1,lx,y+b*.40,{font:'script',size:72,color:'accent',fit:cw*.48}));e.push(T(f.fn1||f.n1,lx,y+b*.66,{font:'display',size:40,upper:1,fit:cw*.48}));
  e.push(I(m+cw*.54,y,cw*.46,b));y+=b+g;e.push(I(m,y,cw*.46,c));const rx=m+cw*.77;
  e.push(T(f.l2,rx,y+c*.40,{font:'script',size:72,color:'accent',fit:cw*.44}));e.push(T(f.fn2||f.n2,rx,y+c*.66,{font:'display',size:40,upper:1,fit:cw*.44}));
  y+=c+g;e.push(I(m,y,cw,d));return e}},
{id:'band',cat:'wedding',n:'Dải chữ giữa ảnh',best:'Ảnh cổng',b({W,H,m,p,f}){
  const cw=W-2*m,ih=H-2*m,cy=m+ih*.56,e=[];
  e.push(I(m,m,cw,ih*.56,{bleed:1}));e.push(I(m,cy,cw,ih*.44,{bleed:1}));e.push({t:'band',x:m,y:cy-p(250),w:cw,h:p(540)});
  e.push(T(f.script,W/2,cy-p(130),{font:'script',size:146,color:'accent',fit:cw-p(40)}));
  e.push(T(f.date,W/2,cy-p(26),{font:'serif',italic:1,size:28}));
  e.push(T(f.quote,W/2,cy+p(58),{font:'serif',italic:1,size:23,maxW:cw-p(130),lh:1.45,maxLines:3}));
  e.push(T(f.n1,m+cw*.28,cy+p(178),{font:'script',size:46,fit:cw*.4}));e.push(T(f.n2,m+cw*.72,cy+p(178),{font:'script',size:46,fit:cw*.4}));return e}},
{id:'grid9',cat:'wedding',n:'Lưới + thẻ giữa',best:'Ảnh cổng',b({W,H,m,g,p,f,u}){
  const cw=W-2*m,c3=(cw-2*g)/3,av=H-2*m,e=[],r=(av+g)/(c3*1.5+g),rows=Math.max(1,2*Math.round((r-1)/2)+1),ch=(av-(rows-1)*g)/rows,center=Math.floor(rows/2)*3+1;
  for(let i=0;i<rows*3;i++){const x=m+(i%3)*(c3+g),y=m+Math.floor(i/3)*(ch+g);
    if(i===center){const cx=x+c3/2,cy=y+ch/2,k=Math.min(1,ch/420)/u;e.push(Cd(x,y,c3,ch));
      e.push(T(f.tag,cx,cy-ch*.27,{font:'script',size:34*k,color:'accent',fit:c3-20}));
      e.push(T(f.n1,cx,cy-ch*.04,{font:'serif',size:42*k,fit:c3-24}));e.push(T('&',cx,cy+ch*.07,{font:'script',size:30*k,color:'accent'}));
      e.push(T(f.n2,cx,cy+ch*.18,{font:'serif',size:42*k,fit:c3-24}));e.push(T(f.date,cx,cy+ch*.32,{font:'sans',size:15*k,ls:.12,fit:c3-20}))}
    else e.push(I(x,y,c3,ch))}return e}},
{id:'single',cat:'wedding',n:'Một ảnh ấn tượng',best:'Ảnh cổng',b({W,H,m,p,f}){
  const cw=W-2*m,ih=H-2*m,e=[];e.push(I(m,m,cw,ih));e.push(Fd(m,m+ih*.46,cw,ih*.54+1,'down'));const ty=m+ih*.72;
  e.push(T(f.head,W/2,ty,{font:'display',size:54,upper:1,maxW:cw-p(140),lh:1.06}));
  e.push(T(f.date,W/2,ty+p(98),{font:'sans',size:21,ls:.3}));
  e.push(T(f.quote,W/2,ty+p(172),{font:'serif',italic:1,size:24,maxW:cw-p(150),lh:1.4,maxLines:3}));
  e.push(T(f.n1,m+cw*.27,H-m-p(64),{font:'script',size:48,fit:cw*.4}));e.push(T(f.n2,m+cw*.73,H-m-p(64),{font:'script',size:48,fit:cw*.4}));return e}},
{id:'polaroid',cat:'wedding',n:'Polaroid kỷ niệm',best:'Story',b({W,H,m,p,f}){
  const e=[];e.push(T(f.script,W/2,m+p(112),{font:'script',size:108,color:'accent',fit:W-2*m}));
  e.push(T(`${f.n1}  ·  ${f.n2}`,W/2,m+p(210),{font:'sans',size:21,upper:1,ls:.32}));
  const top=m+p(300),bot=H-m-p(96),av=bot-top,pw=W*.5,pad=pw*.055,iw=pw-2*pad,n=clamp(Math.round(av/(iw*.78)),2,7),rowH=av/n,ih=Math.min(iw*.92,rowH*1.12);
  for(let i=0;i<n;i++){const cx=i%2?W*.615:W*.385,cy=top+(i+.5)*rowH-pad;e.push(I(cx-iw/2,cy-ih/2,iw,ih,{rot:(i%2?1:-1)*(3+i%3*1.4)*DEG,frame:pad,bleed:1}))}
  e.push(T(f.date,W/2,H-m-p(42),{font:'serif',italic:1,size:28}));return e}},
];
