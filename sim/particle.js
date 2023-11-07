class Particle {
	constructor(pos, mass) {
		this.locked = false;
		this.mass = mass;
		this.pos = pos;
		this.vel = new Vector(0, 0);
		this.acc = new Vector(0, 0);
	}
	update(deltaTime) {
		if (this.locked) {
			this.vel.mul(0);
			this.acc.mul(0);
			return;
		}
		this.vel.add(vmul(this.acc, deltaTime));
		this.pos.add(vmul(this.vel, deltaTime));
		this.wallbounce(deltaTime);
		this.acc.mul(0);
	}
	wallbounce(deltaTime) {
		if (this.pos.y >= height) {
			this.pos.y = height;
			this.vel.y *= -0.5;
		} else if (this.pos.y <= 0) {
			this.pos.y = 0;
			this.vel.y *= -0.5;
		} else if (this.pos.x >= width) {
			this.pos.x = width;
			this.vel.x *= -0.5;
		} else if (this.pos.x <= 0) {
			this.pos.x = 0;
			this.vel.x *= -0.5;
		} else {
			return;
		}
		this.vel.mul(1-(deltaTime));
	}
	draw(ctx) {
		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
	force(v) {
		this.acc.add(vdiv(v, this.mass));
	}
	lock() {
		this.locked = true;
		this.vel.mul(0);
		this.acc.mul(0);
	}
	unlock() {
		this.locked = false;
		this.vel.mul(0);
		this.acc.mul(0);
	}
}