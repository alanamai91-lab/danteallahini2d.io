/* ============================================================
   SAKURA.JS — Atmospheric Petal Particles
   ShadowSlump Aesthetic Restoration
   ============================================================ */

const canvas = document.getElementById('sakuraCanvas');
const ctx = canvas.getContext('2d');

let width, height, pixels;
let petals = [];

const PETAL_COUNT = 45;
const PINK_ACCENT = '#f7b9c4';

function init() {
    resize();
    createPetals();
    animate();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);

class Petal {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
        this.r = Math.random() * 4 + 2;
        this.s = Math.random() * 1.5 + 0.5; // speed
        this.a = Math.random() * Math.PI; // angle
        this.as = Math.random() * 0.02 + 0.01; // angle speed
        this.w = Math.random() * 5 + 5; // width
        this.h = Math.random() * 5 + 5; // height
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.y += this.s;
        this.x += Math.sin(this.y * 0.01) * 0.5;
        this.a += this.as;

        if (this.y > height) {
            this.reset();
            this.y = -20;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.a);
        ctx.beginPath();
        // Draw petal shape (pill-like)
        ctx.ellipse(0, 0, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = PINK_ACCENT;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.restore();
    }
}

function createPetals() {
    for (let i = 0; i < PETAL_COUNT; i++) {
        petals.push(new Petal());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    petals.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

init();
