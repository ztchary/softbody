function encode(string) {
	const byteArray = new TextEncoder().encode(string);
	const cs = new CompressionStream("gzip");
	const writer = cs.writable.getWriter();
	writer.write(byteArray);
	writer.close();
	return new Response(cs.readable).arrayBuffer().then(function (arrayBuffer) {
		let array = new Uint8Array(arrayBuffer);
		let ret = '';
		array.forEach((x) => {
			ret += String.fromCharCode(x);
		});
		return ret;
	});
}

function decode(string) {
	const byteArray = Uint8Array.from(string, x => x.charCodeAt(0));
	const cs = new DecompressionStream("gzip");
	const writer = cs.writable.getWriter();
	writer.write(byteArray);
	writer.close();
	return new Response(cs.readable).arrayBuffer().then(function (arrayBuffer) {
		return new TextDecoder().decode(arrayBuffer);
	});
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function uuid() {
	let url = URL.createObjectURL(new Blob()).substr(-36);
	let id = url.toString();
	URL.revokeObjectURL(url);
	return id;
}