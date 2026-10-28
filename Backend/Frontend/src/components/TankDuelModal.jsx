import React, { useState, useEffect, useRef, useCallback } from 'react';
import useGameStore from '../zustand/useGameStore';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/Authprovider';
import PixelAvatar from './PixelAvatar';
import { RiRobot3Fill } from "react-icons/ri";
import toast from 'react-hot-toast';
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

import {
    FiX,
    FiRefreshCw,
    FiCpu,
    FiShield,
    FiZap,
    FiHeart,
    FiVolume2,
    FiVolumeX
} from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';

// ── Retro 8-bit Sound Synthesizer via Web Audio API ──────────────────────────
class SoundEffects {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playShoot() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    playHit() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    playExplosion() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
    }

    playPowerUp() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            const time = this.ctx.currentTime + i * 0.06;
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.18, time);
            gain.gain.linearRampToValueAtTime(0.01, time + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.06);
        });
    }

    playWin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const notes = [330, 392, 659, 523, 587, 784];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            const time = this.ctx.currentTime + i * 0.1;
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.25, time);
            gain.gain.linearRampToValueAtTime(0.01, time + 0.09);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.1);
        });
    }
}

const sfx = new SoundEffects();

// ── Battlefield Grid Definition (15 cols x 11 rows) ─────────────────────────
const COLS = 15;
const ROWS = 11;
const CELL_SIZE = 36; // 540px width x 396px height
const MAP_TEMPLATE = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 1, 0, 0, 1, 2, 1, 0, 0, 1, 0, 0, 2],
    [2, 0, 2, 1, 0, 2, 0, 1, 0, 2, 0, 1, 2, 0, 2],
    [2, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 2],
    [2, 0, 0, 1, 0, 0, 1, 2, 1, 0, 0, 1, 0, 0, 2],
    [2, 1, 2, 0, 1, 2, 0, 0, 0, 2, 1, 0, 2, 1, 2],
    [2, 0, 0, 1, 0, 0, 1, 2, 1, 0, 0, 1, 0, 0, 2],
    [2, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 2],
    [2, 0, 2, 1, 0, 2, 0, 1, 0, 2, 0, 1, 2, 0, 2],
    [2, 0, 0, 1, 0, 0, 1, 2, 1, 0, 0, 1, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];

// Helper: initial map copy
const createInitialMap = () => MAP_TEMPLATE.map((row) => [...row]);

function TankDuelModal() {
    const { activeGame, gameMode, opponent, mySymbol, closeGame, startBotGame } = useGameStore();
    const { socket } = useSocketContext();
    const [authUser] = useAuth();

    const canvasRef = useRef(null);

    // Audio Mute state
    const [isMuted, setIsMuted] = useState(false);
    const toggleMute = () => {
        setIsMuted((prev) => {
            sfx.muted = !prev;
            return !prev;
        });
    };

    // Scoreboard
    const [scores, setScores] = useState({ player: 0, opponent: 0 });
    const [gameOverWinner, setGameOverWinner] = useState(null); // 'player' | 'opponent' | null

    // Determine player roles: challenger is Tank 1 (Blue), opponent is Tank 2 (Red)
    const isPlayer1 = mySymbol === 'X' || mySymbol === 'p1';

    // Game state refs (to run at 60 FPS in canvas loop without React re-render lag)
    const mapRef = useRef(createInitialMap());
    const tanksRef = useRef({
        p1: {
            x: 1 * CELL_SIZE + 6,
            y: 1 * CELL_SIZE + 6,
            w: 24,
            h: 24,
            dir: 'down',
            speed: 2.2,
            hp: 4,
            maxHp: 4,
            shieldTime: 0,
            rapidTime: 0,
            color: '#38bdf8',
            invulnerable: 0,
        },
        p2: {
            x: 13 * CELL_SIZE + 6,
            y: 9 * CELL_SIZE + 6,
            w: 24,
            h: 24,
            dir: 'up',
            speed: 2.2,
            hp: 4,
            maxHp: 4,
            shieldTime: 0,
            rapidTime: 0,
            color: '#f43f5e',
            invulnerable: 0,
        },
    });

    const bulletsRef = useRef([]);
    const particlesRef = useRef([]);
    const powerupsRef = useRef([]);
    const keysRef = useRef({});
    const lastShootTimeRef = useRef(0);
    const botTimerRef = useRef(0);

    // Reset round
    const handleResetRound = useCallback((notify = true) => {
        mapRef.current = createInitialMap();
        tanksRef.current = {
            p1: {
                x: 1 * CELL_SIZE + 6,
                y: 1 * CELL_SIZE + 6,
                w: 24,
                h: 24,
                dir: 'down',
                speed: 2.2,
                hp: 4,
                maxHp: 4,
                shieldTime: 0,
                rapidTime: 0,
                color: '#38bdf8',
                invulnerable: 60,
            },
            p2: {
                x: 13 * CELL_SIZE + 6,
                y: 9 * CELL_SIZE + 6,
                w: 24,
                h: 24,
                dir: 'up',
                speed: 2.2,
                hp: 4,
                maxHp: 4,
                shieldTime: 0,
                rapidTime: 0,
                color: '#f43f5e',
                invulnerable: 60,
            },
        };
        bulletsRef.current = [];
        particlesRef.current = [];
        powerupsRef.current = [
            { x: 7 * CELL_SIZE + 10, y: 5 * CELL_SIZE + 10, type: 'shield', pulse: 0 },
            { x: 3 * CELL_SIZE + 10, y: 5 * CELL_SIZE + 10, type: 'speed', pulse: 0 },
            { x: 11 * CELL_SIZE + 10, y: 5 * CELL_SIZE + 10, type: 'rapid', pulse: 0 },
        ];
        setGameOverWinner(null);

        if (notify && gameMode === 'online' && socket && opponent?._id) {
            socket.emit("restartGame", { to: opponent._id, gameType: 'tankduel' });
        }
    }, [gameMode, socket, opponent]);

    // Keyboard handlers
    useEffect(() => {
        if (activeGame !== 'tankduel') return;

        const handleKeyDown = (e) => {
            keysRef.current[e.key.toLowerCase()] = true;
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };

        const handleKeyUp = (e) => {
            keysRef.current[e.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [activeGame]);

    // Touch controls helper
    const handleTouchControl = (key, isDown) => {
        keysRef.current[key] = isDown;
    };

    // Socket listeners for online tank synchronization
    useEffect(() => {
        if (!socket || gameMode !== 'online' || activeGame !== 'tankduel') return;

        const onGameMove = (payload) => {
            if (payload?.gameType !== 'tankduel') return;

            // Opponent tank position / state update
            if (payload.action === 'sync') {
                const targetKey = isPlayer1 ? 'p2' : 'p1';
                if (payload.tankState) {
                    Object.assign(tanksRef.current[targetKey], payload.tankState);
                }
            }

            // Opponent shoot
            if (payload.action === 'shoot') {
                bulletsRef.current.push(payload.bullet);
                sfx.playShoot();
            }

            // Wall destroyed
            if (payload.action === 'destroyWall') {
                const { r, c } = payload;
                if (mapRef.current[r] && mapRef.current[r][c] === 1) {
                    mapRef.current[r][c] = 0;
                    sfx.playHit();
                }
            }
        };

        const onGameRestart = (payload) => {
            if (!payload?.gameType || payload.gameType === 'tankduel') {
                handleResetRound(false);
                toast("Battle restarted by opponent!", { icon: "🔄" });
            }
        };

        const onGameEnded = () => {
            toast("Opponent left the duel", { icon: "👋" });
            startBotGame('tankduel', { fullname: "NexBot AI" });
        };

        socket.on("gameMoveReceived", onGameMove);
        socket.on("gameRestarted", onGameRestart);
        socket.on("gameEnded", onGameEnded);

        return () => {
            socket.off("gameMoveReceived", onGameMove);
            socket.off("gameRestarted", onGameRestart);
            socket.off("gameEnded", onGameEnded);
        };
    }, [socket, gameMode, activeGame, isPlayer1, handleResetRound, startBotGame]);

    // Collision check: Tank vs Map Walls
    const checkWallCollision = (x, y, w, h) => {
        const left = Math.floor(x / CELL_SIZE);
        const right = Math.floor((x + w - 1) / CELL_SIZE);
        const top = Math.floor(y / CELL_SIZE);
        const bottom = Math.floor((y + h - 1) / CELL_SIZE);

        for (let r = top; r <= bottom; r++) {
            for (let c = left; c <= right; c++) {
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                    if (mapRef.current[r][c] === 1 || mapRef.current[r][c] === 2) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    // Shoot projectile
    const shootBullet = useCallback((tankKey) => {
        const tank = tanksRef.current[tankKey];
        if (!tank || tank.hp <= 0) return;

        const speed = tank.rapidTime > 0 ? 7 : 5;
        let bx = tank.x + tank.w / 2;
        let by = tank.y + tank.h / 2;
        let bdx = 0;
        let bdy = 0;

        if (tank.dir === 'up') { bdy = -speed; by -= 14; }
        if (tank.dir === 'down') { bdy = speed; by += 14; }
        if (tank.dir === 'left') { bdx = -speed; bx -= 14; }
        if (tank.dir === 'right') { bdx = speed; bx += 14; }

        const bullet = {
            x: bx,
            y: by,
            dx: bdx,
            dy: bdy,
            owner: tankKey,
            color: tank.color,
            radius: 3.5,
        };

        bulletsRef.current.push(bullet);
        sfx.playShoot();

        // If local player in online mode, broadcast shoot
        if (gameMode === 'online' && socket && opponent?._id) {
            socket.emit("makeGameMove", {
                to: opponent._id,
                gameType: 'tankduel',
                action: 'shoot',
                bullet,
            });
        }
    }, [gameMode, socket, opponent]);

    // ── 60 FPS Canvas Game Loop ──────────────────────────────────────────────
    useEffect(() => {
        if (activeGame !== 'tankduel') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationFrameId;
        let syncTick = 0;

        const myTankKey = isPlayer1 ? 'p1' : 'p2';
        const otherTankKey = isPlayer1 ? 'p2' : 'p1';

        const gameLoop = () => {
            const tanks = tanksRef.current;
            const myTank = tanks[myTankKey];
            const otherTank = tanks[otherTankKey];

            // 1. Process Local Player Controls
            if (myTank.hp > 0 && !gameOverWinner) {
                const keys = keysRef.current;
                let moveX = 0;
                let moveY = 0;
                let newDir = myTank.dir;
                const spd = myTank.speed;

                if (keys['w'] || keys['arrowup']) { moveY -= spd; newDir = 'up'; }
                else if (keys['s'] || keys['arrowdown']) { moveY += spd; newDir = 'down'; }
                else if (keys['a'] || keys['arrowleft']) { moveX -= spd; newDir = 'left'; }
                else if (keys['d'] || keys['arrowright']) { moveX += spd; newDir = 'right'; }

                if (moveX !== 0 || moveY !== 0) {
                    myTank.dir = newDir;
                    const nextX = myTank.x + moveX;
                    const nextY = myTank.y + moveY;

                    // Check bounds & wall collision
                    if (!checkWallCollision(nextX, myTank.y, myTank.w, myTank.h)) {
                        myTank.x = nextX;
                    }
                    if (!checkWallCollision(myTank.x, nextY, myTank.w, myTank.h)) {
                        myTank.y = nextY;
                    }
                }

                // Shoot action (space or j)
                if (keys[' '] || keys['j'] || keys['enter']) {
                    const now = Date.now();
                    const coolDown = myTank.rapidTime > 0 ? 180 : 380;
                    if (now - lastShootTimeRef.current > coolDown) {
                        lastShootTimeRef.current = now;
                        shootBullet(myTankKey);
                    }
                }

                // Decrement powerup timers
                if (myTank.shieldTime > 0) myTank.shieldTime--;
                if (myTank.rapidTime > 0) myTank.rapidTime--;
                if (myTank.invulnerable > 0) myTank.invulnerable--;
            }

            // 2. Process Bot AI (Single Player mode)
            if (gameMode === 'bot' && otherTank.hp > 0 && !gameOverWinner) {
                botTimerRef.current++;
                if (botTimerRef.current % 18 === 0) {
                    // Decide direction towards player or powerup
                    const dx = myTank.x - otherTank.x;
                    const dy = myTank.y - otherTank.y;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        otherTank.dir = dx > 0 ? 'right' : 'left';
                    } else {
                        otherTank.dir = dy > 0 ? 'down' : 'up';
                    }

                    // Shoot if roughly aligned
                    if (Math.abs(dx) < 28 || Math.abs(dy) < 28) {
                        shootBullet(otherTankKey);
                    }
                }

                // Bot movement
                let bmx = 0;
                let bmy = 0;
                const bspd = otherTank.speed * 0.75;
                if (otherTank.dir === 'up') bmy -= bspd;
                if (otherTank.dir === 'down') bmy += bspd;
                if (otherTank.dir === 'left') bmx -= bspd;
                if (otherTank.dir === 'right') bmx += bspd;

                if (!checkWallCollision(otherTank.x + bmx, otherTank.y + bmy, otherTank.w, otherTank.h)) {
                    otherTank.x += bmx;
                    otherTank.y += bmy;
                } else {
                    // Turn randomly on obstacle
                    const dirs = ['up', 'down', 'left', 'right'];
                    otherTank.dir = dirs[Math.floor(Math.random() * dirs.length)];
                }

                if (otherTank.shieldTime > 0) otherTank.shieldTime--;
                if (otherTank.rapidTime > 0) otherTank.rapidTime--;
                if (otherTank.invulnerable > 0) otherTank.invulnerable--;
            }

            // 3. Online Position Sync (sent at 15 FPS)
            syncTick++;
            if (gameMode === 'online' && syncTick % 4 === 0 && socket && opponent?._id) {
                socket.emit("makeGameMove", {
                    to: opponent._id,
                    gameType: 'tankduel',
                    action: 'sync',
                    tankState: {
                        x: myTank.x,
                        y: myTank.y,
                        dir: myTank.dir,
                        hp: myTank.hp,
                        shieldTime: myTank.shieldTime,
                        rapidTime: myTank.rapidTime,
                    },
                });
            }

            // 4. Update Bullets & Collisions
            const currentBullets = bulletsRef.current;
            for (let i = currentBullets.length - 1; i >= 0; i--) {
                const b = currentBullets[i];
                b.x += b.dx;
                b.y += b.dy;

                let bulletRemoved = false;

                // Canvas boundaries
                if (b.x < 0 || b.x > COLS * CELL_SIZE || b.y < 0 || b.y > ROWS * CELL_SIZE) {
                    currentBullets.splice(i, 1);
                    continue;
                }

                // Wall collisions
                const cr = Math.floor(b.y / CELL_SIZE);
                const cc = Math.floor(b.x / CELL_SIZE);
                if (cr >= 0 && cr < ROWS && cc >= 0 && cc < COLS) {
                    const cell = mapRef.current[cr][cc];
                    if (cell === 2) {
                        // Steel wall: bullet sparks and vanishes
                        currentBullets.splice(i, 1);
                        sfx.playHit();
                        for (let p = 0; p < 4; p++) {
                            particlesRef.current.push({
                                x: b.x, y: b.y,
                                vx: (Math.random() - 0.5) * 4,
                                vy: (Math.random() - 0.5) * 4,
                                color: '#94a3b8',
                                life: 12,
                            });
                        }
                        continue;
                    }
                    if (cell === 1) {
                        // Brick wall: destroy brick!
                        mapRef.current[cr][cc] = 0;
                        currentBullets.splice(i, 1);
                        sfx.playExplosion();

                        // Brick debris particles
                        for (let p = 0; p < 8; p++) {
                            particlesRef.current.push({
                                x: cc * CELL_SIZE + CELL_SIZE / 2,
                                y: cr * CELL_SIZE + CELL_SIZE / 2,
                                vx: (Math.random() - 0.5) * 6,
                                vy: (Math.random() - 0.5) * 6,
                                color: '#d97706',
                                life: 18,
                            });
                        }

                        // Chance to drop powerup from brick
                        if (Math.random() < 0.28) {
                            const types = ['shield', 'speed', 'rapid', 'heal'];
                            powerupsRef.current.push({
                                x: cc * CELL_SIZE + 10,
                                y: cr * CELL_SIZE + 10,
                                type: types[Math.floor(Math.random() * types.length)],
                                pulse: 0,
                            });
                        }

                        if (gameMode === 'online' && socket && opponent?._id) {
                            socket.emit("makeGameMove", {
                                to: opponent._id,
                                gameType: 'tankduel',
                                action: 'destroyWall',
                                r: cr,
                                c: cc,
                            });
                        }
                        continue;
                    }
                }

                // Tank hit detection
                ['p1', 'p2'].forEach((tKey) => {
                    if (bulletRemoved) return;
                    if (b.owner === tKey) return; // cannot shoot self

                    const t = tanks[tKey];
                    if (b.x >= t.x && b.x <= t.x + t.w && b.y >= t.y && b.y <= t.y + t.h) {
                        currentBullets.splice(i, 1);
                        bulletRemoved = true;

                        if (t.shieldTime > 0) {
                            // Deflected by shield
                            sfx.playHit();
                            for (let p = 0; p < 8; p++) {
                                particlesRef.current.push({
                                    x: b.x, y: b.y,
                                    vx: (Math.random() - 0.5) * 5,
                                    vy: (Math.random() - 0.5) * 5,
                                    color: '#38bdf8',
                                    life: 14,
                                });
                            }
                        } else if (t.invulnerable <= 0) {
                            t.hp = Math.max(0, t.hp - 1);
                            t.invulnerable = 25;
                            sfx.playExplosion();

                            // Explosion particles
                            for (let p = 0; p < 16; p++) {
                                particlesRef.current.push({
                                    x: t.x + t.w / 2,
                                    y: t.y + t.h / 2,
                                    vx: (Math.random() - 0.5) * 8,
                                    vy: (Math.random() - 0.5) * 8,
                                    color: p % 2 === 0 ? '#ef4444' : '#f59e0b',
                                    life: 25,
                                });
                            }

                            // Check Win/Loss
                            if (t.hp <= 0 && !gameOverWinner) {
                                const winnerKey = tKey === 'p1' ? 'p2' : 'p1';
                                const won = winnerKey === myTankKey;
                                setGameOverWinner(won ? 'player' : 'opponent');
                                if (won) {
                                    sfx.playWin();
                                    setScores((s) => ({ ...s, player: s.player + 1 }));
                                } else {
                                    setScores((s) => ({ ...s, opponent: s.opponent + 1 }));
                                }
                            }
                        }
                    }
                });
            }

            // 5. Update Power-ups & Collection
            const currentPowerups = powerupsRef.current;
            for (let i = currentPowerups.length - 1; i >= 0; i--) {
                const pu = currentPowerups[i];
                pu.pulse = (pu.pulse || 0) + 0.08;

                ['p1', 'p2'].forEach((tKey) => {
                    const t = tanks[tKey];
                    const dist = Math.hypot((t.x + t.w / 2) - (pu.x + 8), (t.y + t.h / 2) - (pu.y + 8));
                    if (dist < 18) {
                        currentPowerups.splice(i, 1);
                        sfx.playPowerUp();

                        if (pu.type === 'shield') t.shieldTime = 300; // 5 seconds
                        if (pu.type === 'rapid') t.rapidTime = 300;
                        if (pu.type === 'speed') t.speed = 3.2;
                        if (pu.type === 'heal') t.hp = Math.min(t.maxHp, t.hp + 1);

                        // Collect sparkles
                        for (let p = 0; p < 10; p++) {
                            particlesRef.current.push({
                                x: pu.x + 8, y: pu.y + 8,
                                vx: (Math.random() - 0.5) * 5,
                                vy: (Math.random() - 0.5) * 5,
                                color: '#a855f7',
                                life: 20,
                            });
                        }
                    }
                });
            }

            // 6. Update Particles
            const particles = particlesRef.current;
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                if (p.life <= 0) particles.splice(i, 1);
            }

            // ── DRAWING CANVAS (8-Bit Retro Rendering) ────────────────────────
            ctx.fillStyle = '#0f131d'; // ground
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid dots
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            for (let x = 0; x < canvas.width; x += 18) {
                for (let y = 0; y < canvas.height; y += 18) {
                    ctx.fillRect(x, y, 1.5, 1.5);
                }
            }

            // Draw Map Walls
            const map = mapRef.current;
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const val = map[r][c];
                    const wx = c * CELL_SIZE;
                    const wy = r * CELL_SIZE;

                    if (val === 2) {
                        // Steel Block
                        ctx.fillStyle = '#334155';
                        ctx.fillRect(wx, wy, CELL_SIZE, CELL_SIZE);
                        ctx.fillStyle = '#475569';
                        ctx.fillRect(wx + 3, wy + 3, CELL_SIZE - 6, CELL_SIZE - 6);
                        // Rivets
                        ctx.fillStyle = '#94a3b8';
                        ctx.fillRect(wx + 5, wy + 5, 2, 2);
                        ctx.fillRect(wx + CELL_SIZE - 7, wy + 5, 2, 2);
                        ctx.fillRect(wx + 5, wy + CELL_SIZE - 7, 2, 2);
                        ctx.fillRect(wx + CELL_SIZE - 7, wy + CELL_SIZE - 7, 2, 2);
                    } else if (val === 1) {
                        // Destructible Brick Block
                        ctx.fillStyle = '#9a3412';
                        ctx.fillRect(wx, wy, CELL_SIZE, CELL_SIZE);
                        ctx.fillStyle = '#c2410c';
                        ctx.fillRect(wx + 2, wy + 2, CELL_SIZE - 4, 14);
                        ctx.fillRect(wx + 2, wy + 18, CELL_SIZE - 4, 14);
                        // Brick mortar lines
                        ctx.fillStyle = '#7c2d12';
                        ctx.fillRect(wx, wy + 16, CELL_SIZE, 2);
                        ctx.fillRect(wx + CELL_SIZE / 2, wy, 2, 16);
                        ctx.fillRect(wx + 8, wy + 18, 2, 18);
                    }
                }
            }

            // Draw Power-ups
            powerupsRef.current.forEach((pu) => {
                const bounce = Math.sin(pu.pulse) * 3;
                ctx.save();
                ctx.translate(pu.x + 8, pu.y + 8 + bounce);

                // Halo glow
                ctx.fillStyle = pu.type === 'shield' ? 'rgba(56,189,248,0.3)' : pu.type === 'rapid' ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, 11, 0, Math.PI * 2);
                ctx.fill();

                // Icon drawing
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const emoji = pu.type === 'shield' ? '🛡️' : pu.type === 'rapid' ? '⚡' : pu.type === 'heal' ? '💖' : '👟';
                ctx.fillText(emoji, 0, 0);
                ctx.restore();
            });

            // Draw Tanks (8-Bit Pixel Tank Sprite)
            ['p1', 'p2'].forEach((tKey) => {
                const t = tanks[tKey];
                if (t.hp <= 0) return;

                ctx.save();
                ctx.translate(t.x + t.w / 2, t.y + t.h / 2);

                // Shield bubble effect
                if (t.shieldTime > 0) {
                    ctx.strokeStyle = '#38bdf8';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, 18, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Damage blink
                if (t.invulnerable > 0 && Math.floor(t.invulnerable / 4) % 2 === 0) {
                    ctx.globalAlpha = 0.4;
                }

                // Rotate according to direction
                if (t.dir === 'down') ctx.rotate(Math.PI);
                if (t.dir === 'left') ctx.rotate(-Math.PI / 2);
                if (t.dir === 'right') ctx.rotate(Math.PI / 2);

                // Tank Treads
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(-12, -12, 5, 24); // Left tread
                ctx.fillRect(7, -12, 5, 24);  // Right tread

                // Tread details
                ctx.fillStyle = '#475569';
                for (let ty = -10; ty < 12; ty += 5) {
                    ctx.fillRect(-12, ty, 5, 2);
                    ctx.fillRect(7, ty, 5, 2);
                }

                // Tank Body
                ctx.fillStyle = t.color;
                ctx.fillRect(-7, -9, 14, 18);

                // Turret Base
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();

                // Cannon Barrel
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(-2, -16, 4, 11);

                ctx.restore();
            });

            // Draw Bullets
            bulletsRef.current.forEach((b) => {
                ctx.save();
                ctx.fillStyle = b.color;
                ctx.shadowColor = b.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Draw Particles
            particlesRef.current.forEach((p) => {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 2.5, 2.5);
            });

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        handleResetRound(false);
        animationFrameId = requestAnimationFrame(gameLoop);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [activeGame, isPlayer1, gameMode, socket, opponent, gameOverWinner, handleResetRound, shootBullet]);

    if (activeGame !== 'tankduel') return null;

    const myTankKey = isPlayer1 ? 'p1' : 'p2';
    const otherTankKey = isPlayer1 ? 'p2' : 'p1';
    const myTank = tanksRef.current[myTankKey];
    const otherTank = tanksRef.current[otherTankKey];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
            <div
                className="bg-[#12141C] border border-gray-800 w-full max-w-[580px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header HUD */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-[#161823] shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <IoGameControllerOutline className="text-lg" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
                                Tank Duel 8-Bit
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                    BATTLE CITY
                                </span>
                            </h3>
                            <span className="text-[11px] text-gray-400">
                                {gameMode === 'online' ? `Online vs ${opponent?.fullname || 'Player'}` : 'Playing vs NexBot AI'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={toggleMute}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                            title={isMuted ? "Unmute Sound" : "Mute Sound"}
                        >
                            {isMuted ? <FiVolumeX className="text-base" /> : <FiVolume2 className="text-base text-indigo-400" />}
                        </button>
                        <button
                            type="button"
                            onClick={closeGame}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                            title="Exit duel"
                        >
                            <FiX className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Combatants Health & Scoreboard */}
                <div className="px-4 py-2 bg-[#1A1D29] border-b border-gray-800 flex items-center justify-between">
                    {/* Player (Blue Tank) */}
                    <div className="flex items-center gap-2">
                        <PixelAvatar
                            avatar={authUser?.user?.avatar}
                            name={authUser?.user?.fullname || "You"}
                            size={30}
                            isOnline={true}
                        />
                        <div>
                            <div className="flex items-center gap-1 text-xs font-bold text-cyan-400">
                                {authUser?.user?.fullname ? authUser.user.fullname.split(' ')[0] : 'You'}
                                <span className="text-[11px] font-mono text-gray-400">({scores.player})</span>
                            </div>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-xs ${i < (myTank?.hp || 0) ? 'text-rose-500' : 'text-gray-700'}`}
                                    >
                                        ♥
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* VS Badge */}
                    <div className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                        VS
                    </div>

                    {/* Opponent (Red Tank) */}
                    <div className="flex items-center gap-2 text-right">
                        <div>
                            <div className="flex items-center justify-end gap-1 text-xs font-bold text-rose-400">
                                <span className="text-[11px] font-mono text-gray-400">({scores.opponent})</span>
                                {opponent?.fullname ? opponent.fullname.split(' ')[0] : 'Opponent'}
                            </div>
                            <div className="flex items-center justify-end gap-0.5 mt-0.5">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-xs ${i < (otherTank?.hp || 0) ? 'text-rose-500' : 'text-gray-700'}`}
                                    >
                                        ♥
                                    </span>
                                ))}
                            </div>
                        </div>
                        {gameMode === 'bot' ? (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                               <RiRobot3Fill />
                            </div>
                        ) : (
                            <PixelAvatar
                                avatar={opponent?.avatar}
                                name={opponent?.fullname || "Opponent"}
                                size={30}
                                isOnline={true}
                            />
                        )}
                    </div>
                </div>

                {/* Battlefield Canvas Area */}
                <div className="relative flex items-center justify-center p-2 bg-black overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={COLS * CELL_SIZE}
                        height={ROWS * CELL_SIZE}
                        className="max-w-full h-auto border border-gray-800 rounded-lg shadow-inner image-rendering-pixelated"
                    />

                    {/* Game Over Banner Overlay */}
                    {gameOverWinner && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs animate-fade-in">
                            <div className="text-4xl mb-2">
                                {gameOverWinner === 'player' ? '🏆' : '💥'}
                            </div>
                            <h2 className={`text-2xl font-black mb-1 ${gameOverWinner === 'player' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {gameOverWinner === 'player' ? 'VICTORY!' : 'TANK DESTROYED!'}
                            </h2>
                            <p className="text-xs text-gray-400 mb-4">
                                {gameOverWinner === 'player' ? 'You defeated the enemy tank!' : 'Better luck next battle!'}
                            </p>
                            <button
                                type="button"
                                onClick={() => handleResetRound(true)}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                                <FiRefreshCw /> Rematch Battle
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Touch On-Screen Controls */}
                <div className="px-4 py-2 bg-[#161823] border-t border-gray-800 flex items-center justify-between sm:hidden">
                    {/* D-Pad */}
                    <div className="grid grid-cols-3 gap-1 w-28">
                        <div></div>
                        <button
                            type="button"
                            onTouchStart={() => handleTouchControl('arrowup', true)}
                            onTouchEnd={() => handleTouchControl('arrowup', false)}
                            onMouseDown={() => handleTouchControl('arrowup', true)}
                            onMouseUp={() => handleTouchControl('arrowup', false)}
                            className="h-8 rounded bg-gray-800 active:bg-indigo-600 text-white font-bold text-xs"
                        >
                            ▲
                        </button>
                        <div></div>
                        <button
                            type="button"
                            onTouchStart={() => handleTouchControl('arrowleft', true)}
                            onTouchEnd={() => handleTouchControl('arrowleft', false)}
                            onMouseDown={() => handleTouchControl('arrowleft', true)}
                            onMouseUp={() => handleTouchControl('arrowleft', false)}
                            className="h-8 rounded bg-gray-800 active:bg-indigo-600 text-white font-bold text-xs"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            type="button"
                            onTouchStart={() => handleTouchControl('arrowdown', true)}
                            onTouchEnd={() => handleTouchControl('arrowdown', false)}
                            onMouseDown={() => handleTouchControl('arrowdown', true)}
                            onMouseUp={() => handleTouchControl('arrowdown', false)}
                            className="h-8 rounded bg-gray-800 active:bg-indigo-600 text-white font-bold text-xs"
                        >
                            ▼
                        </button>
                        <button
                            type="button"
                            onTouchStart={() => handleTouchControl('arrowright', true)}
                            onTouchEnd={() => handleTouchControl('arrowright', false)}
                            onMouseDown={() => handleTouchControl('arrowright', true)}
                            onMouseUp={() => handleTouchControl('arrowright', false)}
                            className="h-8 rounded bg-gray-800 active:bg-indigo-600 text-white font-bold text-xs"
                        >
                            ▶
                        </button>
                    </div>

                    {/* Fire Button */}
                    <button
                        type="button"
                        onTouchStart={() => handleTouchControl(' ', true)}
                        onTouchEnd={() => handleTouchControl(' ', false)}
                        onMouseDown={() => handleTouchControl(' ', true)}
                        onMouseUp={() => handleTouchControl(' ', false)}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 active:scale-95 text-white font-black text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center"
                    >
                        FIRE
                    </button>
                </div>

                {/* Desktop Instructions / Footer */}
                <div className="hidden sm:flex px-4 py-2 bg-[#12141C] border-t border-gray-800/80 items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-3">
                        <span>🎮 <strong className="text-gray-200">WASD / Arrows:</strong> Drive & Steer</span>
                        <span>💥 <strong className="text-gray-200">Spacebar / Enter:</strong> Fire Cannon</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-amber-400">🧱 Destructible Bricks</span>
                        <span>•</span>
                        <span className="text-purple-400">⚡ Powerups</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TankDuelModal;
