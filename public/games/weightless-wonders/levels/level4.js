// Level 4: Multi-Gravity Explorer
// Experience different gravity on Earth, Mars, and Moon!
// Move between zones to feel how gravity changes across our solar system
let state = {};
export function stop(){ if(state) state.running = false; }
export function start(ctx){
    return new Promise(resolve=>{
        const canvas = ctx.canvas; const c = canvas; const g = c.getContext('2d');
        // Real gravity values (m/s^2) and scale to convert to game units (px/frame^2)
        const REAL_GRAVITIES = {
            earth: 9.81,
            mars: 3.71,
            moon: 1.62
        };
        // scale factor determined from previous tuning (game Earth gravity ~= 0.45)
        const GAME_SCALE = 0.45 / 9.81; // multiply real m/s^2 to get game units

    state = { running:true, canvas:c, ctx:g, player:{x: c.width/2, y:50, r:14, xVel:0, yVel:0, dir:'left', onGround:false}, animId:null, stars:[], score:0, collectedTotal:0, resolve };

        // cleanup any existing slider elements
        try{ const olds = ctx.hud.querySelectorAll('.gravity-slider'); olds.forEach(el=>el.remove()); }catch(e){}

        // input listeners
        const keys = {};
        function kd(e){ keys[e.code] = true; if(e.code==='ArrowLeft' || e.code==='KeyA') state.player.dir='left'; if(e.code==='ArrowRight' || e.code==='KeyD') state.player.dir='right';
            // jump keys
            if((e.code==='Space' || e.code==='ArrowUp' || e.code==='KeyW') && state.player.onGround){
                // compute a jump impulse so the player reaches a sensible height per zone
                const zone = zoneForX(state.player.x);
                // simple factors based on real-world jump multipliers (relative to Earth)
                // Earth ≈ 1.0 m baseline, Mars ≈ 2.6 m, Moon ≈ 6.0 m — use these as factors
                const jumpFactors = { earth: 1.0, mars: 2.6, moon: 6.0 };
                // base pixel height for a 1-meter jump on Earth (scale with canvas height)
                const basePixel = Math.max(80, Math.floor(c.height * 0.12));
                const factor = jumpFactors[zone] || 1.0;
                const desiredH = basePixel * factor;
                // use the scaled game gravity (px/frame^2)
                const real = REAL_GRAVITIES[zone] || REAL_GRAVITIES.earth;
                const gameG = real * GAME_SCALE;
                // v = sqrt(2 * g * h) ; negative because up is negative y
                const jumpV = -Math.sqrt(2 * Math.max(0.0001, gameG) * Math.max(8, desiredH));
                state.player.yVel = jumpV;
                state.player.onGround = false;
            }
        }
        function ku(e){ keys[e.code] = false; }
        window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

        function zoneForX(x){ const third = c.width/3; if(x < third) return 'earth'; if(x < third*2) return 'mars'; return 'moon'; }

        function drawBackground(){
            try{
                const imgEarth = window.assets && window.assets.images && window.assets.images.earth;
                const imgMars = window.assets && window.assets.images && window.assets.images.mars;
                const imgMoon = window.assets && window.assets.images && window.assets.images.moon;
                const third = c.width/3;
                if(imgEarth) g.drawImage(imgEarth, 0, 0, third, c.height);
                else { g.fillStyle = '#2e6fd8'; g.fillRect(0,0,third,c.height); }
                if(imgMars) g.drawImage(imgMars, third, 0, third, c.height);
                else { g.fillStyle = '#b85b3a'; g.fillRect(third,0,third,c.height); }
                if(imgMoon) g.drawImage(imgMoon, third*2, 0, third, c.height);
                else { g.fillStyle = '#cfcfcf'; g.fillRect(third*2,0,third,c.height); }
            }catch(e){ /* fallback backgrounds */ const third=c.width/3; g.fillStyle='#2e6fd8'; g.fillRect(0,0,third,c.height); g.fillStyle='#b85b3a'; g.fillRect(third,0,third,c.height); g.fillStyle='#cfcfcf'; g.fillRect(third*2,0,third,c.height); }
        }

        function drawPlayer(){
            try{
                const imgL = window.assets && window.assets.images && window.assets.images.astronautLeft;
                const imgR = window.assets && window.assets.images && window.assets.images.astronautRight;
                const pSize = 64; // larger for visibility
                if(state.player.dir === 'right' && imgR){ g.drawImage(imgR, state.player.x - pSize/2, state.player.y - pSize/2, pSize, pSize); return; }
                if(imgL){ g.drawImage(imgL, state.player.x - pSize/2, state.player.y - pSize/2, pSize, pSize); return; }
                // fallback
                g.beginPath(); g.fillStyle='#88e0ff'; g.arc(state.player.x,state.player.y,state.player.r,0,Math.PI*2); g.fill(); g.closePath();
            }catch(e){ g.beginPath(); g.fillStyle='#88e0ff'; g.arc(state.player.x,state.player.y,state.player.r,0,Math.PI*2); g.fill(); g.closePath(); }
        }

        function loop(){
            // pause support
            try{ if(window.levelManager && window.levelManager.paused){ state.animId = requestAnimationFrame(loop); return; } }catch(e){}
            if(!state.running) return;
            g.clearRect(0,0,c.width,c.height);
            drawBackground();

            // simple star system (spawn throughout the screen like level 3)
            function addStar(){ const x = 40 + Math.random() * (c.width - 80); const y = Math.max(40, Math.random()*(c.height-80)); state.stars.push({x,y,r:8,collected:false}); }
            if(state.stars.length < 12){ addStar(); }
            // draw stars and check collection
            for(let i=state.stars.length-1;i>=0;i--){ const s = state.stars[i]; if(s.collected) continue; try{ const img = window.assets && window.assets.images && window.assets.images.star; if(img) g.drawImage(img, s.x-14, s.y-14, 28,28); else { g.beginPath(); g.fillStyle='gold'; g.arc(s.x,s.y,s.r,0,Math.PI*2); g.fill(); g.closePath(); } }catch(e){} const dx = s.x - state.player.x; const dy = s.y - state.player.y; if(Math.sqrt(dx*dx+dy*dy) < s.r + state.player.r){ s.collected = true; state.collectedTotal++; try{ ctx.hud.querySelector('#score').textContent = 'Stars: ' + state.collectedTotal; }catch(e){} try{ if(window.assets && window.assets.audio && window.assets.audio.starCollect){ window.assets.audio.starCollect.currentTime = 0; window.assets.audio.starCollect.play().catch(()=>{}); } }catch(e){} state.stars.splice(i,1); } }

            // input horizontal
            const hSpeed = 2.2;
            if(keys['ArrowLeft']||keys['KeyA']) state.player.xVel = -hSpeed;
            else if(keys['ArrowRight']||keys['KeyD']) state.player.xVel = hSpeed;
            else state.player.xVel *= 0.9;

            // determine gravity by zone (use scaled game gravity for physics)
            const zone = zoneForX(state.player.x);
            const realG = REAL_GRAVITIES[zone] || REAL_GRAVITIES.earth;
            const grav = realG * GAME_SCALE;
            state.player.yVel += grav;

            // Create and update platforms
            if(!state.platforms) {
                state.platforms = [];
                const third = c.width/3;
                // Ground platform for each zone
                state.platforms.push({x:0, y:c.height-40, w:c.width, h:40});

                // Vertical spacing increased by 3.5x (base spacing 50px * 3.5)
                const vSpace = 175;  // 50 * 3.5
                const hSpace = 78;   // 60 * 1.3 (30% increase in horizontal spacing)
                const pWidth = 120;  // Platform width
                const pHeight = 16;  // Platform height

                // Earth Zone Platforms (Left third)
                // Row 1 (lowest)
                state.platforms.push({x:15, y:c.height-90, w:pWidth, h:pHeight});
                state.platforms.push({x:15 + (pWidth + hSpace), y:c.height-90, w:pWidth, h:pHeight});
                
                // Row 2
                state.platforms.push({x:15 + (pWidth/2), y:c.height-(90+vSpace), w:pWidth, h:pHeight});
                state.platforms.push({x:15 + (pWidth/2) + (pWidth + hSpace), y:c.height-(90+vSpace), w:pWidth, h:pHeight});
                
                // Mars Zone Platforms (Middle third)
                // Row 1
                state.platforms.push({x:third + 15, y:c.height-90, w:pWidth, h:pHeight});
                state.platforms.push({x:third + 15 + (pWidth + hSpace), y:c.height-90, w:pWidth, h:pHeight});
                
                // Row 2
                state.platforms.push({x:third + 15 + (pWidth/2), y:c.height-(90+vSpace), w:pWidth, h:pHeight});
                state.platforms.push({x:third + 15 + (pWidth/2) + (pWidth + hSpace), y:c.height-(90+vSpace), w:pWidth, h:pHeight});
                
                // Moon Zone Platforms (Right third)
                // Row 1
                state.platforms.push({x:(third*2) + 15, y:c.height-90, w:pWidth, h:pHeight});
                state.platforms.push({x:(third*2) + 15 + (pWidth + hSpace), y:c.height-90, w:pWidth, h:pHeight});
                
                // Row 2
                state.platforms.push({x:(third*2) + 15 + (pWidth/2), y:c.height-(90+vSpace), w:pWidth, h:pHeight});
                state.platforms.push({x:(third*2) + 15 + (pWidth/2) + (pWidth + hSpace), y:c.height-(90+vSpace), w:pWidth, h:pHeight});
            }

            // Platform collision detection
            state.player.x += state.player.xVel;
            state.player.y += state.player.yVel;
            state.player.onGround = false;

            // Check collision with each platform
            state.platforms.forEach(p => {
                g.fillStyle = 'rgba(255,255,255,0.15)';
                g.fillRect(p.x, p.y, p.w, p.h);
                
                if(state.player.x > p.x - state.player.r && state.player.x < p.x + p.w + state.player.r) {
                    const prevY = state.player.y - state.player.yVel;
                    const isAbove = prevY - state.player.r <= p.y;
                    const isBelow = prevY + state.player.r >= p.y + p.h;
                    
                    if(isAbove && state.player.y + state.player.r > p.y && state.player.y - state.player.r < p.y) {
                        // Collision from above
                        state.player.y = p.y - state.player.r;
                        state.player.yVel = 0;
                        state.player.onGround = true;
                    } else if(isBelow && state.player.y - state.player.r < p.y + p.h && state.player.y + state.player.r > p.y + p.h) {
                        // Collision from below
                        state.player.y = p.y + p.h + state.player.r;
                        state.player.yVel = 0;
                    }
                }
            });

            // Clamp horizontally and prevent falling through bottom
            state.player.x = Math.max(state.player.r, Math.min(c.width - state.player.r, state.player.x));
            if(state.player.y + state.player.r > c.height - 20){ 
                state.player.y = c.height - 20 - state.player.r; 
                state.player.yVel = 0; 
                state.player.onGround = true; 
            }

            // draw dividing lines
            const third = c.width/3;
            g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; g.beginPath(); g.moveTo(third,0); g.lineTo(third,c.height); g.moveTo(third*2,0); g.lineTo(third*2,c.height); g.stroke(); g.closePath();

            // zone labels and gravity readout
            g.fillStyle = 'rgba(255,255,255,0.9)'; g.font = '18px serif'; g.textAlign = 'center';
            g.fillText('Earth', third/2, 30); g.fillText('Mars', third + third/2, 30); g.fillText('Moon', third*2 + third/2, 30);
            // show real gravity (m/s^2) to the player
            g.fillText('g = ' + realG.toFixed(2) + ' m/s²', state.player.x, 60);

            drawPlayer();

            // Check for level completion at 2 stars
            if(state.collectedTotal >= 20){
                try{ 
                    if(window.assets && window.assets.audio && window.assets.audio.levelPass){ 
                        window.assets.audio.levelPass.currentTime = 0; 
                        window.assets.audio.levelPass.play().catch(()=>{}); 
                    } 
                }catch(e){}
                setTimeout(()=>finish(true),800);
                return;
            }

            state.animId = requestAnimationFrame(loop);
        }

        function finish(r){ state.running = false; try{ if(state.animId) cancelAnimationFrame(state.animId); }catch(e){} window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku); resolve(r===true); }

    // init and start (place player on ground so jump is available immediately)
    state.player.x = c.width/2; state.player.y = c.height - 20 - state.player.r; state.player.onGround = true; try{ ctx.hud.querySelector('#score').textContent=''; }catch(e){}
    try{ ctx.hud.querySelector('#objective').textContent = 'Objective: collect 20 stars'; }catch(e){}
            // play option sound then short narration (prefer lvl4Voice if preloaded)
            let narrationAudio = null;
            try{ if(window.assets && window.assets.audio && window.assets.audio.option){ window.assets.audio.option.currentTime = 0; window.assets.audio.option.play().catch(()=>{}); } }catch(e){}
            const narrationTimeout = setTimeout(()=>{
                try{
                    if(window.assets && window.assets.audio && window.assets.audio.lvl4Voice){
                        narrationAudio = window.assets.audio.lvl4Voice; narrationAudio.currentTime = 0; narrationAudio.play().catch(()=>{});
                        console.log('Level 4 narration: playing lvl4Voice');
                    } else {
                        console.log('Level 3 narration: using speechSynthesis fallback');
                        ctx.speak('Three gravity zones: Earth, Mars, and Moon. Move left and right to enter each zone and feel the change in gravity.');
                    }
                }catch(e){ console.warn('Level 3 narration failed', e); }
            },800);
        loop();
    });
}
