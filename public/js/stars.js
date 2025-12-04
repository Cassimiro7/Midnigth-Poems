// public/js/stars.js
(() => {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const stars = [];
  const STAR_COUNT = Math.floor((w*h)/8000); // density

  function rand(a,b){ return Math.random()*(b-a)+a; }

  function init(){
    stars.length = 0;
    for(let i=0;i<STAR_COUNT;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: rand(0.3,1.6),
        alpha: rand(0.15,0.95),
        tw: Math.random()*Math.PI*2,
        speed: rand(0.0005,0.0025)
      });
    }
  }

  function onResize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    init();
  }

  window.addEventListener('resize', onResize);

  let mouseX = w/2, mouseY = h/2;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
  });

  function draw(){
    ctx.clearRect(0,0,w,h);

    // faint milky gradient center
    const g = ctx.createRadialGradient(w*0.5,h*0.45,0,w*0.5,h*0.45, Math.max(w,h)*0.9);
    g.addColorStop(0, 'rgba(24,26,36,0.03)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // stars
    for(const s of stars){
      s.tw += s.speed;
      const t = (Math.sin(s.tw)+1)/2;
      const alpha = s.alpha * (0.6 + 0.4*t);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.arc(s.x + (mouseX - w/2)*0.02, s.y + (mouseY - h/2)*0.02, s.r, 0, Math.PI*2);
      ctx.fill();
    }

    // occasional shooting effect
    if (Math.random() < 0.003) {
      shoot();
    }

    requestAnimationFrame(draw);
  }

  function shoot(){
    const sx = Math.random()*w;
    const sy = Math.random()*h*0.6;
    const len = Math.random()*200+120;
    const angle = Math.random()*Math.PI/3 - Math.PI/6;
    const steps = 20;
    let i = 0;
    (function _trail(){
      const x = sx + Math.cos(angle)*(len*(i/steps));
      const y = sy + Math.sin(angle)*(len*(i/steps));
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${0.6*(1 - i/steps)})`;
      ctx.lineWidth = 2;
      ctx.moveTo(x, y);
      ctx.lineTo(x - Math.cos(angle)*10, y - Math.sin(angle)*10);
      ctx.stroke();
      i++;
      if (i <= steps) requestAnimationFrame(_trail);
    })();
  }

  init();
  draw();
})();
