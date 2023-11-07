class SoftObject {
	constructor(shapeData, color) {
		this.particles = [];
		this.springs = [];
		this.perimeter = [];
		shapeData["particles"].forEach((values) => {
			this.particles.push(new Particle(new Vector(values[0], values[1]), values[2]));
		});
		shapeData["springs"].forEach((values) => {
			this.springs.push(new Spring(this.particles[values[0]], this.particles[values[1]], values[2], values[3], values[4]));
		});
		shapeData["perimeter"].forEach((p) => {
			this.perimeter.push(this.particles[p]);
		});
		this.color = color;
	}
	update(deltaTime) {
		if (this.particles.length == 0) {
			return;
		}
		this.particles.forEach((particle) => {
			particle.acc.add(new Vector(parseInt(xslider.value), parseInt(yslider.value)*-1));
			particle.update(deltaTime);
		});
		this.springs.forEach((spring) => {
			spring.update();
		});
	}
	draw(ctx, debug) {
		if (this.particles.length == 0) {
			return;
		}
		ctx.lineWidth = 10;
		ctx.lineCap = "round";
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = this.color;
		ctx.beginPath();
		let first = this.perimeter[this.perimeter.length-1];
		ctx.moveTo(first.pos.x, first.pos.y);
		this.perimeter.forEach((particle) => {
			ctx.lineTo(particle.pos.x, particle.pos.y);
		});
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		
		if (debug) {
			this.particles.forEach((particle) => {
				particle.draw(ctx);
			});
			this.springs.forEach((spring) => {
				spring.draw(ctx);
			});
		}
	}
	getBoundingBox() {
		let top = Infinity;
		let bottom = -Infinity;
		let left = Infinity;
		let right = -Infinity;
		this.particles.forEach((p) => {
			top = Math.min(p.pos.y, top);
			bottom = Math.max(p.pos.y, bottom);
			left = Math.min(p.pos.x, left);
			right = Math.max(p.pos.x, right);
		});
		return [top, bottom, left, right];
	}
	doesPointCollide(x, y) {
		let [t, b, l, r] = this.getBoundingBox();
		if ((x < l) || (x > r) || (y < t) || (y > b)) {
			return false;
		}
		let nleft = 0;
		let closest;
		let distance = Infinity;
		for (let i = 0; i < this.perimeter.length; i++) {
			let c = this.perimeter[i].pos;
			let n = this.perimeter[(i+1)%this.perimeter.length].pos;
			let m = ((x - c.x) * (n.x - c.x) + (y - c.y) * (n.y - c.y)) / c.dist2(n);
			m = Math.max(0, Math.min(1, m));
			let cx = c.x + m * (n.x - c.x);
			let cy = c.y + m * (n.y - c.y);

			let xdist = cx - x;
			let ydist = cy - y;
			let dist = (xdist*xdist+ydist*ydist);
			if (dist < distance) {
				closest = [new Vector(cx, cy), dist, this.perimeter[i], this.perimeter[(i+1)%this.perimeter.length], m];
				distance = dist;
			}

			if ((c.y > y) == (n.y > y)) {
				continue;
			}
			if ((c.x < x) == (n.x < x)) {
				if (c.x < x) {
					nleft++;
				}
				continue;
			}
			let b = (y - c.y)*(n.x-c.x)/(n.y-c.y)
			if (c.x+b < x) {
				nleft++;
			}
		}
		if (nleft%2 == 1) {
			return closest;
		} else {
			return false;
		}
	}
	collide(obj) {
		let [t1, b1, l1, r1] = this.getBoundingBox();
		let [t2, b2, l2, r2] = obj.getBoundingBox();
		if (l1 > r2 || r1 < l2 || t1 > b2 || b1 < t2) {
			return;
		}
		this.particles.forEach((p) => {
			let collision = obj.doesPointCollide(p.pos.x, p.pos.y);
			if (!collision) {
				return;
			}
			let [point, dist2, a, b, t] = collision;
			let normal = a.pos.normal(b.pos);
			let invnormal = vmul(normal, -1);
			if (p.pos.dist2(vadd(normal, point)) > p.pos.dist2(vadd(invnormal, point))) {
				normal = invnormal;
				t = 1-t;
			}
			let f = vmul(normal, Math.sqrt(dist2));
			let fa = vmul(f, 1-t);
			let fb = vmul(f, t);
			let fp = vmul(f, -1);
			a.pos.add(fa);
			b.pos.add(fb);
			p.pos.add(fp);

			let ab = vadd(a.vel, b.vel);
			ab.div(2);

			let tan = new Vector(normal.y, -normal.x);
			tan.normalize();
			tan.mul(ab.dot(tan));
			let perp = vsub(ab, tan);
			a.vel.sub(perp);
			b.vel.sub(perp);
			p.vel.add(perp);
		});
	}
}