// Level 1: Basic Movement and Star Collection
// Learn to control your astronaut and collect stars in normal gravity.
// Use arrow keys or WASD to move and jump!: Gravity Balance (Microgravity)
// Exports: start(ctx) -> Promise<boolean>, stop()

let state = {};

export function stop(){
    state.running = false;
}

export default async function(){ /* noop default */ }

export function start(ctx){
    return new Promise((resolve)=>{
        const canvas = ctx.canvas;
        const c = canvas;
        const ctx2 = c.getContext('2d');
        state = {
            running: true,
            canvas: c,
            ctx: ctx2,
            player: null,
            stars: [],
            score: 0,
            collectedTotal: 0,
            animId: null,
            resolve
        };

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

        function addOneStar(){
            state.stars.push({ x: Math.random()*(c.width-40)+20, y: Math.random()*(c.height-40)+20, r: 8, collected:false });
        }
        function generateStars(n){ state.stars = []; for(let i=0;i<n;i++) addOneStar(); }

    function clear(){ state.ctx.clearRect(0,0,c.width,c.height); }
    function drawCircle(x,y,r,col){ state.ctx.beginPath(); state.ctx.fillStyle = col; state.ctx.arc(x,y,r,0,Math.PI*2); state.ctx.fill(); state.ctx.closePath(); }
    // force star image to a visible size (28x28) when available
    function drawStarImage(s){ try{ const img = window.assets && window.assets.images && window.assets.images.star; if(img){ const size = 28; state.ctx.drawImage(img, s.x - size/2, s.y - size/2, size, size); return; } }catch(e){} drawCircle(s.x,s.y,Math.max(6,s.r),'gold'); }

        // controls
        const keys = {};
        function onKeyDown(e){ keys[e.code] = true; }
        function onKeyUp(e){ keys[e.code] = false; }
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

    function playBeep(){ try{ const a = window.assets && window.assets.audio && window.assets.audio.starCollect; if(a){ a.currentTime = 0; a.play().catch(()=>{}); return; } }catch(e){} try{ const aCtx = new (window.AudioContext || window.webkitAudioContext)(); const o = aCtx.createOscillator(); const g = aCtx.createGain(); o.type='sine'; o.frequency.value=880; g.gain.value=0.02; o.connect(g); g.connect(aCtx.destination); o.start(); setTimeout(()=>{ o.stop(); aCtx.close(); }, 80);}catch(e){} }

        function loop(){
            // global pause support: levels should stop updating when a shared pause is set
            try{ if(window.levelManager && window.levelManager.paused) { requestAnimationFrame(loop); return; } }catch(e){}
            if(!state.running) return;
            clear();
            if(keys['ArrowUp']||keys['KeyW']) state.player.yVel -= state.player.thrust;
            if(keys['ArrowDown']||keys['KeyS']) state.player.yVel += state.player.thrust;
            if(keys['ArrowLeft']||keys['KeyA']) { state.player.xVel -= state.player.thrust; state.player.dir = 'left'; }
            if(keys['ArrowRight']||keys['KeyD']) { state.player.xVel += state.player.thrust; state.player.dir = 'right'; }

            state.player.x += state.player.xVel;
            state.player.y += state.player.yVel;
            state.player.xVel *= state.player.friction;
            state.player.yVel *= state.player.friction;

            // clamp to canvas borders (walls)
            state.player.x = Math.max(state.player.r, Math.min(c.width - state.player.r, state.player.x));
            state.player.y = Math.max(state.player.r, Math.min(c.height - state.player.r, state.player.y));

            // stars
            state.stars.forEach(s=>{
                if(s.collected) return;
                // draw using star image when available, fallback to circle
                drawStarImage(s);
                const dx = s.x - state.player.x;
                const dy = s.y - state.player.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < s.r + state.player.r){
                    s.collected = true;
                    state.score++;
                    state.collectedTotal++;
                    try{ ctx.hud.querySelector('#score').textContent = 'Stars: ' + state.collectedTotal; }catch(e){}
                    playBeep();
                    // ensure at least 6 visible stars
                    // remove the collected star and spawn a replacement later
                    setTimeout(()=>{
                        // prune collected flags and ensure at least 6 uncollected exist
                        state.stars = state.stars.filter(x=>!x.collected);
                        while(state.stars.length < 12){ addOneStar(); }
                    }, 80);
                }
            });

            // draw the astronaut sprite at a visible size (48x48) if available, else fallback to circle
            try{
                const imgL = window.assets && window.assets.images && window.assets.images.astronautLeft;
                const imgR = window.assets && window.assets.images && window.assets.images.astronautRight;
                const pSize = 48;
                // default to left-facing
                if(state.player.dir === 'right' && imgR){ state.ctx.drawImage(imgR, state.player.x - pSize/2, state.player.y - pSize/2, pSize, pSize); }
                else if(imgL){ state.ctx.drawImage(imgL, state.player.x - pSize/2, state.player.y - pSize/2, pSize, pSize); }
                else drawCircle(state.player.x, state.player.y, state.player.r, '#88e0ff');
            }catch(e){ drawCircle(state.player.x, state.player.y, state.player.r, '#88e0ff'); }

            if(keys['ArrowUp']||keys['KeyW']||keys['ArrowDown']||keys['KeyS']||keys['ArrowLeft']||keys['KeyA']||keys['ArrowRight']||keys['KeyD']){
                // thrust visual
                state.ctx.beginPath(); state.ctx.fillStyle='rgba(255,180,90,0.9)'; state.ctx.arc(state.player.x, state.player.y+state.player.r+6, 6, 0, Math.PI*2); state.ctx.fill(); state.ctx.closePath();
            }

            // win when total collected reaches 20
            if(state.collectedTotal >= 20){
                try{ if(window.assets && window.assets.audio && window.assets.audio.levelPass){ window.assets.audio.levelPass.currentTime = 0; window.assets.audio.levelPass.play().catch(()=>{}); } else { ctx.speak('Well done! You collected 20 stars.'); } }catch(e){}
                setTimeout(()=>finish(true),800);
                return;
            }

            state.animId = requestAnimationFrame(loop);
        }

        function finish(result){
            state.running = false;
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            if(state.animId) cancelAnimationFrame(state.animId);
            // resolve promise
            resolve(result === true);
        }

        // init
        initPlayer();
        generateStars(12);
        try{ ctx.hud.querySelector('#score').textContent = 'Stars: 0'; }catch(e){}
        // play option sound then narration after 1.5s (use lvl1Voice if available)
        let narrationAudio = null;
        try{ if(window.assets && window.assets.audio && window.assets.audio.option){ window.assets.audio.option.currentTime = 0; window.assets.audio.option.play().catch(()=>{}); } }catch(e){}
        const narrationTimeout = setTimeout(()=>{
            try{
                if(window.assets && window.assets.audio && window.assets.audio.lvl1Voice){
                    narrationAudio = window.assets.audio.lvl1Voice;
                    narrationAudio.currentTime = 0;
                    narrationAudio.play().catch(()=>{});
                    console.log('Level 1 narration: playing lvl1Voice');
                } else {
                    console.log('Level 1 narration: using speechSynthesis fallback');
                    ctx.speak("Welcome to microgravity! Here, floating means there’s no up or down — your movements don’t stop unless you push in the opposite direction. Try to collect all stars using gentle bursts of thrust!");
                }
            }catch(e){ console.warn('Level 1 narration failed', e); }
        }, 1500);
        loop();
    });
}
