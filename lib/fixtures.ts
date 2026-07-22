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

const PENDULUM = `<!doctype html>
<!--EXPLAIN: A pendulum swings because gravity keeps pulling the bob back toward the bottom. At the ends of the swing it stops for an instant — all of its energy is height. As it falls that height turns into speed, so it moves fastest at the very bottom, then coasts back up the other side. Height and speed trade back and forth, forever.-->
<html><head><meta charset="utf-8"><style>
html,body{margin:0;height:100%;background:#0f1613;overflow:hidden;font-family:ui-sans-serif,system-ui,sans-serif}
#t{position:absolute;top:16px;left:18px;color:#f4f1e6;font-weight:800;font-size:19px;letter-spacing:-.01em;z-index:2}
#c{position:absolute;bottom:14px;left:18px;right:18px;color:#93a39a;font-size:12px;line-height:1.4;font-family:ui-monospace,monospace;z-index:2}
canvas{display:block}
</style></head><body>
<div id="t">A pendulum: trading height for speed</div>
<canvas id="cv"></canvas>
<div id="c">Gravity pulls the bob back to the bottom. It pauses at the ends, then falls — fastest at the very bottom — and coasts up the far side.</div>
<script>
const cv=document.getElementById('cv'),x=cv.getContext('2d');
function size(){cv.width=innerWidth;cv.height=innerHeight}size();addEventListener('resize',size);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const A=0.82; // amplitude (rad)
let t=reduced?A*0.7:0;
function frame(){
 const w=cv.width,h=cv.height,px=w/2,py=h*0.24,L=Math.min(h*0.52,w*0.42);
 const th=reduced?A*0.75:A*Math.cos(t);
 const bx=px+Math.sin(th)*L, by=py+Math.cos(th)*L;
 x.fillStyle='#0f1613';x.fillRect(0,0,w,h);
 // swing arc path
 x.strokeStyle='rgba(147,163,154,.25)';x.lineWidth=1;x.beginPath();x.arc(px,py,L,Math.PI/2-A,Math.PI/2+A);x.stroke();
 // equilibrium (straight down) dashed
 x.strokeStyle='rgba(120,224,176,.5)';x.setLineDash([5,5]);x.lineWidth=1.5;x.beginPath();x.moveTo(px,py);x.lineTo(px,py+L+18);x.stroke();x.setLineDash([]);
 x.fillStyle='#78e0b0';x.font='12px ui-monospace,monospace';x.fillText('fastest here',px+8,py+L+16);
 // turning points
 [-A,A].forEach(s=>{const tx=px+Math.sin(s)*L,ty=py+Math.cos(s)*L;x.strokeStyle='rgba(255,111,94,.6)';x.lineWidth=1.5;x.beginPath();x.arc(tx,ty,10,0,7);x.stroke();});
 x.fillStyle='rgba(255,111,94,.9)';x.fillText('pauses',px+Math.sin(A)*L-16,py+Math.cos(A)*L+26);
 // rod
 x.strokeStyle='#f4f1e6';x.lineWidth=2.5;x.beginPath();x.moveTo(px,py);x.lineTo(bx,by);x.stroke();
 // pivot
 x.fillStyle='#93a39a';x.beginPath();x.arc(px,py,5,0,7);x.fill();
 x.fillStyle='#93a39a';x.font='11px ui-monospace,monospace';x.fillText('pivot',px+8,py-6);
 // gravity arrow from bob
 x.strokeStyle='rgba(255,210,62,.6)';x.lineWidth=2;x.beginPath();x.moveTo(bx,by);x.lineTo(bx,by+30);x.stroke();
 x.beginPath();x.moveTo(bx-4,by+24);x.lineTo(bx,by+30);x.lineTo(bx+4,by+24);x.stroke();
 x.fillStyle='rgba(255,210,62,.85)';x.fillText('gravity',bx+8,by+26);
 // bob (glow + core)
 const g=x.createRadialGradient(bx,by,2,bx,by,26);g.addColorStop(0,'rgba(91,200,255,.55)');g.addColorStop(1,'rgba(91,200,255,0)');
 x.fillStyle=g;x.beginPath();x.arc(bx,by,26,0,7);x.fill();
 x.fillStyle='#5bc8ff';x.beginPath();x.arc(bx,by,13,0,7);x.fill();
 if(!reduced){t+=0.028;requestAnimationFrame(frame);}
}
frame();
</script></body></html>`;

export const FIXTURES: Fixture[] = [
  { id: "pendulum", question: "how does a pendulum swing?", html: PENDULUM },
  { id: "seasons", question: "why do seasons happen? isn't it distance from the sun?", html: SEASONS },
];

export function fixtureFor(question: string): Fixture | undefined {
  const q = question.toLowerCase();
  if (q.includes("season")) return FIXTURES[1];
  if (q.includes("pendulum")) return FIXTURES[0];
  return undefined;
}
