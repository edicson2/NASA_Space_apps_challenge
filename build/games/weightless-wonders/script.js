// Module entry: manages starfield, menu and dynamic level loading
document.addEventListener("DOMContentLoaded", function () {
	const starfield = document.querySelector(".starfield");

	// Function to generate a random number within a range
	function getRandomNumber(min, max) {
		return Math.random() * (max - min) + min;
	}

	// Function to create a star element
	function createStar() {
		const star = document.createElement("div");
		star.classList.add("star");
		const isShootingStar = Math.random() > 0.95; // 5% chance of creating a shooting star
		if (isShootingStar) {
			star.classList.add("shooting-star");
			star.style.animationDuration = `${getRandomNumber(2, 4)}s`; // Set animation duration for shooting stars
		}
		star.style.left = `${getRandomNumber(0, 100)}vw`;
		star.style.top = `${getRandomNumber(0, 100)}vh`;
		star.style.width = `${isShootingStar ? getRandomNumber(3, 5) : getRandomNumber(1, 2)}px`; // Larger width for shooting stars
		star.style.height = `${isShootingStar ? getRandomNumber(3, 5) : getRandomNumber(1, 2)}px`; // Larger height for shooting stars
		starfield.appendChild(star);
	}

	// Generate stars including shooting stars
	for (let i = 0; i < 1000; i++) {
		createStar();
	}

	// Function to make stars fade in and out
	function blinkStars() {
		const stars = document.querySelectorAll(".star");
		stars.forEach((star) => {
			const duration = getRandomNumber(2, 4); // Randomize duration for each star
			star.style.animation = `blink ${duration}s infinite alternate`;
		});
	}

	// Blink stars
	blinkStars();

	// Level manager state
	const levelManager = {
		current: 0,
		total: 4,
		runningLevel: null,
		paused: false
	};
	// expose globally so levels can read pause state and HUD objective
	try{ window.levelManager = levelManager; }catch(e){}

	const startButton = document.getElementById('startButton');
	const menu = document.getElementById('menu');
	const gameContainer = document.getElementById('gameContainer');

	// Pause functionality handled by 'P' key only

	// Simple asset loader (images + audio)
	const assets = {
		images: {},
		audio: {}
	};

	async function loadAssets(){
		// images
		const imgList = {
			astronautLeft: './assets/astronaut left.png',
			astronautRight: './assets/astronaut right.png',
			star: './assets/star.jpg',
			earth: './assets/earth.png',
			mars: './assets/mars.png',
			moon: './assets/moon.png'
		};
		await Promise.all(Object.entries(imgList).map(([k, url]) => new Promise((res, rej) => {
			const img = new Image(); img.onload = () => { assets.images[k] = img; res(); }; img.onerror = rej; img.src = url;
		})));

		// audio
		// audio (voice files explicitly mapped to existing assets)
		const audioList = {
			option: './assets/option selected.mp3',
			levelPass: './assets/level passed.mp3',
			starCollect: './assets/star collected.mp3',
			// narration clips (only include files that exist in assets/)
			lvl1Voice: './assets/lvl1 voice.mp3',
			lvl2Voice: './assets/lvl2 voice.mp3',
			lvl3Voice: './assets/lvl3 voice.mp3',
			lvl4Voice: './assets/lvl4 voice.mp3'
		};
		Object.entries(audioList).forEach(([k,url]) => { assets.audio[k] = new Audio(url); assets.audio[k].preload = 'auto'; });
	}

	// preload assets in background and expose globally for levels
	const assetsReady = loadAssets().then(() => { try{ window.assets = assets; }catch(e){}
		// adjust volumes: star collect quieter, and start background music loop at 50%
		try{ if(assets.audio && assets.audio.starCollect) assets.audio.starCollect.volume = 0.5; }catch(e){}
		try{ if(assets.audio && assets.audio['space background music']){
			assets.audio['space background music'].loop = true;
			assets.audio['space background music'].volume = 0.5;
			// start background music immediately and keep it playing regardless of pause/menu
			assets.audio['space background music'].play().catch(()=>{});
		}
		}catch(e){}
	}).catch(e=>{ console.warn('Asset load failed', e); });

	// Start button: disable while loading and start sequence
	startButton.addEventListener('click', async () => {
		// If paused, use the same toggle function as pressing P
		if(levelManager.paused){
			togglePause(); // same behavior as pressing P
			return;
		}
		try{
			startButton.disabled = true;
			startButton.textContent = 'Loading...';
			console.log('Start pressed — loading level sequence');
			// call sequence; startLevelSequence will hide the menu when it's ready to show the canvas
			await startLevelSequence(1);
		}catch(err){
			console.error('Error starting level sequence', err);
			menu.classList.remove('hidden');
		}finally{
			startButton.disabled = false;
			startButton.textContent = 'Start (Play Levels in order)';
		}
	});



	// Resize canvas to be larger and match container before starting a level
	function resizeCanvasToContainer(){
		const canvas = document.getElementById('gameCanvas');
		const container = document.getElementById('gameContainer');
		if(!canvas || !container) return;
		// make canvas fill most of viewport with padding
		const maxW = Math.max(800, Math.floor(window.innerWidth * 0.9));
		const maxH = Math.max(480, Math.floor(window.innerHeight * 0.82));
		canvas.width = maxW;
		canvas.height = maxH;
		canvas.style.width = maxW + 'px';
		canvas.style.height = maxH + 'px';
	}

	window.addEventListener('resize', resizeCanvasToContainer);

	// Pause button click handler removed; use keyboard 'P' to toggle pause/resume instead.

	// helper used to resume narrations on Continue
	function resumeNarrationIfAny(){
		try{ if(assets && assets.audio){ ['lvl1Voice','lvl2Voice','lvl3Voice','lvl4Voice'].forEach(k=>{ const a = assets.audio[k]; if(a && a.paused && a.currentTime > 0){ a.play().catch(()=>{}); } }); } }catch(e){}
	}

	// Toggle pause/resume via keyboard 'P'
	function togglePause(){
		// only toggle when game canvas is visible
		try{ const gc = document.getElementById('gameContainer'); if(gc && gc.classList.contains('hidden')) return; }catch(e){}
		if(!levelManager.paused){
			// pause
			levelManager.paused = true;
			// pause narration and some SFX
			try{ if(assets && assets.audio){ ['lvl1Voice','lvl2Voice','lvl3Voice','lvl4Voice','starCollect','levelPass','option'].forEach(k=>{ const a = assets.audio[k]; if(a) try{ a.pause(); }catch(e){} }); } }catch(e){}
			try{ 
				const titleEl = menu && menu.querySelector && menu.querySelector('.menu-title'); 
				if(titleEl) {
					// Update both the SVG text and the fallback text
					const svgText = titleEl.querySelector('svg text');
					if(svgText) svgText.textContent = 'Pause';
					// Update the fallback text content (the last text node)
					const textNodes = Array.from(titleEl.childNodes).filter(node => node.nodeType === 3);
					if(textNodes.length) textNodes[textNodes.length-1].textContent = 'Pause';
				}
			}catch(e){}
			try{ menu.classList.remove('hidden'); }catch(e){}
			try{ 
				startButton.disabled = false; // Ensure button is enabled when showing Continue
				startButton.textContent = 'Continue';
			}catch(e){}
		} else {
			// resume
			levelManager.paused = false;
			try{ 
				const titleEl = menu && menu.querySelector && menu.querySelector('.menu-title'); 
				if(titleEl) {
					// Update both the SVG text and the fallback text
					const svgText = titleEl.querySelector('svg text');
					if(svgText) svgText.textContent = 'Weightless Wonders';
					// Update the fallback text content (the last text node)
					const textNodes = Array.from(titleEl.childNodes).filter(node => node.nodeType === 3);
					if(textNodes.length) textNodes[textNodes.length-1].textContent = 'Weightless Wonders';
				}
			}catch(e){}
			try{ menu.classList.add('hidden'); }catch(e){}
			// resume narration audio if present
			try{ if(assets && assets.audio){ ['lvl1Voice','lvl2Voice','lvl3Voice','lvl4Voice'].forEach(k=>{ const a = assets.audio[k]; if(a && a.paused && a.currentTime>0){ a.play().catch(()=>{}); } }); } }catch(e){}
			try{ 
				startButton.disabled = false; // Ensure button is enabled when returning to start
				startButton.textContent = 'Start (Play Levels in order)';
			}catch(e){}
		}
	}

	document.addEventListener('keydown', (e)=>{ if(e.code === 'KeyP'){ togglePause(); } });

	function stopAllAudio(){
		// stop everything except background music which we want to persist across menu
		Object.entries(assets.audio || {}).forEach(([k,a])=>{ try{ if(k === 'space background music'){ /* keep it playing */ return; } a.pause(); a.currentTime = 0; }catch(e){} });
		// stop speech synthesis
		if('speechSynthesis' in window){ speechSynthesis.cancel(); }
	}

	function stopNarration(){
		// stop any narration audio elements but don't reset other game sounds
		try{
			if(assets && assets.audio){
				['lvl1Voice','lvl2Voice','lvl3Voice','lvl4Voice'].forEach(k=>{
					const a = assets.audio[k]; if(a){ try{ a.pause(); a.currentTime = 0; }catch(e){} }
				});
			}
		}catch(e){}
		if('speechSynthesis' in window) try{ speechSynthesis.cancel(); }catch(e){}
	}

	async function startLevelSequence(startAt){
		// ensure any previous level is fully stopped
		stopRunningLevel();
		levelManager.current = startAt;
		while(levelManager.current <= levelManager.total){
			// resize canvas to a larger play area before starting
			resizeCanvasToContainer();
			// wait for assets to be ready and ensure imports complete before hiding menu
			try{ await assetsReady.catch(()=>{}); }catch(e){}
			// Start reveal animation
			menu.classList.add('reveal');
			// After animation completes, hide menu and show game
			setTimeout(() => {
				menu.classList.add('hidden');
				menu.classList.remove('reveal');
				gameContainer.classList.remove('hidden');
			}, 600);
			const success = await startLevel(levelManager.current);
			if(!success) break; // aborted
			levelManager.current++;
		}
		// sequence finished — return to menu
		stopRunningLevel();
		gameContainer.classList.add('hidden');
		menu.classList.remove('hidden');
		// Pause functionality handled by 'P' key only
	}

	let runningModule = null;

		// Function to update progress bar
		function updateProgress(stars) {
			const progress = document.getElementById('progress');
			if (progress) {
				const percentage = (stars / 20) * 100;
				progress.style.width = `${Math.min(100, percentage)}%`;
			}
		}

		// Function to reset progress
		function resetProgress() {
			const progress = document.getElementById('progress');
			if (progress) {
				progress.style.width = '0%';
			}
		}

		// Observer to watch for score changes
		const scoreObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'characterData' || mutation.type === 'childList') {
					const scoreText = mutation.target.textContent || '';
					const stars = parseInt(scoreText.match(/\d+/) || '0');
					updateProgress(stars);
				}
			});
		});

		// Start observing score element
		const scoreElement = document.getElementById('score');
		if (scoreElement) {
			scoreObserver.observe(scoreElement, {
				characterData: true,
				childList: true,
				subtree: true
			});
		}

		async function startLevel(n){
			// Reset progress bar for new level
			resetProgress();

			// Update level-specific background
			const gameContainer = document.getElementById('gameContainer');
			if (gameContainer) {
				gameContainer.dataset.level = n.toString();
			}

			let moduleUrl = new URL(`./levels/level${n}.js`, import.meta.url).href;
			console.log('Importing level module from', moduleUrl);
			// wait for assets to be ready before loading level
			try{ await assetsReady.catch(()=>{}); }catch(e){}

			try{

				// ensure any previous module is stopped before loading a new one
				stopRunningLevel();
				// stop any narration/voice to avoid overlap when the new level begins
				stopNarration();
				runningModule = await import(moduleUrl);
				if(typeof runningModule.start !== 'function'){
					console.warn('Level', n, 'has no start() export');
					return false;
				}
				// provide hooks and DOM elements
				const ctx = {
					canvas: document.getElementById('gameCanvas'),
					hud: document.getElementById('hud'),
					speak: speak,
					done: () => {} // placeholder — will be replaced per-level promise
				};
				// mark running level in manager
				levelManager.runningLevel = n;
				// each level's start should return a promise that resolves when level completes or is aborted
				const finished = await runningModule.start(ctx);
				levelManager.runningLevel = null;
				return finished === true;
			}catch(err){
				console.error('Failed to load level', n, err);
				return false;
			}finally{
				// All audio is now directly referenced by level number
			}
		}

	function stopRunningLevel(){
		if(runningModule && typeof runningModule.stop === 'function'){
			try{ runningModule.stop(); }catch(e){/*ignore*/}
		}
		runningModule = null;
		// Reset progress when stopping level
		resetProgress();
	}

	// Web Speech helper
	function speak(text){
		if(!('speechSynthesis' in window)) return;
		const utter = new SpeechSynthesisUtterance(text);
		utter.rate = 1.0;
		speechSynthesis.cancel();
		speechSynthesis.speak(utter);
	}

	// Note: per-level implementations live in `levels/levelX.js` modules.
	// The LevelManager dynamically imports them and calls their exported start(ctx) function.
});
