const width = 1800;
const height = 1200;
let debug = false;
let del = false;
let dragging = false;
let selected;
let canvas;
let ctx;
let xslider, yslider, subslider;
let subcount;
let objname, color, spawn;
let reset, resetcache;
let oldTs = 0;
let objects = [];
let cache = {};

window.onload = function() {
	canvas = document.getElementById("canvas");
	subslider = document.getElementById("sub");
	subcount = document.getElementById("subcount");
	xslider = document.getElementById("x");
	yslider = document.getElementById("y");
	objname = document.getElementById("objname");
	color = document.getElementById("color");
	spawn = document.getElementById("spawn");
	reset = document.getElementById("reset");
	resetcache = document.getElementById("resetcache");
	canvas.width = width;
	canvas.height = height;
	ctx = canvas.getContext('2d');
	canvas.onmousemove = (e) => {
		if (dragging) {
			selected.pos = new Vector(e.clientX, e.clientY);
		}
	}
	canvas.onmousedown = (e) => {
		if (del) {
			let todel = findClosestParticle(e, true);
			objects.splice(objects.indexOf(todel), 1);
			return;
		}
		let closest = findClosestParticle(e);
		closest.pos = new Vector(e.clientX, e.clientY);
		closest.lock();
		if (!e.ctrlKey) {
			dragging = true;
			selected = closest;
		}
	}
	canvas.onmouseup = (e) => {
		if (dragging) {
			dragging = false;
			selected.unlock();
		}
	}
	spawn.onclick = () => {
		createObject(objname.value);
	}
	reset.onclick = () => {
		objects = [];
	}
	resetcache.onclick = () => {
		localStorage.clear();
		cache = {};
	}
	document.onkeyup = (e) => {
		if (e.key == 'Shift') {
			del = false;
		}
	}
	document.onkeydown = (e) => {
		if (e.key == 'd') {
			debug = (!debug);
		} else if (e.key == 'Shift') {
			del = true;
		}
	}
	let lscache = localStorage.getItem("cache");
	if (lscache) {
		cache = JSON.parse(lscache);
	}
	window.requestAnimationFrame(loop);
}

function findClosestParticle(e, t) {
	let closest;
	let co;
	let distance = Infinity;
	let mouse = new Vector(e.clientX, e.clientY);
	objects.forEach((obj) => {
		obj.particles.forEach((p) => {
			let dist = p.pos.distance(mouse);
			if (dist < distance) {
				closest = p;
				distance = dist;
				co = obj;
			}
		});
	});
	if (t) {
		return co;
	}
	return closest;
}

function loop(ts) {
	let deltaTime = Math.min((ts-oldTs)/1000, 1/10);
	oldTs = ts;
	ctx.fillStyle = "#cecece";
	ctx.fillRect(0, 0, width, height);
	let substeps = parseInt(subslider.value);
	subcount.textContent = subslider.value;
	for (let i = 0; i < substeps; i++) {
		objects.forEach((o) => {
			o.update(deltaTime/substeps);
			objects.forEach((o2) => {
				if (o != o2) {
					o.collide(o2);
				}
			});
		});
	}
	objects.forEach((o) => {
		o.draw(ctx, debug);
	});
	window.requestAnimationFrame(loop);
}

function createObject(obj) {
	if (Object.keys(cache).includes(obj)) {
		load(obj);
	} else {
		downloadObj(obj);
	}
}

function downloadObj(obj) {
	fetch('./shapes/'+obj+'.sobj')
	.then((response) => response.text())
	.then((data) => decode(data))
	.then((string) => {
		cache[obj] = JSON.parse(string);
		localStorage.setItem("cache", JSON.stringify(cache));
		load(obj);
	});
}

function load(obj) {
	let objj = cache[obj];
	let keys = Object.keys(objj);
	if (keys.includes("random")) {
		let opt = objj["random"];
		let obj = opt[Math.floor(Math.random()*opt.length)];
		createObject(obj);
		return;
	} else if (keys.includes("auto")) {
		objj["auto"].forEach((o) => {
			createObject(o);
		});
	}

	let tcolor = "#"+color.value;
	if (tcolor == "#") {
		tcolor = cache[obj]["color"];
	}
	objects.push(new SoftObject(cache[obj], tcolor));
}