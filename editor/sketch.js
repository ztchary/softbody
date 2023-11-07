const width = 800;
const height = 800;
const spacing = 25;
const moveThreshold = 5;
let canvas;
let mass;
let stiff;
let damp;
let filename;
let exp;
let color;
let reset;
let ctx;
let shifting = false;
let perimeter = [];
let particles = {};
let springs = {};
let down = false;
let mousedownCoords = [0, 0];


function registerEvents() {
	document.onkeydown = (e) => {
		if (e.key == "U") {
			let pnames = Object.keys(particles);
			for (let i = 0; i < pnames.length; i++) {
				for (let j = i+1; j < pnames.length; j++) {
					createSpring(pnames[i], pnames[j]);
				}
			}
			draw();
		}
		if (e.key == 'Shift') {
			shifting = true;
		}
	}
	document.onkeyup = (e) => {
		shifting = false;
	}

	canvas.onmouseup = (e) => {
		if (!down) {
			return;
		}
		if (inThreshold(e)) {
			let xpos = e.clientX;
			let ypos = e.clientY;
			if (e.ctrlKey) {
				xpos = Math.round(xpos/spacing)*spacing;
				ypos = Math.round(ypos/spacing)*spacing;
			}
			particles[uuid()] = {"p":[xpos, ypos, parseFloat(mass.value)],"s":[]};
		} else {
			createSpringClosest(mousedownCoords[0], mousedownCoords[1], e.clientX, e.clientY);
		}
		draw();
		down = false;
	}
	canvas.onmousedown = (e) => {
		if (shifting) {
			deleteParticle(findClosestParticle(e.clientX, e.clientY));
			draw();
			return;
		}
		if (document.getElementById("perimeter").checked) {
			perimeter.push(findClosestParticle(e.clientX, e.clientY));
			draw();
			return;
		}
		mousedownCoords = [e.clientX, e.clientY];
		down = true;
	}
	canvas.onmousemove = (e) => {
		if (inThreshold(e) || !down) {
			return;
		}
		draw();
		ctx.strokeStyle = "#555555";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(mousedownCoords[0], mousedownCoords[1]);
		ctx.lineTo(e.clientX, e.clientY);
		ctx.stroke();
		ctx.closePath();
	}
	exp.onclick = () => {
		let realPart = [];
		let realSpri = [];
		let realPeri = [];
		let lookup = {};
		let index = 0;
		let xOff = Infinity;
		let yOff = Infinity;

		Object.values(particles).forEach((p) => {
			xOff = Math.min(xOff, p["p"][0]);
			yOff = Math.min(yOff, p["p"][1]);
		});
		Object.keys(particles).forEach((p) => {
			lookup[p] = index;
			let pdata = particles[p]["p"]
			pdata[0] -= xOff;
			pdata[1] -= yOff;
			realPart.push(pdata);
			index++;
		});
		Object.keys(springs).forEach((s) => {
			let data = springs[s];
			if (data[0] == data[1]) {
				return;
			}
			realSpri.push([lookup[data[0]], lookup[data[1]], data[2], data[3], data[4]]);
		});
		perimeter.forEach((p) => {
			realPeri.push(lookup[p]);
		});
		encode(JSON.stringify({"particles": realPart, "springs": realSpri, "perimeter": realPeri, "color": "#"+color.value})).then((data) => {
			download(filename.value+".sobj", data);
		});
	}
	reset.onclick = () => {
		perimeter = [];
		draw();
	}
}

function createSpringClosest(x1, y1, x2, y2) {
	let a = findClosestParticle(x1, y1);
	let b = findClosestParticle(x2, y2);
	createSpring(a, b);
}

function createSpring(a, b) {
	let id = uuid();
	springs[id] = [a, b, parseFloat(stiff.value), parseFloat(particleDistance(particles[a], particles[b]).toFixed(2)), parseFloat(damp.value)];
	particles[a]["s"].push(id);
	particles[b]["s"].push(id);
}

function particleDistance(a, b) {
	let xdist = a["p"][0] - b["p"][0];
	let ydist = a["p"][1] - b["p"][1];
	let dist = xdist*xdist + ydist*ydist;
	return Math.sqrt(dist);
}

function deleteParticle(p) {
	particles[p]["s"].forEach((s) => {
		delete springs[s];
	});
	delete particles[p];
	let c = 0;
	perimeter.forEach((e) => {
		if (e == p) {
			perimeter.splice(c, 1);
			return;
		}
		c++;
	});
}

function findClosestParticle(x, y) {
	let closest;
	let distance = Infinity;
	Object.keys(particles).forEach((p) => {
		let xdist = particles[p]["p"][0] - x;
		let ydist = particles[p]["p"][1] - y;
		let dist = xdist*xdist + ydist*ydist;
		if (dist < distance) {
			closest = p;
			distance = dist;
		}
	});
	return closest;
}

function inThreshold(e) {
	let xdist = e.clientX-mousedownCoords[0];
	let ydist = e.clientY-mousedownCoords[1];
	let dist = xdist*xdist + ydist*ydist;
	return (dist <= moveThreshold*moveThreshold)
}

window.onload = () => {
	canvas = document.getElementById("canvas");
	mass = document.getElementById("mass");
	stiff = document.getElementById("stiff");
	damp = document.getElementById("damp");
	filename = document.getElementById("filename");
	exp = document.getElementById("export");
	reset = document.getElementById("reset");
	color = document.getElementById("color");
	ctx = canvas.getContext("2d");
	canvas.width = width;
	canvas.height = height;
	draw();
	registerEvents();
}

function drawBackground() {
	ctx.fillStyle = "#eeeeee";
	ctx.fillRect(0, 0, width, height);
}

function drawLines() {
	ctx.strokeStyle = "#dddddd";
	ctx.lineWidth = 1;
	ctx.beginPath();
	for (let i = 0; i < width/spacing; i++) {
		ctx.moveTo(i*spacing, 0);
		ctx.lineTo(i*spacing, height);
	}
	for (let i = 0; i < height/spacing; i++) {
		ctx.moveTo(0, i*spacing);
		ctx.lineTo(width, i*spacing);
	}
	ctx.stroke();
	ctx.closePath();
}

function drawParticles() {
	ctx.fillStyle = "#000000";
	Object.values(particles).forEach((p) => {
		ctx.beginPath();
		ctx.arc(p["p"][0], p["p"][1], p["p"][2]*2, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	});
}

function drawSprings() {
	ctx.strokeStyle = "#555555";
	ctx.lineWidth = 1;
	ctx.beginPath();
	Object.values(springs).forEach((s) => {
		ctx.moveTo(particles[s[0]]["p"][0], particles[s[0]]["p"][1]);
		ctx.lineTo(particles[s[1]]["p"][0], particles[s[1]]["p"][1]);
	});
	ctx.stroke();
	ctx.closePath();
}

function drawPerimeter() {
	if (perimeter.length == 0) {
		return;
	}
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#ff0000";
	ctx.beginPath();
	let start = particles[perimeter[perimeter.length-1]]["p"];
	ctx.moveTo(start[0], start[1]);
	perimeter.forEach((p) => {
		let point = particles[p]["p"];
		ctx.lineTo(point[0], point[1]);
	});
	ctx.stroke();
	ctx.closePath();
}

function draw() {
	drawBackground();
	drawLines();
	drawSprings();
	drawParticles();
	drawPerimeter();
}
