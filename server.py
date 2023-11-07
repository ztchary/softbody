from flask import request
import flask
import os

app = flask.Flask(__name__)

@app.route("/editor/upload", methods=["GET", "POST"])
def upload():
	if request.method == 'POST':
		if 'file' not in request.files:
			print(request.files)
			return 'nope'
		file = request.files['file']
		if file.filename == '':
			return "nuh uh"
		if not file.filename.endswith(".sobj"):
			return "nice try pal"
		if os.path.exists("shapes/"+file.filename):
			return "filename taken"
		if file:
			filename = file.filename
			file.save(os.path.join("shapes/", filename))
			return flask.redirect('/sim')
	else:
		return flask.send_file("editor/upload.html")

@app.route("/shapes/<f>")
def get_shapes(f):
	return flask.send_file(f"shapes/{f}")

@app.route("/editor/<f>")
def get_editor(f):
	if "." not in f:
		f += ".html"
	return flask.send_file(f"editor/{f}")

@app.route("/sim/<f>")
def get_sim(f):
	return flask.send_file(f"sim/{f}")

@app.route("/debug/<f>")
def get_debug(f):
	return flask.send_file(f"debug/{f}")

@app.route("/<name>")
def get_name(name):
	if name not in ["sim", "editor"]:
		flask.abort(404)
	return flask.send_file(name+"/index.html")

@app.route("/")
def home():
	return flask.redirect('/sim')

@app.route("/style.css")
def style():
	return flask.send_file("style.css")

@app.route("/utils.js")
def utils():
	return flask.send_file("utils.js")

@app.route("/favicon.ico")
def favicon():
	flask.abort(404)

@app.route("/index.js.map")
def indexjsmap():
	flask.abort(404)

app.run("0.0.0.0", 7777)