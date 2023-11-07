let input;
let save;
let json;

window.onload = () => {
	input = document.getElementById("input");
	save = document.getElementById("save");
	json = document.getElementById("json");

	input.onchange = () => {
		let file = input.files[0];
		console.log(file);
		if (!file) {
			return;
		}
		let reader = new FileReader();
		reader.readAsText(file);
		reader.onload = (e) => {
			decode(e.target.result).then((data) => {
				// json.value = JSON.stringify(JSON.parse(data), null, "\t");
				json.value = data;
			});
		}
	}

	save.onclick = () => {
		console.log(json.value);
		let out = encode(JSON.stringify(JSON.parse(json.value))).then((data) => {
			let fname = input.files[0];
			if (fname) {
				fname = fname.name;
			} else {
				fname = "untitled.sobj";
			}
			download(fname, data);
		});
	}
}