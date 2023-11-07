class Spring {
	constructor(a, b, s, l, d) {
		this.a = a;
		this.b = b;
		this.s = s*1000;
		this.l = l;
		this.d = d;
	}
	update() {
		let dir = this.a.pos.dir(this.b.pos);
		let x = this.a.pos.distance(this.b.pos) - this.l;
		let fs = this.s * x;
		let fd = vsub(this.b.vel, this.a.vel).dot(dir)*this.d;
		let ft = fs + fd;
		this.a.force(vmul(dir, ft));
		this.b.force(vmul(dir, -ft));
	}
	draw(ctx) {
		let f = Math.floor(this.a.pos.distance(this.b.pos) - this.l)*50;
		let red = Math.min(255, Math.max(0, f));
		let blue = Math.min(255, Math.max(0, -f));
		red = red.toString(16).padStart(2, '0');
		blue = blue.toString(16).padStart(2, '0');
		ctx.strokeStyle = "#"+red+"00"+blue;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(this.a.pos.x, this.a.pos.y);
		ctx.lineTo(this.b.pos.x, this.b.pos.y);
		ctx.stroke();
	}
}