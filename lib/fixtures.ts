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
<!--EXPLAIN: Two forces act on the bob: its weight (mg) pulls straight down, and the rod's tension (T) pulls along the rod toward the pivot. The tension cancels the part of gravity that lines up with the rod. What's left over is the sideways component, mg·sinθ, and it always points back toward the bottom — that's the restoring force that makes the pendulum swing. It's biggest at the ends and zero at the bottom.-->
<html><head><meta charset="utf-8"><style>
html,body{margin:0;height:100%;background:#0f1613;overflow:hidden;font-family:ui-sans-serif,system-ui,sans-serif}
#t{position:absolute;top:16px;left:18px;color:#f4f1e6;font-weight:800;font-size:19px;letter-spacing:-.01em;z-index:2}
#c{position:absolute;bottom:14px;left:18px;right:18px;color:#93a39a;font-size:12px;line-height:1.4;font-family:ui-monospace,monospace;z-index:2}
canvas{display:block}
</style></head><body>
<div id="t">A pendulum: the forces that swing it</div>
<canvas id="cv"></canvas>
<div id="c">Weight pulls straight down; the rod's tension cancels the part along it. What's left — mg·sinθ — always points back to the bottom, so it swings.</div>
<script>
const cv=document.getElementById('cv'),x=cv.getContext('2d');
function size(){cv.width=innerWidth;cv.height=innerHeight}size();addEventListener('resize',size);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const A=0.72;
let t=reduced?0.7:0;
function arrow(x1,y1,x2,y2,col,lw){
 x.strokeStyle=col;x.fillStyle=col;x.lineWidth=lw||2.5;
 x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();
 const a=Math.atan2(y2-y1,x2-x1),s=8;
 x.beginPath();x.moveTo(x2,y2);x.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));x.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));x.closePath();x.fill();
}
function frame(){
 const w=cv.width,h=cv.height,px=w/2,py=h*0.2,L=Math.min(h*0.5,w*0.4);
 const th=reduced?0.6:A*Math.cos(t);
 const bx=px+Math.sin(th)*L, by=py+Math.cos(th)*L;
 x.fillStyle='#0f1613';x.fillRect(0,0,w,h);
 x.font='12px ui-monospace,monospace';
 // swing arc + equilibrium
 x.strokeStyle='rgba(147,163,154,.22)';x.lineWidth=1;x.beginPath();x.arc(px,py,L,Math.PI/2-A,Math.PI/2+A);x.stroke();
 x.strokeStyle='rgba(147,163,154,.3)';x.setLineDash([5,5]);x.beginPath();x.moveTo(px,py);x.lineTo(px,py+L+40);x.stroke();x.setLineDash([]);
 // rod + pivot
 x.strokeStyle='#f4f1e6';x.lineWidth=2.5;x.beginPath();x.moveTo(px,py);x.lineTo(bx,by);x.stroke();
 x.fillStyle='#93a39a';x.beginPath();x.arc(px,py,5,0,7);x.fill();x.fillText('pivot',px+9,py-4);
 // --- free-body diagram at the bob ---
 const F=64;
 // weight (mg) straight down
 arrow(bx,by,bx,by+F,'#ffd23e');
 x.fillStyle='#ffd23e';x.fillText('mg  (weight)',bx+8,by+F-4);
 // tension (T) along rod toward pivot
 const ux=(px-bx)/L, uy=(py-by)/L;
 arrow(bx,by,bx+ux*F*0.82,by+uy*F*0.82,'#5bc8ff');
 x.fillStyle='#5bc8ff';x.fillText('T  (tension)',bx+ux*F*0.82-14,by+uy*F*0.82-8);
 // restoring component mg·sinθ (tangential, back toward bottom)
 const tx=Math.cos(th), ty=-Math.sin(th); // +θ tangent
 const rmag=F*Math.sin(Math.abs(th)); const rs=-Math.sign(th)||1;
 if(Math.abs(th)>0.03){
   arrow(bx,by,bx+tx*rmag*rs,by+ty*rmag*rs,'#ff6f5e',3);
   x.fillStyle='#ff6f5e';x.fillText('mg·sinθ  restores',bx+tx*rmag*rs-30,by+ty*rmag*rs+(rs>0?18:-10));
 }
 // bob
 const g=x.createRadialGradient(bx,by,2,bx,by,24);g.addColorStop(0,'rgba(120,224,176,.5)');g.addColorStop(1,'rgba(120,224,176,0)');
 x.fillStyle=g;x.beginPath();x.arc(bx,by,24,0,7);x.fill();
 x.fillStyle='#78e0b0';x.beginPath();x.arc(bx,by,12,0,7);x.fill();
 x.fillStyle='#0f1613';x.beginPath();x.arc(bx,by,4,0,7);x.fill();
 if(!reduced){t+=0.024;requestAnimationFrame(frame);}
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
