const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let active = false, score = 0, combo = 1, rotation = 0;
let ringRadius = 150, playerSide = 1; // 1 = inside, -1 = outside
let objects = [], ripple = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = { angle: 0, speed: 0.04, size: 10 };

window.onmousedown = () => switchSide();
window.onkeydown = (e) => { if(e.code === 'Space') switchSide(); };

function switchSide() {
  if(!active) return;
  playerSide *= -1;
  ripple = 1; // Start ripple effect
}

function start() {
  document.getElementById('menu').style.display = 'none';
  active = true; score = 0; objects = []; player.angle = 0;
  loop();
}

function spawn() {
  const type = Math.random() > 0.3 ? 'note' : 'spike';
  objects.push({
    angle: player.angle + Math.PI + (Math.random() - 0.5),
    side: Math.random() > 0.5 ? 1 : -1,
    type: type,
    color: type === 'note' ? '#0ff' : '#ff0055'
  });
}

function loop() {
  if(!active) return;
  requestAnimationFrame(loop);

  // Clear with Glow
  ctx.fillStyle = 'rgba(0, 5, 10, 0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Draw Central Ring
  ctx.strokeStyle = '#112233';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw Ripple Effect
  if(ripple > 0) {
    ctx.strokeStyle = `rgba(0, 255, 255, ${ripple})`;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius + (1 - ripple) * 50, 0, Math.PI * 2);
    ctx.stroke();
    ripple -= 0.05;
  }

  // Player Movement
  player.angle += player.speed;
  const px = cx + Math.cos(player.angle) * (ringRadius - (playerSide * 15));
  const py = cy + Math.sin(player.angle) * (ringRadius - (playerSide * 15));

  // Draw Player
  ctx.shadowBlur = 15; ctx.shadowColor = '#0ff';
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(px, py, player.size, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // Object Logic
  if(Math.random() < 0.03) spawn();
  
  objects.forEach((obj, i) => {
    const ox = cx + Math.cos(obj.angle) * (ringRadius - (obj.side * 15));
    const oy = cy + Math.sin(obj.angle) * (ringRadius - (obj.side * 15));

    ctx.fillStyle = obj.color;
    ctx.shadowBlur = 10; ctx.shadowColor = obj.color;
    
    if(obj.type === 'note') {
      ctx.fillRect(ox - 5, oy - 5, 10, 10);
    } else {
      ctx.beginPath(); // Spike triangle
      ctx.moveTo(ox, oy - 12); ctx.lineTo(ox + 8, oy + 8); ctx.lineTo(ox - 8, oy + 8);
      ctx.closePath(); ctx.fill();
    }

    // Collision Check
    const dist = Math.hypot(px - ox, py - oy);
    if(dist < 20) {
      if(obj.type === 'note') {
        score += 10 * combo;
        objects.splice(i, 1);
        document.getElementById('score').innerText = score;
      } else {
        gameOver();
      }
    }
  });

  // Cleanup off-screen/old objects
  if(objects.length > 20) objects.shift();
  
  player.speed = 0.04 + (score / 2000); // Speed up
}

function gameOver() {
  active = false;
  document.getElementById('menu').style.display = 'block';
  document.querySelector('h1').innerText = "CONNECTION_LOST";
}


