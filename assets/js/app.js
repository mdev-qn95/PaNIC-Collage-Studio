'use strict';

/* iOS Safari bỏ qua user-scalable=no: chặn phóng to cả trang khi chụm tay hoặc chạm hai lần (ảnh trong khung vẫn chụm để zoom như cũ) */
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
document.addEventListener('dblclick',e=>{if(!e.target.closest('input,textarea,[contenteditable]'))e.preventDefault()},{passive:false});
/* ===== Sân khấu xem trước ===== */
const cv=$('#cv'),dev=$('#device'),stage=$('#stage');let cssW=0,cssH=0,dpr=1,raf=0,tab='tpl',uploadTarget=null,pid=1;
function fitStage(){
  const r=stage.getBoundingClientRect(),ar=ratio();
  const top=14,bot=14,side=14;
  const sbH=0;let h=r.height-top-bot-sbH,w=h/ar;if(w>r.width-2*side){w=r.width-2*side;h=w*ar}
  w=Math.max(40,w);h=Math.max(40,h);cssW=w;cssH=h;
  dev.style.width=w+'px';dev.style.height=h+'px';dev.style.top=(top+(r.height-top-bot-sbH)/2)+'px';
  dpr=Math.min(2.5,window.devicePixelRatio||1);cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);
  const z=sz();$('#szlabel').textContent=z.n;$('#szsub').textContent=z.sub;draw(true);
}
function draw(now){cancelAnimationFrame(raf);if(now===true)doDraw();else raf=requestAnimationFrame(doDraw)}
function doDraw(){lastSlots=render(cv.getContext('2d'),cssW,cssH,{preview:1,sel,dpr});syncSlotbar()}
new ResizeObserver(()=>fitStage()).observe(stage);

/* ===== Chạm, kéo, zoom trên ảnh ===== */
const ptrs=new Map();let drag=null,pinch=null;
const toD=ev=>{const r=cv.getBoundingClientRect();return{x:(ev.clientX-r.left)/r.width*1000,y:(ev.clientY-r.top)/r.width*1000}};
function hit(pt){for(let i=lastSlots.length-1;i>=0;i--){const e=lastSlots[i],cx=e.x+e.w/2,cy=e.y+e.h/2,a=-(e.rot||0),dx=pt.x-cx,dy=pt.y-cy,
  lx=dx*Math.cos(a)-dy*Math.sin(a),ly=dx*Math.sin(a)+dy*Math.cos(a);if(Math.abs(lx)<=e.w/2&&Math.abs(ly)<=e.h/2)return i}return null}
const ens=i=>slotState[i]||(slotState[i]={pid:null,z:1,ox:0,oy:0});
cv.addEventListener('pointerdown',ev=>{if(document.body.classList.contains('focus'))return;cv.setPointerCapture(ev.pointerId);ptrs.set(ev.pointerId,ev);
  if(ptrs.size===1){const pt=toD(ev),h=hit(pt);drag={h,idx:h==null?null:lastSlots[h]._i,last:pt,start:pt,moved:false}}
  else if(ptrs.size===2&&sel!=null){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z:ens(sel).z};drag=null}});
cv.addEventListener('pointermove',ev=>{if(!ptrs.has(ev.pointerId))return;ptrs.set(ev.pointerId,ev);
  if(pinch&&ptrs.size===2){const[a,b]=[...ptrs.values()],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);ens(sel).z=clamp(pinch.z*d/pinch.d,1,4);syncZoom();draw();return}
  if(!drag||drag.h==null)return;const pt=toD(ev);
  if(!drag.moved&&Math.hypot(pt.x-drag.start.x,pt.y-drag.start.y)<8)return;
  drag.moved=true;if(drag.idx!==sel)return;
  const e=lastSlots[drag.h],tpl=tplById(S.tpl),src=resolveSrc(drag.idx,tpl);if(!e||!src)return;const st=ens(drag.idx);
  let dx=pt.x-drag.last.x,dy=pt.y-drag.last.y;const a=-(e.rot||0);[dx,dy]=[dx*Math.cos(a)-dy*Math.sin(a),dx*Math.sin(a)+dy*Math.cos(a)];
  const G=coverGeom(e,src,st);if(G.ex>.5)st.ox=clamp(st.ox+2*dx/G.ex,-1,1);if(G.ey>.5)st.oy=clamp(st.oy+2*dy/G.ey,-1,1);drag.last=pt;draw()});
const endP=ev=>{if(!ptrs.has(ev.pointerId))return;ptrs.delete(ev.pointerId);if(ptrs.size<2)pinch=null;
  if(drag&&!drag.moved&&ptrs.size===0){if(drag.idx==null)sel=null;else{sel=drag.idx;if(!photos.length&&!S.demo){uploadTarget=sel;$('#file').click()}}hideHint();draw();if(tab==='photo')renderPanel()}
  if(ptrs.size===0)drag=null};
cv.addEventListener('pointerup',endP);cv.addEventListener('pointercancel',endP);

/* ===== Nạp ảnh ===== */
$('#file').addEventListener('change',async ev=>{
  const files=[...ev.target.files];ev.target.value='';if(!files.length)return;toast('Đang nạp ảnh…');const added=[];
  for(const f of files){try{added.push(await loadPhoto(f))}catch(e){}}
  photos.push(...added);if(uploadTarget!=null&&added[0])Object.assign(ens(uploadTarget),{pid:added[0].id,z:1,ox:0,oy:0});
  uploadTarget=null;toast(added.length?`Đã thêm ${added.length} ảnh ✦`:'Không đọc được ảnh này');draw();refreshThumbs();if(tab==='photo')renderPanel()});
function loadPhoto(file){return new Promise((res,rej)=>{const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{const MAX=isIOS?2400:3600,k=Math.min(1,MAX/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');
    c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const t=document.createElement('canvas'),tk=180/Math.min(c.width,c.height);t.width=Math.round(c.width*tk);t.height=Math.round(c.height*tk);t.getContext('2d').drawImage(c,0,0,t.width,t.height);
    URL.revokeObjectURL(url);res({id:pid++,src:c,thumb:t.toDataURL('image/jpeg',.8)})};
  img.onerror=()=>{URL.revokeObjectURL(url);rej()};img.src=url})}

/* ===== Biểu tượng ===== */
const ICO={
 tpl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="10" rx="1"/><rect x="13.5" y="3.5" width="7" height="6" rx="1"/><rect x="13.5" y="12.5" width="7" height="8" rx="1"/><rect x="3.5" y="16.5" width="7" height="4" rx="1"/></svg>',
 photo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/></svg>',
 text:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M5 6.5V5h14v1.5M12 5v14M9.5 19h5"/></svg>',
 color:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.5-1.3-1.6-1.3-3s1-2 2.4-2H17a3.5 3.5 0 0 0 3.5-3.5c0-3.8-3.8-6.8-8.5-6.8z"/><circle cx="7.8" cy="11" r="1.1" fill="currentColor"/><circle cx="10.5" cy="7.5" r="1.1" fill="currentColor"/><circle cx="15" cy="7.8" r="1.1" fill="currentColor"/></svg>',
 size:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="3.5" width="11" height="17" rx="1"/><path d="M3 7v10M21 7v10"/></svg>',
 export:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7.5 8.5 12 4l4.5 4.5M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14"/></svg>',
};
const CAT_ICO={
 daily:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="6" width="14" height="36" rx="2"/><path d="M12 10h8v7h-8zM12 20h8v7h-8zM12 30h8v7h-8z"/><rect x="27" y="12" width="13" height="16" rx="1" transform="rotate(8 33 20)"/></svg>',
 wedding:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="19" cy="28" r="10"/><circle cx="29" cy="28" r="10"/><path d="M24 6l3 5h-6z"/></svg>',
 birthday:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="18" cy="17" rx="8" ry="10"/><ellipse cx="32" cy="15" rx="7" ry="9"/><path d="M18 27c-2 5 3 8 0 15M32 24c2 5-3 9 1 18"/></svg>',
 event:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 15h34v6a3 3 0 0 0 0 6v6H7v-6a3 3 0 0 0 0-6z"/><path d="M30 15v18" stroke-dasharray="2 3"/></svg>',
 travel:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="11" width="34" height="26" rx="2"/><rect x="30" y="15" width="7" height="8"/><path d="M11 20h14M11 26h12M11 31h9"/></svg>',
 grad:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19l20-9 20 9-20 9z"/><path d="M12 23v9c4 4 20 4 24 0v-9M40 21v11"/></svg>',
};

const TABS=[['tpl','Mẫu'],['photo','Ảnh'],['text','Chữ'],['color','Phong cách'],['size','Kích thước'],['export','Xuất']];
$('#tabs').innerHTML=TABS.map(([k,n])=>`<button class="tab" data-t="${k}">${ICO[k]}<span>${n}</span></button>`).join('');
const sheet=$('#sheet'),mob=()=>innerWidth<900,PEEK={tpl:232,photo:150,color:226,size:150,export:164};
function sheetH(m){if(m==='closed')return 0;const max=Math.round(innerHeight*(m==='peek'?.42:.62)),P=$('#panel');if(!P||sheet.dataset.mode!==m)return m==='peek'?(PEEK[tab]||200):max;const top=P.getBoundingClientRect().top;let b=0;for(const el of P.children)b=Math.max(b,el.getBoundingClientRect().bottom);return Math.min(max,Math.round(grip.offsetHeight+b-top+P.scrollTop+20))}
function setMode(m,keep){if(!mob())m='full';sheet.dataset.mode=m;renderPanel();sheet.style.setProperty('--dh',sheetH(m)+'px');syncTabs();syncSlotbar();if(!keep)$('#panel').scrollTop=0}
$('#tabs').addEventListener('click',ev=>{const b=ev.target.closest('.tab');if(!b)return;const k=b.dataset.t;
  if(mob()&&k===tab&&sheet.dataset.mode!=='closed'){setMode('closed');return}tab=k;setMode(mob()&&PEEK[k]?'peek':'full')});
function openTab(k,keep){tab=k;setMode(mob()&&PEEK[k]?'peek':'full',keep)}
function syncTabs(){const closed=sheet.dataset.mode==='closed';document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.t===tab&&!closed))}
/* kéo tay nắm để đổi chiều cao ngăn kéo */
let gd=null;const grip=$('#grip');
grip.addEventListener('pointerdown',e=>{if(!mob())return;gd={y:e.clientY,h:sheet.getBoundingClientRect().height,moved:false};sheet.classList.add('drag');grip.setPointerCapture(e.pointerId)});
grip.addEventListener('pointermove',e=>{if(!gd)return;const dy=e.clientY-gd.y;if(Math.abs(dy)>5)gd.moved=true;if(gd.moved)sheet.style.setProperty('--dh',clamp(gd.h-dy,0,innerHeight*.82)+'px')});
const gEnd=()=>{if(!gd)return;sheet.classList.remove('drag');const h=sheet.getBoundingClientRect().height,cur=sheet.dataset.mode;
  if(!gd.moved)setMode(cur==='full'&&PEEK[tab]?'peek':'full',true);
  else{const pk=PEEK[tab]?sheetH('peek'):0,fl=sheetH('full');setMode(h<(pk||fl)*.5?'closed':pk&&h<(pk+fl)/2?'peek':'full',true)}gd=null};
grip.addEventListener('pointerup',gEnd);grip.addEventListener('pointercancel',gEnd);
/* thanh công cụ khung ảnh nổi trên sân khấu */
function sbVis(){return sel!=null&&!document.body.classList.contains('focus')&&!(mob()&&sheet.dataset.mode==='full')}
let sbWas=false;
function syncSlotbar(){const bar=$('#slotbar'),v=sel!=null&&!document.body.classList.contains('focus');bar.classList.toggle('show',v);document.body.classList.toggle('has-sel',v);if(sel!=null){const z=$('#sbZoom'),v=(slotState[sel]||{}).z||1;if(+z.value!==v)z.value=v;0}}
$('#sbZoom').oninput=e=>{if(sel==null)return;ens(sel).z=+e.target.value;syncZoom();draw()};
$('#sbRep').onclick=()=>{if(sel==null)return;if(photos.length){tab='photo';setMode(mob()?'peek':'full')}else{uploadTarget=sel;$('#file').click()}};
$('#sbCtr').onclick=()=>{if(sel==null)return;Object.assign(ens(sel),{z:1,ox:0,oy:0});draw()};
$('#sbX').onclick=()=>{sel=null;draw();if(tab==='photo')renderPanel()};
/* xem toàn màn hình */
$('#btnFocus').onclick=()=>{document.body.classList.add('focus');sel=null;fitStage();showTplName(true)};
$('#focusX').onclick=()=>{document.body.classList.remove('focus');fitStage()};
$('#szbtn').onclick=()=>openTab('size');
let hintT=0;function hideHint(){$('#hint').classList.remove('show')}
const isLand=()=>ratio()<.95;

function visibleTpls(){let list=TPL.filter(t=>S.cat==='all'||t.cat===S.cat);if(isLand())list=list.filter(t=>t.land);return list}
function selectTpl(id){const t=tplById(id);S.tpl=id;sel=null;if(t.pal&&!S.cbg&&!S.ctext&&!S.caccent&&S.pal!==t.pal){S.pal=t.pal;toast(`Đã áp dụng bảng màu gợi ý “${PALS[t.pal].n}”`)}save();draw();refreshThumbs()}

/* ===== Bảng điều khiển ===== */
function renderPanel(){
  const P=$('#panel'),tpl=tplById(S.tpl),cat=CATS.find(c=>c.id===tpl.cat),peek=mob()&&sheet.dataset.mode==='peek';
  const T0={tpl:['Mẫu ghép',`${visibleTpls().length} bố cục`],photo:['Ảnh của bạn',photos.length?`${photos.length} ảnh`:'đang dùng ảnh mẫu'],text:['Nội dung chữ',cat?cat.n:''],color:['Phong cách','màu · bộ lọc · font'],size:['Kích thước','mạng xã hội & in ấn'],export:['Xuất ảnh','tải về hoặc chia sẻ']}[tab];
  $('#ptitle').textContent=T0[0];$('#psub').textContent=T0[1];
  if(tab==='tpl'){
    const list=visibleTpls(),cats=`<div class="cats">${CATS.map(c=>`<button class="chip${c.id===S.cat?' on':''}" data-c="${c.id}">${c.n}</button>`).join('')}</div>`;
    P.innerHTML=peek
      ?cats+`<div class="hstrip">${list.map(t=>`<button class="tcard sm${t.id===S.tpl?' on':''}" data-id="${t.id}"><div class="tthumb"><canvas></canvas></div><b>${t.n}</b></button>`).join('')}</div>`
      :cats+(isLand()?'<p class="note" style="margin:0 0 12px">Khổ ngang — đang hiện các mẫu hợp với ảnh ngang.</p>':'')+
       `<div class="tgrid">${list.map(t=>`<button class="tcard${t.id===S.tpl?' on':''}" data-id="${t.id}"><div class="tthumb"><span class="badge">${CATS.find(c=>c.id===t.cat).n}</span><canvas></canvas></div><b>${t.n}</b><small>${t.best||''}</small></button>`).join('')}</div>`;
    P.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.cat=b.dataset.c;save();renderPanel()});
    P.querySelectorAll('.tcard').forEach(b=>b.onclick=()=>{P.querySelectorAll('.tcard').forEach(x=>x.classList.toggle('on',x===b));selectTpl(b.dataset.id)});
    const on=P.querySelector('.tcard.on');if(peek&&on)on.scrollIntoView({inline:'center',block:'nearest'});
    refreshThumbs(true);
  }
  else if(tab==='photo'){
    const s=sel!=null?ens(sel):null,cur=sel!=null?(s.pid||(photos.length?photos[sel%photos.length].id:null)):null;
    const lib=photos.map(q=>`<div class="ph${q.id===cur?' pick':''}" data-id="${q.id}"><img src="${q.thumb}" alt=""><button class="x" data-del="${q.id}" aria-label="Xoá">×</button></div>`).join('');
    if(peek){
      P.innerHTML=`<div class="hstrip phs"><button class="addph" id="upAll"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg><span>Thêm ảnh</span></button>${lib}
        <div class="pnote">${sel!=null?(photos.length?'Chạm một ảnh để đặt vào khung đang chọn':'Thêm ảnh để thay vào khung đang chọn'):(photos.length?'Chạm khung trong thiết kế để chọn · kéo để căn':'Chọn nhiều ảnh cùng lúc — ảnh tự xếp vào các khung')}</div></div>`;
    }else{
      P.innerHTML=`<button class="upl" id="upAll"><span class="pl">${ICO.photo}</span><span><b>Chọn ảnh từ máy</b><small>Chọn nhiều ảnh cùng lúc — tự xếp vào khung</small></span></button>
       <p class="note" style="margin:14px 0">✦ Chạm một khung trong thiết kế để chọn — thanh công cụ hiện ngay trên ảnh để thay, phóng to, căn giữa. Kéo để căn chỉnh, 2 ngón để zoom.</p>
       <div class="lib">${lib}</div>
       ${photos.length?`<div class="chips" style="margin-top:14px"><button class="chip" id="shuf">✧ Xáo trộn</button><button class="chip" id="auto">Xếp lại theo thứ tự</button><button class="chip" id="clr">Xoá tất cả</button></div>`:''}
       <div class="toggle" style="margin-top:8px"><span>Hiện ảnh mẫu ở khung trống</span><button class="sw2${S.demo?' on':''}" id="demo" aria-label="Ảnh mẫu"></button></div>`;
    }
    $('#upAll').onclick=()=>{uploadTarget=sel;$('#file').click()};
    P.querySelectorAll('.ph').forEach(el=>el.onclick=ev=>{const d=ev.target.dataset.del;
      if(d){photos=photos.filter(q=>q.id!=d);Object.values(slotState).forEach(s=>{if(s.pid==d)s.pid=null});renderPanel();draw();refreshThumbs();return}
      if(sel!=null){Object.assign(ens(sel),{pid:+el.dataset.id,z:1,ox:0,oy:0});renderPanel();draw()}else toast('Chạm vào một khung ảnh trước nhé')});
    if($('#shuf')){$('#shuf').onclick=()=>{const ids=photos.map(q=>q.id).sort(()=>Math.random()-.5);slotState={};for(let i=0;i<40;i++)ens(i).pid=ids[i%ids.length];draw();refreshThumbs()};
      $('#auto').onclick=()=>{slotState={};draw();refreshThumbs()};$('#clr').onclick=()=>{photos=[];slotState={};sel=null;renderPanel();draw();refreshThumbs()}}
    if($('#demo'))$('#demo').onclick=()=>{S.demo=!S.demo;save();renderPanel();draw();refreshThumbs()};
  }
  else if(tab==='text'){
    const keys=usedFields(tpl),f=textsFor(tpl.cat,tpl),L={...LABELS._,...(LABELS[tpl.cat]||{})},order=['n1','fn1','n2','fn2','nick','head','script','sub','big','date','place','from','to','tag','l1','l2','mono','quote','caps'];
    const ks=order.filter(k=>keys.includes(k));
    P.innerHTML=(ks.length?ks.map(k=>k==='quote'||k==='caps'?`<label class="field"><span>${L[k]}</span><textarea data-k="${k}" rows="${k==='caps'?2:3}">${esc(S.texts[tpl.cat]?.[k]??f[k])}</textarea></label>`
        :`<label class="field"><span>${L[k]}</span><input data-k="${k}" value="${esc(k==='mono'?(S.texts[tpl.cat]?.mono||''):f[k])}" placeholder="${k==='mono'?esc(f.mono):''}" enterkeyhint="done"></label>`).join(''):'<p class="note">Mẫu này không có chữ — chỉ có ảnh.</p>')+
      `<div class="range" style="margin-top:6px"><span>Cỡ chữ</span><input type="range" id="ts" min=".7" max="1.35" step=".01" value="${S.tscale}"><em id="tsv">${Math.round(S.tscale*100)}%</em></div>
       <button class="chip" id="resetT" style="margin-top:4px">Khôi phục chữ mẫu</button>`;
    P.querySelectorAll('[data-k]').forEach(el=>{el.oninput=()=>{(S.texts[tpl.cat]=S.texts[tpl.cat]||{})[el.dataset.k]=el.value;save();draw();refreshThumbs()};
      if(el.tagName==='INPUT')el.onkeydown=e=>{if(e.key==='Enter')el.blur()}});
    $('#ts').oninput=ev=>{S.tscale=+ev.target.value;$('#tsv').textContent=Math.round(S.tscale*100)+'%';save();draw()};
    $('#resetT').onclick=()=>{delete S.texts[tpl.cat];save();renderPanel();draw();refreshThumbs()};
  }
  else if(tab==='color'){
    const P0=pal(),fsrc=photos[0]?.src||demoFor(tpl)[0];
    const flt=`<div class="filters">${Object.entries(FILTERS).map(([k,v])=>`<button class="flt${k===S.filter?' on':''}" data-fl="${k}"><canvas width="64" height="80"></canvas><span>${v.n}</span></button>`).join('')}</div>`;
    const sws=Object.entries(PALS).map(([k,v])=>`<button class="sw${k===S.pal&&!S.cbg&&!S.ctext&&!S.caccent?' on':''}" data-p="${k}"><i style="background:${v.bg};--t:${v.text};--a:${v.accent}"></i>${v.n}</button>`).join('');
    P.innerHTML=peek?`${flt}<div class="hstrip sws">${sws}<button class="more" data-full>Font, màu<br>& bố cục ›</button></div>`
     :`<div class="sec"><label>Bộ lọc ảnh</label>${flt}
       <div class="toggle"><span>Hạt film</span><button class="sw2${S.grain?' on':''}" id="grain"></button></div>
       <div class="toggle"><span>Dấu ngày kiểu máy film</span><button class="sw2${S.stamp?' on':''}" id="stamp"></button></div></div>
     <div class="sec"><label>Bảng màu</label><div class="swgrid">${sws}</div></div>
     <div class="sec"><label>Tuỳ chỉnh màu</label><div class="colors">
       <label class="cpick"><input type="color" data-cc="cbg" value="${P0.bg}">Nền</label><label class="cpick"><input type="color" data-cc="ctext" value="${P0.text}">Chữ</label><label class="cpick"><input type="color" data-cc="caccent" value="${P0.accent}">Nhấn</label></div></div>
     <div class="sec"><label>Bộ font</label><div class="chips">${Object.entries(FP).map(([k,v])=>`<button class="fp${k===S.fp?' on':''}" data-f="${k}"><span class="s1" style="font-family:'${v.display}';font-weight:${v.dw}">Ngọc Hân</span><span class="s2" style="font-family:'${v.script}'">Love story</span><small>${v.n}</small></button>`).join('')}</div></div>
     <div class="sec"><label>Bố cục</label>
       <div class="range"><span>Khoảng cách ảnh</span><input type="range" data-r="gap" min="0" max="44" step="1" value="${S.gap}"><em>${S.gap}</em></div>
       <div class="range"><span>Lề viền</span><input type="range" data-r="margin" min="16" max="150" step="1" value="${S.margin}"><em>${S.margin}</em></div>
       <div class="range"><span>Bo góc ảnh</span><input type="range" data-r="radius" min="0" max="48" step="1" value="${S.radius}"><em>${S.radius}</em></div></div>
     <button class="bigbtn alt" data-reset>↺ Khôi phục cài đặt mặc định</button>`;
    P.querySelectorAll('[data-fl]').forEach(b=>{const c=b.querySelector('canvas'),x=c.getContext('2d'),s=applyFilter(fsrc,b.dataset.fl),k=Math.max(64/s.width,80/s.height);x.drawImage(s,(64-s.width*k)/2,(80-s.height*k)/2,s.width*k,s.height*k);
      b.onclick=()=>{if(S.filter===b.dataset.fl)return;P.querySelectorAll('[data-fl]').forEach(x=>x.classList.toggle('on',x===b));b.classList.add('wait');requestAnimationFrame(()=>setTimeout(()=>{S.filter=b.dataset.fl;save();draw(true);b.classList.remove('wait')},16))}});
    if($('#grain')){$('#grain').onclick=()=>{S.grain=!S.grain;save();$('#grain').classList.toggle('on',S.grain);draw();refreshThumbs()};
      $('#stamp').onclick=()=>{S.stamp=!S.stamp;save();$('#stamp').classList.toggle('on',S.stamp);draw();refreshThumbs()}}
    P.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{S.pal=b.dataset.p;S.cbg=S.ctext=S.caccent=null;save();P.querySelectorAll('[data-p]').forEach(x=>x.classList.toggle('on',x===b));draw();refreshThumbs()});
    P.querySelectorAll('[data-cc]').forEach(i=>i.oninput=()=>{S[i.dataset.cc]=i.value;save();draw();refreshThumbs()});
    P.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{S.fp=b.dataset.f;save();P.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('on',x===b));draw();refreshThumbs()});
    P.querySelectorAll('[data-r]').forEach(i=>i.oninput=()=>{S[i.dataset.r]=+i.value;i.nextElementSibling.textContent=i.value;save();draw();refreshThumbs()});
  }
  else if(tab==='size'){
    const card=([k,v])=>{const r=v.h/v.w,h=r>=1?Math.min(34,22*r):22*r,w=r>=1?h/r:24;
      return`<button class="szc${k===S.size?' on':''}" data-s="${k}"><span class="ic"><i style="width:${w}px;height:${h}px"></i></span><span><b>${v.n}</b><small>${k==='custom'?`${S.custW} × ${S.custH} cm`:v.sub}</small></span></button>`};
    if(peek)P.innerHTML=`<div class="hstrip">${Object.entries(SIZES).filter(([k])=>k!=='custom').map(card).join('')}<button class="more" data-full>Tuỳ chỉnh<br>kích thước ›</button></div>`;
    else{const groups={};Object.entries(SIZES).forEach(([k,v])=>(groups[v.g]=groups[v.g]||[]).push([k,v]));
      P.innerHTML=Object.entries(groups).map(([g,list])=>`<div class="group-t" style="margin-top:14px">${g}</div><div class="sizes">${list.map(card).join('')}</div>`).join('')+
       `<div class="row2" id="cust" style="${S.size==='custom'?'':'display:none'}"><label class="field"><span>Rộng (cm)</span><input type="number" inputmode="decimal" id="cw" value="${S.custW}"></label><label class="field"><span>Cao (cm)</span><input type="number" inputmode="decimal" id="ch" value="${S.custH}"></label></div>`}
    P.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{S.size=b.dataset.s;if(isLand()&&!tplById(S.tpl).land){const t=visibleTpls()[0];if(t){S.tpl=t.id;toast(`Chuyển sang mẫu “${t.n}” hợp khổ ngang`)}}save();
      P.querySelectorAll('[data-s]').forEach(x=>x.classList.toggle('on',x===b));if($('#cust'))$('#cust').style.display=S.size==='custom'?'':'none';fitStage();refreshThumbs()});
    if($('#cw')){const cu=()=>{S.custW=clamp(+$('#cw').value||60,5,500);S.custH=clamp(+$('#ch').value||90,5,500);save();fitStage();refreshThumbs()};$('#cw').onchange=cu;$('#ch').onchange=cu}
  }
  else if(tab==='export'){
    const z=sz(),d=exportDims(),fmt=`<button class="chip${S.fmt==='image/jpeg'?' on':''}" data-fm="image/jpeg">JPG</button><button class="chip${S.fmt==='image/png'?' on':''}" data-fm="image/png">PNG</button>`;
    const q=z.u==='cm'?[100,150,200,300].map(v=>`<button class="chip${S.dpi===v?' on':''}" data-dpi="${v}">${v} dpi</button>`).join(''):[1,2].map(v=>`<button class="chip${S.mult===v?' on':''}" data-mu="${v}">${v}× ${v===1?'chuẩn':'siêu nét'}</button>`).join('');
    const dims=`<div class="dims"><div><b>${d.w.toLocaleString('vi')} × ${d.h.toLocaleString('vi')}</b><small>pixel${d.eff?` · ≈ ${d.eff} dpi`:''}</small></div><span>✦</span></div>`;
    P.innerHTML=peek?`<div class="xrow">${dims}<button class="bigbtn" id="go">${ICO.export.replace('<svg','<svg width="20" height="20"')} Xuất</button></div><div class="hstrip chipsrow">${fmt}${q}</div>`
     :`<div class="sec"><label>Định dạng</label><div class="chips">${fmt.replace('>JPG<','>JPG · nhẹ, in tốt<').replace('>PNG<','>PNG · không nén<')}</div></div>
     <div class="sec"><label>${z.u==='cm'?'Độ phân giải in':'Độ nét'}</label><div class="chips">${q}</div></div>${dims}
     ${d.capped?`<p class="note">Điện thoại giới hạn kích thước ảnh nên file được tối ưu còn ~${d.eff} dpi — vẫn nét cho bản in lớn nhìn từ xa. Cần nét hơn, hãy mở trang trên máy tính để xuất.</p>`:`<p class="note">${z.u==='cm'?'Ảnh in thường 300 dpi; standee và ảnh cổng 100–150 dpi là đẹp. Gửi file thẳng cho tiệm in.':'Đúng kích thước chuẩn của nền tảng — đăng lên không bị cắt.'}</p>`}
     <button class="bigbtn" id="go">${ICO.export.replace('<svg','<svg width="20" height="20"')} Xuất ảnh ngay</button>`;
    P.querySelectorAll('[data-fm]').forEach(b=>b.onclick=()=>{S.fmt=b.dataset.fm;save();renderPanel()});
    P.querySelectorAll('[data-dpi]').forEach(b=>b.onclick=()=>{S.dpi=+b.dataset.dpi;save();renderPanel()});
    P.querySelectorAll('[data-mu]').forEach(b=>b.onclick=()=>{S.mult=+b.dataset.mu;save();renderPanel()});
    $('#go').onclick=doExport;
  }
  P.querySelectorAll('[data-full]').forEach(b=>b.onclick=()=>setMode('full'));
  P.querySelectorAll('[data-reset]').forEach(b=>b.onclick=askReset);
}
function syncZoom(){const z=$('#zoom');if(z&&sel!=null){z.value=ens(sel).z;$('#zv').textContent=ens(sel).z.toFixed(1)+'×'}}

let thT=0,thJob=0;
function refreshThumbs(now){clearTimeout(thT);thT=setTimeout(()=>{if(tab!=='tpl')return;const job=++thJob,cards=[...document.querySelectorAll('.tcard')],ar=ratio(),d=Math.min(2,devicePixelRatio||1);let i=0;
  const step=()=>{if(job!==thJob)return;const t0=performance.now();
    while(i<cards.length&&performance.now()-t0<24){const c=cards[i++],cnv=c.querySelector('canvas'),box=c.querySelector('.tthumb'),pad=c.classList.contains('sm')?9:13,
      bw=Math.max(20,box.clientWidth-2*pad),bh=Math.max(20,box.clientHeight-2*pad);
      let h=bh,w=h/ar;if(w>bw){w=bw;h=w*ar}w=Math.round(w);h=Math.round(h);
      if(cnv.width!==Math.round(w*d)||cnv.height!==Math.round(h*d)){cnv.width=Math.round(w*d);cnv.height=Math.round(h*d)}cnv.style.width=w+'px';cnv.style.height=h+'px';
      render(cnv.getContext('2d'),w,h,{dpr:d,tpl:c.dataset.id})}
    if(i<cards.length)requestAnimationFrame(step)};step()},now===true?0:180)}

/* ===== Xuất ảnh ===== */
function exportDims(){const z=sz();let w,h;if(z.u==='cm'){w=z.w/2.54*S.dpi;h=z.h/2.54*S.dpi}else{w=z.w*S.mult;h=z.h*S.mult}
  const cap=isIOS?16e6:64e6;let k=1;if(w*h>cap)k=Math.sqrt(cap/(w*h));k=Math.min(k,16000/Math.max(w,h));
  return{w:Math.round(w*k),h:Math.round(h*k),capped:k<1,eff:z.u==='cm'?Math.round(S.dpi*Math.min(1,k)):null}}
let lastFile=null,lastURL=null;
async function doExport(){
  $('#busytxt').textContent='Đang xuất ảnh chất lượng cao…';$('#busy').classList.add('show');await new Promise(r=>setTimeout(r,60));
  try{await document.fonts.ready;const d=exportDims(),c=document.createElement('canvas');c.width=d.w;c.height=d.h;render(c.getContext('2d'),d.w,d.h,{});
    const blob=await new Promise(r=>c.toBlob(r,S.fmt,.94));c.width=c.height=1;if(!blob)throw 0;
    const ext=S.fmt==='image/png'?'png':'jpg',nm=`PaNIC-Collage-${S.tpl}-${new Date().toISOString().slice(0,10)}.${ext}`;
    lastFile=new File([blob],nm,{type:S.fmt});if(lastURL)URL.revokeObjectURL(lastURL);lastURL=URL.createObjectURL(blob);
    const canShare=!!(navigator.canShare&&navigator.canShare({files:[lastFile]}));
    $('#mbox').innerHTML=`<h3>Ảnh đã sẵn sàng ✦</h3><p>${d.w} × ${d.h} px · ${(blob.size/1048576).toFixed(1)} MB · ${ext.toUpperCase()}</p><div class="mprev"><img src="${lastURL}" alt=""></div>
      ${canShare?'<button class="bigbtn" id="shr">Lưu vào Ảnh / Chia sẻ</button>':''}<a class="bigbtn ${canShare?'alt':''}" href="${lastURL}" download="${nm}">Tải file về máy</a><button class="bigbtn ghost" id="cls">Đóng</button>`;
    $('#modal').classList.add('show');
    if(canShare)$('#shr').onclick=()=>navigator.share({files:[lastFile],title:'PaNIC Collage'}).catch(()=>{});
    $('#cls').onclick=()=>$('#modal').classList.remove('show');
  }catch(e){toast('Ảnh quá lớn với thiết bị này — thử giảm dpi nhé')}
  $('#busy').classList.remove('show');
}

/* ===== Chào mừng: chọn dịp ===== */
function welcome(){
  $('#mbox').innerHTML=`<div class="wel"><small>PaNIC Collage Studio</small><h3>Hôm nay bạn muốn ghép ảnh cho dịp gì?</h3>
    <div class="occ">${CATS.filter(c=>c.id!=='all').map(c=>`<button data-o="${c.id}" style="--c1:${c.c[0]};--c2:${c.c[1]};--c3:${c.c[2]}"><span class="oi">${CAT_ICO[c.id]}</span><b>${c.n}</b><small>${c.sub}</small></button>`).join('')}</div>
    <button class="bigbtn ghost" id="skip">Xem tất cả mẫu</button><button class="linkbtn" data-reset>↺ Khôi phục cài đặt mặc định</button></div>`;
  $('#modal').classList.add('show');
  $('#mbox').querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const c=CATS.find(x=>x.id===b.dataset.o),t=TPL.find(x=>x.cat===c.id);
    S.cat=c.id;S.size=c.size;S.seen=true;if(t)S.tpl=t.id;S.pal={daily:'linen',wedding:'ivory',birthday:'party',event:'linen',travel:'sky',grad:'navy'}[c.id]||S.pal;S.cbg=S.ctext=S.caccent=null;
    save();$('#modal').classList.remove('show');fitStage();openTab('tpl')});
  $('#mbox').querySelector('[data-reset]').onclick=askReset;
  $('#skip').onclick=()=>{S.cat='all';S.seen=true;save();$('#modal').classList.remove('show');openTab('tpl')};
}

$('#modal').addEventListener('click',e=>{if(e.target.id==='modal'){$('#modal').classList.remove('show');if(!S.seen){S.seen=true;save()}}});
$('#btnExport').onclick=()=>openTab('export');
$('#brand').onclick=welcome;
let tT=0;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),2200)}

/* ===== Khởi động ===== */
const FL=['400 40px "Cormorant Garamond"','500 40px "Cormorant Garamond"','italic 400 40px "Cormorant Garamond"','300 40px "Noto Serif Display"','italic 300 40px "Noto Serif Display"',
  '400 40px "Playfair Display"','italic 400 40px "Playfair Display"','400 40px "Great Vibes"','500 40px "Dancing Script"','300 40px "Montserrat"','500 40px "Montserrat"',
  '400 40px "Lora"','italic 400 40px "Lora"','400 40px "Anton"','400 40px "Patrick Hand"','500 40px "Be Vietnam Pro"'];
Promise.allSettled(FL.map(f=>document.fonts.load(f,'AaĐđẤấỡễ&0123'))).then(()=>{draw();refreshThumbs()});
if(document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>{draw();refreshThumbs()});
if(!TPL.some(t=>t.id===S.tpl))S.tpl=TPL[0].id;
openTab('tpl');fitStage();
if(mob()){$('#hint').classList.add('show');hintT=setTimeout(hideHint,5000)}
if(!S.seen&&!/[?&]noWelcome/.test(location.search))welcome();
addEventListener('resize',()=>{if(!gd)sheet.style.setProperty('--dh',sheetH(mob()?sheet.dataset.mode:'full')+'px');syncTabs();refreshThumbs()});

/* ===== Khôi phục mặc định ===== */
function askReset(){
  $('#mbox').innerHTML=`<h3>Khôi phục mặc định?</h3><p>Trang sẽ trở về như lần đầu truy cập: mẫu, bảng màu, font, kích thước, bộ lọc, chữ đã sửa và ảnh đã thêm đều được xoá.</p>
    <button class="bigbtn danger" id="rsY">↺ Khôi phục</button><button class="bigbtn ghost" id="rsN">Huỷ</button>`;
  $('#modal').classList.add('show');
  $('#rsN').onclick=()=>$('#modal').classList.remove('show');
  $('#rsY').onclick=()=>{try{localStorage.removeItem(STORE)}catch(e){}location.replace(location.pathname)};
}

/* ===== Vuốt trái/phải để đổi mẫu ===== */
const tplName=$('#tplname');let tnT=0,sw=null,swiping=false;
function showTplName(hint){const list=visibleTpls(),i=list.findIndex(t=>t.id===S.tpl),t=tplById(S.tpl);
  tplName.innerHTML=`<b>${t.n}</b><span>${i+1} / ${list.length}${hint?' · vuốt để đổi mẫu':''}</span>`;tplName.classList.add('show');clearTimeout(tnT);tnT=setTimeout(()=>tplName.classList.remove('show'),hint?2600:1500)}
function swipeTpl(dir){if(swiping)return;const list=visibleTpls();if(list.length<2)return;let i=list.findIndex(t=>t.id===S.tpl);if(i<0)i=0;
  const next=list[(i+dir+list.length)%list.length],base='translate(-50%,-50%)';swiping=true;
  const out=dev.animate([{transform:base,opacity:1},{transform:`${base} translateX(${-dir*70}px)`,opacity:0}],{duration:150,easing:'ease-in'});
  out.onfinish=()=>{selectTpl(next.id);document.querySelectorAll('.tcard').forEach(x=>x.classList.toggle('on',x.dataset.id===next.id));
    const on=document.querySelector('.tcard.on');if(on)on.scrollIntoView({inline:'center',block:'nearest'});showTplName();
    dev.animate([{transform:`${base} translateX(${dir*70}px)`,opacity:0},{transform:base,opacity:1}],{duration:240,easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish=()=>{swiping=false}}}
stage.addEventListener('pointerdown',e=>{if(e.target.closest('.slotbar,.focusx,.navbtn'))return;
  if(!document.body.classList.contains('focus')&&e.target===cv&&sel!=null){const h=hit(toD(e));if(h!=null&&lastSlots[h]._i===sel)return}sw={x:e.clientX,y:e.clientY,id:e.pointerId}});
stage.addEventListener('pointerup',e=>{if(!sw||e.pointerId!==sw.id)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;sw=null;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)swipeTpl(dx<0?1:-1)});
stage.addEventListener('pointercancel',()=>{sw=null});
$('#navPrev').onclick=()=>swipeTpl(-1);$('#navNext').onclick=()=>swipeTpl(1);
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(document.activeElement?.tagName)||$('#modal').classList.contains('show'))return;
  if(e.key==='ArrowRight')swipeTpl(1);else if(e.key==='ArrowLeft')swipeTpl(-1);else if(e.key==='Escape'&&document.body.classList.contains('focus'))$('#focusX').click()});
