class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	add(a) {
		this.x += a.x;
		this.y += a.y;
	}
	sub(a) {
		this.x -= a.x;
		this.y -= a.y;
	}
	mul(a) {
		this.x *= a;
		this.y *= a;
	}
	div(a) {
		this.x /= a;
		this.y /= a;
	}
	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	distance(a) {
		return vsub(a, this).magnitude();
	}
	normalize() {
		this.div(this.magnitude());
	}
	dot(a) {
		return this.x*a.x+this.y*a.y;
	}
	dir(a) {
		let dir = vsub(a, this);
		dir.normalize();
		return dir;
	}
	normal(a) {
		let norm = vsub(a, this);
		norm.normalize();
		return new Vector(norm.y, -norm.x);
	}
	dist2(a) {
		let b = vsub(a, this);
		return (b.x * b.x + b.y * b.y);
	}
}

function vadd(a, b) {
	let c = new Vector(a.x, a.y);
	c.add(b);
	return c;
}
function vsub(a, b) {
	let c = new Vector(a.x, a.y);
	c.sub(b);
	return c;
}
function vmul(a, b) {
	let c = new Vector(a.x, a.y);
	c.mul(b);
	return c;
}
function vdiv(a, b) {
	let c = new Vector(a.x, a.y);
	c.div(b);
	return c;
}