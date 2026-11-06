const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const cp = require('node:child_process');
const read = path => fs.readFileSync(path, 'utf8');
const baseline = path => cp.execFileSync('git', ['show', `c40a20f:${path}`], {encoding:'utf8'});
const app = read('assets/js/app.js');
const oldApp = baseline('assets/js/app.js');
const fit = source => source.slice(source.indexOf('function fitStage()'), source.indexOf('\nfunction draw('));
const dims = source => source.slice(source.indexOf('function exportDims()'), source.indexOf('\nlet lastFile='));
function context(engine, data, userAgent, stored) {
  let saved;
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, {style:{},dataset:{mode:'full'},innerHTML:'',querySelectorAll:()=>[],getBoundingClientRect:()=>({width:390,height:420})});
    return nodes.get(id);
  };
  const c = vm.createContext({assert, console, navigator:{userAgent}, window:{devicePixelRatio:3},
    document:{querySelector:s=>['#cust','#cw'].includes(s)?null:node(s)},
    localStorage:{getItem:()=>JSON.stringify(stored),setItem:(k,v)=>saved=JSON.parse(v)}});
  vm.runInContext(data+'\n'+engine.split('/* ===== Ảnh mẫu')[0], c);
  vm.runInContext(`const cv=$('#cv'),dev=$('#device'),stage=$('#stage');let cssW=0,cssH=0,dpr=1;const draw=()=>{};`,c);
  return {c,node,saved:()=>saved};
}
const settings={mock:true,tpl:'dump',size:'custom',custW:71,custH:123,texts:{birthday:{n1:'NGUYỄN BẢO ANH'}},pal:'party',gap:21,filter:'film',seen:true};
let checks=0;
for(const userAgent of ['Desktop','iPhone']) {
  const old=context(baseline('assets/js/engine.js'),baseline('assets/js/data.js'),userAgent,{...settings,mock:false});
  vm.runInContext(fit(oldApp)+'\n'+dims(oldApp),old.c);
  for(const mock of [true,false]) {
    const current=context(read('assets/js/engine.js'),read('assets/js/data.js'),userAgent,{...settings,mock});
    vm.runInContext(fit(app)+'\n'+dims(app),current.c);
    vm.runInContext('assert.equal("mock" in S,false);save()', current.c);
    const {mock:unused,...expected}=settings;
    for(const [key,value] of Object.entries(expected))assert.deepEqual(current.saved()[key],value);
    assert.equal('mock' in current.saved(),false);
    const sizes=vm.runInContext('Object.keys(SIZES)',current.c);
    for(const size of sizes) {
      for(const [width,height] of [[390,420],[1440,800],[320,160]]) {
        for(const target of [old,current]) {
          target.node('#stage').getBoundingClientRect=()=>({width,height});
          vm.runInContext(`S.size=${JSON.stringify(size)};fitStage()`,target.c);
        }
        for(const expr of ['cssW','cssH','dpr','cv.width','cv.height','dev.style.top','dev.style.width','dev.style.height'])
          assert.equal(vm.runInContext(expr,current.c),vm.runInContext(expr,old.c),`${size}: ${expr}`);
        checks++;
      }
      for(const dpi of [100,150,200,300])for(const mult of [1,2]) {
        const expression=`S.dpi=${dpi};S.mult=${mult};JSON.stringify(exportDims())`;
        assert.equal(vm.runInContext(expression,current.c),vm.runInContext(expression,old.c));checks++;
      }
    }
    vm.runInContext(`const visibleTpls=()=>[],tplById=()=>({cat:'daily',land:true});let tab='size';const sheet=$('#sheet');let mobile=false;const mob=()=>mobile;`,current.c);
    vm.runInContext(app.slice(app.indexOf('function renderPanel()'),app.indexOf('\nfunction syncZoom()')),current.c);
    for(const mobile of [true,false])for(const mode of ['peek','full']) {
      vm.runInContext(`mobile=${mobile};sheet.dataset.mode='${mode}';renderPanel()`,current.c);
      const html=current.node('#panel').innerHTML;
      assert.doesNotMatch(html,/mock/i);
      for(const size of sizes.filter(k=>k!=='custom'||!mobile||mode==='full'))assert.ok(html.includes(`data-s="${size}"`));
      if(!mobile||mode==='full')assert.ok(html.includes('id="cw"')&&html.includes('id="ch"'));
      checks++;
    }
  }
}
for(const path of ['assets/js/app.js','assets/css/app.css','index.html'])assert.doesNotMatch(read(path),/mock|class="(?:feet|legs)"/i);
// Export and editor rendering must remain byte-for-byte unchanged.
assert.equal(app.slice(app.indexOf('function exportDims()')),oldApp.slice(oldApp.indexOf('function exportDims()')));
assert.equal(read('assets/js/engine.js').split('/* ===== Ảnh mẫu')[1],baseline('assets/js/engine.js').split('/* ===== Ảnh mẫu')[1]);
console.log(`PASS: ${checks} regression scenarios; legacy settings preserved; export/rendering unchanged.`);
