import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const input=process.env.MAKEFUN_INPUT_DIR||'/input',output=process.env.MAKEFUN_OUTPUT_DIR||'/output';
const letters='udlr',op=[1,0,3,2],limit=250000;
function solve(text){
 const rows=text.replace(/\r/g,'').trimEnd().split('\n'),w=Math.max(...rows.map(r=>r.length)),n=w*rows.length;
 const floor=new Uint8Array(n),goals=new Set(),boxes=new Set();let player=-1;
 for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++){
  let c=rows[y][x],p=y*w+x;if(c==='#')continue;floor[p]=1;
  if('.+*'.includes(c))goals.add(p);if('$*'.includes(c))boxes.add(p);if('@+'.includes(c))player=p;
 }
 if(player<0)return '';
 const delta=[-w,w,-1,1];
 const neighbor=(p,d)=>{const t=p+delta[d];return t>=0&&t<n&&floor[t]&&(d<2||Math.floor(t/w)===Math.floor(p/w))?t:-1};
 function walk(start,target){
  if(start===target)return '';
  const prev=new Int32Array(n).fill(-1),step=new Int8Array(n),queue=[start];prev[start]=start;
  for(let head=0;head<queue.length;head++){
   const p=queue[head];for(let d=0;d<4;d++){
    const t=neighbor(p,d);if(t<0||boxes.has(t)||prev[t]!==-1)continue;
    prev[t]=p;step[t]=d;if(t===target){let a=[];for(let z=t;z!==start;z=prev[z])a.push(letters[step[z]]);return a.reverse().join('')};queue.push(t);
   }
  }return null;
 }
 const hall=Math.floor(player/w),seen=new Uint8Array(n),rooms=[];
 for(let p=0;p<n;p++)if(floor[p]&&Math.floor(p/w)!==hall&&!seen[p]){
  const cells=[p];seen[p]=1;
  for(let h=0;h<cells.length;h++)for(let d=0;d<4;d++){
   const t=neighbor(cells[h],d);if(t>=0&&Math.floor(t/w)!==hall&&!seen[t]){seen[t]=1;cells.push(t)}
  }
  if(cells.some(z=>boxes.has(z)))rooms.push(cells.sort((a,b)=>a-b));
 }
 let answer='';
 for(const cells of rooms){
  const members=new Set(cells),doors=[];
  for(const p of cells)for(let d=0;d<4;d++){const t=neighbor(p,d);if(t>=0&&Math.floor(t/w)===hall)doors.push(t)}
  if(!doors.length)return '';const door=Math.min(...doors),route=walk(player,door);if(route===null)return '';
  answer+=route;player=door;
  const global=[...cells,door],index=new Map(global.map((p,i)=>[p,i])),size=global.length,doorId=size-1;
  const adj=global.map(p=>delta.map((_,d)=>index.get(neighbor(p,d))??-1));
  const target=new Set(cells.filter(p=>goals.has(p)).map(p=>index.get(p)));
  const startBoxes=cells.filter(p=>boxes.has(p)).map(p=>index.get(p));
  const good=new Uint8Array(size),reverse=[...target];for(const g of reverse)good[g]=1;
  for(let h=0;h<reverse.length;h++)for(let d=0;d<4;d++){
   const b=adj[reverse[h]][op[d]],stand=b<0?-1:adj[b][op[d]];
   if(b>=0&&b!==doorId&&stand>=0&&!good[b]){good[b]=1;reverse.push(b)}
  }
  function region(bs,start){
   const occupied=new Uint8Array(size);for(const b of bs)occupied[b]=1;
   const reach=new Uint8Array(size),q=[start];reach[start]=1;let min=start;
   for(let h=0;h<q.length;h++)for(const t of adj[q[h]])if(t>=0&&!occupied[t]&&!reach[t]){reach[t]=1;q.push(t);if(t<min)min=t}
   return {occupied,reach,min};
  }
  const key=(bs,m)=>String.fromCharCode(...bs,m);
  const first=region(startBoxes,doorId),visited=new Set([key(startBoxes,first.min)]);
  const states=[{b:startBoxes,p:doorId,parent:-1,from:-1,d:0}];let found=-1;
  for(let head=0;head<states.length&&states.length<=limit;head++){
   const s=states[head];if(s.b.every(b=>target.has(b))){found=head;break}
   const cur=region(s.b,s.p);
   for(let bi=0;bi<s.b.length;bi++)for(let d=0;d<4;d++){
    const b=s.b[bi],to=adj[b][d],behind=adj[b][op[d]];
    if(to<0||to===doorId||behind<0||!cur.reach[behind]||cur.occupied[to]||!good[to])continue;
    const bs=s.b.slice();bs[bi]=to;bs.sort((a,b)=>a-b);
    const r=region(bs,b),k=key(bs,r.min);if(visited.has(k))continue;
    visited.add(k);states.push({b:bs,p:b,parent:head,from:b,d});
   }
  }
  if(found<0)return '';
  const plan=[];for(let at=found;states[at].parent>=0;at=states[at].parent)plan.push(states[at]);plan.reverse();
  for(const s of plan){
   const from=global[s.from],behind=neighbor(from,op[s.d]),to=neighbor(from,s.d),r=walk(player,behind);
   if(r===null||!boxes.has(from)||to<0||boxes.has(to)||!members.has(to))return '';
   answer+=r+letters[s.d];boxes.delete(from);boxes.add(to);player=from;
  }
 }
 return [...boxes].every(b=>goals.has(b))?answer:'';
}
for(const id of readdirSync(input).sort()){
 let moves='';try{moves=solve(readFileSync(join(input,id,'level.txt'),'utf8'))}catch{}
 mkdirSync(join(output,id),{recursive:true});writeFileSync(join(output,id,'solution.txt'),moves+'\n');
}
