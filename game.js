(() => {


// bird
const bird = { x: 90, y: H/2, w: 36, h: 28, vy:0, g:0.45, flap:-8.5 };


// audio (tiny wrapper using WebAudio)
let audioCtx = null;
function initAudio(){ if(audioCtx) return; audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }
function playTone(freq, dur = 0.06, vol = 0.06){ try{ initAudio(); const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type='sine'; o.frequency.value = freq; o.connect(g); g.connect(audioCtx.destination); g.gain.value = vol; o.start(); o.stop(audioCtx.currentTime + dur);}catch(e){} }


// load highscore
try{ high = Number(localStorage.getItem('flappy_high') || 0); }catch(e){ high = 0 }


function spawnPipe(){ const gap = 150; const top = 40 + Math.random() * (H - gap - 200); pipes.push({ x: W + 20, top, bottom: top + gap, w: 56, speed: 2.6, scored:false }); }


function rectsIntersect(ax,ay,aw,ah,bx,by,bw,bh){ return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by; }


function update(){
frame++;
if(!running) return;


if(frame % 95 === 0) spawnPipe();


// pipes
for(let i = pipes.length - 1; i >= 0; i--){ const p = pipes[i]; p.x -= p.speed; if(!p.scored && p.x + p.w < bird.x){ score++; p.scored = true; scoreEl.textContent = score; playTone(880, 0.05, 0.05); } if(p.x < -80) pipes.splice(i,1); }


// bird physics
bird.vy += bird.g; bird.y += bird.vy;
if(bird.y + bird.h > H - 90){ bird.y = H - 90 - bird.h; endGame(); }
if(bird.y < 0){ bird.y = 0; bird.vy = 0; }


// collisions
for(const p of pipes){ if(rectsIntersect(bird.x,bird.y,bird.w,bird.h,p.x,0,p.w,p.top) || rectsIntersect(bird.x,bird.y,bird.w,bird.h,p.x,p.bottom,p.w,H - p.bottom - 90)){ endGame(); break; } }
}


function draw(){
// sky
const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#9be6ff'); g.addColorStop(1,'#70c5ce'); ctx.fillStyle = g; ctx.fillRect(0,0,W,H);


// ground
ctx.fillStyle = '#4d9158'; ctx.fillRect(0,H-90,W,90);


// pipes
for(const p of pipes){ ctx.fillStyle = '#2e8b57'; ctx.fillRect(p.x,0,p.w,p.top); ctx.fillRect(p.x,p.bottom,p.w,H - p.bottom - 90);
ctx.fillStyle = '#256247'; ctx.fillRect(p.x-4,p.top-16,p.w+8,16); ctx.fillRect(p.x-4,p.bottom,p.w+8,16);
if(showHit){ ctx.strokeStyle = 'rgba(255,0,0,0.9)'; ctx.strokeRect(p.x,0,p.w,p.top); ctx.strokeRect(p.x,p.bottom,p.w,H - p.bottom - 90); }
}


// bird
ctx.save(); ctx.translate(bird.x + bird.w/2, bird.y + bird.h/2); ctx.rotate(Math.max(-0.8, Math.min(0.9, bird.vy / 10)));
roundRect(ctx, -bird.w/2, -bird.h/2, bird.w, bird.h, 6); ctx.fillStyle = '#ffdd57'; ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(6, -6, 3, 0, Math.PI*2); ctx.fill(); ctx.restore();
if(showHit){ ctx.strokeStyle='red'; ctx.strokeRect(bird.x,bird.y,bird.w,bird.h); }


// HUD
ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(12,12,150,44); ctx.fillStyle = '#fff'; ctx.font = '20px Inter, Arial'; ctx.fillText('Score: ' + score, 22, 40);
ctx.fillStyle = '#fff'; ctx.font = '12px Inter, Arial'; ctx.fillText('Best: ' + high, 180, 30);
}


function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }


function loop(){ update(); draw(); if(running) requestAnimationFrame(loop); }


function start(){ running = true; frame = 0; score = 0; pipes = []; bird.y = H/2; bird.vy = 0; scoreEl.textContent = 0; playTone(660,0.06,0.05); loop(); }
function endGame(){ if(!running) return; running = false; playTone(140,0.12,0.06); if(score > high){ high = score; localStorage.setItem('flappy_high', String(high)); } setTimeout(()=>{ alert('Game Over — score: '+score+' — best: '+high); }, 80); }


// input
window.addEventListener('keydown', e => { if(e.code === 'Space'){ if(!running) start(); bird.vy = bird.flap; try{ audioCtx && audioCtx.resume(); }catch(e){} playTone(1200,0.03,0.05); } if(e.key.toLowerCase() === 'd'){ showHit = !showHit; debugBox.checked = showHit; } });
window.addEventListener('mousedown', () => { if(!running) start(); bird.vy = bird.flap; playTone(1200,0.03,0.05); });
window.addEventListener('touchstart', e => { e.preventDefault(); if(!running) start(); bird.vy = bird.flap; playTone(1200,0.03,0.05); }, {passive:false});


// UI
startBtn.addEventListener('click', start);
debugBox.addEventListener('change', () => { showHit = debugBox.checked; });


// responsive scaling
function fit(){ const maxW = Math.min(window.innerWidth*0.92, 420); const scale = maxW / W; canvas.style.width = Math.round(W * scale) + 'px'; }
window.addEventListener('resize', fit); fit();


})();
