const express = require("express");
const bodyParser = require("body-parser");

const fs = require("fs");
const path = require("path");
const app = express();

const PORT = 9090;
const BASE_PATH = "public";

app.use(express.static(BASE_PATH));

const jsonParser = bodyParser.json();
app.use(jsonParser);

app.get("/", function (req, res) {
	res.send("Hello World!");
});

function createDir(dir) {
	const dirPath = path.join(BASE_PATH, dir);
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath);
	}
}

function randomItem(array) {
	const idx = Math.floor(Math.random() * array.length);
	return array[idx];
}

function randomKey(keyLen = 7) {
	const DOWN_CASE_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
	const UP_CASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
	const NUMBERS = "0123456789".split("");
	const CHARS = [...DOWN_CASE_LETTERS, ...UP_CASE_LETTERS, ...NUMBERS];
	const len = CHARS.length;

	return [
		randomItem(DOWN_CASE_LETTERS),
		...new Array(keyLen - 1).fill().map(() => randomItem(CHARS)),
	].join("");
}

function getFilePath(req) {
	const dir = req.params.resources;
	const id = req.params.id;
	const basename = path.basename(id, ".json");
	return path.join(BASE_PATH, dir, `${basename}.json`);
}

app.get("/api/:resources", function (req, res) {
	console.log(req.params);
	const dir = req.params.resources;
	const dirPath = path.join(BASE_PATH, dir);

	if (!fs.existsSync(dirPath)) {
		res.sendStatus(404);
		return;
	}

	const files = fs.readdirSync(dirPath).map((file) => {
		return path.basename(file, ".json");
	});
	res.json(files);
});

app.post("/api/:resources", function (req, res) {
	const dir = req.params.resources;
	createDir(dir);

	const key = randomKey();
	const filePath = path.join(BASE_PATH, dir, `${key}.json`);
	const publicPath = path.join("/", dir, `${key}.json`);

	const json = JSON.stringify(req.body);
	fs.writeFile(filePath, json, "utf8", function () {
		res.send({ id: key, path: publicPath });
	});
});

app.get("/api/:resources/:id", function (req, res) {
	const filePath = getFilePath(req);

	if (!fs.existsSync(filePath)) {
		res.sendStatus(404);
		return;
	}

	res.sendFile(filePath, { root: __dirname });
});

app.put("/api/:resources/:id", function (req, res) {
	const filePath = getFilePath(req);

	if (!fs.existsSync(filePath)) {
		res.sendStatus(404);
		return;
	}

	const json = JSON.stringify(req.body);
	fs.writeFile(filePath, json, "utf8", function () {
		res.sendFile(filePath, { root: __dirname });
	});
});

app.delete("/api/:resources/:id", function (req, res) {
	const filePath = getFilePath(req);
	console.log(filePath);

	if (!fs.existsSync(filePath)) {
		res.sendStatus(404);
		return;
	}

	fs.unlinkSync(filePath);
	res.json({ msg: "resource deleted" });
});

const server = app.listen(PORT, function () {
	const { address, port } = server.address();

	console.log("url: http://%s:%s", address, port);
});
