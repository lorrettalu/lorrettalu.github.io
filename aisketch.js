// Please write a simple p5.js sketch that draws an animated painting in // the style of Wassily Kandinsky

// --- Simple Kandinsky-inspired animated painting ---
      // Controls:
      //   SPACE: new composition
      //   S:     save PNG

      let seed = 12345;
      let circles = [];
      let bars = [];
      let needles = [];
      let triangles = [];

      function setup() {
        let cnv = createCanvas(windowWidth * 0.5, windowHeight * 0.5);
        pixelDensity(2);
        noStroke();
        newComposition();
      }

      function windowResized() {
        resizeCanvas(windowWidth * 0.5, windowHeight * 0.5);
        newComposition();
      }

      function keyPressed() {
        if (key === ' ') newComposition();
        if (key.toLowerCase() === 's') saveCanvas('kandinsky', 'png');
      }

      function newComposition() {
        seed = floor(random(1e9));
        randomSeed(seed);
        noiseSeed(seed);

        // palette: muted paper + a few punchy accents
        const palettes = [
          ['#0d0c0c','#e74f2e','#f2d64b','#2b6cb0','#efe7da','#6f9e6e'],
          ['#1b1b1b','#f4c430','#cc3b3b','#2f80ed','#efe7da','#7f8c8d'],
          ['#222','#f7b801','#f18701','#f35b04','#efe7da','#1e6f5c']
        ];
        window.palette = random(palettes);

        // build layers
        circles = makeCircles(8, min(width, height)*0.48);
        bars = makeBars(6);
        needles = makeNeedles(12);
        triangles = makeTriangles(7);

        background('#efe7da');
      }

      function draw() {
        background('#efe7da');

        // very light paper grain
        push();
        noStroke();
        for (let i = 0; i < 200; i++) {
          fill(0, 10);
          const x = random(width), y = random(height);
          rect(x, y, 1, 1);
        }
        pop();

        // faint guide lines (Kandinsky liked structure under play)
        drawGuides();

        // order: bars -> circles -> needles -> triangles -> outline accents
        drawBars();
        drawCircles();
        drawNeedles();
        drawTriangles();
        drawAccents();
      }

      // ---------- generators ----------
      function makeCircles(n, maxR) {
        const arr = [];
        for (let i = 0; i < n; i++) {
          const r = random(maxR*0.08, maxR*0.35);
          const a = random(TWO_PI);
          const rad = random(maxR*0.15, maxR*0.8);
          const cx = width/2 + cos(a)*rad;
          const cy = height/2 + sin(a)*rad;
          arr.push({
            x: cx, y: cy, r,
            hue: random(palette),
            wobble: random(1000),
            ring: random() < 0.6
          });
        }
        return arr;
      }

      function makeBars(n) {
        const arr = [];
        for (let i = 0; i < n; i++) {
          arr.push({
            cx: random(width), cy: random(height),
            w: random(width*0.08, width*0.3),
            h: random(6, 18),
            angle: random(TWO_PI),
            speed: random(-0.003, 0.003),
            col: random(palette)
          });
        }
        return arr;
      }

      function makeNeedles(n) {
        const arr = [];
        for (let i = 0; i < n; i++) {
          const rad = random(min(width, height)*0.1, min(width, height)*0.45);
          arr.push({
            cx: width/2, cy: height/2,
            len: rad,
            angle: random(TWO_PI),
            speed: random(0.002, 0.006),
            thick: random(1, 4),
            col: random(['#0d0c0c', '#1b1b1b', random(palette)])
          });
        }
        return arr;
      }

      function makeTriangles(n) {
        const arr = [];
        for (let i = 0; i < n; i++) {
          const size = random(20, 80);
          const x = random(width), y = random(height);
          arr.push({
            x, y, s: size,
            a: random(TWO_PI),
            spin: random(-0.01, 0.01),
            col: random(palette),
            jitter: random(1000)
          });
        }
        return arr;
      }

      // ---------- drawing ----------
      function drawGuides() {
        push();
        stroke(0, 18);
        strokeWeight(1);
        const m = 5;
        for (let i = 1; i < m; i++) {
          const x = (width/m)*i;
          const y = (height/m)*i;
          line(x, 0, x, height);
          line(0, y, width, y);
        }
        pop();
      }

      function drawBars() {
        push();
        rectMode(CENTER);
        for (const b of bars) {
          b.angle += b.speed;
          push();
          translate(b.cx, b.cy);
          rotate(b.angle);
          noStroke();
          fill(colorWithAlpha(b.col, 160));
          rect(0, 0, b.w, b.h, 3);
          pop();
        }
        pop();
      }

      function drawCircles() {
        push();
        for (const c of circles) {
          const t = millis()*0.0005 + c.wobble;
          const dx = (noise(t)*2 - 1) * 10;
          const dy = (noise(t+1000)*2 - 1) * 10;

          // soft shadow
          noStroke();
          fill(0, 18);
          ellipse(c.x+dx+4, c.y+dy+5, c.r*1.02);

          // fill
          fill(colorWithAlpha(c.hue, 170));
          ellipse(c.x+dx, c.y+dy, c.r);

          // optional ring
          if (c.ring) {
            noFill();
            stroke(colorWithAlpha('#0d0c0c', 180));
            strokeWeight(2);
            ellipse(c.x+dx, c.y+dy, c.r*0.7);
          }

          // small inner dot
          noStroke();
          fill(colorWithAlpha(random(palette), 200));
          ellipse(c.x+dx + sin(t*3)*8, c.y+dy + cos(t*3)*8, c.r*0.12);
        }
        pop();
      }

      function drawNeedles() {
        push();
        strokeCap(SQUARE);
        for (const n of needles) {
          n.angle += n.speed;
          push();
          translate(n.cx, n.cy);
          rotate(n.angle);
          stroke(colorWithAlpha(n.col, 220));
          strokeWeight(n.thick);
          line(0, 0, n.len, 0);

          // tiny tick at the end
          push();
          translate(n.len, 0);
          rotate(PI/6);
          line(0, 0, 12, 0);
          pop();

          pop();
        }
        pop();
      }

      function drawTriangles() {
        push();
        for (const tr of triangles) {
          const t = millis()*0.0006 + tr.jitter;
          const jx = (noise(t)*2-1) * 6;
          const jy = (noise(t+500)*2-1) * 6;
          tr.a += tr.spin*0.5;

          // shadow
          noStroke();
          fill(0, 15);
          drawIsoTriangle(tr.x+jx+3, tr.y+jy+4, tr.s*1.02, tr.a);

          // fill
          fill(colorWithAlpha(tr.col, 190));
          drawIsoTriangle(tr.x+jx, tr.y+jy, tr.s, tr.a);
        }
        pop();
      }

      function drawAccents() {
        // a few crisp black lines to “snap” the composition
        push();
        stroke('#0d0c0c');
        strokeWeight(2);
        const k = min(width, height);
        line(width*0.12, height*0.15, width*0.88, height*0.15);
        line(width*0.2, height*0.78, width*0.8, height*0.62);
        // small dots
        noStroke();
        fill('#0d0c0c');
        circle(width*0.82, height*0.28, k*0.01);
        circle(width*0.18, height*0.52, k*0.008);
        pop();
      }

      // ---------- helpers ----------
      function colorWithAlpha(hex, a) {
        const c = color(hex);
        return color(red(c), green(c), blue(c), a);
      }

      function drawIsoTriangle(x, y, s, angle) {
        push();
        translate(x, y);
        rotate(angle);
        beginShape();
        vertex(-s*0.5,  s*0.35);
        vertex( 0,     -s*0.5);
        vertex( s*0.5,  s*0.35);
        endShape(CLOSE);
        pop();
      }