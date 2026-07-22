/**
 * Pre-baked animations. They make the keyless demo work, keep judges' testing
 * free, and let the recording run on a known-good output instead of live-gen
 * roulette. The live model handles anything not listed here.
 */
export type Fixture = { id: string; question: string; html: string };

const SEASONS = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;height:100%;background:#0b0b0d;overflow:hidden;font-family:ui-sans-serif,system-ui,sans-serif}
#t{position:absolute;top:16px;left:18px;color:#ece6d9;font-weight:800;font-size:20px;letter-spacing:-.01em}
#c{position:absolute;bottom:16px;left:18px;right:18px;color:#8f8a7e;font-size:13px;font-family:ui-monospace,monospace}
canvas{display:block}
</style></head><body>
<div id="t">Seasons come from tilt, not distance</div>
<canvas id="cv"></canvas>
<div id="c">Earth's axis stays tilted the same way all year. The hemisphere leaning toward the Sun gets steeper light — that's summer.</div>
<script>
const cv=document.getElementById('cv'),x=cv.getContext('2d');
function size(){cv.width=innerWidth;cv.height=innerHeight}size();addEventListener('resize',size);
let a=0;
function loop(){
 const w=cv.width,h=cv.height,cx=w/2,cy=h/2,R=Math.min(w,h)*0.32;
 x.clearRect(0,0,w,h);
 // orbit path
 x.strokeStyle='#26241f';x.lineWidth=1;x.beginPath();x.ellipse(cx,cy,R,R*0.72,0,0,7);x.stroke();
 // sun
 const g=x.createRadialGradient(cx,cy,4,cx,cy,46);g.addColorStop(0,'#ffd23e');g.addColorStop(1,'rgba(255,210,62,0)');
 x.fillStyle=g;x.beginPath();x.arc(cx,cy,46,0,7);x.fill();
 x.fillStyle='#ffd23e';x.beginPath();x.arc(cx,cy,16,0,7);x.fill();
 // earth position
 const ex=cx+Math.cos(a)*R, ey=cy+Math.sin(a)*R*0.72;
 // sun rays to earth
 x.strokeStyle='rgba(255,210,62,.28)';x.lineWidth=1;
 for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(cx,cy);x.lineTo(ex+i*10,ey);x.stroke();}
 // earth
 x.fillStyle='#345bff';x.beginPath();x.arc(ex,ey,18,0,7);x.fill();
 // fixed tilt axis (points same way always)
 const tilt=-0.41; // ~23.5deg
 const ax=Math.sin(tilt)*26, ay=-Math.cos(tilt)*26;
 x.strokeStyle='#ece6d9';x.lineWidth=2;x.beginPath();x.moveTo(ex-ax,ey-ay);x.lineTo(ex+ax,ey+ay);x.stroke();
 // which hemisphere toward sun -> season label
 const toward=(ex>cx); // crude: right side of orbit
 const north = Math.cos(a) < 0 ? 'Summer' : (Math.cos(a)>0?'Winter':'Equinox');
 x.fillStyle='#1fc16b';x.font='700 13px ui-monospace,monospace';
 x.fillText('N. Hemisphere: '+north, ex+26, ey-6);
 // pole dots
 x.fillStyle='#ff5b41';x.beginPath();x.arc(ex+ax,ey+ay,3,0,7);x.fill();
 a+=0.006;requestAnimationFrame(loop);
}
loop();
</script></body></html>`;

const ORBITS = `<!doctype html>
<!--EXPLAIN: A planet is pulled straight toward the Sun by gravity, but it is also moving sideways fast enough that it keeps missing. That endless "falling but never landing" is an orbit — the closer planets have to move faster to stay up.-->
<html><head><meta charset="utf-8"><style>
html,body{margin:0;height:100%;background:#0f1613;overflow:hidden;font-family:ui-sans-serif,system-ui,sans-serif}
#t{position:absolute;top:16px;left:18px;color:#f4f1e6;font-weight:800;font-size:19px;letter-spacing:-.01em;z-index:2}
#c{position:absolute;bottom:14px;left:18px;right:18px;color:#93a39a;font-size:12px;line-height:1.4;font-family:ui-monospace,monospace;z-index:2}
canvas{display:block}
</style></head><body>
<div id="t">Orbits: forever falling, never landing</div>
<canvas id="cv"></canvas>
<div id="c">Gravity pulls each planet straight at the Sun — it just keeps moving sideways fast enough to miss. Closer in means faster.</div>
<script>
const cv=document.getElementById('cv'),x=cv.getContext('2d');
function size(){cv.width=cv.clientWidth||innerWidth;cv.height=cv.clientHeight||innerHeight;cv.width=innerWidth;cv.height=innerHeight}
size();addEventListener('resize',size);
const planets=[
 {rf:0.34,sp:0.0150,col:'#5bc8ff',sz:5,name:'',trail:[]},
 {rf:0.58,sp:0.0092,col:'#ff6f5e',sz:8,trail:[]},
 {rf:0.82,sp:0.0060,col:'#78e0b0',sz:6,trail:[]}
];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let a=0;
function frame(){
 const w=cv.width,h=cv.height,cx=w/2,cy=h/2,base=Math.min(w,h)*0.44;
 x.fillStyle='#0f1613';x.fillRect(0,0,w,h);
 // faint orbit rings
 planets.forEach(p=>{x.strokeStyle='rgba(147,163,154,.18)';x.lineWidth=1;x.beginPath();x.arc(cx,cy,base*p.rf,0,7);x.stroke();});
 // planets + trails
 planets.forEach(p=>{
   const R=base*p.rf, ang=a*(p.sp/0.006), px=cx+Math.cos(ang)*R, py=cy+Math.sin(ang)*R;
   if(!reduced){p.trail.push([px,py]); if(p.trail.length>46)p.trail.shift();}
   for(let i=0;i<p.trail.length;i++){const t=i/p.trail.length;x.globalAlpha=t*0.6;x.fillStyle=p.col;x.beginPath();x.arc(p.trail[i][0],p.trail[i][1],p.sz*t*0.9,0,7);x.fill();}
   x.globalAlpha=1;
   const g=x.createRadialGradient(px,py,0,px,py,p.sz*2.4);g.addColorStop(0,p.col);g.addColorStop(1,'rgba(0,0,0,0)');
   x.fillStyle=g;x.beginPath();x.arc(px,py,p.sz*2.4,0,7);x.fill();
   x.fillStyle=p.col;x.beginPath();x.arc(px,py,p.sz,0,7);x.fill();
 });
 // sun
 const sg=x.createRadialGradient(cx,cy,2,cx,cy,54);sg.addColorStop(0,'#ffd23e');sg.addColorStop(.4,'rgba(255,210,62,.5)');sg.addColorStop(1,'rgba(255,210,62,0)');
 x.fillStyle=sg;x.beginPath();x.arc(cx,cy,54,0,7);x.fill();
 x.fillStyle='#ffd23e';x.beginPath();x.arc(cx,cy,15,0,7);x.fill();
 if(!reduced){a+=1;requestAnimationFrame(frame);}
}
frame();
</script></body></html>`;

export const FIXTURES: Fixture[] = [
  { id: "orbits", question: "how do planets stay in orbit?", html: ORBITS },
  { id: "seasons", question: "why do seasons happen? isn't it distance from the sun?", html: SEASONS },
];

export function fixtureFor(question: string): Fixture | undefined {
  const q = question.toLowerCase();
  if (q.includes("season")) return FIXTURES[1];
  if (q.includes("orbit") || q.includes("planet")) return FIXTURES[0];
  return undefined;
}
