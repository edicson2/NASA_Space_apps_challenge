// Level 2: Zero Gravity Chase
// Experience weightlessness as you chase floating stars!
// Use thrusters (arrow keys/WASD) to maneuver in zero gravity and catch stars before they drift away
// at medium speed. Collect 2 stars to win. Stars disappear after passing slightly above the top.
let state = {};
export function stop(){ state.running = false; }
export function start(ctx){
    return new Promise(resolve=>{
        const canvas = ctx.canvas; const c = canvas; const g = c.getContext('2d');
        state = { running:true, canvas:c, ctx:g, player:null, stars:[], score:0, collectedTotal:0, animId:null, resolve };

        function initPlayer(){
            state.player = {
                x: c.width/2,
                y: c.height/2,
                r: 14,
                xVel: 0,
                yVel: 0,
                thrust: 0.08,
                friction: 0.998,
                dir: 'left'
            };
        }

        function spawnStar(){
            // spawn at random x along bottom, slightly off-canvas so it rises in
            const x = Math.random() * (c.width - 40) + 20;
            const y = c.height + (Math.random()*20 + 6); // start slightly below
            // medium upward speed
            const vy = -(1.0 + Math.random() * 0.6); // px per frame (negative = up)
            const r = 8 + Math.random()*6;
            state.stars.push({ x, y, r, vy, collected:false });
        }

        // --- Free-fall animated background ---
        function initBackground(count){
            state.background = [];
            for(let i=0;i<count;i++){
                const size = 0.8 + Math.random()*3.2; // line width
                const len = 12 + Math.random()*48;
                // faster upward speed (negative vy moves up)
                const vy = -(1.8 + Math.random()*4.2);
                const x = Math.random() * c.width;
                const y = Math.random() * c.height;
                const alpha = 0.08 + Math.random()*0.3;
                // small horizontal drift to simulate motion
                const drift = (Math.random()-0.5) * 0.6;
                state.background.push({x,y,size,len,vy,alpha,drift});
            }
        }

        function drawBackground(){
            if(!state.background) return;
            // draw brighter, faster streaks moving bottom -> top (vy negative)
            for(let i=0;i<state.background.length;i++){
                const p = state.background[i];
                p.y += p.vy; // vy negative -> moves up
                p.x += p.drift;
                // loop when well above the top
                if(p.y + p.len < -40){
                    p.y = c.height + Math.random()*60;
                    p.x = Math.random() * c.width;
                }
                // wrap x horizontally
                if(p.x < -10) p.x = c.width + 10;
                if(p.x > c.width + 10) p.x = -10;

                try{
                    // glow for head
                    g.save();
                    g.lineCap = 'round';
                    g.shadowBlur = Math.min(16, p.size * 6);
                    g.shadowColor = `rgba(180,210,255,${p.alpha})`;
                    g.strokeStyle = `rgba(220,240,255,${p.alpha})`;
                    g.lineWidth = p.size;
                    g.beginPath();
                    g.moveTo(p.x, p.y);
                    g.lineTo(p.x, p.y + p.len);
                    g.stroke();
                    g.closePath();
                    g.restore();

                    // trailing segments for motion blur (fainter tails)
                    const tailSteps = 3;
                    for(let t=1;t<=tailSteps;t++){
                        const frac = 1 - (t / (tailSteps + 1));
                        const ty = p.y + (p.len * (t / (tailSteps + 1)));
                        g.beginPath();
                        g.strokeStyle = `rgba(200,220,255,${p.alpha * frac * 0.5})`;
                        g.lineWidth = Math.max(0.4, p.size * frac * 0.8);
                        g.moveTo(p.x, ty);
                        g.lineTo(p.x, ty + (p.len * 0.12));
                        g.stroke();
                        g.closePath();
                    }
                }catch(e){}
            }

            // gentle darken overlay to keep contrast
            try{
                g.globalCompositeOperation = 'source-over';
                g.fillStyle = 'rgba(6,10,18,0.02)';
                g.fillRect(0,0,c.width,c.height);
            }catch(e){}
        }

        // play star collect sound fallback
        function playStarCollect(){ try{ const a = window.assets && window.assets.audio && window.assets.audio.starCollect; if(a){ a.currentTime = 0; a.play().catch(()=>{}); return; } }catch(e){} try{ const aCtx = new (window.AudioContext || window.webkitAudioContext)(); const o = aCtx.createOscillator(); const gGain = aCtx.createGain(); o.type='sine'; o.frequency.value=880; gGain.gain.value=0.02; o.connect(gGain); gGain.connect(aCtx.destination); o.start(); setTimeout(()=>{ o.stop(); aCtx.close(); }, 80);}catch(e){} }

        // controls (same as level1)
        const keys = {};
        function onKeyDown(e){ keys[e.code] = true; }
        function onKeyUp(e){ keys[e.code] = false; }
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        function clear(){ g.clearRect(0,0,c.width,c.height); }
        function drawCircle(x,y,r,col){ g.beginPath(); g.fillStyle = col; g.arc(x,y,r,0,Math.PI*2); g.fill(); g.closePath(); }
        function drawStarImage(s){ try{ const img = window.assets && window.assets.images && window.assets.images.star; if(img){ const size = 28; g.drawImage(img, s.x - size/2, s.y - size/2, size, size); return; } }catch(e){} drawCircle(s.x,s.y,Math.max(6,s.r),'gold'); }

        function loop(){
            // pause support
            try{ if(window.levelManager && window.levelManager.paused){ state.animId = requestAnimationFrame(loop); return; } }catch(e){}
            if(!state.running) return;
            clear();
            // draw looping falling background first
            drawBackground();

            // player thrust like level1
            if(keys['ArrowUp']||keys['KeyW']) state.player.yVel -= state.player.thrust;
            if(keys['ArrowDown']||keys['KeyS']) state.player.yVel += state.player.thrust;
            if(keys['ArrowLeft']||keys['KeyA']) { state.player.xVel -= state.player.thrust; state.player.dir = 'left'; }
            if(keys['ArrowRight']||keys['KeyD']) { state.player.xVel += state.player.thrust; state.player.dir = 'right'; }

            state.player.x += state.player.xVel;
            state.player.y += state.player.yVel;
            state.player.xVel *= state.player.friction;
            state.player.yVel *= state.player.friction;

            // clamp to canvas borders
            state.player.x = Math.max(state.player.r, Math.min(c.width - state.player.r, state.player.x));
            state.player.y = Math.max(state.player.r, Math.min(c.height - state.player.r, state.player.y));

            // spawn stars periodically so they come from bottom at medium speed
            if(state.stars.length < 15 && Math.random() < 0.08){ spawnStar(); }

            // update stars: move upward, draw, handle collection and removal
            for(let i = state.stars.length -1; i >= 0; i--){
                const s = state.stars[i];
                if(s.collected) continue;
                s.y += s.vy; // vy negative -> moves up
                drawStarImage(s);
                // if went well above the top, remove
                if(s.y + s.r < -20){ // slightly off-screen above
                    state.stars.splice(i,1);
                    continue;
                }
                // collision
                const dx = s.x - state.player.x;
                const dy = s.y - state.player.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < s.r + state.player.r){
                    s.collected = true;
                    state.score++;
                    state.collectedTotal++;
                    try{ ctx.hud.querySelector('#score').textContent = 'Stars: ' + state.collectedTotal; }catch(e){}
                    playStarCollect();
                    // spawn replacement to keep ~12 stars
                    setTimeout(()=>{ if(state){ state.stars = state.stars.filter(x=>!x.collected); while(state.stars.length < 15) spawnStar(); } }, 80);
                }
            }

            // draw astronaut sprite at visible size (48x48) if available
            try{
                const imgL = window.assets && window.assets.images && window.assets.images.astronautLeft;
                const imgR = window.assets && window.assets.images && window.assets.images.astronautRight;
                const pSize = 48;
                if(state.player.dir === 'right' && imgR){ g.drawImage(imgR, state.player.x - pSize/2, state.player.y - pSize/2, pSize, pSize); }
                else if(imgL){ g.drawImage(imgL, state.player.x - pSize/2, state.player.y - pSize/2, pSize, pSize); }
                else drawCircle(state.player.x, state.player.y, state.player.r, '#88e0ff');
            }catch(e){ drawCircle(state.player.x, state.player.y, state.player.r, '#88e0ff'); }

            // thrust visual
            if(keys['ArrowUp']||keys['KeyW']||keys['ArrowDown']||keys['KeyS']||keys['ArrowLeft']||keys['KeyA']||keys['ArrowRight']||keys['KeyD']){
                g.beginPath(); g.fillStyle='rgba(255,180,90,0.9)'; g.arc(state.player.x, state.player.y+state.player.r+6, 6, 0, Math.PI*2); g.fill(); g.closePath();
            }

            // require 20 collected stars to win
            if(state.collectedTotal >= 20){
                try{ if(window.assets && window.assets.audio && window.assets.audio.levelPass){ window.assets.audio.levelPass.currentTime = 0; window.assets.audio.levelPass.play().catch(()=>{}); } else { ctx.speak('You reached 20 stars — level complete!'); } }catch(e){}
                setTimeout(()=>finish(true),800);
                return;
            }

            state.animId = requestAnimationFrame(loop);
        }

        function finish(r){
            state.running = false;
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            try{ if(narrationAudio){ narrationAudio.pause(); narrationAudio.currentTime = 0; } }catch(e){}
            if(typeof narrationTimeout !== 'undefined') clearTimeout(narrationTimeout);
            if(state.animId) cancelAnimationFrame(state.animId);
            resolve(r === true);
        }

        // init
        initPlayer();
        initBackground(80);
    try{ ctx.hud.querySelector('#score').textContent = 'Stars: 0'; ctx.hud.querySelector('#objective').textContent = 'Objective: collect all the stars'; }catch(e){}
        try{ if(window.assets && window.assets.audio && window.assets.audio.option){ window.assets.audio.option.currentTime = 0; window.assets.audio.option.play().catch(()=>{}); } }catch(e){}
        // play option sound then narration after 1.5s
        let narrationAudio = null;
        const narrationTimeout = setTimeout(()=>{
            try{
                if(window.assets && window.assets.audio && window.assets.audio.lvl2Voice){ narrationAudio = window.assets.audio.lvl2Voice; narrationAudio.currentTime = 0; narrationAudio.play().catch(()=>{}); console.log('Level 2 narration: playing lvl2Voice'); }
                else { console.log('Level 2 narration: using speechSynthesis fallback'); ctx.speak('Microgravity again, but this time stars rise up from below — collect ten of them!'); }
            }catch(e){}
        },1500);

        loop();
    });
}
