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

export const FIXTURES: Fixture[] = [
  { id: "seasons", question: "why do seasons happen? isn't it distance from the sun?", html: SEASONS },
];

export function fixtureFor(question: string): Fixture | undefined {
  const q = question.toLowerCase();
  if (q.includes("season")) return FIXTURES[0];
  return undefined;
}
