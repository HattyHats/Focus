/**
 * FOCUS DASHBOARD - CORE APPLICATION ENGINE
 * Design: Cyber-Obsidian Glassmorphism
 * Created by HattyHats
 */

(function () {
    'use strict';

    // ==========================================================================
    // 1. SOUND ENGINE (Web Audio API Synthesizer & Ambient Generator)
    // ==========================================================================
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.masterGain = null;
            this.ambientSource = null;
            this.ambientGain = null;
            this.currentSound = 'none';
            this.volume = 0.5;
            this.isPlaying = false;
        }

        init() {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = this.volume;
                this.masterGain.connect(this.ctx.destination);
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        setVolume(val) {
            this.volume = Math.max(0, Math.min(1, val));
            if (this.masterGain) {
                this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            }
        }

        playChime(type = 'enter') {
            this.init();
            const now = this.ctx.currentTime;

            if (type === 'enter') {
                // Futuristic cinematic triad chime (C4, G4, C5, E5)
                [261.63, 392.00, 523.25, 659.25].forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + i * 0.08);

                    gain.gain.setValueAtTime(0, now + i * 0.08);
                    gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 1.2);

                    osc.connect(gain);
                    gain.connect(this.masterGain);
                    osc.start(now + i * 0.08);
                    osc.stop(now + i * 0.08 + 1.3);
                });
            } else if (type === 'bell') {
                // Focus timer complete bell
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);

                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now);
                osc.stop(now + 1.6);
            } else if (type === 'success') {
                // Quick task completion pop
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, now); // D5
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now);
                osc.stop(now + 0.3);
            }
        }

        startAmbient(type) {
            this.init();
            this.stopAmbient();
            this.currentSound = type;
            if (type === 'none') {
                this.isPlaying = false;
                return;
            }

            this.isPlaying = true;
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            this.ambientGain.connect(this.masterGain);

            if (type === 'rain') {
                // Cyber rain generator with filtered white noise & resonance
                const bufferSize = this.ctx.sampleRate * 2;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 800;

                noise.connect(filter);
                filter.connect(this.ambientGain);
                noise.start();
                this.ambientSource = noise;
            } else if (type === 'drone') {
                // Deep space alpha binaural drone (108Hz + 116Hz = 8Hz alpha wave beat)
                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                osc1.type = 'sine';
                osc2.type = 'sine';
                osc1.frequency.value = 108;
                osc2.frequency.value = 116;

                osc1.connect(this.ambientGain);
                osc2.connect(this.ambientGain);
                osc1.start();
                osc2.start();
                this.ambientSource = { stop: () => { osc1.stop(); osc2.stop(); } };
            } else if (type === 'white') {
                // Concentration white noise
                const bufferSize = this.ctx.sampleRate * 2;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.5;
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;
                noise.connect(this.ambientGain);
                noise.start();
                this.ambientSource = noise;
            }
        }

        stopAmbient() {
            if (this.ambientSource) {
                try { this.ambientSource.stop(); } catch (e) {}
                this.ambientSource = null;
            }
            this.isPlaying = false;
        }

        toggleAmbient(type) {
            if (this.isPlaying) {
                this.stopAmbient();
                return false;
            } else {
                this.startAmbient(type || 'rain');
                return true;
            }
        }
    }

    const sound = new SoundEngine();

    // ==========================================================================
    // 2. SPLASH SCREEN (Particle Constellation & Telemetry)
    // ==========================================================================
    const splashScreen = document.getElementById('splashScreen');
    const splashCanvas = document.getElementById('splashCanvas');
    const enterBtn = document.getElementById('enterBtn');
    const splashQuote = document.getElementById('splashQuote');
    const telemetryText = document.getElementById('telemetryText');
    const dontShowSplashCheckbox = document.getElementById('dontShowSplash');

    const QUOTES = [
        "“Where focus goes, energy flows.” — Tony Robbins",
        "“Deep work is the superpower of the 21st century.” — Cal Newport",
        "“Eliminate the noise. Amplify the signal.”",
        "“Mastery demands complete and relentless presence.”",
        "“One task, one moment, supreme execution.”",
        "“Build your fortress of concentration.”"
    ];

    if (splashQuote) {
        splashQuote.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    }

    // Telemetry sequence
    if (telemetryText) {
        const statuses = [
            "INITIALIZING NEURAL MESH...",
            "CALIBRATING WORKSPACES...",
            "SYNCING LIVE TELEMETRY...",
            "FOCUS MATRIX ONLINE • READY"
        ];
        let sIdx = 0;
        const sInt = setInterval(() => {
            sIdx++;
            if (sIdx < statuses.length) {
                telemetryText.textContent = statuses[sIdx];
            } else {
                clearInterval(sInt);
            }
        }, 600);
    }

    // Particle Constellation on Splash Canvas
    let splashCtx = splashCanvas ? splashCanvas.getContext('2d') : null;
    let particles = [];
    let mouse = { x: -1000, y: -1000, radius: 140 };

    function initSplashParticles() {
        if (!splashCanvas) return;
        splashCanvas.width = window.innerWidth;
        splashCanvas.height = window.innerHeight;
        particles = [];
        const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 14000));
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * splashCanvas.width,
                y: Math.random() * splashCanvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 1,
                color: i % 3 === 0 ? 'rgba(139, 92, 246, 0.8)' : (i % 3 === 1 ? 'rgba(96, 165, 250, 0.7)' : 'rgba(236, 72, 153, 0.7)')
            });
        }
    }

    function animateSplashParticles() {
        if (!splashCtx || splashScreen.classList.contains('hide-splash')) return;
        splashCtx.clearRect(0, 0, splashCanvas.width, splashCanvas.height);

        // Update & draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > splashCanvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > splashCanvas.height) p.vy *= -1;

            // Mouse repulsion
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const angle = Math.atan2(dy, dx);
                p.x -= Math.cos(angle) * 2;
                p.y -= Math.sin(angle) * 2;
            }

            splashCtx.beginPath();
            splashCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            splashCtx.fillStyle = p.color;
            splashCtx.shadowBlur = 8;
            splashCtx.shadowColor = p.color;
            splashCtx.fill();
            splashCtx.shadowBlur = 0;

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const d = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (d < 120) {
                    splashCtx.beginPath();
                    splashCtx.moveTo(p.x, p.y);
                    splashCtx.lineTo(p2.x, p2.y);
                    splashCtx.strokeStyle = `rgba(139, 92, 246, ${0.25 * (1 - d / 120)})`;
                    splashCtx.lineWidth = 0.75;
                    splashCtx.stroke();
                }
            }
        }

        requestAnimationFrame(animateSplashParticles);
    }

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('resize', () => {
        if (splashCanvas) {
            splashCanvas.width = window.innerWidth;
            splashCanvas.height = window.innerHeight;
            initSplashParticles();
        }
    });

    // Check if user previously checked "don't show splash"
    const hasSeenSplash = localStorage.getItem('focus_skip_splash') === 'true' || sessionStorage.getItem('focus_dashboard_has_seen_splash') === 'true';

    function hideSplash() {
        sound.playChime('enter');
        if (splashScreen) {
            splashScreen.classList.add('hide-splash');
        }
        sessionStorage.setItem('focus_dashboard_has_seen_splash', 'true');
        if (dontShowSplashCheckbox && dontShowSplashCheckbox.checked) {
            localStorage.setItem('focus_skip_splash', 'true');
        }
    }

    if (hasSeenSplash) {
        if (splashScreen) splashScreen.style.display = 'none';
    } else {
        initSplashParticles();
        animateSplashParticles();
        if (enterBtn) {
            enterBtn.addEventListener('click', hideSplash);
        }
    }

    // ==========================================================================
    // 3. THEME & COLOR CUSTOMIZATION
    // ==========================================================================
    const THEMES = [
        { name: 'Cyber Purple', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
        { name: 'Tokyo Pink', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
        { name: 'Matrix Green', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
        { name: 'Ocean Cyan', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
        { name: 'Solar Orange', color: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
        { name: 'Electric Blue', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' }
    ];

    function applyTheme(color) {
        document.documentElement.style.setProperty('--accent-color', color);
        document.documentElement.style.setProperty('--accent-glow', color + '55');
        document.documentElement.style.setProperty('--accent-hover', color);
        localStorage.setItem('focus_theme_color', color);
    }

    const savedTheme = localStorage.getItem('focus_theme_color') || '#8b5cf6';
    applyTheme(savedTheme);

    // ==========================================================================
    // 4. WORKSPACE DATA MODEL
    // ==========================================================================
    const DEFAULT_WORKSPACES = [
        {
            id: 'ws-main',
            name: 'Command Center',
            widgets: [
                { id: 'globe-1', type: 'CYBER_GLOBE', span: 1 },
                { id: 'pomo-1', type: 'POMODORO', span: 1 },
                { id: 'todo-1', type: 'TODO', span: 1 },
                { id: 'notes-1', type: 'NOTES', span: 1 },
                { id: 'matrix-1', type: 'HABIT_MATRIX', span: 2 },
                { id: 'markets-1', type: 'MARKETS', span: 1 },
                { id: 'clock-1', type: 'CLOCK', span: 1 }
            ]
        },
        {
            id: 'ws-deepwork',
            name: 'Deep Work',
            widgets: [
                { id: 'soundscape-1', type: 'SOUNDSCAPE', span: 2 },
                { id: 'pomo-2', type: 'POMODORO', span: 1 },
                { id: 'breath-1', type: 'BREATHING', span: 1 },
                { id: 'binaural-1', type: 'BINAURAL', span: 1 },
                { id: 'word-1', type: 'WORD_COUNTER', span: 1 },
                { id: 'dict-1', type: 'DICTIONARY', span: 1 },
                { id: 'ambient-1', type: 'AMBIENT_WEATHER', span: 1 }
            ]
        },
        {
            id: 'ws-trading',
            name: 'Markets & Crypto',
            widgets: [
                { id: 'markets-2', type: 'MARKETS', span: 1 },
                { id: 'heatmap-1', type: 'CRYPTO_HEATMAP', span: 2 },
                { id: 'blockchain-1', type: 'BLOCKCHAIN', span: 1 },
                { id: 'news-1', type: 'NEWS_CRYPTO', span: 1 }
            ]
        }
    ];

    let workspaces = [];
    try {
        const saved = localStorage.getItem('focus_dashboard_workspaces');
        workspaces = saved ? JSON.parse(saved) : DEFAULT_WORKSPACES;
    } catch (e) {
        workspaces = DEFAULT_WORKSPACES;
    }

    // Auto-hydrate new standout widgets if not present in existing session
    if (workspaces && workspaces.length > 0) {
        if (!workspaces.some(ws => ws.widgets.some(w => w.type === 'CYBER_GLOBE'))) {
            workspaces[0].widgets.unshift({ id: 'globe-1', type: 'CYBER_GLOBE', span: 1 });
        }
        if (!workspaces.some(ws => ws.widgets.some(w => w.type === 'SOUNDSCAPE'))) {
            const deepWorkWs = workspaces.find(ws => ws.id === 'ws-deepwork');
            if (deepWorkWs) {
                deepWorkWs.widgets.unshift({ id: 'soundscape-1', type: 'SOUNDSCAPE', span: 2 });
            }
        }
    }

    let activeWorkspaceId = localStorage.getItem('focus_dashboard_active_workspace') || (workspaces[0] ? workspaces[0].id : 'ws-main');
    if (!workspaces.find(w => w.id === activeWorkspaceId)) {
        activeWorkspaceId = workspaces[0] ? workspaces[0].id : 'ws-main';
    }

    function saveWorkspaces() {
        localStorage.setItem('focus_dashboard_workspaces', JSON.stringify(workspaces));
        localStorage.setItem('focus_dashboard_active_workspace', activeWorkspaceId);
    }

    function getActiveWorkspace() {
        return workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
    }

    // ==========================================================================
    // 5. ALL 21 WIDGET DEFINITIONS & DIRECTORY
    // ==========================================================================
    const WIDGET_REGISTRY = {
        POMODORO: {
            name: 'Pomodoro Timer',
            icon: '⏱️',
            desc: 'Stay in the flow with customizable focus & break intervals.',
            span: 1,
            render: renderPomodoroWidget
        },
        TODO: {
            name: 'Task Slayer (To-Do)',
            icon: '✅',
            desc: 'Organize high-priority goals and destroy distractions.',
            span: 1,
            render: renderTodoWidget
        },
        NOTES: {
            name: 'Quick Scratchpad',
            icon: '📝',
            desc: 'Instant auto-saving notes with character & word counts.',
            span: 1,
            render: renderNotesWidget
        },
        MARKETS: {
            name: 'Markets & Crypto',
            icon: '📈',
            desc: 'Real-time prices, 24h gainers, and sparklines for top assets.',
            span: 1,
            render: renderMarketsWidget
        },
        CRYPTO_HEATMAP: {
            name: 'Crypto Heatmap',
            icon: '🗺️',
            desc: 'Treemap visualization of the cryptocurrency market.',
            span: 2,
            render: renderHeatmapWidget
        },
        BLOCKCHAIN: {
            name: 'Live Global Crypto Transactions',
            icon: '⛓️',
            desc: 'Real-time live feed of global Bitcoin & token transactions, TPS meter, and whale tracker.',
            span: 2,
            render: renderBlockchainWidget
        },
        WEATHER: {
            name: 'Weather Forecast',
            icon: '⛅',
            desc: 'Current temperature, sky condition, humidity, and wind.',
            span: 1,
            render: renderWeatherWidget
        },
        AMBIENT_WEATHER: {
            name: 'Ambient Rain & Cosmos',
            icon: '🌧️',
            desc: 'Animated backdrop visualizer with atmospheric rainfall.',
            span: 1,
            render: renderAmbientWeatherWidget
        },
        CLOCK: {
            name: 'World Clock',
            icon: '🌍',
            desc: 'Track local time alongside Tokyo, London, and New York.',
            span: 1,
            render: renderWorldClockWidget
        },
        CALCULATOR: {
            name: 'Smart Calculator',
            icon: '🧮',
            desc: 'Fast calculation pad with history tape and keyboard input.',
            span: 1,
            render: renderCalculatorWidget
        },
        CALENDAR: {
            name: 'Monthly Planner',
            icon: '📅',
            desc: 'Clean monthly overview with date highlighter and notes.',
            span: 1,
            render: renderCalendarWidget
        },
        WORD_COUNTER: {
            name: 'Word & Text Analyzer',
            icon: '📊',
            desc: 'Word count, character stats, reading time, and complexity.',
            span: 1,
            render: renderWordCounterWidget
        },
        DICTIONARY: {
            name: 'Dictionary & Lexicon',
            icon: '📖',
            desc: 'Instant definitions, phonetics, and clickable synonyms.',
            span: 1,
            render: renderDictionaryWidget
        },
        VISION: {
            name: 'Focus Vision Board',
            icon: '🎯',
            desc: 'Keep your ultimate goal and inspiring imagery front-and-center.',
            span: 1,
            render: renderVisionWidget
        },
        SPOTIFY: {
            name: 'Lofi Radio (Spotify)',
            icon: '🎧',
            desc: 'Official Spotify chill beats and lofi background player.',
            span: 1,
            render: renderSpotifyWidget
        },
        HATTY: {
            name: 'Chill With Hatty',
            icon: '🎩',
            desc: 'Original relaxing beats and soundscapes by HattyHats.',
            span: 1,
            render: renderHattyWidget
        },
        EMBED: {
            name: 'Website Embedder',
            icon: '🌐',
            desc: 'Embed reference docs, tools, or research pages in an iframe.',
            span: 2,
            render: renderEmbedWidget
        },
        BOOKMARKS: {
            name: 'Quick Bookmarks',
            icon: '🔖',
            desc: 'Fast shortcuts to your essential research and daily tools.',
            span: 1,
            render: renderBookmarksWidget
        },
        NEWS_AI: {
            name: 'AI & Future Tech News',
            icon: '🤖',
            desc: 'Curated breakthroughs in Artificial Intelligence and tech.',
            span: 1,
            render: (w, b) => renderNewsWidget(w, b, 'AI & Machine Learning')
        },
        NEWS_CRYPTO: {
            name: 'Crypto & Web3 News',
            icon: '🪙',
            desc: 'Latest market movements and blockchain industry updates.',
            span: 1,
            render: (w, b) => renderNewsWidget(w, b, 'Crypto & Blockchain')
        },
        NEWS_POLITICS: {
            name: 'World News Pulse',
            icon: '📰',
            desc: 'High-signal global headlines and international updates.',
            span: 1,
            render: (w, b) => renderNewsWidget(w, b, 'Global News')
        },
        BREATHING: {
            name: 'Box Breathing Circle',
            icon: '🌬️',
            desc: '4-7-8 relaxation & nervous system reset for peak focus.',
            span: 1,
            render: renderBreathingWidget
        },
        BINAURAL: {
            name: 'Neural Binaural Beats',
            icon: '🧠',
            desc: 'Synthesizes Alpha (10Hz), Theta (6Hz), and Beta (18Hz) brainwaves.',
            span: 1,
            render: renderBinauralWidget
        },
        HABIT_MATRIX: {
            name: 'Deep Work Matrix',
            icon: '🔥',
            desc: 'GitHub-style heatmap tracking your daily focus hours and streaks.',
            span: 2,
            render: renderHabitMatrixWidget
        },
        CYBER_GLOBE: {
            name: '3D Cyber Globe & Orbit',
            icon: '🌐',
            desc: 'Real-time 3D wireframe Earth with rotatable globe, cities, and satellite tracking.',
            span: 1,
            render: renderCyberGlobeWidget
        },
        SOUNDSCAPE: {
            name: 'Ambient Soundscape Studio',
            icon: '🎛️',
            desc: 'Multi-layer procedural audio generator (Cyber Rain, Deep Drone, Binaural, Bells) with spectrum visualizer.',
            span: 2,
            render: renderSoundscapeWidget
        }
    };

    // ==========================================================================
    // 6. WIDGET RENDERING IMPLEMENTATIONS
    // ==========================================================================

    // 1. Pomodoro Widget
    function renderPomodoroWidget(widget, container) {
        let mode = 'work'; // 'work', 'short', 'long'
        let duration = 25 * 60;
        let timeLeft = duration;
        let timerId = null;

        container.innerHTML = `
            <div class="pomo-container">
                <div class="pomo-modes">
                    <button class="pomo-mode-btn active" data-mode="work">Work (25m)</button>
                    <button class="pomo-mode-btn" data-mode="short">Short Break (5m)</button>
                    <button class="pomo-mode-btn" data-mode="long">Long Break (15m)</button>
                </div>
                <div class="pomo-ring-box">
                    <svg class="pomo-svg" viewBox="0 0 100 100">
                        <circle class="pomo-bg-circle" cx="50" cy="50" r="42" />
                        <circle class="pomo-progress-circle" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="0" />
                    </svg>
                    <div class="pomo-digits">25:00</div>
                </div>
                <div class="pomo-controls">
                    <button class="btn-pomo btn-pomo-primary" id="pomoStartBtn">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        START
                    </button>
                    <button class="btn-pomo btn-pomo-secondary" id="pomoResetBtn">RESET</button>
                </div>
            </div>
        `;

        const digits = container.querySelector('.pomo-digits');
        const progress = container.querySelector('.pomo-progress-circle');
        const startBtn = container.querySelector('#pomoStartBtn');
        const resetBtn = container.querySelector('#pomoResetBtn');
        const modeBtns = container.querySelectorAll('.pomo-mode-btn');

        function updateDisplay() {
            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            digits.textContent = `${m}:${s}`;
            const offset = 264 - (264 * (timeLeft / duration));
            progress.style.strokeDashoffset = offset;
        }

        function setMode(newMode) {
            mode = newMode;
            modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === newMode));
            if (mode === 'work') duration = 25 * 60;
            else if (mode === 'short') duration = 5 * 60;
            else if (mode === 'long') duration = 15 * 60;
            clearInterval(timerId);
            timerId = null;
            timeLeft = duration;
            startBtn.innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> START`;
            updateDisplay();
        }

        modeBtns.forEach(b => {
            b.addEventListener('click', () => setMode(b.dataset.mode));
        });

        startBtn.addEventListener('click', () => {
            sound.init();
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
                startBtn.innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> RESUME`;
            } else {
                startBtn.innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> PAUSE`;
                timerId = setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                        updateDisplay();
                    } else {
                        clearInterval(timerId);
                        timerId = null;
                        sound.playChime('bell');
                        if (mode === 'work') {
                            incrementSessionCount();
                            logDeepWorkMinutes(25);
                        }
                        
                        // Sleek In-App Completion Banner
                        const existingBanner = container.querySelector('.pomo-banner');
                        if (existingBanner) existingBanner.remove();
                        const banner = document.createElement('div');
                        banner.className = 'pomo-banner';
                        banner.innerHTML = `
                            <span>🎉 ${mode.toUpperCase()} complete! Ready for ${mode === 'work' ? 'Break' : 'Focus'}?</span>
                            <button class="pomo-banner-close">Dismiss</button>
                        `;
                        container.appendChild(banner);
                        banner.querySelector('.pomo-banner-close').addEventListener('click', () => banner.remove());
                        setTimeout(() => { if (banner.isConnected) banner.remove(); }, 6000);

                        setMode(mode === 'work' ? 'short' : 'work');
                    }
                }, 1000);
            }
        });

        resetBtn.addEventListener('click', () => setMode(mode));
        updateDisplay();
    }

    function incrementSessionCount() {
        let count = parseInt(localStorage.getItem('focus_sessions_today') || '0', 10) + 1;
        localStorage.setItem('focus_sessions_today', count.toString());
        updateStatsHeader();
    }

    function logDeepWorkMinutes(mins) {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${day}`;
        let logs = {};
        try {
            logs = JSON.parse(localStorage.getItem('focus_deep_work_logs') || '{}');
        } catch (e) { logs = {}; }
        const addHours = +(mins / 60).toFixed(2);
        logs[todayStr] = +((logs[todayStr] || 0) + addHours).toFixed(1);
        localStorage.setItem('focus_deep_work_logs', JSON.stringify(logs));
        window.dispatchEvent(new CustomEvent('focus:deepwork-updated', { detail: { date: todayStr, hours: logs[todayStr] } }));
    }

    // 2. To-Do Widget
    function renderTodoWidget(widget, container) {
        const storageKey = `focus_todo_${widget.id}`;
        let tasks = [];
        try {
            tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch (e) { tasks = []; }

        if (tasks.length === 0) {
            tasks = [
                { id: 1, text: 'Review deep work project goals', done: false, priority: 'high' },
                { id: 2, text: 'Clear inbox and prioritize tasks', done: true, priority: 'med' },
                { id: 3, text: '30-minute undistracted coding sprint', done: false, priority: 'high' }
            ];
        }

        container.innerHTML = `
            <div class="todo-container">
                <form class="todo-form">
                    <input type="text" class="todo-input" placeholder="Add a new task..." required>
                    <button type="submit" class="btn-pill" style="height:36px; padding:0 1rem;">SPAWN</button>
                </form>
                <ul class="todo-list"></ul>
            </div>
        `;

        const form = container.querySelector('.todo-form');
        const input = container.querySelector('.todo-input');
        const list = container.querySelector('.todo-list');

        function saveAndRender() {
            localStorage.setItem(storageKey, JSON.stringify(tasks));
            list.innerHTML = '';
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `todo-item ${task.done ? 'done' : ''}`;
                li.innerHTML = `
                    <div class="todo-left">
                        <input type="checkbox" class="todo-checkbox" ${task.done ? 'checked' : ''}>
                        <span class="todo-label">${escapeHtml(task.text)}</span>
                    </div>
                    <button class="widget-btn btn-remove" title="Delete">✕</button>
                `;

                li.querySelector('.todo-checkbox').addEventListener('change', (e) => {
                    task.done = e.target.checked;
                    if (task.done) sound.playChime('success');
                    saveAndRender();
                });

                li.querySelector('.btn-remove').addEventListener('click', () => {
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveAndRender();
                });

                list.appendChild(li);
            });
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            tasks.unshift({ id: Date.now(), text, done: false, priority: 'med' });
            input.value = '';
            sound.playChime('success');
            saveAndRender();
        });

        saveAndRender();
    }

    // 3. Notes Widget
    function renderNotesWidget(widget, container) {
        const storageKey = `focus_notes_${widget.id}`;
        const savedText = localStorage.getItem(storageKey) || "### 💡 Today's Focus Note\n- Eliminate unnecessary tabs\n- Focus on one high-impact deliverable\n- Flow state achieved through deep silence";

        container.innerHTML = `
            <div class="notes-container">
                <textarea class="notes-textarea" placeholder="Jot down notes, links, or thoughts...">${escapeHtml(savedText)}</textarea>
                <div class="notes-footer">
                    <span class="notes-stats">0 words | 0 chars</span>
                    <button class="widget-btn" id="copyNotesBtn" title="Copy to clipboard">📋</button>
                </div>
            </div>
        `;

        const textarea = container.querySelector('.notes-textarea');
        const stats = container.querySelector('.notes-stats');
        const copyBtn = container.querySelector('#copyNotesBtn');

        function updateStats() {
            const val = textarea.value;
            localStorage.setItem(storageKey, val);
            const words = val.trim() ? val.trim().split(/\s+/).length : 0;
            stats.textContent = `${words} words | ${val.length} chars`;
        }

        textarea.addEventListener('input', updateStats);
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(textarea.value);
            copyBtn.textContent = '✓';
            setTimeout(() => copyBtn.textContent = '📋', 1200);
        });

        updateStats();
    }

    // 4. Markets & Crypto Widget
    function renderMarketsWidget(widget, container) {
        const COINS = [
            { symbol: 'BTC', name: 'Bitcoin', price: 92450.00, change: +3.42 },
            { symbol: 'ETH', name: 'Ethereum', price: 2680.20, change: +1.85 },
            { symbol: 'SOL', name: 'Solana', price: 145.40, change: +4.65 },
            { symbol: 'BNB', name: 'BNB', price: 585.10, change: +0.72 },
            { symbol: 'XRP', name: 'Ripple', price: 2.38, change: +8.14 },
            { symbol: 'ADA', name: 'Cardano', price: 0.88, change: +2.12 },
            { symbol: 'DOGE', name: 'Dogecoin', price: 0.155, change: +6.40 },
            { symbol: 'AVAX', name: 'Avalanche', price: 28.90, change: -1.25 }
        ];

        container.innerHTML = `
            <div class="market-ticker-grid">
                ${COINS.map(c => `
                    <div class="market-card">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="market-symbol">${c.symbol}</span>
                            <span class="market-change ${c.change >= 0 ? 'up' : 'down'}">
                                ${c.change >= 0 ? '▲' : '▼'} ${Math.abs(c.change)}%
                            </span>
                        </div>
                        <span class="market-price">$${c.price > 1 ? c.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : c.price.toFixed(3)}</span>
                    </div>
                `).join('')}
            </div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.65rem; display:flex; justify-content:space-between; align-items:center;">
                <span>● Live Market Feed</span>
                <span>Updated Real-Time</span>
            </div>
        `;

        // Live price tick simulation
        setInterval(() => {
            const cards = container.querySelectorAll('.market-card');
            cards.forEach(card => {
                if (Math.random() < 0.35) {
                    const priceEl = card.querySelector('.market-price');
                    let price = parseFloat(priceEl.textContent.replace('$', '').replace(/,/g, ''));
                    const delta = (Math.random() - 0.48) * (price * 0.0018);
                    price += delta;
                    priceEl.textContent = `$${price > 1 ? price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : price.toFixed(3)}`;
                }
            });
        }, 2200);
    }

    // 5. Crypto Heatmap (Live Real-Time Prices & Market Ticker)
    function renderHeatmapWidget(widget, container) {
        const TOKENS = [
            { s: 'BTC', name: 'Bitcoin', price: 91450.00, change: +3.25, baseColor: '#059669', w: 'span 2' },
            { s: 'ETH', name: 'Ethereum', price: 2680.20, change: +1.92, baseColor: '#059669', w: 'span 2' },
            { s: 'SOL', name: 'Solana', price: 145.40, change: +4.65, baseColor: '#10b981', w: 'span 1' },
            { s: 'BNB', name: 'BNB', price: 585.10, change: +0.82, baseColor: '#10b981', w: 'span 1' },
            { s: 'XRP', name: 'Ripple', price: 2.38, change: +8.14, baseColor: '#10b981', w: 'span 1' },
            { s: 'ADA', name: 'Cardano', price: 0.885, change: +2.12, baseColor: '#10b981', w: 'span 1' },
            { s: 'DOGE', name: 'Dogecoin', price: 0.155, change: +6.40, baseColor: '#10b981', w: 'span 1' },
            { s: 'AVAX', name: 'Avalanche', price: 28.90, change: -1.25, baseColor: '#ef4444', w: 'span 1' }
        ];

        function getTileBg(c) {
            if (c >= 6) return 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
            if (c >= 2) return 'linear-gradient(135deg, #047857 0%, #059669 100%)';
            if (c >= 0) return 'linear-gradient(135deg, #065f46 0%, #047857 100%)';
            if (c >= -3) return 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)';
            return 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)';
        }

        function formatPrice(p) {
            if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (p >= 1) return '$' + p.toFixed(2);
            return '$' + p.toFixed(3);
        }

        container.innerHTML = `
            <div class="heatmap-container">
                <div class="heatmap-grid" id="heatmapGrid">
                    ${TOKENS.map(t => `
                        <div class="heatmap-tile" id="tile-${t.s}" style="background:${getTileBg(t.change)}; grid-column: ${t.w}">
                            <div class="heatmap-tile-top">
                                <span class="heatmap-tile-symbol">${t.s}</span>
                                <span class="heatmap-tile-change" id="change-${t.s}">${t.change >= 0 ? '+' : ''}${t.change.toFixed(2)}%</span>
                            </div>
                            <div class="heatmap-tile-center">
                                <div class="heatmap-tile-price" id="price-${t.s}">${formatPrice(t.price)}</div>
                            </div>
                            <div class="heatmap-tile-name">${t.name}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="heatmap-footer">
                    <span>● Real-Time Price Engine Active</span>
                    <span id="heatmapLastTick">Live Ticking</span>
                </div>
            </div>
        `;

        // Real-Time Live Price Engine
        const intervalId = setInterval(() => {
            if (!container.isConnected) {
                clearInterval(intervalId);
                return;
            }

            // Pick 2-4 tokens to tick
            const numTicks = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < numTicks; i++) {
                const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
                const isPositive = Math.random() < 0.58;
                const pctDelta = (Math.random() * 0.0035 + 0.0005) * (isPositive ? 1 : -1);
                
                token.price = Math.max(0.0001, token.price * (1 + pctDelta));
                token.change += (pctDelta * 100);

                const tileEl = container.querySelector(`#tile-${token.s}`);
                const priceEl = container.querySelector(`#price-${token.s}`);
                const changeEl = container.querySelector(`#change-${token.s}`);

                if (priceEl && changeEl && tileEl) {
                    priceEl.textContent = formatPrice(token.price);
                    changeEl.textContent = `${token.change >= 0 ? '+' : ''}${token.change.toFixed(2)}%`;
                    tileEl.style.background = getTileBg(token.change);

                    // Price tick flash
                    const tickClass = isPositive ? 'tick-up' : 'tick-down';
                    priceEl.classList.remove('tick-up', 'tick-down');
                    void priceEl.offsetWidth; // Trigger reflow
                    priceEl.classList.add(tickClass);
                    setTimeout(() => priceEl.classList.remove(tickClass), 700);
                }
            }

            const lastTickEl = container.querySelector('#heatmapLastTick');
            if (lastTickEl) {
                const now = new Date();
                lastTickEl.textContent = `Updated ${now.toLocaleTimeString()}`;
            }
        }, 1400);
    }

    // 6. Live Global Crypto Transactions Feed (High-Throughput Multi-Chain Engine)
    function renderBlockchainWidget(widget, container) {
        let currentChain = 'ALL'; // 'ALL', 'BTC', 'ETH', 'SOL', 'POL', 'ARB', 'DOGE'
        let currentFilter = 'all'; // 'all', 'swaps', 'whales', 'micro', 'transfers'
        let currentSpeed = 'fast'; // 'normal', 'fast', 'turbo'
        let isPaused = false;
        let timer = null;
        let isMounted = false;
        let totalVolumeUsd = 148290450;

        const CHAINS = {
            BTC: {
                name: 'Bitcoin',
                symbol: '₿',
                color: '#f59e0b',
                priceUsd: 91450,
                baseTps: 11.2,
                tpsRange: [8.5, 14.8],
                blockTime: '9.6m',
                blockHeight: 884912,
                gasLabel: '14 sat/vB',
                genTx: () => {
                    const rand = Math.random();
                    let type = 'transfer';
                    let amount = 0;
                    let isWhale = false;
                    let isMicro = false;
                    let routeDesc = '';

                    if (rand < 0.10) { // 10% Whale
                        isWhale = true;
                        type = 'whale';
                        amount = +(Math.random() * 45 + 1.6).toFixed(4);
                        routeDesc = 'Whale Wallet Transfer';
                    } else if (rand < 0.35) { // 25% Micro
                        isMicro = true;
                        type = 'micro';
                        amount = +(Math.random() * 0.0004 + 0.00002).toFixed(6);
                        routeDesc = 'Lightning / Micro-Pay';
                    } else if (rand < 0.52) { // 17% Ordinals
                        type = 'ordinal';
                        amount = +(Math.random() * 0.006 + 0.0008).toFixed(5);
                        routeDesc = 'Runes / Inscription';
                    } else { // Standard transfer
                        type = 'transfer';
                        amount = +(Math.random() * 0.045 + 0.002).toFixed(4);
                        routeDesc = 'SegWit P2PKH Transfer';
                    }

                    const usdVal = Math.round(amount * 91450);
                    return {
                        chain: 'BTC',
                        symbol: '₿',
                        color: '#f59e0b',
                        type,
                        amount,
                        usdVal,
                        isWhale: isWhale || usdVal >= 100000,
                        isMicro: isMicro || usdVal < 35,
                        routeDesc,
                        hash: '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
                        feeUsd: (Math.random() * 2.2 + 0.65).toFixed(2),
                        time: Date.now()
                    };
                }
            },
            ETH: {
                name: 'Ethereum',
                symbol: '⟠',
                color: '#8b5cf6',
                priceUsd: 2680,
                baseTps: 29.4,
                tpsRange: [22, 38],
                blockTime: '12.0s',
                blockHeight: 21840119,
                gasLabel: '15 Gwei',
                genTx: () => {
                    const rand = Math.random();
                    let type = 'transfer';
                    let amount = 0;
                    let isWhale = false;
                    let isMicro = false;
                    let routeDesc = '';

                    const PAIRS = [
                        { from: 'USDC', to: 'ETH', rate: 1/2680 },
                        { from: 'ETH', to: 'USDT', rate: 2680 },
                        { from: 'ETH', to: 'UNI', rate: 185 },
                        { from: 'ETH', to: 'PEPE', rate: 125000000 },
                        { from: 'ETH', to: 'LINK', rate: 142 }
                    ];

                    if (rand < 0.10) { // 10% Whale
                        isWhale = true;
                        type = 'whale';
                        amount = +(Math.random() * 950 + 40).toFixed(2);
                        routeDesc = 'Institutional Move';
                    } else if (rand < 0.48) { // 38% DeFi Swap
                        type = 'swap';
                        const p = PAIRS[Math.floor(Math.random() * PAIRS.length)];
                        amount = +(Math.random() * 4.5 + 0.12).toFixed(3);
                        routeDesc = `Uniswap V3 (${p.from} ➔ ${p.to})`;
                    } else if (rand < 0.72) { // 24% Micro
                        isMicro = true;
                        type = 'micro';
                        amount = +(Math.random() * 0.012 + 0.001).toFixed(4);
                        routeDesc = 'Gas / Micro-Call';
                    } else { // Standard transfer
                        type = 'transfer';
                        amount = +(Math.random() * 1.8 + 0.05).toFixed(3);
                        routeDesc = 'ERC-20 Transfer';
                    }

                    const usdVal = Math.round(amount * 2680);
                    return {
                        chain: 'ETH',
                        symbol: '⟠',
                        color: '#8b5cf6',
                        type,
                        amount,
                        usdVal,
                        isWhale: isWhale || usdVal >= 100000,
                        isMicro: isMicro || usdVal < 35,
                        routeDesc,
                        hash: '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
                        feeUsd: (Math.random() * 4.8 + 1.2).toFixed(2),
                        time: Date.now()
                    };
                }
            },
            SOL: {
                name: 'Solana',
                symbol: '◎',
                color: '#10b981',
                priceUsd: 145,
                baseTps: 3120,
                tpsRange: [2600, 3800],
                blockTime: '400ms',
                blockHeight: 312890450,
                gasLabel: '0.000005 SOL',
                genTx: () => {
                    const rand = Math.random();
                    let type = 'transfer';
                    let amount = 0;
                    let isWhale = false;
                    let isMicro = false;
                    let routeDesc = '';

                    const PAIRS = ['SOL ➔ JUP', 'USDC ➔ SOL', 'SOL ➔ BONK', 'SOL ➔ PYTH', 'SOL ➔ RAY'];

                    if (rand < 0.09) { // 9% Whale
                        isWhale = true;
                        type = 'whale';
                        amount = Math.round(Math.random() * 8500 + 700);
                        routeDesc = 'Treasury Liquidity';
                    } else if (rand < 0.55) { // 46% Swap
                        type = 'swap';
                        amount = +(Math.random() * 28 + 0.4).toFixed(2);
                        routeDesc = `Raydium (${PAIRS[Math.floor(Math.random() * PAIRS.length)]})`;
                    } else if (rand < 0.82) { // 27% Micro
                        isMicro = true;
                        type = 'micro';
                        amount = +(Math.random() * 0.15 + 0.005).toFixed(3);
                        routeDesc = 'Fast Micro-Tip';
                    } else { // Transfer
                        type = 'transfer';
                        amount = +(Math.random() * 8.5 + 0.2).toFixed(2);
                        routeDesc = 'SPL Transfer';
                    }

                    const usdVal = Math.round(amount * 145);
                    return {
                        chain: 'SOL',
                        symbol: '◎',
                        color: '#10b981',
                        type,
                        amount,
                        usdVal,
                        isWhale: isWhale || usdVal >= 80000,
                        isMicro: isMicro || usdVal < 35,
                        routeDesc,
                        hash: Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
                        feeUsd: '0.0007',
                        time: Date.now()
                    };
                }
            },
            POL: {
                name: 'Polygon',
                symbol: 'POL',
                color: '#a855f7',
                priceUsd: 0.48,
                baseTps: 110,
                tpsRange: [80, 150],
                blockTime: '2.1s',
                blockHeight: 65420180,
                gasLabel: '32 Gwei',
                genTx: () => {
                    const rand = Math.random();
                    const isWhale = rand < 0.08;
                    const isMicro = !isWhale && rand < 0.45;
                    const type = isWhale ? 'whale' : (rand < 0.55 ? 'swap' : (isMicro ? 'micro' : 'transfer'));
                    const amount = isWhale ? Math.round(Math.random() * 180000 + 45000) : (isMicro ? Math.round(Math.random() * 40 + 2) : Math.round(Math.random() * 1800 + 100));
                    const usdVal = Math.round(amount * 0.48);
                    return {
                        chain: 'POL',
                        symbol: 'POL',
                        color: '#a855f7',
                        type,
                        amount,
                        usdVal,
                        isWhale: isWhale || usdVal >= 50000,
                        isMicro: isMicro || usdVal < 35,
                        routeDesc: type === 'swap' ? 'QuickSwap Trade' : (type === 'micro' ? 'Web3 Gaming Micro-tx' : 'Polygon POS Transfer'),
                        hash: '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
                        feeUsd: '0.004',
                        time: Date.now()
                    };
                }
            },
            ARB: {
                name: 'Arbitrum',
                symbol: 'ARB',
                color: '#38bdf8',
                priceUsd: 0.82,
                baseTps: 58,
                tpsRange: [42, 85],
                blockTime: '250ms',
                blockHeight: 295480100,
                gasLabel: '0.01 Gwei',
                genTx: () => {
                    const rand = Math.random();
                    const isWhale = rand < 0.08;
                    const isMicro = !isWhale && rand < 0.40;
                    const type = isWhale ? 'whale' : (rand < 0.60 ? 'swap' : (isMicro ? 'micro' : 'transfer'));
                    const amount = isWhale ? Math.round(Math.random() * 120000 + 35000) : (isMicro ? Math.round(Math.random() * 35 + 2) : Math.round(Math.random() * 1200 + 80));
                    const usdVal = Math.round(amount * 0.82);
                    return {
                        chain: 'ARB',
                        symbol: 'ARB',
                        color: '#38bdf8',
                        type,
                        amount,
                        usdVal,
                        isWhale: isWhale || usdVal >= 60000,
                        isMicro: isMicro || usdVal < 35,
                        routeDesc: type === 'swap' ? 'GMX Perps Execution' : (type === 'micro' ? 'L2 Nitro Micro-tx' : 'Arbitrum One Transfer'),
                        hash: '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
                        feeUsd: '0.002',
                        time: Date.now()
                    };
                }
            },
            DOGE: {
                name: 'Dogecoin',
                symbol: '🐕',
                color: '#eab308',
                priceUsd: 0.155,
                baseTps: 45,
                tpsRange: [32, 68],
                blockTime: '1.0m',
                blockHeight: 5612890,
                gasLabel: '1.0 DOGE',
                genTx: () => {
                    const rand = Math.random();
                    const isWhale = rand < 0.08;
                    const isMicro = !isWhale && rand < 0.45;
                    const type = isWhale ? 'whale' : (isMicro ? 'micro' : 'transfer');
                    const amount = isWhale ? Math.round(Math.random() * 1500000 + 350000) : (isMicro ? Math.round(Math.random() * 180 + 20) : Math.round(Math.random() * 15000 + 400));
                    const usdVal = Math.round(amount * 0.155);
                    return {
                        chain: 'DOGE',
                        symbol: '🐕',
                        color: '#eab308',
                        type,
                        amount,
                        usdVal,
                        isWhale: isWhale || usdVal >= 50000,
                        isMicro: isMicro || usdVal < 35,
                        routeDesc: type === 'whale' ? 'Miner Payout Pool' : (type === 'micro' ? 'Community Micro-Tip' : 'P2P Wallet Send'),
                        hash: 'd' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
                        feeUsd: '0.15',
                        time: Date.now()
                    };
                }
            }
        };

        const CHAIN_KEYS = ['BTC', 'ETH', 'SOL', 'POL', 'ARB', 'DOGE'];
        function getNextTx() {
            const chainKey = currentChain === 'ALL' 
                ? CHAIN_KEYS[Math.floor(Math.random() * CHAIN_KEYS.length)]
                : currentChain;
            return CHAINS[chainKey].genTx();
        }

        let txList = [];
        let currentTps = 84.5;
        let particles = [];

        container.innerHTML = `
            <div class="blockchain-widget-container">
                <div class="crypto-token-tabs">
                    <button class="crypto-token-tab active" data-chain="ALL">⚡ ALL CHAINS</button>
                    <button class="crypto-token-tab" data-chain="BTC">₿ Bitcoin</button>
                    <button class="crypto-token-tab" data-chain="ETH">⟠ Ethereum</button>
                    <button class="crypto-token-tab" data-chain="SOL">◎ Solana</button>
                    <button class="crypto-token-tab" data-chain="POL">🟣 Polygon</button>
                    <button class="crypto-token-tab" data-chain="ARB">🔷 Arbitrum</button>
                    <button class="crypto-token-tab" data-chain="DOGE">🐕 Doge</button>
                </div>

                <div class="tx-telemetry-grid">
                    <div class="tx-stat-box">
                        <div class="tx-stat-label">Velocity</div>
                        <div class="tx-stat-val" id="txLiveTps" style="color:#10b981;">-- TPS</div>
                    </div>
                    <div class="tx-stat-box">
                        <div class="tx-stat-label">Volume Streamed</div>
                        <div class="tx-stat-val" id="txTotalVolume" style="color:var(--accent-hover);">$148.2M</div>
                    </div>
                    <div class="tx-stat-box">
                        <div class="tx-stat-label">Network Fee / Gas</div>
                        <div class="tx-stat-val" id="txGasFee">--</div>
                    </div>
                    <div class="tx-stat-box">
                        <div class="tx-stat-label">Block Height</div>
                        <div class="tx-stat-val" id="txBlockHeight">--</div>
                    </div>
                </div>

                <canvas class="blockchain-canvas"></canvas>

                <div class="tx-control-bar">
                    <div class="tx-filter-pills">
                        <button class="tx-filter-btn active" data-filter="all">All</button>
                        <button class="tx-filter-btn" data-filter="swaps">DeFi Swaps 🔄</button>
                        <button class="tx-filter-btn" data-filter="whales">Whales 🐋</button>
                        <button class="tx-filter-btn" data-filter="micro">Micro <$35 ⚡</button>
                        <button class="tx-filter-btn" data-filter="transfers">Transfers 💸</button>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <select class="tx-filter-btn" id="txSpeedSelect" style="outline:none; cursor:pointer;" title="Stream Speed">
                            <option value="normal">Speed: 1x</option>
                            <option value="fast" selected>Speed: Fast (Real-Time)</option>
                            <option value="turbo">Speed: Turbo 🔥</option>
                        </select>
                        <button class="btn-pill" id="txPauseBtn" style="height:22px; padding:0 0.6rem; font-size:0.68rem;">Pause</button>
                    </div>
                </div>

                <div class="tx-feed-list" id="txFeedList"></div>
            </div>
        `;

        const tpsEl = container.querySelector('#txLiveTps');
        const volEl = container.querySelector('#txTotalVolume');
        const gasEl = container.querySelector('#txGasFee');
        const blockEl = container.querySelector('#txBlockHeight');
        const feedListEl = container.querySelector('#txFeedList');
        const pauseBtn = container.querySelector('#txPauseBtn');
        const speedSelect = container.querySelector('#txSpeedSelect');
        const chainTabs = container.querySelectorAll('.crypto-token-tab');
        const filterBtns = container.querySelectorAll('.tx-filter-btn[data-filter]');

        const canvas = container.querySelector('.blockchain-canvas');
        const ctx = canvas.getContext('2d');

        function updateTelemetry() {
            if (isPaused) return;
            let cfg = CHAINS[currentChain] || CHAINS.BTC;
            let [minT, maxT] = cfg.tpsRange;
            if (currentChain === 'ALL') {
                currentTps = +(3200 + Math.random() * 450).toFixed(1);
                if (gasEl) gasEl.textContent = 'Multi-Gas';
                if (blockEl) blockEl.textContent = 'Omni-Mempool';
            } else {
                currentTps = +(minT + Math.random() * (maxT - minT)).toFixed(1);
                if (gasEl) gasEl.textContent = cfg.gasLabel;
                if (blockEl) blockEl.textContent = `#${cfg.blockHeight.toLocaleString()}`;
            }

            if (tpsEl) tpsEl.textContent = `${currentTps.toLocaleString()} TPS`;
            if (volEl) volEl.textContent = `$${(totalVolumeUsd / 1000000).toFixed(2)}M`;
        }

        function pushTx(tx) {
            if (isPaused) return;
            totalVolumeUsd += tx.usdVal;
            txList.unshift(tx);
            if (txList.length > 70) txList.pop();

            const w = canvas.getBoundingClientRect().width || 300;
            const h = canvas.getBoundingClientRect().height || 48;
            
            let pR = 3.5;
            let pColor = tx.color;
            if (tx.isWhale) { pR = 7.5; pColor = '#fbbf24'; }
            else if (tx.type === 'swap') { pR = 4.5; pColor = '#38bdf8'; }
            else if (tx.isMicro) { pR = 2.0; pColor = 'rgba(255,255,255,0.7)'; }

            particles.push({
                x: 0,
                y: Math.random() * (h - 14) + 7,
                vx: Math.random() * 4 + 3.2,
                r: pR,
                color: pColor,
                isWhale: tx.isWhale
            });

            renderFeed();
        }

        function renderFeed() {
            if (!feedListEl) return;
            let filtered = txList;
            if (currentFilter === 'whales') filtered = txList.filter(t => t.isWhale);
            else if (currentFilter === 'swaps') filtered = txList.filter(t => t.type === 'swap');
            else if (currentFilter === 'micro') filtered = txList.filter(t => t.isMicro);
            else if (currentFilter === 'transfers') filtered = txList.filter(t => t.type === 'transfer');

            if (filtered.length === 0) {
                feedListEl.innerHTML = `<div style="text-align:center; padding:1.2rem; color:var(--text-muted); font-size:0.72rem;">Listening for incoming ${currentFilter} transactions...</div>`;
                return;
            }

            feedListEl.innerHTML = filtered.slice(0, 25).map(t => {
                const timeAgo = Math.max(0, Math.round((Date.now() - t.time) / 1000));
                const timeStr = timeAgo === 0 ? 'just now' : `${timeAgo}s ago`;

                let tagHtml = '';
                if (t.isWhale) tagHtml = `<span class="tx-type-tag tx-tag-whale">WHALE 🐋</span>`;
                else if (t.type === 'swap') tagHtml = `<span class="tx-type-tag tx-tag-swap">SWAP 🔄</span>`;
                else if (t.isMicro) tagHtml = `<span class="tx-type-tag tx-tag-micro">MICRO ⚡</span>`;
                else tagHtml = `<span class="tx-type-tag tx-tag-transfer">SEND 💸</span>`;

                return `
                    <div class="tx-feed-item ${t.isWhale ? 'whale' : (t.type === 'swap' ? 'swap' : (t.isMicro ? 'micro' : ''))}">
                        <div class="tx-col-left">
                            <span class="tx-chain-pill" style="color:${t.color};">${t.symbol}</span>
                            ${tagHtml}
                            <span class="tx-amount" style="font-weight:700;">${t.amount.toLocaleString()} ${t.chain}</span>
                            <span style="color:var(--text-muted);">($${t.usdVal.toLocaleString()})</span>
                            <span style="color:var(--text-secondary); font-size:0.65rem; margin-left:4px;">• ${t.routeDesc}</span>
                        </div>
                        <div class="tx-col-right">
                            <span>${t.hash}</span>
                            <span>Fee: $${t.feeUsd}</span>
                            <span>${timeStr}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Seed initial transactions across spectrum
        for (let i = 0; i < 8; i++) {
            const tx = getNextTx();
            tx.time -= (i * 1200 + 200);
            txList.push(tx);
        }
        renderFeed();
        updateTelemetry();

        // Chain selector
        chainTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                chainTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentChain = tab.dataset.chain;
                txList = [];
                particles = [];
                updateTelemetry();
                for (let i = 0; i < 6; i++) {
                    const tx = getNextTx();
                    tx.time -= (i * 1000 + 100);
                    txList.push(tx);
                }
                renderFeed();
            });
        });

        // Filter chips
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderFeed();
            });
        });

        // Speed select
        speedSelect.addEventListener('change', (e) => {
            currentSpeed = e.target.value;
        });

        pauseBtn.addEventListener('click', () => {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            pauseBtn.style.background = isPaused ? 'var(--accent-color)' : '';
        });

        function scheduleNextTx() {
            if (!container.isConnected) {
                if (!isMounted) {
                    timer = setTimeout(scheduleNextTx, 100);
                    return;
                }
                return;
            }
            isMounted = true;
            if (!isPaused) {
                pushTx(getNextTx());
                if (Math.random() < 0.4) updateTelemetry();
            }

            let delay = 350;
            if (currentSpeed === 'turbo') delay = Math.random() * 60 + 65;
            else if (currentSpeed === 'fast') delay = Math.random() * 160 + 120;
            else delay = Math.random() * 450 + 350;

            timer = setTimeout(scheduleNextTx, delay);
        }
        scheduleNextTx();

        // Animated canvas
        function drawCanvas() {
            if (!container.isConnected) {
                if (!isMounted) {
                    requestAnimationFrame(drawCanvas);
                    return;
                }
                return;
            }
            isMounted = true;

            const rect = canvas.getBoundingClientRect();
            const w = Math.round(rect.width) || 300;
            const h = Math.round(rect.height) || 48;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }

            ctx.fillStyle = '#06070a';
            ctx.fillRect(0, 0, w, h);

            // Flow grid track
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();

            // Destination Block Node
            const cubeX = w - 48;
            const cubeY = h / 2 - 15;
            ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cubeX, cubeY, 40, 30);
            ctx.fillRect(cubeX, cubeY, 40, 30);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 8.5px monospace';
            const labelStr = currentChain === 'ALL' ? 'OMNI' : currentChain;
            ctx.fillText(labelStr, cubeX + (labelStr.length > 3 ? 5 : 9), cubeY + 14);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '7px monospace';
            ctx.fillText('BLOCK', cubeX + 8, cubeY + 24);

            // Flowing particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                if (p.isWhale) {
                    ctx.shadowColor = '#fbbf24';
                    ctx.shadowBlur = 12;
                }
                ctx.fill();
                ctx.shadowBlur = 0;

                if (p.x >= cubeX) {
                    particles.splice(i, 1);
                }
            }

            requestAnimationFrame(drawCanvas);
        }
        drawCanvas();
    }

    // 7. Weather Widget (Interactive Global Cities)
    function renderWeatherWidget(widget, container) {
        const CITIES = {
            ny: { name: 'New York', temp: '72°F', cond: 'Clear Sky', icon: '☀️', humidity: '45%', wind: '8 mph NW', pressure: '1014 hPa' },
            lon: { name: 'London', temp: '58°F', cond: 'Light Drizzle', icon: '🌧️', humidity: '78%', wind: '12 mph SW', pressure: '1008 hPa' },
            tok: { name: 'Tokyo', temp: '68°F', cond: 'Scattered Clouds', icon: '⛅', humidity: '55%', wind: '6 mph E', pressure: '1016 hPa' },
            sf: { name: 'San Francisco', temp: '64°F', cond: 'Coastal Fog', icon: '🌫️', humidity: '82%', wind: '14 mph W', pressure: '1012 hPa' },
            zur: { name: 'Zurich', temp: '55°F', cond: 'Crisp Alpine', icon: '🏔️', humidity: '52%', wind: '5 mph N', pressure: '1020 hPa' }
        };

        let currentCity = 'ny';

        container.innerHTML = `
            <div class="weather-city-tabs">
                <button class="weather-city-btn active" data-city="ny">New York</button>
                <button class="weather-city-btn" data-city="lon">London</button>
                <button class="weather-city-btn" data-city="tok">Tokyo</button>
                <button class="weather-city-btn" data-city="sf">San Francisco</button>
                <button class="weather-city-btn" data-city="zur">Zurich</button>
            </div>
            <div class="weather-display">
                <div class="weather-temp-group">
                    <div class="weather-icon-large" id="weatherIcon">☀️</div>
                    <div>
                        <div class="weather-degrees" id="weatherTemp">72°F</div>
                        <div style="font-size:0.85rem; color:var(--text-secondary);" id="weatherCond">Clear Sky • New York</div>
                    </div>
                </div>
                <div class="weather-meta">
                    <span id="weatherHum">Humidity: 45%</span>
                    <span id="weatherWind">Wind: 8 mph NW</span>
                    <span id="weatherPres">Pressure: 1014 hPa</span>
                </div>
            </div>
        `;

        const iconEl = container.querySelector('#weatherIcon');
        const tempEl = container.querySelector('#weatherTemp');
        const condEl = container.querySelector('#weatherCond');
        const humEl = container.querySelector('#weatherHum');
        const windEl = container.querySelector('#weatherWind');
        const presEl = container.querySelector('#weatherPres');
        const cityBtns = container.querySelectorAll('.weather-city-btn');

        cityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                cityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCity = btn.dataset.city;
                const c = CITIES[currentCity];
                iconEl.textContent = c.icon;
                tempEl.textContent = c.temp;
                condEl.textContent = `${c.cond} • ${c.name}`;
                humEl.textContent = `Humidity: ${c.humidity}`;
                windEl.textContent = `Wind: ${c.wind}`;
                presEl.textContent = `Pressure: ${c.pressure}`;
            });
        });
    }

    // 8. Ambient Weather Backdrop Canvas
    function renderAmbientWeatherWidget(widget, container) {
        container.innerHTML = `
            <canvas style="width:100%; height:100%; flex:1; min-height:120px; border-radius:8px; background:#04060a;"></canvas>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.65rem; flex-shrink:0;">
                <span style="font-size:0.82rem; color:var(--text-secondary);">Rainfall Atmosphere</span>
                <button class="btn-pill" id="rainAudioBtn" style="height:30px; font-size:0.75rem; padding:0 0.8rem;">Play Sound</button>
            </div>
        `;

        const canvas = container.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const btn = container.querySelector('#rainAudioBtn');

        btn.addEventListener('click', () => {
            const active = sound.toggleAmbient('rain');
            btn.textContent = active ? 'Pause Sound' : 'Play Sound';
            btn.style.background = active ? 'var(--accent-color)' : '';
        });

        let drops = [];
        for (let i = 0; i < 50; i++) {
            drops.push({
                x: Math.random() * 400,
                y: Math.random() * 300,
                len: Math.random() * 16 + 10,
                speed: Math.random() * 6 + 4
            });
        }

        let isMounted = false;
        function drawRain() {
            if (!container.isConnected) {
                if (!isMounted) {
                    requestAnimationFrame(drawRain);
                    return;
                }
                return;
            }
            isMounted = true;
            const w = canvas.clientWidth || 300;
            const h = canvas.clientHeight || 160;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }

            ctx.fillStyle = 'rgba(4, 6, 10, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = 'rgba(96, 165, 250, 0.45)';
            ctx.lineWidth = 1;
            for (let d of drops) {
                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x + 1, d.y + d.len);
                ctx.stroke();

                d.y += d.speed;
                if (d.y > canvas.height) {
                    d.y = -d.len;
                    d.x = Math.random() * canvas.width;
                }
            }
            requestAnimationFrame(drawRain);
        }
        drawRain();
    }

    // 9. World Clock Widget
    function renderWorldClockWidget(widget, container) {
        container.innerHTML = `
            <div class="clock-list">
                <div class="clock-row">
                    <span class="clock-city">Local</span>
                    <span class="clock-time" id="clkLocal">--:--:--</span>
                </div>
                <div class="clock-row">
                    <span class="clock-city">New York</span>
                    <span class="clock-time" id="clkNY">--:--:--</span>
                </div>
                <div class="clock-row">
                    <span class="clock-city">London</span>
                    <span class="clock-time" id="clkLondon">--:--:--</span>
                </div>
                <div class="clock-row">
                    <span class="clock-city">Tokyo</span>
                    <span class="clock-time" id="clkTokyo">--:--:--</span>
                </div>
            </div>
        `;

        function updateClocks() {
            const now = new Date();
            const fmt = (tz) => now.toLocaleTimeString('en-US', { timeZone: tz, hour12: true });
            const cLocal = container.querySelector('#clkLocal');
            const cNY = container.querySelector('#clkNY');
            const cLon = container.querySelector('#clkLondon');
            const cTok = container.querySelector('#clkTokyo');

            if (cLocal) cLocal.textContent = now.toLocaleTimeString('en-US', { hour12: true });
            if (cNY) cNY.textContent = fmt('America/New_York');
            if (cLon) cLon.textContent = fmt('Europe/London');
            if (cTok) cTok.textContent = fmt('Asia/Tokyo');
        }
        updateClocks();
        setInterval(updateClocks, 1000);
    }

    // 10. Calculator Widget
    function renderCalculatorWidget(widget, container) {
        container.innerHTML = `
            <div class="calc-container">
                <div class="calc-display">0</div>
                <div class="calc-grid">
                    <button class="calc-btn operator">C</button>
                    <button class="calc-btn operator">±</button>
                    <button class="calc-btn operator">%</button>
                    <button class="calc-btn operator">/</button>
                    <button class="calc-btn">7</button>
                    <button class="calc-btn">8</button>
                    <button class="calc-btn">9</button>
                    <button class="calc-btn operator">*</button>
                    <button class="calc-btn">4</button>
                    <button class="calc-btn">5</button>
                    <button class="calc-btn">6</button>
                    <button class="calc-btn operator">-</button>
                    <button class="calc-btn">1</button>
                    <button class="calc-btn">2</button>
                    <button class="calc-btn">3</button>
                    <button class="calc-btn operator">+</button>
                    <button class="calc-btn" style="grid-column: span 2;">0</button>
                    <button class="calc-btn">.</button>
                    <button class="calc-btn equals">=</button>
                </div>
            </div>
        `;

        const display = container.querySelector('.calc-display');
        let current = '0';
        let prev = null;
        let op = null;

        container.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.textContent;
                if (!isNaN(val) || val === '.') {
                    if (current === '0' && val !== '.') current = val;
                    else current += val;
                } else if (val === 'C') {
                    current = '0';
                    prev = null;
                    op = null;
                } else if (['+', '-', '*', '/'].includes(val)) {
                    prev = current;
                    op = val;
                    current = '0';
                } else if (val === '=') {
                    if (prev && op) {
                        try {
                            const res = eval(`${parseFloat(prev)} ${op} ${parseFloat(current)}`);
                            current = String(Number(res.toFixed(6)));
                            prev = null;
                            op = null;
                        } catch (e) {
                            current = 'Error';
                        }
                    }
                }
                display.textContent = current;
            });
        });
    }

    // 11. Calendar Widget
    function renderCalendarWidget(widget, container) {
        const now = new Date();
        const monthName = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();
        const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
        const firstDay = new Date(year, now.getMonth(), 1).getDay();

        let cells = [];
        for (let i = 0; i < firstDay; i++) {
            cells.push(`<div class="cal-cell"></div>`);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = d === now.getDate();
            cells.push(`<div class="cal-cell ${isToday ? 'today' : ''}">${d}</div>`);
        }

        container.innerHTML = `
            <div class="cal-container">
                <div class="cal-header">
                    <span>${monthName} ${year}</span>
                    <span style="color:var(--accent-hover); font-size:0.85rem;">Today</span>
                </div>
                <div class="cal-grid">
                    <div class="cal-day-name">S</div>
                    <div class="cal-day-name">M</div>
                    <div class="cal-day-name">T</div>
                    <div class="cal-day-name">W</div>
                    <div class="cal-day-name">T</div>
                    <div class="cal-day-name">F</div>
                    <div class="cal-day-name">S</div>
                    ${cells.join('')}
                </div>
            </div>
        `;
    }

    // 12. Word Counter Widget
    function renderWordCounterWidget(widget, container) {
        container.innerHTML = `
            <div class="wc-container">
                <textarea class="notes-textarea" placeholder="Paste or type text here to analyze..."></textarea>
                <div class="wc-stats">
                    <div class="wc-stat-box"><strong id="wcWords">0</strong><span>Words</span></div>
                    <div class="wc-stat-box"><strong id="wcChars">0</strong><span>Chars</span></div>
                    <div class="wc-stat-box"><strong id="wcRead">0s</strong><span>Read Time</span></div>
                </div>
            </div>
        `;

        const ta = container.querySelector('textarea');
        const wWords = container.querySelector('#wcWords');
        const wChars = container.querySelector('#wcChars');
        const wRead = container.querySelector('#wcRead');

        ta.addEventListener('input', () => {
            const t = ta.value.trim();
            const words = t ? t.split(/\s+/).length : 0;
            wWords.textContent = words;
            wChars.textContent = ta.value.length;
            const sec = Math.ceil((words / 200) * 60);
            wRead.textContent = sec < 60 ? `${sec}s` : `${Math.ceil(sec / 60)}m`;
        });
    }

    // 13. Dictionary Widget
    function renderDictionaryWidget(widget, container) {
        container.innerHTML = `
            <div class="dict-container">
                <form class="dict-search-form">
                    <input type="text" class="todo-input" placeholder="Look up any word..." required>
                    <button type="submit" class="btn-pill" style="height:36px; padding:0 0.9rem;">Search</button>
                </form>
                <div class="dict-result">
                    <div class="dict-word-title">Focus</div>
                    <div class="dict-phonetic">/ˈfoʊ.kəs/ • noun</div>
                    <p>The center of interest, attention, or activity; concentration of mental effort.</p>
                    <div class="dict-synonyms">
                        <span class="syn-chip">concentration</span>
                        <span class="syn-chip">attention</span>
                        <span class="syn-chip">clarity</span>
                        <span class="syn-chip">intensity</span>
                    </div>
                </div>
            </div>
        `;

        const form = container.querySelector('form');
        const input = container.querySelector('input');
        const res = container.querySelector('.dict-result');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const word = input.value.trim();
            if (!word) return;
            res.innerHTML = `<div style="color:var(--text-muted);">Searching lexicon...</div>`;

            try {
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
                if (!response.ok) throw new Error('Word not found');
                const data = await response.json();
                const entry = data[0];
                const def = entry.meanings[0]?.definitions[0]?.definition || 'No definition found.';
                const phonetic = entry.phonetic || entry.phonetics[0]?.text || '';
                const syns = entry.meanings[0]?.synonyms?.slice(0, 5) || [];

                res.innerHTML = `
                    <div class="dict-word-title">${escapeHtml(entry.word)}</div>
                    <div class="dict-phonetic">${escapeHtml(phonetic)} • ${entry.meanings[0]?.partOfSpeech || ''}</div>
                    <p>${escapeHtml(def)}</p>
                    ${syns.length ? `<div class="dict-synonyms">${syns.map(s => `<span class="syn-chip">${escapeHtml(s)}</span>`).join('')}</div>` : ''}
                `;
            } catch (err) {
                res.innerHTML = `<div style="color:var(--danger);">Word definition unavailable offline.</div>`;
            }
        });
    }

    // 14. Vision Board Widget
    function renderVisionWidget(widget, container) {
        const storageKey = `focus_vision_${widget.id}`;
        const defaultImg = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
        const saved = localStorage.getItem(storageKey) || defaultImg;

        container.innerHTML = `
            <div class="vision-img-container">
                <img class="vision-img" src="${escapeHtml(saved)}" alt="Vision Goal">
                <div class="vision-overlay-text">“Relentless Focus. Pure Execution.”</div>
            </div>
            <div style="margin-top:0.65rem; display:flex; gap:6px;">
                <input type="text" class="todo-input" style="padding:0.4rem 0.6rem; font-size:0.8rem;" placeholder="Paste image URL...">
                <button class="btn-pill" id="updateVisionBtn" style="height:32px; padding:0 0.8rem; font-size:0.75rem;">Set</button>
            </div>
        `;

        const inp = container.querySelector('input');
        const btn = container.querySelector('#updateVisionBtn');
        const img = container.querySelector('.vision-img');

        btn.addEventListener('click', () => {
            const url = inp.value.trim();
            if (url) {
                img.src = url;
                localStorage.setItem(storageKey, url);
                inp.value = '';
            }
        });
    }

    // 15. Spotify Widget
    function renderSpotifyWidget(widget, container) {
        container.innerHTML = `
            <div class="spotify-container">
                <iframe style="border-radius:12px; width:100%; height:100%; flex:1; min-height:120px; border:none;" 
                    src="https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
                </iframe>
            </div>
        `;
    }

    // 16. Chill With Hatty Widget
    function renderHattyWidget(widget, container) {
        container.innerHTML = `
            <div class="hatty-container">
                <iframe style="border-radius:12px; width:100%; height:100%; flex:1; min-height:120px; border:none;" 
                    src="https://hattyhats.github.io/chill-with-hatty/" 
                    allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen>
                </iframe>
            </div>
        `;
    }

    // 17. Embed Widget
    function renderEmbedWidget(widget, container) {
        const storageKey = `focus_embed_${widget.id}`;
        const defaultUrl = "https://en.wikipedia.org/wiki/Flow_(psychology)";
        const savedUrl = localStorage.getItem(storageKey) || defaultUrl;

        container.innerHTML = `
            <div class="embed-container">
                <div style="display:flex; gap:6px; margin-bottom:0.6rem; flex-shrink:0;">
                    <input type="text" class="todo-input" style="padding:0.4rem 0.6rem; font-size:0.8rem;" value="${escapeHtml(savedUrl)}">
                    <button class="btn-pill" id="loadEmbedBtn" style="height:32px; padding:0 0.8rem; font-size:0.75rem;">Go</button>
                </div>
                <iframe style="width:100%; height:100%; flex:1; min-height:140px; border-radius:8px; border:1px solid var(--glass-border);" src="${escapeHtml(savedUrl)}"></iframe>
            </div>
        `;

        const inp = container.querySelector('input');
        const btn = container.querySelector('#loadEmbedBtn');
        const iframe = container.querySelector('iframe');

        btn.addEventListener('click', () => {
            let u = inp.value.trim();
            if (u && !u.startsWith('http://') && !u.startsWith('https://')) {
                u = 'https://' + u;
            }
            iframe.src = u;
            localStorage.setItem(storageKey, u);
        });
    }

    // 18. Bookmarks Widget
    function renderBookmarksWidget(widget, container) {
        const LINKS = [
            { name: 'Earn With Hatty', url: 'https://earnwithhatty.com/', icon: '🎩' },
            { name: 'Quick-Pad', url: 'https://hatsquickpad.netlify.app/', icon: '⚡' },
            { name: 'Local-Cast', url: 'https://hattyhats.github.io/local-cast/', icon: '📡' },
            { name: 'GitHub', url: 'https://github.com/', icon: '🐙' }
        ];

        container.innerHTML = `
            <div class="bookmarks-grid">
                ${LINKS.map(l => `
                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="bookmark-tile">
                        <div class="bookmark-icon">${l.icon}</div>
                        <span>${l.name}</span>
                    </a>
                `).join('')}
            </div>
        `;
    }

    // 19-21. News Feeds & Deep Intelligence Desks
    function renderNewsWidget(widget, container, category) {
        const NEWS_DATA = {
            'AI & Machine Learning': [
                {
                    id: 'ai-1',
                    title: 'DeepSeek-R1 & Open Reasoning Architectures Spark Global Developer Surge',
                    summary: 'New open-weights reasoning paradigms match proprietary frontiers on competitive mathematics and code synthesis while slashing training compute by over 80%. Small distilled models demonstrate massive zero-shot gains.',
                    src: 'MIT Tech Review',
                    time: '4m ago',
                    tags: ['#Reasoning', '#OpenWeights', '#LLMs'],
                    impact: 'high',
                    readTime: '3 min read',
                    takeaways: [
                        'Distillation enables 1.5B–14B parameter models to replicate complex multi-step reasoning trajectories.',
                        'Inference cost falls below $0.14 per million tokens on standard consumer hardware.',
                        'Catalyzes sovereign and on-premise enterprise model deployments globally.'
                    ]
                },
                {
                    id: 'ai-2',
                    title: 'Anthropic Unveils Next-Gen Claude Multi-Agent Collaboration Protocol',
                    summary: 'Autonomous agent teams can now divide complex engineering refactors across synchronized sub-agents using hierarchical task graphs and deterministic verification loops.',
                    src: 'VentureBeat',
                    time: '18m ago',
                    tags: ['#Agents', '#CodeRefactor', '#Anthropic'],
                    impact: 'bullish',
                    readTime: '2 min read',
                    takeaways: [
                        'Sub-agent coordination yields a 42% reduction in recurring tool execution failures.',
                        'Structured memory sandboxes prevent context drift across multi-hour tasks.',
                        'Enterprise preview rolled out to Tier-1 software engineering organizations.'
                    ]
                },
                {
                    id: 'ai-3',
                    title: 'NVIDIA Blackwell Ultra B300 Clusters Ramp Full Datacenter Production',
                    summary: 'Hyperscalers expand liquid-cooled datacenter capex as 580-teraflop FP4 dense inference clusters deploy to support continuous test-time compute workloads.',
                    src: 'Bloomberg Tech',
                    time: '42m ago',
                    tags: ['#Chips', '#Infrastructure', '#Hardware'],
                    impact: 'bullish',
                    readTime: '3 min read',
                    takeaways: [
                        '288GB ultra-fast HBM3e memory eliminates context window memory pressure.',
                        'Packaging yield exceeds 92% across TSMC advanced CoWoS foundry lines.',
                        'Up to 25x power efficiency gains over legacy Hopper server racks.'
                    ]
                },
                {
                    id: 'ai-4',
                    title: 'Humanoid Robotics Fleets Reach 10,000 Autonomous Factory Hours',
                    summary: 'Vision-Language-Action (VLA) foundation models demonstrate zero-shot generalization across precision assembly, palletizing, and cleanroom navigation without manual teleoperation.',
                    src: 'TechCrunch',
                    time: '1h ago',
                    tags: ['#Robotics', '#VLA', '#Automation'],
                    impact: 'high',
                    readTime: '4 min read',
                    takeaways: [
                        'High-speed tactile tactile feedback loops reduce component slippage below 0.02%.',
                        'Fleet-wide self-correcting neural policies update dynamically across factory nodes.',
                        'Commercial deployments expand across automotive tier-1 manufacturing hubs.'
                    ]
                },
                {
                    id: 'ai-5',
                    title: 'Sub-10ms Local LLM Inference Engine Released for Workstation Silicon',
                    summary: 'Breakthrough 2-bit quantization and bit-serial matrix multiplication architectures allow 70B parameter models to execute smoothly on local developer workstations with zero cloud dependencies.',
                    src: 'HackerNews Digest',
                    time: '2h ago',
                    tags: ['#EdgeAI', '#Quantization', '#OpenSource'],
                    impact: 'neutral',
                    readTime: '2 min read',
                    takeaways: [
                        'Perplexity loss remains within 0.75% of FP16 unquantized baselines.',
                        'Eliminates API latency spikes, tokens fees, and privacy leaks for sensitive codebases.',
                        'Native support included for Apple Silicon, RTX 40/50 series, and Linux workstations.'
                    ]
                },
                {
                    id: 'ai-6',
                    title: 'Quantum-Assisted Neural Networks Achieve Million-Qubit Simulation Milestone',
                    summary: 'Hybrid quantum-classical tensor networks successfully simulate intricate molecular electron orbital interactions that were previously intractable with supercomputers.',
                    src: 'ArXiv AI',
                    time: '3h ago',
                    tags: ['#QuantumAI', '#Simulation', '#Biotech'],
                    impact: 'high',
                    readTime: '4 min read',
                    takeaways: [
                        'Variational quantum algorithms bypass NISQ-era decoherence limitations.',
                        'Chemical catalyst simulations execute over 8,000x faster than legacy DFT calculations.',
                        'Direct applications in solid-state battery electrolyte and drug design.'
                    ]
                },
                {
                    id: 'ai-7',
                    title: 'EU AI Act Foundation Model Compliance Rubrics Finalized',
                    summary: 'European regulatory authorities clarify audit metrics for systemic frontier AI models, establishing concrete safe harbors for open-source research and standardizing copyright reporting.',
                    src: 'Reuters',
                    time: '5h ago',
                    tags: ['#Regulation', '#Policy', '#Europe'],
                    impact: 'neutral',
                    readTime: '3 min read',
                    takeaways: [
                        'Clear exemptions guaranteed for non-monetized open research repositories.',
                        'High-impact classification threshold set above 10^25 cumulative floating point operations.',
                        'Standardized compliance checklists published for enterprise AI deployers.'
                    ]
                },
                {
                    id: 'ai-8',
                    title: 'Photorealistic 4D Neural Spatial Video Synthesizer Open-Sourced',
                    summary: 'New volumetric radiance field engine reconstructs fully navigable 3D meshes and physics-consistent dynamic lighting directly from single mobile camera sweeps.',
                    src: 'The Verge',
                    time: '6h ago',
                    tags: ['#VisionAI', '#SpatialComputing', '#3D'],
                    impact: 'bullish',
                    readTime: '2 min read',
                    takeaways: [
                        'Generates interactive navigable spatial rooms in under 3.5 seconds on desktop GPUs.',
                        'Physical material reflectivity and specular highlights rendered with ray-tracing accuracy.',
                        'Direct export compatibility with Blender, Unreal Engine 5, and WebGL viewports.'
                    ]
                }
            ],
            'Crypto & Blockchain': [
                {
                    id: 'crypto-1',
                    title: 'Bitcoin Institutional ETF Net Inflows Exceed $1.2B in Record Single-Day Haul',
                    summary: 'Global sovereign wealth funds and tier-1 pension managers aggressively accumulate spot BTC as liquid exchange reserves plunge to lowest levels since 2018.',
                    src: 'CoinDesk',
                    time: '6m ago',
                    tags: ['#Bitcoin', '#ETFs', '#Macro'],
                    impact: 'bullish',
                    readTime: '2 min read',
                    takeaways: [
                        'Spot OTC desk reserves dip below 84,000 BTC as institutional absorption accelerates.',
                        'Average wealth management model portfolios increase recommended allocation to 3.5%.',
                        'Mempool fee velocity remains buoyant with steady block space demand.'
                    ]
                },
                {
                    id: 'crypto-2',
                    title: 'Ethereum Layer-2 Networks Cross 250M Daily Transactions Post-Pectra Upgrade',
                    summary: 'Peer-DAS data availability and blob throughput optimizations reduce rollup settlement costs to fractions of a cent, accelerating consumer decentralized app adoption.',
                    src: 'The Block',
                    time: '22m ago',
                    tags: ['#Ethereum', '#Layer2', '#Scaling'],
                    impact: 'bullish',
                    readTime: '3 min read',
                    takeaways: [
                        'Average gas fees on Arbitrum, Base, and Optimism fall below $0.002 per transaction.',
                        'Combined Layer-2 Total Value Locked (TVL) hits a record $53.4 Billion.',
                        'Zero-knowledge proof verification compute latency reduced by 64%.'
                    ]
                },
                {
                    id: 'crypto-3',
                    title: 'Solana DeFi Volume Surpasses Centralized Exchanges in 7-Day Trading Surge',
                    summary: 'High-speed automated market makers, Jupiter decentralized routing, and on-chain orderbooks process over $28B in weekly spot volume with zero network interruptions.',
                    src: 'Decrypt',
                    time: '48m ago',
                    tags: ['#Solana', '#DeFi', '#DEX'],
                    impact: 'bullish',
                    readTime: '3 min read',
                    takeaways: [
                        'Firedancer validator software achieves 60,000 TPS under extreme synthetic stress tests.',
                        'Daily active transacting wallets cross 4.9 million unique addresses.',
                        'Liquid staking derivatives reach an all-time high of 18.2% of total circulating supply.'
                    ]
                },
                {
                    id: 'crypto-4',
                    title: 'Basel Committee & G20 Publish Unified Cross-Border Stablecoin Standard',
                    summary: 'International banking authorities establish transparent reserve backing criteria, requiring regulated issuers to hold short-term sovereign treasuries and segregated cash reserves.',
                    src: 'Financial Times',
                    time: '1h ago',
                    tags: ['#Stablecoins', '#Regulation', '#Banking'],
                    impact: 'neutral',
                    readTime: '4 min read',
                    takeaways: [
                        'Mandates daily audited cryptographic proof-of-reserves for dollar and euro tokens.',
                        'Provides legal runway for commercial depository banks to issue native ledger tokens.',
                        'Clears regulatory overhang for institutional cross-border trade settlements.'
                    ]
                },
                {
                    id: 'crypto-5',
                    title: 'Shared Cryptoeconomic Restaking Protocols Surpass $22B in Total Value Locked',
                    summary: 'Decentralized consensus security expands beyond Layer-1 validation to secure cross-chain bridges, oracle networks, and off-chain coprocessors with shared staking collateral.',
                    src: 'CoinTelegraph',
                    time: '2h ago',
                    tags: ['#Restaking', '#Security', '#EigenLayer'],
                    impact: 'high',
                    readTime: '3 min read',
                    takeaways: [
                        'Dual-asset consensus models mitigate single-token cascading liquidation risks.',
                        'Institutional reinsurance pools underwrite smart contract slashing protections.',
                        'Over 45 Actively Validated Services (AVS) currently operating live mainnet nodes.'
                    ]
                },
                {
                    id: 'crypto-6',
                    title: 'Zero-Knowledge State Proof Protocol Eliminates Multi-Sig Bridge Exploits',
                    summary: 'Cryptographic validity proofs replace trusted federated validator committees, allowing multi-million dollar liquidity transfers across chains with mathematical certainty.',
                    src: 'CryptoSlate',
                    time: '4h ago',
                    tags: ['#ZK', '#Bridges', '#Security'],
                    impact: 'critical',
                    readTime: '3 min read',
                    takeaways: [
                        'Direct light client verification eliminates historic bridge vulnerability vectors.',
                        'Execution finality confirmed in under 45 seconds across EVM and Solana clusters.',
                        'Adopted as default cross-chain messaging standard by 14 major DeFi protocols.'
                    ]
                },
                {
                    id: 'crypto-7',
                    title: 'DePIN Compute Cooperatives Pool 60,000+ Consumer GPUs for AI Fine-Tuning',
                    summary: 'Decentralized physical infrastructure protocols coordinate distributed GPU hardware clusters, undercutting centralized cloud compute providers by 65%.',
                    src: 'Blockworks',
                    time: '6h ago',
                    tags: ['#DePIN', '#AICompute', '#Web3'],
                    impact: 'high',
                    readTime: '3 min read',
                    takeaways: [
                        'Fault-tolerant consensus algorithms withstand intermittent node disconnections.',
                        'Automated verification tasks prevent malicious gradient poisoning during training.',
                        'Commercial inference contracts fully subscribed through end-of-year.'
                    ]
                }
            ],
            'Global News': [
                {
                    id: 'global-1',
                    title: 'Federal Reserve Signals Neutral Interest Rate Path as Core Inflation Cools to 2.4%',
                    summary: 'Central bankers prepare balanced monetary adjustments as productivity indices reach multi-year highs and labor markets stabilize at sustainable equilibrium levels.',
                    src: 'Wall Street Journal',
                    time: '12m ago',
                    tags: ['#Macro', '#Economy', '#InterestRates'],
                    impact: 'bullish',
                    readTime: '3 min read',
                    takeaways: [
                        'Treasury yields normalize smoothly across 2-year and 10-year maturity curves.',
                        'Corporate earnings reports beat consensus forecasts across 74% of S&P 500 constituents.',
                        'Consumer sentiment gauges improve for third consecutive reporting period.'
                    ]
                },
                {
                    id: 'global-2',
                    title: 'Global Semiconductor Alliance Announces 2nm Foundry Commercial Breakthrough',
                    summary: 'Advanced High-NA EUV lithography achieves 94% commercial yield on next-generation silicon, setting stage for next wave of edge neural computing hardware.',
                    src: 'Reuters Finance',
                    time: '35m ago',
                    tags: ['#Semiconductors', '#SupplyChain', '#Tech'],
                    impact: 'high',
                    readTime: '4 min read',
                    takeaways: [
                        'Capital expenditures in advanced packaging projected to reach $118B globally.',
                        'Multi-regional fabrication clusters mitigate geographic supply chain concentration.',
                        'Automotive, mobile, and server silicon roadmaps accelerated by two quarters.'
                    ]
                },
                {
                    id: 'global-3',
                    title: 'Clean Energy Grid Additions Break Records as Utility Battery Costs Drop 38%',
                    summary: 'Massive grid-scale lithium iron phosphate and sodium-ion energy storage installations absorb industrial peak loads across North America, Europe, and Asia.',
                    src: 'Bloomberg Markets',
                    time: '1h ago',
                    tags: ['#Energy', '#Renewables', '#Commodities'],
                    impact: 'neutral',
                    readTime: '3 min read',
                    takeaways: [
                        'Renewable energy capacity accounts for over 85% of all new grid interconnects.',
                        'Crude oil benchmark stabilizes near $71/barrel amid moderated demand forecasts.',
                        'National grid balancing costs decline by 22% due to rapid sub-second battery dispatch.'
                    ]
                },
                {
                    id: 'global-4',
                    title: 'Sovereign Debt Markets Experience Liquidity Rebound in Global Treasury Auctions',
                    summary: 'Primary dealers report robust foreign and domestic bid-to-cover ratios, reflecting resilient institutional confidence in sovereign balance sheets and long-term bonds.',
                    src: 'Financial Times',
                    time: '2h ago',
                    tags: ['#Bonds', '#Liquidity', '#CentralBanks'],
                    impact: 'neutral',
                    readTime: '3 min read',
                    takeaways: [
                        'Deep secondary market trading volumes confirm healthy market absorption.',
                        'Currency hedging spreads tighten across Euro, Sterling, and Yen cross-pairs.',
                        'Credit default swap spreads across developed sovereigns remain near historic tights.'
                    ]
                },
                {
                    id: 'global-5',
                    title: 'Enterprise Software Capex Guidance Surpasses $260B on Workflow Automation',
                    summary: 'Quarterly executive surveys show double-digit productivity gains as AI agent tooling and automated back-office pipelines move from pilot stage to production.',
                    src: 'Barron’s',
                    time: '4h ago',
                    tags: ['#Equities', '#Enterprise', '#Productivity'],
                    impact: 'bullish',
                    readTime: '3 min read',
                    takeaways: [
                        'Revenue per employee metrics advance 19% across automated enterprise adopters.',
                        'Annual net revenue retention in vertical developer tools holds steady above 115%.',
                        'Accelerated consolidation seen in developer workspace and agentic orchestrators.'
                    ]
                }
            ]
        };

        const articles = NEWS_DATA[category] || NEWS_DATA['AI & Machine Learning'];
        let activeTag = 'ALL';
        let searchQuery = '';

        // Extract unique tags
        const allTags = ['ALL'];
        articles.forEach(a => {
            a.tags.forEach(t => {
                if (!allTags.includes(t)) allTags.push(t);
            });
        });

        container.innerHTML = `
            <div class="news-widget-container">
                <div class="news-toolbar">
                    <div class="news-search-row">
                        <input type="text" class="news-search-input" placeholder="Search headlines, briefings, tags...">
                        <button class="news-refresh-btn" title="Fetch Latest Headlines">
                            <span>↻</span> Refresh
                        </button>
                    </div>
                    <div class="news-filter-tags">
                        ${allTags.slice(0, 8).map(tag => `
                            <button class="news-tag-btn ${tag === 'ALL' ? 'active' : ''}" data-tag="${tag}">${tag}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="news-feed-list"></div>
            </div>
        `;

        const feedList = container.querySelector('.news-feed-list');
        const searchInput = container.querySelector('.news-search-input');
        const refreshBtn = container.querySelector('.news-refresh-btn');
        const tagBtns = container.querySelectorAll('.news-tag-btn');

        function renderList(items) {
            if (!feedList) return;
            if (items.length === 0) {
                feedList.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.75rem;">No stories matching "${escapeHtml(searchQuery)}"</div>`;
                return;
            }

            feedList.innerHTML = items.map(a => {
                let impactClass = 'news-badge-neutral';
                if (a.impact === 'bullish') impactClass = 'news-badge-bullish';
                else if (a.impact === 'critical') impactClass = 'news-badge-critical';
                else if (a.impact === 'high') impactClass = 'news-badge-high';

                return `
                    <div class="news-card" data-id="${a.id}">
                        <div class="news-card-header">
                            <div class="news-card-source-box">
                                <span class="news-card-source">${escapeHtml(a.src)}</span>
                                <span>•</span>
                                <span class="news-card-time">${a.time}</span>
                            </div>
                            <div class="news-card-badges">
                                ${a.isNew ? '<span class="news-badge news-badge-new">NEW</span>' : ''}
                                <span class="news-badge ${impactClass}">${a.impact}</span>
                            </div>
                        </div>
                        <h4 class="news-title">${escapeHtml(a.title)}</h4>
                        <div class="news-summary">${escapeHtml(a.summary)}</div>
                        <div class="news-card-footer">
                            <div class="news-tags-row">
                                ${a.tags.map(t => `<span class="news-chip-tag">${escapeHtml(t)}</span>`).join('')}
                            </div>
                            <button class="news-expand-btn" data-id="${a.id}">
                                <span>Takeaways</span> <span>▼</span>
                            </button>
                        </div>
                        <div class="news-briefing-drawer" id="drawer-${a.id}">
                            <ul>
                                ${a.takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }).join('');

            // Wire up takeaway toggles
            feedList.querySelectorAll('.news-expand-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    const drawer = feedList.querySelector(`#drawer-${id}`);
                    if (drawer) {
                        drawer.classList.toggle('show');
                        const isExpanded = drawer.classList.contains('show');
                        btn.querySelector('span:last-child').textContent = isExpanded ? '▲' : '▼';
                    }
                });
            });
        }

        function filterAndRender() {
            let filtered = articles;
            if (activeTag !== 'ALL') {
                filtered = filtered.filter(a => a.tags.includes(activeTag));
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                filtered = filtered.filter(a => 
                    a.title.toLowerCase().includes(q) || 
                    a.summary.toLowerCase().includes(q) ||
                    a.tags.some(t => t.toLowerCase().includes(q)) ||
                    a.src.toLowerCase().includes(q)
                );
            }
            renderList(filtered);
        }

        // Search listener
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            filterAndRender();
        });

        // Tag buttons
        tagBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tagBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeTag = btn.dataset.tag;
                filterAndRender();
            });
        });

        // Refresh action with animation and breaking news injection
        refreshBtn.addEventListener('click', () => {
            sound.playChime('enter');
            refreshBtn.querySelector('span').style.transform = 'rotate(360deg)';
            refreshBtn.querySelector('span').style.transition = 'transform 0.4s ease';
            setTimeout(() => {
                refreshBtn.querySelector('span').style.transform = '';
                refreshBtn.querySelector('span').style.transition = '';
            }, 400);

            // Prepend a breaking flash story
            const breakingStory = {
                id: `breaking-${Date.now()}`,
                title: category === 'AI & Machine Learning'
                    ? 'BREAKING: Next-Generation Frontier Model Passes Complex Mathematical Olympiad Benchmark'
                    : (category === 'Crypto & Blockchain'
                        ? 'BREAKING: Global Settlement Clearinghouse Approves Real-Time On-Chain Atomic Delivery'
                        : 'BREAKING: International Trade Corridors Report 14% Cargo Velocity Surge on Digital Logistics'),
                summary: 'Real-time telemetry and network telemetry confirm immediate institutional execution and record throughput across all primary liquidity venues.',
                src: 'Breaking Intelligence',
                time: 'just now',
                tags: ['#Breaking', '#FlashUpdate'],
                impact: 'high',
                readTime: '1 min read',
                isNew: true,
                takeaways: [
                    'Immediate high-priority execution confirmed by global desks.',
                    'Zero latency bottlenecks observed across live pipelines.',
                    'Secondary markets pricing in swift operational integration.'
                ]
            };

            if (!articles.some(a => a.id.startsWith('breaking'))) {
                articles.unshift(breakingStory);
            }
            filterAndRender();
        });

        filterAndRender();
    }

    // 22. Box Breathing Focus Circle Widget
    function renderBreathingWidget(widget, container) {
        let isRunning = false;
        let timer = null;
        let phaseIndex = 0; // 0: Inhale (4s), 1: Hold (7s), 2: Exhale (8s)
        const PHASES = [
            { name: 'Inhale', duration: 4, class: 'inhale' },
            { name: 'Hold', duration: 7, class: 'hold' },
            { name: 'Exhale', duration: 8, class: 'exhale' }
        ];
        let secondsLeft = PHASES[0].duration;
        let cyclesCompleted = 0;

        container.innerHTML = `
            <div class="breathing-box">
                <div class="breathing-orb-container">
                    <div class="breathing-orb"></div>
                    <div class="breathing-label">READY</div>
                </div>
                <div class="breathing-timer">4s</div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="btn-pill" id="breathToggleBtn" style="height:34px; padding:0 1.2rem;">Start Breath</button>
                    <span style="font-size:0.8rem; color:var(--text-muted);">Cycles: <strong id="breathCycles" style="color:var(--text-primary);">0</strong></span>
                </div>
            </div>
        `;

        const orb = container.querySelector('.breathing-orb');
        const label = container.querySelector('.breathing-label');
        const timerEl = container.querySelector('.breathing-timer');
        const toggleBtn = container.querySelector('#breathToggleBtn');
        const cyclesEl = container.querySelector('#breathCycles');

        function step() {
            if (!isRunning) return;
            secondsLeft--;
            if (secondsLeft <= 0) {
                phaseIndex = (phaseIndex + 1) % PHASES.length;
                if (phaseIndex === 0) {
                    cyclesCompleted++;
                    cyclesEl.textContent = cyclesCompleted;
                    sound.playChime('success');
                }
                const phase = PHASES[phaseIndex];
                secondsLeft = phase.duration;
                label.textContent = phase.name.toUpperCase();
                orb.className = `breathing-orb ${phase.class}`;
            }
            timerEl.textContent = `${secondsLeft}s`;
        }

        toggleBtn.addEventListener('click', () => {
            sound.init();
            isRunning = !isRunning;
            if (isRunning) {
                toggleBtn.textContent = 'Pause';
                toggleBtn.style.background = 'var(--accent-color)';
                const phase = PHASES[phaseIndex];
                label.textContent = phase.name.toUpperCase();
                orb.className = `breathing-orb ${phase.class}`;
                timer = setInterval(step, 1000);
            } else {
                toggleBtn.textContent = 'Resume';
                toggleBtn.style.background = '';
                clearInterval(timer);
            }
        });
    }

    // 23. Neural Binaural Beats Generator Widget (True Stereo Panned Entrainment)
    function renderBinauralWidget(widget, container) {
        let isPlaying = false;
        let oscL = null;
        let oscR = null;
        let gainNode = null;
        let currentMode = 'alpha';

        const PRESETS = {
            alpha: { name: 'Alpha (10Hz)', desc: 'Flow State & Focus', freq: 10, base: 216 },
            theta: { name: 'Theta (6Hz)', desc: 'Deep Insight & Calm', freq: 6, base: 196 },
            beta: { name: 'Beta (18Hz)', desc: 'Coding & High Alert', freq: 18, base: 240 },
            gamma: { name: 'Gamma (40Hz)', desc: 'Peak Cognition', freq: 40, base: 300 }
        };

        container.innerHTML = `
            <div class="binaural-controls">
                <div class="binaural-presets">
                    <button class="binaural-preset-btn active" data-mode="alpha">Alpha 10Hz</button>
                    <button class="binaural-preset-btn" data-mode="theta">Theta 6Hz</button>
                    <button class="binaural-preset-btn" data-mode="beta">Beta 18Hz</button>
                    <button class="binaural-preset-btn" data-mode="gamma">Gamma 40Hz</button>
                </div>
                <canvas class="binaural-canvas"></canvas>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:0.8rem; color:var(--text-secondary);" id="binauralDesc">Flow State & Focus • Headphones Recommended</div>
                    <button class="btn-pill" id="binauralToggleBtn" style="height:32px; padding:0 1rem; font-size:0.8rem;">Play Beats</button>
                </div>
            </div>
        `;

        const canvas = container.querySelector('.binaural-canvas');
        const ctx = canvas.getContext('2d');
        const toggleBtn = container.querySelector('#binauralToggleBtn');
        const descEl = container.querySelector('#binauralDesc');
        const presetBtns = container.querySelectorAll('.binaural-preset-btn');

        function startBeats() {
            sound.init();
            stopBeats();
            const actx = sound.ctx;
            const p = PRESETS[currentMode];

            gainNode = actx.createGain();
            gainNode.gain.value = 0.15;
            gainNode.connect(sound.masterGain);

            oscL = actx.createOscillator();
            oscR = actx.createOscillator();

            oscL.type = 'sine';
            oscR.type = 'sine';

            oscL.frequency.value = p.base;
            oscR.frequency.value = p.base + p.freq;

            // True Stereo Panning for Neurological Entrainment
            if (actx.createStereoPanner) {
                const panL = actx.createStereoPanner();
                panL.pan.value = -1.0; // 100% Left Ear
                const panR = actx.createStereoPanner();
                panR.pan.value = 1.0;  // 100% Right Ear

                oscL.connect(panL);
                panL.connect(gainNode);

                oscR.connect(panR);
                panR.connect(gainNode);
            } else {
                oscL.connect(gainNode);
                oscR.connect(gainNode);
            }

            oscL.start();
            oscR.start();
            isPlaying = true;
            toggleBtn.textContent = 'Stop Beats';
            toggleBtn.style.background = 'var(--accent-color)';
        }

        function stopBeats() {
            if (oscL) { try { oscL.stop(); } catch(e) {} oscL = null; }
            if (oscR) { try { oscR.stop(); } catch(e) {} oscR = null; }
            isPlaying = false;
            toggleBtn.textContent = 'Play Beats';
            toggleBtn.style.background = '';
        }

        toggleBtn.addEventListener('click', () => {
            if (isPlaying) stopBeats();
            else startBeats();
        });

        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                descEl.textContent = `${PRESETS[currentMode].desc} • Headphones Recommended`;
                if (isPlaying) startBeats();
            });
        });

        // Waveform Visualizer
        let isMounted = false;
        let wavePhase = 0;
        function drawWave() {
            if (!container.isConnected) {
                if (!isMounted) {
                    requestAnimationFrame(drawWave);
                    return;
                }
                return;
            }
            isMounted = true;
            const w = canvas.clientWidth || 300;
            const h = canvas.clientHeight || 60;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }

            ctx.fillStyle = '#06070a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = isPlaying ? '#a78bfa' : 'rgba(255, 255, 255, 0.15)';

            const freq = PRESETS[currentMode].freq;
            for (let x = 0; x < canvas.width; x++) {
                const y = canvas.height / 2 + Math.sin(x * 0.05 + wavePhase) * Math.sin(x * 0.01) * (isPlaying ? 22 : 6);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            if (isPlaying) wavePhase += (freq * 0.03);
            else wavePhase += 0.02;

            requestAnimationFrame(drawWave);
        }
        drawWave();
    }

    // 24. Deep Work Matrix Heatmap Widget (Real-Time Calendar Habit Engine)
    function renderHabitMatrixWidget(widget, container) {
        function formatDate(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }

        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const today = new Date();
        const todayStr = formatDate(today);

        // Load or initialize persistent logs
        let logs = {};
        try {
            logs = JSON.parse(localStorage.getItem('focus_deep_work_logs') || '{}');
        } catch(e) { logs = {}; }

        // Seed realistic history if empty or fresh install
        if (!logs || Object.keys(logs).length === 0) {
            logs = {};
            // Seed 15 weeks back from today
            for (let i = 105; i >= 1; i--) {
                const pastD = new Date(today);
                pastD.setDate(today.getDate() - i);
                const pastStr = formatDate(pastD);
                const isWeekend = pastD.getDay() === 0 || pastD.getDay() === 6;
                const prob = isWeekend ? 0.32 : 0.68;
                if (Math.random() < prob) {
                    const hrs = +(Math.random() * (isWeekend ? 2.5 : 4.0) + 1.0).toFixed(1);
                    logs[pastStr] = hrs;
                }
            }
            // Ensure an active 4-day streak leading up to yesterday
            for (let i = 1; i <= 4; i++) {
                const pastD = new Date(today);
                pastD.setDate(today.getDate() - i);
                const pastStr = formatDate(pastD);
                logs[pastStr] = +(Math.random() * 2.5 + 2.0).toFixed(1);
            }
            // Today starts with whatever sessions were done today
            const sessionsToday = parseInt(localStorage.getItem('focus_sessions_today') || '0', 10);
            if (sessionsToday > 0) {
                logs[todayStr] = +(sessionsToday * 0.42).toFixed(1);
            }
            localStorage.setItem('focus_deep_work_logs', JSON.stringify(logs));
        }

        // Calculate 16 ISO weeks (Monday-Sunday)
        const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
        const distFromMon = (dayOfWeek + 6) % 7;
        const currentMon = new Date(today);
        currentMon.setDate(today.getDate() - distFromMon);
        currentMon.setHours(0, 0, 0, 0);

        const startMon = new Date(currentMon);
        startMon.setDate(currentMon.getDate() - (15 * 7));

        let selectedDateStr = todayStr;

        function saveLogs() {
            localStorage.setItem('focus_deep_work_logs', JSON.stringify(logs));
        }

        function getLevel(h) {
            if (!h || h <= 0) return 0;
            if (h < 1.5) return 1;
            if (h < 3.0) return 2;
            if (h < 4.5) return 3;
            return 4;
        }

        function computeStats() {
            let totalHrs = 0;
            let activeDays = 0;
            let pastDaysCount = 0;

            // Compute total hours & active days in the 16-week window
            for (let i = 0; i < 112; i++) {
                const d = new Date(startMon);
                d.setDate(startMon.getDate() + i);
                const dStr = formatDate(d);
                if (d <= today || dStr === todayStr) {
                    pastDaysCount++;
                    const h = logs[dStr] || 0;
                    totalHrs += h;
                    if (h > 0) activeDays++;
                }
            }

            // Streak calculation
            let currentStreak = 0;
            let checkD = new Date(today);
            const todayHrs = logs[todayStr] || 0;
            if (todayHrs > 0) {
                currentStreak = 1;
                checkD.setDate(checkD.getDate() - 1);
                while (true) {
                    const ds = formatDate(checkD);
                    if ((logs[ds] || 0) > 0) {
                        currentStreak++;
                        checkD.setDate(checkD.getDate() - 1);
                    } else break;
                }
            } else {
                const yest = new Date(today);
                yest.setDate(yest.getDate() - 1);
                checkD = yest;
                while (true) {
                    const ds = formatDate(checkD);
                    if ((logs[ds] || 0) > 0) {
                        currentStreak++;
                        checkD.setDate(checkD.getDate() - 1);
                    } else break;
                }
            }

            const consistency = pastDaysCount > 0 ? Math.round((activeDays / pastDaysCount) * 100) : 0;
            return {
                totalHrs: +totalHrs.toFixed(1),
                todayHrs: +(logs[todayStr] || 0).toFixed(1),
                currentStreak,
                consistency
            };
        }

        function renderDOM() {
            if (!container.isConnected) return;
            const stats = computeStats();

            // Month headers
            let monthCells = [];
            let prevMonth = -1;
            for (let w = 0; w < 16; w++) {
                const d = new Date(startMon);
                d.setDate(startMon.getDate() + (w * 7));
                const m = d.getMonth();
                if (w === 0 || m !== prevMonth) {
                    monthCells.push(`<div class="matrix-month-cell">${MONTH_NAMES[m]}</div>`);
                    prevMonth = m;
                } else {
                    monthCells.push(`<div class="matrix-month-cell"></div>`);
                }
            }

            // Generate 112 tiles (7 rows x 16 cols)
            let tileHtml = '';
            for (let w = 0; w < 16; w++) {
                for (let d = 0; d < 7; d++) {
                    const date = new Date(startMon);
                    date.setDate(startMon.getDate() + (w * 7) + d);
                    const dateStr = formatDate(date);
                    const isToday = dateStr === todayStr;
                    const isFuture = date > today && !isToday;
                    const hrs = logs[dateStr] || 0;
                    const lvl = getLevel(hrs);
                    const isSelected = dateStr === selectedDateStr;

                    const dayName = DAY_NAMES[date.getDay()];
                    const titleText = isFuture 
                        ? `${dayName}, ${dateStr} (Upcoming)` 
                        : `${dayName}, ${dateStr}: ${hrs > 0 ? hrs + ' hrs focus' : 'No focus logged'}`;

                    tileHtml += `
                        <div class="matrix-tile lvl-${lvl} ${isToday ? 'today-tile' : ''} ${isFuture ? 'future-tile' : ''} ${isSelected ? 'selected' : ''}"
                             data-date="${dateStr}"
                             data-future="${isFuture ? '1' : '0'}"
                             title="${titleText}">
                        </div>
                    `;
                }
            }

            const selectedDateObj = new Date(selectedDateStr + 'T12:00:00');
            const selDayName = DAY_NAMES[selectedDateObj.getDay()];
            const selMonthName = MONTH_NAMES[selectedDateObj.getMonth()];
            const selDayNum = selectedDateObj.getDate();
            const selHrs = +(logs[selectedDateStr] || 0).toFixed(1);

            let statusBadge = '';
            if (selHrs >= 4.5) statusBadge = '🔥 Elite Focus (Goal Met!)';
            else if (selHrs >= 3.0) statusBadge = '⚡ Deep Focus Achieved';
            else if (selHrs >= 1.5) statusBadge = '🎯 Solid Focus Block';
            else if (selHrs > 0) statusBadge = '🌱 Momentum Started';
            else statusBadge = '⚪ No Focus Logged';

            container.innerHTML = `
                <div class="matrix-widget-container">
                    <!-- 4-Stat Telemetry Grid -->
                    <div class="matrix-stats-grid">
                        <div class="matrix-stat-card">
                            <div class="matrix-stat-title">Current Streak</div>
                            <div class="matrix-stat-value" id="matrixStreakVal" style="color:#f59e0b;">
                                🔥 ${stats.currentStreak} Days
                            </div>
                        </div>
                        <div class="matrix-stat-card">
                            <div class="matrix-stat-title">Total Logged</div>
                            <div class="matrix-stat-value" id="matrixTotalHrsVal" style="color:var(--accent-hover);">
                                ⏱️ ${stats.totalHrs} hrs
                            </div>
                        </div>
                        <div class="matrix-stat-card">
                            <div class="matrix-stat-title">Today's Focus</div>
                            <div class="matrix-stat-value" id="matrixTodayVal" style="color:#10b981;">
                                🎯 ${stats.todayHrs} / 4.0h
                            </div>
                        </div>
                        <div class="matrix-stat-card">
                            <div class="matrix-stat-title">Consistency</div>
                            <div class="matrix-stat-value" id="matrixConsistVal" style="color:#38bdf8;">
                                ⚡ ${stats.consistency}%
                            </div>
                        </div>
                    </div>

                    <!-- Scrollable Calendar Heatmap -->
                    <div class="matrix-scroll-wrapper">
                        <div class="matrix-layout">
                            <div class="matrix-day-labels">
                                <div class="matrix-day-label">Mon</div>
                                <div class="matrix-day-label"></div>
                                <div class="matrix-day-label">Wed</div>
                                <div class="matrix-day-label"></div>
                                <div class="matrix-day-label">Fri</div>
                                <div class="matrix-day-label"></div>
                                <div class="matrix-day-label">Sun</div>
                            </div>
                            <div class="matrix-content">
                                <div class="matrix-month-labels">
                                    ${monthCells.join('')}
                                </div>
                                <div class="matrix-grid" id="matrixGrid">
                                    ${tileHtml}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Interactive Day Inspector -->
                    <div class="matrix-inspector">
                        <div class="matrix-inspector-left">
                            <span class="matrix-inspector-date" id="inspectorDate">
                                📅 ${selectedDateStr === todayStr ? 'Today • ' : ''}${selDayName}, ${selMonthName} ${selDayNum}
                            </span>
                            <span class="matrix-inspector-status" id="inspectorStatus">
                                ${statusBadge} • <strong id="inspectorHrsText">${selHrs} hrs</strong>
                            </span>
                        </div>
                        <div class="matrix-inspector-actions">
                            <button class="matrix-ctrl-btn" data-action="sub05" title="Subtract 30 minutes">-0.5h</button>
                            <button class="matrix-ctrl-btn" data-action="add05" title="Add 30 minutes">+0.5h</button>
                            <button class="matrix-ctrl-btn" data-action="add10" title="Add 1 hour">+1.0h</button>
                            <button class="matrix-ctrl-btn" data-action="clear" title="Clear day">Clear</button>
                        </div>
                    </div>

                    <!-- Quick Log Toolbar & Legend -->
                    <div class="matrix-footer">
                        <div class="matrix-quick-log">
                            <span style="font-weight:600; color:var(--text-secondary); margin-right:2px;">Today:</span>
                            <button class="matrix-ctrl-btn" id="btnQuickPomo">+25m Pomo ⏱️</button>
                            <button class="matrix-ctrl-btn" id="btnQuick1h">+1h Focus ⚡</button>
                            <button class="matrix-ctrl-btn" id="btnQuick2h">+2h Deep Work 🎯</button>
                            <button class="matrix-ctrl-btn" id="btnQuickReset" style="color:var(--text-muted);">Reset ↺</button>
                        </div>
                        <div class="matrix-legend">
                            <span>Less</span>
                            <span class="matrix-legend-cell" style="background:rgba(255,255,255,0.04);"></span>
                            <span class="matrix-legend-cell" style="background:rgba(139, 92, 246, 0.28);"></span>
                            <span class="matrix-legend-cell" style="background:rgba(139, 92, 246, 0.55);"></span>
                            <span class="matrix-legend-cell" style="background:rgba(139, 92, 246, 0.85);"></span>
                            <span class="matrix-legend-cell" style="background:#c4b5fd;"></span>
                            <span>More (4h+)</span>
                        </div>
                    </div>
                </div>
            `;

            attachEvents();
        }

        function attachEvents() {
            // Tile clicks
            container.querySelectorAll('.matrix-tile').forEach(tile => {
                tile.addEventListener('click', () => {
                    if (tile.dataset.future === '1') return;
                    const dateStr = tile.dataset.date;
                    selectedDateStr = dateStr;

                    // Cycle hours: 0 -> 1.5 -> 3.0 -> 4.5 -> 6.0 -> 0
                    let current = logs[dateStr] || 0;
                    if (current === 0) current = 1.5;
                    else if (current < 2.5) current = 3.0;
                    else if (current < 4.0) current = 4.5;
                    else if (current < 5.5) current = 6.0;
                    else current = 0;

                    logs[dateStr] = +current.toFixed(1);
                    saveLogs();
                    sound.playChime('success');
                    renderDOM();
                });
            });

            // Inspector action buttons
            container.querySelectorAll('.matrix-inspector-actions button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    let current = logs[selectedDateStr] || 0;
                    if (action === 'sub05') current = Math.max(0, current - 0.5);
                    else if (action === 'add05') current = current + 0.5;
                    else if (action === 'add10') current = current + 1.0;
                    else if (action === 'clear') current = 0;

                    logs[selectedDateStr] = +current.toFixed(1);
                    saveLogs();
                    sound.playChime('success');
                    renderDOM();
                });
            });

            // Quick Log buttons
            const qPomo = container.querySelector('#btnQuickPomo');
            const q1h = container.querySelector('#btnQuick1h');
            const q2h = container.querySelector('#btnQuick2h');
            const qReset = container.querySelector('#btnQuickReset');

            if (qPomo) {
                qPomo.addEventListener('click', () => {
                    selectedDateStr = todayStr;
                    logs[todayStr] = +((logs[todayStr] || 0) + 0.42).toFixed(1);
                    saveLogs();
                    sound.playChime('success');
                    renderDOM();
                });
            }
            if (q1h) {
                q1h.addEventListener('click', () => {
                    selectedDateStr = todayStr;
                    logs[todayStr] = +((logs[todayStr] || 0) + 1.0).toFixed(1);
                    saveLogs();
                    sound.playChime('success');
                    renderDOM();
                });
            }
            if (q2h) {
                q2h.addEventListener('click', () => {
                    selectedDateStr = todayStr;
                    logs[todayStr] = +((logs[todayStr] || 0) + 2.0).toFixed(1);
                    saveLogs();
                    sound.playChime('success');
                    renderDOM();
                });
            }
            if (qReset) {
                qReset.addEventListener('click', () => {
                    selectedDateStr = todayStr;
                    logs[todayStr] = 0;
                    saveLogs();
                    sound.playChime('enter');
                    renderDOM();
                });
            }
        }

        renderDOM();

        // Listen for external updates (e.g. Pomodoro completion)
        function handleExternalUpdate() {
            if (!container.isConnected) {
                window.removeEventListener('focus:deepwork-updated', handleExternalUpdate);
                return;
            }
            try {
                logs = JSON.parse(localStorage.getItem('focus_deep_work_logs') || '{}');
            } catch(e) {}
            renderDOM();
        }
        window.addEventListener('focus:deepwork-updated', handleExternalUpdate);
    }

    // 25. 3D Cyber Globe & Orbit Telemetry Widget
    function renderCyberGlobeWidget(widget, container) {
        container.innerHTML = `
            <div class="cyber-globe-container">
                <canvas class="cyber-globe-canvas"></canvas>
                <div class="cyber-globe-telemetry">
                    <span>ALT: <strong>418 km</strong></span>
                    <span>VEL: <strong>7.66 km/s</strong></span>
                    <span id="globeCoords">LAT: <strong>35.6°N</strong> LON: <strong>139.7°E</strong></span>
                </div>
                <div class="cyber-globe-controls">
                    <button class="btn-pill" id="globeRotateBtn" style="height:26px; padding:0 0.8rem; font-size:0.72rem;">Pause Rotation</button>
                    <span style="font-size:0.72rem; color:var(--text-muted);"><span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#10b981; margin-right:4px;"></span>ISS Orbit Active</span>
                </div>
            </div>
        `;

        const canvas = container.querySelector('.cyber-globe-canvas');
        const ctx = canvas.getContext('2d');
        const rotateBtn = container.querySelector('#globeRotateBtn');
        const coordsEl = container.querySelector('#globeCoords');

        let isRotating = true;
        let rotY = 0;
        let rotX = 0.28;
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let velY = 0;
        let velX = 0;
        let isMounted = false;

        // Accurate Global Landmass Point Grid
        function isLand(lat, lon) {
            // North America & Greenland
            if (lat >= 14 && lat <= 72 && lon >= -168 && lon <= -52) {
                if (lat > 52 && lon < -140) return true; // Alaska
                if (lat >= 25 && lat <= 52 && lon >= -125 && lon <= -70) return true; // US/Canada
                if (lat < 25 && lon >= -105 && lon <= -78) return true; // Mexico/Central
                if (lat >= 60 && lon >= -52 && lon <= -20) return true; // Greenland
            }
            // South America
            if (lat >= -56 && lat <= 12 && lon >= -82 && lon <= -34) {
                if (lat < -18 && lon < -72) return false;
                if (lat < -38 && lon > -58) return false;
                return true;
            }
            // Europe
            if (lat >= 36 && lat <= 71 && lon >= -10 && lon <= 42) {
                if (lat > 58 && lon > 35) return false;
                return true;
            }
            // Africa
            if (lat >= -35 && lat <= 37 && lon >= -18 && lon <= 52) {
                if (lat < 2 && lon < 8) return false;
                if (lat > 18 && lon < -14) return false;
                return true;
            }
            // Asia
            if (lat >= 5 && lat <= 76 && lon >= 42 && lon <= 175) {
                if (lat < 12 && lon < 95) return false;
                return true;
            }
            // Australia & New Zealand
            if (lat >= -44 && lat <= -11 && lon >= 113 && lon <= 154) return true;
            if (lat >= -47 && lat <= -35 && lon >= 166 && lon <= 179) return true; // NZ
            // Japan & UK
            if (lat >= 30 && lat <= 45 && lon >= 128 && lon <= 146) return true;
            if (lat >= 50 && lat <= 59 && lon >= -8 && lon <= 2) return true;
            return false;
        }

        const LAND_POINTS = [];
        for (let lat = -75; lat <= 75; lat += 4.5) {
            for (let lon = -180; lon < 180; lon += 5.5) {
                if (isLand(lat, lon)) {
                    LAND_POINTS.push({ lat, lon });
                }
            }
        }

        const CITIES = [
            { name: 'Tokyo', lat: 35.6, lon: 139.6 },
            { name: 'London', lat: 51.5, lon: -0.1 },
            { name: 'NYC', lat: 40.7, lon: -74.0 },
            { name: 'SF', lat: 37.7, lon: -122.4 },
            { name: 'Singapore', lat: 1.3, lon: 103.8 },
            { name: 'Sydney', lat: -33.8, lon: 151.2 },
            { name: 'Zurich', lat: 47.3, lon: 8.5 }
        ];

        // Global flight arcs between major hubs
        const ARCS = [
            { from: CITIES[0], to: CITIES[3] }, // Tokyo -> SF
            { from: CITIES[1], to: CITIES[2] }, // London -> NYC
            { from: CITIES[1], to: CITIES[6] }, // London -> Zurich
            { from: CITIES[3], to: CITIES[2] }, // SF -> NYC
            { from: CITIES[4], to: CITIES[0] }, // Singapore -> Tokyo
            { from: CITIES[4], to: CITIES[5] }  // Singapore -> Sydney
        ];

        function renderGlobe() {
            if (!container.isConnected) {
                if (!isMounted) {
                    requestAnimationFrame(renderGlobe);
                    return;
                }
                return;
            }
            isMounted = true;

            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const w = Math.round(rect.width) || 300;
            const h = Math.round(rect.height) || 200;

            if (w === 0 || h === 0) {
                requestAnimationFrame(renderGlobe);
                return;
            }

            if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
                canvas.width = Math.round(w * dpr);
                canvas.height = Math.round(h * dpr);
            }

            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h / 2;
            const radius = Math.min(cx, cy) * 0.78;

            // Physics rotation & inertia
            if (!isDragging) {
                if (isRotating) rotY += 0.006;
                rotY += velY;
                rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));
                velY *= 0.94;
                velX *= 0.94;
            }

            // 3D Spherical Projection Function
            function project(latDeg, lonDeg, r) {
                const phi = (90 - latDeg) * (Math.PI / 180);
                const theta = (lonDeg + 180) * (Math.PI / 180) + rotY;

                let x = -(r * Math.sin(phi) * Math.cos(theta));
                let z = (r * Math.sin(phi) * Math.sin(theta));
                let y = (r * Math.cos(phi));

                const cosX = Math.cos(rotX);
                const sinX = Math.sin(rotX);
                const y2 = y * cosX - z * sinX;
                const z2 = y * sinX + z * cosX;

                return {
                    x: cx + x,
                    y: cy - y2,
                    z: z2,
                    visible: z2 > 0
                };
            }

            // 1. Atmospheric Outer Halo
            const glow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.25);
            glow.addColorStop(0, 'rgba(139, 92, 246, 0.18)');
            glow.addColorStop(0.7, 'rgba(167, 139, 250, 0.08)');
            glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
            ctx.fill();

            // 2. Dark Obsidian Sphere Body
            const sphereGrad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.05, cx, cy, radius);
            sphereGrad.addColorStop(0, 'rgba(25, 20, 45, 0.75)');
            sphereGrad.addColorStop(0.7, 'rgba(8, 10, 18, 0.92)');
            sphereGrad.addColorStop(1, 'rgba(139, 92, 246, 0.25)');
            ctx.fillStyle = sphereGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // Sphere Outline
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // 3. Latitude Circles
            const lats = [-60, -30, 0, 30, 60];
            lats.forEach(lat => {
                ctx.beginPath();
                ctx.strokeStyle = lat === 0 ? 'rgba(167, 139, 250, 0.4)' : 'rgba(255, 255, 255, 0.07)';
                ctx.lineWidth = lat === 0 ? 1.4 : 0.8;

                let first = true;
                for (let lon = -180; lon <= 180; lon += 4) {
                    const pt = project(lat, lon, radius);
                    if (pt.visible) {
                        if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
                        else { ctx.lineTo(pt.x, pt.y); }
                    } else {
                        first = true;
                    }
                }
                ctx.stroke();
            });

            // 4. Longitude Meridians
            for (let lon = -180; lon < 180; lon += 30) {
                ctx.beginPath();
                ctx.strokeStyle = lon === 0 ? 'rgba(167, 139, 250, 0.35)' : 'rgba(255, 255, 255, 0.06)';
                ctx.lineWidth = 0.8;

                let first = true;
                for (let lat = -90; lat <= 90; lat += 4) {
                    const pt = project(lat, lon, radius);
                    if (pt.visible) {
                        if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
                        else { ctx.lineTo(pt.x, pt.y); }
                    } else {
                        first = true;
                    }
                }
                ctx.stroke();
            }

            // 5. Continental Landmass Hologram Matrix
            LAND_POINTS.forEach(pt => {
                const proj = project(pt.lat, pt.lon, radius);
                if (proj.visible) {
                    const depthAlpha = Math.min(1, 0.2 + (proj.z / radius) * 0.8);
                    ctx.fillStyle = `rgba(167, 139, 250, ${depthAlpha * 0.85})`;
                    ctx.fillRect(proj.x - 1, proj.y - 1, 2.2, 2.2);
                } else {
                    // Back side faint translucent dots
                    ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
                    ctx.fillRect(proj.x - 0.75, proj.y - 0.75, 1.5, 1.5);
                }
            });

            // 6. Flight Arcs Between Cities
            const arcTime = (Date.now() * 0.0015) % 1;
            ARCS.forEach(arc => {
                const p1 = project(arc.from.lat, arc.from.lon, radius);
                const p2 = project(arc.to.lat, arc.to.lon, radius);

                if (p1.visible || p2.visible) {
                    // Midpoint raised into orbit
                    const midLat = (arc.from.lat + arc.to.lat) / 2;
                    const midLon = (arc.from.lon + arc.to.lon) / 2;
                    const midP = project(midLat, midLon, radius * 1.16);

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.quadraticCurveTo(midP.x, midP.y, p2.x, p2.y);
                    ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
                    ctx.setLineDash([3, 4]);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Traveling pulse packet
                    const t = arcTime;
                    const qx = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * midP.x + t * t * p2.x;
                    const qy = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * midP.y + t * t * p2.y;
                    ctx.beginPath();
                    ctx.arc(qx, qy, 2, 0, Math.PI * 2);
                    ctx.fillStyle = '#38bdf8';
                    ctx.fill();
                }
            });

            // 7. City Beacon Nodes
            const time = Date.now() * 0.003;
            CITIES.forEach(city => {
                const pt = project(city.lat, city.lon, radius);
                if (pt.visible) {
                    const pulse = (Math.sin(time + city.lat) + 1) / 2;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 2.5 + pulse * 5, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(167, 139, 250, ${0.75 - pulse * 0.55})`;
                    ctx.lineWidth = 1.2;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();

                    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                    ctx.font = 'bold 9px monospace';
                    ctx.fillText(city.name, pt.x + 6, pt.y + 3);
                }
            });

            // 8. ISS Orbit Simulation
            const satLon = ((Date.now() * 0.015) % 360) - 180;
            const satLat = Math.sin(Date.now() * 0.0008) * 51.6;
            const satPt = project(satLat, satLon, radius * 1.14);
            if (satPt.visible) {
                ctx.beginPath();
                ctx.arc(satPt.x, satPt.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#10b981';
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 9px monospace';
                ctx.fillText('ISS [418km]', satPt.x + 7, satPt.y + 3);

                if (coordsEl) {
                    coordsEl.innerHTML = `LAT: <strong>${satLat.toFixed(1)}°</strong> LON: <strong>${satLon.toFixed(1)}°</strong>`;
                }
            }

            ctx.restore();
            requestAnimationFrame(renderGlobe);
        }

        renderGlobe();

        // Mouse Drag to Rotate with Momentum
        canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            velY = 0;
            velX = 0;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            velY = dx * 0.006;
            velX = dy * 0.006;
            rotY += velY;
            rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        rotateBtn.addEventListener('click', () => {
            isRotating = !isRotating;
            rotateBtn.textContent = isRotating ? 'Pause Rotation' : 'Resume Rotation';
            rotateBtn.style.background = isRotating ? '' : 'var(--accent-color)';
        });
    }

    // 26. Ambient Soundscape Studio Widget
    function renderSoundscapeWidget(widget, container) {
        let isPlaying = false;
        const tracks = [
            { id: 'rain', name: 'Cyber Rain', icon: '🌧️', volume: 0.5, node: null, gain: null },
            { id: 'drone', name: 'Deep Space Pad', icon: '🪐', volume: 0.4, node: null, gain: null },
            { id: 'alpha', name: 'Cosmic Alpha 10Hz', icon: '✨', volume: 0.35, node: null, gain: null },
            { id: 'chimes', name: 'Crystal Bells', icon: '🔮', volume: 0.25, node: null, gain: null }
        ];

        container.innerHTML = `
            <div class="soundscape-mixer">
                <canvas class="soundscape-visualizer"></canvas>
                ${tracks.map(t => `
                    <div class="soundscape-track">
                        <div class="soundscape-track-info">
                            <span>${t.icon}</span>
                            <span>${t.name}</span>
                        </div>
                        <input type="range" class="soundscape-slider" data-id="${t.id}" min="0" max="1" step="0.01" value="${t.volume}">
                        <span style="font-size:0.75rem; font-family:var(--font-mono); width:32px; text-align:right;" id="vol-${t.id}">${Math.round(t.volume * 100)}%</span>
                    </div>
                `).join('')}
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                    <div style="display:flex; gap:6px;">
                        <button class="btn-pill" id="presetRain" style="height:28px; padding:0 0.8rem; font-size:0.75rem;">Rainstorm</button>
                        <button class="btn-pill" id="presetSpace" style="height:28px; padding:0 0.8rem; font-size:0.75rem;">Deep Orbit</button>
                    </div>
                    <button class="btn-pill" id="soundscapeMasterBtn" style="height:32px; padding:0 1.2rem; font-size:0.82rem; font-weight:700;">▶ Play Soundscape</button>
                </div>
            </div>
        `;

        const canvas = container.querySelector('.soundscape-visualizer');
        const vCtx = canvas.getContext('2d');
        const masterBtn = container.querySelector('#soundscapeMasterBtn');

        function resizeVis() {
            canvas.width = canvas.clientWidth || 300;
            canvas.height = canvas.clientHeight || 44;
        }
        resizeVis();

        function startAudio() {
            sound.init();
            const actx = sound.ctx;

            // 1. Cyber Rain
            const bufferSize = actx.sampleRate * 2;
            const noiseBuffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = actx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const filter = actx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 850;

            const rainGain = actx.createGain();
            rainGain.gain.value = tracks[0].volume * 0.22;

            whiteNoise.connect(filter);
            filter.connect(rainGain);
            rainGain.connect(sound.masterGain);
            whiteNoise.start();

            tracks[0].node = whiteNoise;
            tracks[0].gain = rainGain;

            // 2. Deep Space Pad
            const droneOsc = actx.createOscillator();
            droneOsc.type = 'triangle';
            droneOsc.frequency.value = 55;
            const droneGain = actx.createGain();
            droneGain.gain.value = tracks[1].volume * 0.2;
            droneOsc.connect(droneGain);
            droneGain.connect(sound.masterGain);
            droneOsc.start();

            tracks[1].node = droneOsc;
            tracks[1].gain = droneGain;

            // 3. Cosmic Alpha
            const alphaOsc = actx.createOscillator();
            alphaOsc.type = 'sine';
            alphaOsc.frequency.value = 216;
            const alphaGain = actx.createGain();
            alphaGain.gain.value = tracks[2].volume * 0.16;
            alphaOsc.connect(alphaGain);
            alphaGain.connect(sound.masterGain);
            alphaOsc.start();

            tracks[2].node = alphaOsc;
            tracks[2].gain = alphaGain;

            // 4. Crystal Bells
            const bellOsc = actx.createOscillator();
            bellOsc.type = 'sine';
            bellOsc.frequency.value = 528;
            const bellGain = actx.createGain();
            bellGain.gain.value = tracks[3].volume * 0.07;
            bellOsc.connect(bellGain);
            bellGain.connect(sound.masterGain);
            bellOsc.start();

            tracks[3].node = bellOsc;
            tracks[3].gain = bellGain;

            isPlaying = true;
            masterBtn.textContent = '⏸ Pause Soundscape';
            masterBtn.style.background = 'var(--accent-color)';
        }

        function stopAudio() {
            tracks.forEach(t => {
                if (t.node) {
                    try { t.node.stop(); } catch(e) {}
                    t.node = null;
                    t.gain = null;
                }
            });
            isPlaying = false;
            masterBtn.textContent = '▶ Play Soundscape';
            masterBtn.style.background = '';
        }

        masterBtn.addEventListener('click', () => {
            if (isPlaying) stopAudio();
            else startAudio();
        });

        // Sliders
        container.querySelectorAll('.soundscape-slider').forEach(slider => {
            slider.addEventListener('input', () => {
                const id = slider.dataset.id;
                const val = parseFloat(slider.value);
                const track = tracks.find(t => t.id === id);
                if (track) {
                    track.volume = val;
                    const label = container.querySelector(`#vol-${id}`);
                    if (label) label.textContent = `${Math.round(val * 100)}%`;
                    if (track.gain) {
                        track.gain.gain.value = val * (id === 'chimes' ? 0.07 : 0.2);
                    }
                }
            });
        });

        // Presets
        const rainBtn = container.querySelector('#presetRain');
        const spaceBtn = container.querySelector('#presetSpace');

        rainBtn.addEventListener('click', () => {
            setPreset({ rain: 0.9, drone: 0.2, alpha: 0.1, chimes: 0.0 });
        });

        spaceBtn.addEventListener('click', () => {
            setPreset({ rain: 0.1, drone: 0.8, alpha: 0.6, chimes: 0.4 });
        });

        function setPreset(vals) {
            tracks.forEach(t => {
                if (vals[t.id] !== undefined) {
                    t.volume = vals[t.id];
                    const s = container.querySelector(`.soundscape-slider[data-id="${t.id}"]`);
                    if (s) s.value = t.volume;
                    const l = container.querySelector(`#vol-${t.id}`);
                    if (l) l.textContent = `${Math.round(t.volume * 100)}%`;
                    if (t.gain) t.gain.gain.value = t.volume * (t.id === 'chimes' ? 0.07 : 0.2);
                }
            });
        }

        let visStep = 0;
        let isMounted = false;
        function drawVis() {
            if (!container.isConnected) {
                if (!isMounted) {
                    requestAnimationFrame(drawVis);
                    return;
                }
                return;
            }
            isMounted = true;

            const rect = canvas.getBoundingClientRect();
            const w = Math.round(rect.width) || 300;
            const h = Math.round(rect.height) || 44;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }

            vCtx.fillStyle = '#06070a';
            vCtx.fillRect(0, 0, canvas.width, canvas.height);

            const bars = 30;
            const barW = (canvas.width - bars * 2) / bars;
            for (let i = 0; i < bars; i++) {
                let h = 3;
                if (isPlaying) {
                    const trackWeight = tracks.reduce((a, b) => a + b.volume, 0) / 4;
                    h = Math.max(3, (Math.sin(visStep * 0.06 + i * 0.35) * 0.5 + 0.5) * (canvas.height - 8) * trackWeight + 4);
                }
                const x = i * (barW + 2) + 2;
                const y = canvas.height - h;

                const grad = vCtx.createLinearGradient(0, canvas.height, 0, 0);
                grad.addColorStop(0, '#8b5cf6');
                grad.addColorStop(1, '#ec4899');
                vCtx.fillStyle = isPlaying ? grad : 'rgba(255, 255, 255, 0.1)';
                vCtx.fillRect(x, y, barW, h);
            }

            if (isPlaying) visStep++;
            requestAnimationFrame(drawVis);
        }
        drawVis();
    }

    // Helper: Escape HTML
    function escapeHtml(str) {
        return (str || '').replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    // ==========================================================================
    // 7. DASHBOARD RENDERER & WORKSPACE LOGIC
    // ==========================================================================
    const workspaceTabsContainer = document.getElementById('workspaceTabs');
    const widgetGrid = document.getElementById('widgetGrid');
    const newTabBtn = document.getElementById('newTabBtn');

    function renderWorkspaceTabs() {
        if (!workspaceTabsContainer) return;
        workspaceTabsContainer.innerHTML = '';

        workspaces.forEach(ws => {
            const tab = document.createElement('div');
            tab.className = `workspace-tab ${ws.id === activeWorkspaceId ? 'active' : ''}`;
            tab.innerHTML = `
                <span>${escapeHtml(ws.name)}</span>
                ${workspaces.length > 1 && ws.id === activeWorkspaceId ? `<span class="tab-close" title="Delete Workspace">✕</span>` : ''}
            `;

            tab.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-close')) {
                    e.stopPropagation();
                    if (confirm(`Delete workspace "${ws.name}"?`)) {
                        workspaces = workspaces.filter(w => w.id !== ws.id);
                        activeWorkspaceId = workspaces[0].id;
                        saveWorkspaces();
                        renderWorkspaceTabs();
                        renderWidgets();
                    }
                    return;
                }
                activeWorkspaceId = ws.id;
                saveWorkspaces();
                renderWorkspaceTabs();
                renderWidgets();
            });

            workspaceTabsContainer.appendChild(tab);
        });
    }

    let draggedWidgetId = null;
    let draggedCard = null;

    function renderWidgets() {
        if (!widgetGrid) return;
        widgetGrid.innerHTML = '';
        const currentWs = getActiveWorkspace();

        if (!currentWs || !currentWs.widgets || currentWs.widgets.length === 0) {
            widgetGrid.innerHTML = `
                <div style="flex: 1 1 100%; text-align:center; padding: 4rem 1rem; color:var(--text-secondary);">
                    <div style="font-size:3rem; margin-bottom:1rem;">🧩</div>
                    <h2>No Gadgets in this Workspace</h2>
                    <p style="margin-top:0.5rem;">Click the "+ Add Gadget" button above to customize your command center.</p>
                </div>
            `;
            return;
        }

        currentWs.widgets.forEach(w => {
            const def = WIDGET_REGISTRY[w.type];
            if (!def) return;

            const card = document.createElement('div');
            card.className = 'widget-card';
            card.id = `widget-${w.id}`;
            card.dataset.id = w.id;
            card.setAttribute('draggable', 'false');

            // Set initial freeform width (custom or default 380px)
            if (w.width) {
                card.style.width = `${w.width}px`;
            } else if (w.span && w.span >= 2) {
                card.style.width = `${Math.min(780, (widgetGrid.clientWidth || 800) - 24)}px`;
            } else {
                card.style.width = '380px';
            }

            // Set initial freeform height (if customized)
            if (w.height) {
                card.style.height = `${w.height}px`;
            }

            card.innerHTML = `
                <div class="widget-header">
                    <div class="widget-title">
                        <span class="drag-handle" title="Drag to move">⋮⋮</span>
                        <span class="widget-icon">${def.icon}</span>
                        <span>${def.name}</span>
                    </div>
                    <div class="widget-actions">
                        <button class="widget-btn btn-reset-size" title="Reset to Default Size">↺</button>
                        <button class="widget-btn btn-maximize" title="Maximize / Restore">⛶</button>
                        <button class="widget-btn btn-remove" title="Remove Widget">✕</button>
                    </div>
                </div>
                <div class="widget-body"></div>
                <!-- Interactive Freeform Reshape Handles -->
                <div class="widget-edge-bottom" title="Drag bottom edge to reshape height"></div>
                <div class="widget-edge-right" title="Drag right edge to reshape width"></div>
                <div class="widget-resize-badge"></div>
                <div class="widget-resize-handle" title="Drag corner to freely reshape width & height">
                    <svg width="12" height="12" viewBox="0 0 10 10">
                        <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    </svg>
                </div>
            `;

            const body = card.querySelector('.widget-body');

            // Close button
            card.querySelector('.btn-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                currentWs.widgets = currentWs.widgets.filter(item => item.id !== w.id);
                saveWorkspaces();
                renderWidgets();
            });

            // Maximize button
            card.querySelector('.btn-maximize').addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.toggle('maximized');
                window.dispatchEvent(new Event('resize'));
            });

            // Reset Size button
            card.querySelector('.btn-reset-size').addEventListener('click', (e) => {
                e.stopPropagation();
                delete w.width;
                delete w.height;
                card.style.width = '380px';
                card.style.height = '';
                saveWorkspaces();
                window.dispatchEvent(new Event('resize'));
            });

            // Multi-Handle Freeform Continuous Reshaping (Corner, Bottom Edge, Right Edge)
            const resizeHandle = card.querySelector('.widget-resize-handle');
            const edgeBottom = card.querySelector('.widget-edge-bottom');
            const edgeRight = card.querySelector('.widget-edge-right');
            const badge = card.querySelector('.widget-resize-badge');

            function startReshape(e, mode) {
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                card.setAttribute('draggable', 'false');
                card.classList.add('resizing');
                document.body.classList.add('resizing-active');
                document.body.style.userSelect = 'none';

                if (mode === 'corner') document.body.style.cursor = 'nwse-resize';
                else if (mode === 'bottom') document.body.style.cursor = 'ns-resize';
                else if (mode === 'right') document.body.style.cursor = 'ew-resize';

                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = card.offsetWidth;
                const startHeight = card.offsetHeight;
                const gridW = widgetGrid.clientWidth || window.innerWidth;
                const maxAllowedWidth = Math.max(260, gridW - 24);

                let currentW = startWidth;
                let currentH = startHeight;

                function onMouseMove(ev) {
                    if (ev.cancelable) ev.preventDefault();
                    const clientX = ev.clientX !== undefined ? ev.clientX : (ev.touches && ev.touches[0] ? ev.touches[0].clientX : startX);
                    const clientY = ev.clientY !== undefined ? ev.clientY : (ev.touches && ev.touches[0] ? ev.touches[0].clientY : startY);

                    const dx = clientX - startX;
                    const dy = clientY - startY;

                    // Real-time continuous height reshape pixel-by-pixel
                    if (mode === 'corner' || mode === 'bottom') {
                        currentH = Math.max(140, Math.min(2400, startHeight + dy));
                        card.style.height = `${currentH}px`;
                    }

                    // Real-time continuous width reshape pixel-by-pixel
                    if (mode === 'corner' || mode === 'right') {
                        currentW = Math.max(220, Math.min(maxAllowedWidth, startWidth + dx));
                        card.style.width = `${currentW}px`;
                    }

                    // Real-time dimension badge
                    if (badge) {
                        const displayW = (mode === 'bottom') ? Math.round(card.offsetWidth) : Math.round(currentW);
                        const displayH = (mode === 'right') ? Math.round(card.offsetHeight) : Math.round(currentH);
                        badge.textContent = `${displayW} × ${displayH} px`;
                    }

                    // Instant redraw for canvas/globe
                    window.dispatchEvent(new Event('resize'));
                }

                function onMouseUp() {
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                    window.removeEventListener('touchmove', onMouseMove);
                    window.removeEventListener('touchend', onMouseUp);
                    window.removeEventListener('touchcancel', onMouseUp);

                    card.classList.remove('resizing');
                    document.body.classList.remove('resizing-active');
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';

                    // Permanently save the exact pixel dimensions (never snaps to any presets!)
                    if (mode === 'corner' || mode === 'right') {
                        w.width = Math.round(currentW);
                    }
                    if (mode === 'corner' || mode === 'bottom') {
                        w.height = Math.round(currentH);
                    }
                    saveWorkspaces();
                    window.dispatchEvent(new Event('resize'));
                }

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
                window.addEventListener('touchmove', onMouseMove, { passive: false });
                window.addEventListener('touchend', onMouseUp);
                window.addEventListener('touchcancel', onMouseUp);
            }

            resizeHandle.addEventListener('mousedown', (e) => startReshape(e, 'corner'));
            edgeBottom.addEventListener('mousedown', (e) => startReshape(e, 'bottom'));
            edgeRight.addEventListener('mousedown', (e) => startReshape(e, 'right'));

            resizeHandle.addEventListener('touchstart', (e) => { if (e.touches && e.touches.length > 0) startReshape(e.touches[0], 'corner'); }, { passive: false });
            edgeBottom.addEventListener('touchstart', (e) => { if (e.touches && e.touches.length > 0) startReshape(e.touches[0], 'bottom'); }, { passive: false });
            edgeRight.addEventListener('touchstart', (e) => { if (e.touches && e.touches.length > 0) startReshape(e.touches[0], 'right'); }, { passive: false });

            // Double click resize handles to auto-reset to default size
            [resizeHandle, edgeBottom, edgeRight].forEach(el => {
                el.addEventListener('dblclick', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    delete w.width;
                    delete w.height;
                    card.style.width = '380px';
                    card.style.height = '';
                    saveWorkspaces();
                    window.dispatchEvent(new Event('resize'));
                });
            });

            // Drag & Drop Reordering (Only when grabbing header / drag-handle)
            const header = card.querySelector('.widget-header');
            header.addEventListener('mousedown', (e) => {
                // If user clicks a button or size control, do NOT trigger drag
                if (e.target.closest('.widget-actions') || e.target.closest('button')) {
                    return;
                }
                card.setAttribute('draggable', 'true');
            });

            header.addEventListener('mouseup', () => {
                if (!card.classList.contains('dragging')) {
                    card.setAttribute('draggable', 'false');
                }
            });

            card.addEventListener('dragstart', (e) => {
                if (card.getAttribute('draggable') !== 'true') {
                    e.preventDefault();
                    return;
                }
                draggedCard = card;
                draggedWidgetId = w.id;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', w.id);
                if (e.dataTransfer.setDragImage) {
                    e.dataTransfer.setDragImage(card, 24, 20);
                }
            });

            card.addEventListener('dragend', () => {
                card.setAttribute('draggable', 'false');
                card.classList.remove('dragging');
                document.querySelectorAll('.widget-card').forEach(c => c.classList.remove('drag-over-before', 'drag-over-after'));
                draggedCard = null;
                draggedWidgetId = null;
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (!draggedCard || draggedCard === card) return;

                const rect = card.getBoundingClientRect();
                const isBefore = e.clientX < (rect.left + rect.width / 2);
                if (isBefore) {
                    card.classList.add('drag-over-before');
                    card.classList.remove('drag-over-after');
                } else {
                    card.classList.add('drag-over-after');
                    card.classList.remove('drag-over-before');
                }
            });

            card.addEventListener('dragleave', (e) => {
                // Only clear drop indicator if cursor actually left the card
                if (!card.contains(e.relatedTarget)) {
                    card.classList.remove('drag-over-before', 'drag-over-after');
                }
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over-before', 'drag-over-after');
                if (!draggedWidgetId || draggedWidgetId === w.id) return;

                const rect = card.getBoundingClientRect();
                const isBefore = e.clientX < (rect.left + rect.width / 2);

                const fromIdx = currentWs.widgets.findIndex(x => x.id === draggedWidgetId);
                if (fromIdx < 0) return;
                const [moved] = currentWs.widgets.splice(fromIdx, 1);

                let toIdx = currentWs.widgets.findIndex(x => x.id === w.id);
                if (!isBefore) toIdx++;
                currentWs.widgets.splice(toIdx, 0, moved);

                saveWorkspaces();
                renderWidgets();
                sound.playChime('enter');
            });

            // Mount widget card to DOM first so container.isConnected is true during render
            widgetGrid.appendChild(card);
            def.render(w, body);
        });
    }

    if (newTabBtn) {
        newTabBtn.addEventListener('click', () => {
            const name = prompt("Enter a name for the new workspace:");
            if (name && name.trim()) {
                const newWs = {
                    id: `ws-${Date.now()}`,
                    name: name.trim(),
                    widgets: [
                        { id: `notes-${Date.now()}`, type: 'NOTES' },
                        { id: `todo-${Date.now()}`, type: 'TODO' }
                    ]
                };
                workspaces.push(newWs);
                activeWorkspaceId = newWs.id;
                saveWorkspaces();
                renderWorkspaceTabs();
                renderWidgets();
            }
        });
    }

    // ==========================================================================
    // 8. ADD WIDGET DIRECTORY MODAL
    // ==========================================================================
    const addWidgetModal = document.getElementById('addWidgetModal');
    const openAddWidgetBtn = document.getElementById('openAddWidgetBtn');
    const closeAddWidgetBtn = document.getElementById('closeAddWidgetBtn');
    const widgetDirectoryGrid = document.getElementById('widgetDirectoryGrid');
    const widgetSearchInput = document.getElementById('widgetSearchInput');

    function renderWidgetDirectory(filter = '') {
        if (!widgetDirectoryGrid) return;
        widgetDirectoryGrid.innerHTML = '';

        const keys = Object.keys(WIDGET_REGISTRY);
        keys.forEach(key => {
            const w = WIDGET_REGISTRY[key];
            if (filter && !w.name.toLowerCase().includes(filter.toLowerCase()) && !w.desc.toLowerCase().includes(filter.toLowerCase())) {
                return;
            }

            const card = document.createElement('div');
            card.className = 'widget-dir-card';
            card.innerHTML = `
                <div class="widget-dir-icon">${w.icon}</div>
                <div class="widget-dir-name">${w.name}</div>
                <div class="widget-dir-desc">${w.desc}</div>
            `;

            card.addEventListener('click', () => {
                const currentWs = getActiveWorkspace();
                currentWs.widgets.push({
                    id: `${key.toLowerCase()}-${Date.now()}`,
                    type: key,
                    span: w.span || 1
                });
                saveWorkspaces();
                renderWidgets();
                addWidgetModal.classList.remove('show');
            });

            widgetDirectoryGrid.appendChild(card);
        });
    }

    if (openAddWidgetBtn) {
        openAddWidgetBtn.addEventListener('click', () => {
            renderWidgetDirectory();
            if (addWidgetModal) addWidgetModal.classList.add('show');
        });
    }

    if (closeAddWidgetBtn) {
        closeAddWidgetBtn.addEventListener('click', () => {
            if (addWidgetModal) addWidgetModal.classList.remove('show');
        });
    }

    if (addWidgetModal) {
        addWidgetModal.addEventListener('click', (e) => {
            if (e.target === addWidgetModal) {
                addWidgetModal.classList.remove('show');
            }
        });
    }

    if (widgetSearchInput) {
        widgetSearchInput.addEventListener('input', (e) => {
            renderWidgetDirectory(e.target.value);
        });
    }

    // ==========================================================================
    // 9. HEADER CONTROLS (Zen Mode, Sound, Dropdowns)
    // ==========================================================================
    const zenModeBtn = document.getElementById('zenModeBtn');
    const zenSoundBtn = document.getElementById('zenSoundBtn');
    const soundSelect = document.getElementById('soundSelect');
    const volumeSlider = document.getElementById('volumeSlider');

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeDropdown = document.getElementById('themeDropdown');
    const linksToggleBtn = document.getElementById('linksToggleBtn');
    const linksDropdown = document.getElementById('linksDropdown');

    // Zen Mode
    if (zenModeBtn) {
        zenModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('zen-mode');
            zenModeBtn.style.color = document.body.classList.contains('zen-mode') ? 'var(--accent-hover)' : '';
        });
    }

    // Audio bar controls
    if (zenSoundBtn) {
        zenSoundBtn.addEventListener('click', () => {
            const selected = soundSelect ? soundSelect.value : 'rain';
            const playing = sound.toggleAmbient(selected);
            zenSoundBtn.innerHTML = playing ? 
                `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>` : 
                `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
        });
    }

    if (soundSelect) {
        soundSelect.addEventListener('change', () => {
            if (sound.isPlaying) {
                sound.startAmbient(soundSelect.value);
            }
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            sound.setVolume(parseFloat(e.target.value));
        });
    }

    // Theme Palette dropdown
    if (themeToggleBtn && themeDropdown) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('show');
            if (linksDropdown) linksDropdown.classList.remove('show');
        });

        const paletteGrid = themeDropdown.querySelector('.theme-palette-grid');
        if (paletteGrid) {
            paletteGrid.innerHTML = '';
            THEMES.forEach(t => {
                const swatch = document.createElement('div');
                swatch.className = 'theme-swatch';
                swatch.style.background = t.color;
                swatch.title = t.name;
                swatch.addEventListener('click', () => {
                    applyTheme(t.color);
                    themeDropdown.classList.remove('show');
                });
                paletteGrid.appendChild(swatch);
            });
        }
    }

    // Quick Links dropdown
    if (linksToggleBtn && linksDropdown) {
        linksToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            linksDropdown.classList.toggle('show');
            if (themeDropdown) themeDropdown.classList.remove('show');
        });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        if (themeDropdown) themeDropdown.classList.remove('show');
        if (linksDropdown) linksDropdown.classList.remove('show');
    });

    // Update Focus Stats Header
    function updateStatsHeader() {
        const statsEl = document.getElementById('todayFocusSessions');
        if (statsEl) {
            const count = localStorage.getItem('focus_sessions_today') || '0';
            statsEl.textContent = count;
        }
    }
    updateStatsHeader();

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
    renderWorkspaceTabs();
    renderWidgets();

})();
