const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");

const fs = require("fs");
const path = require("path");
const app = express();

const PORT = 9090;
const BASE_PATH = path.join(__dirname, "public");

app.use(express.static(BASE_PATH));
app.use(fileUpload());

// const jsonParser = bodyParser.json();
// app.use(jsonParser);

app.use(bodyParser.text());

app.get("/", function (req, res) {
	res.send("Hello World!");
});

function createDir(dirPath) {
	// const dirPath = path.join(BASE_PATH, dir);
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

function getAPIFilePath(req) {
	const dir = req.params.resources;
	const id = req.params.id;
	console.log(dir, id);
	// const basename = path.basename(id, ".json");
	const basename = path.basename(id);
	return path.join(BASE_PATH, dir, basename);
}

app.post("/api/upload", (req, res) => {
	if (!req.files) {
		return res.status(500).send({ msg: "file is not found" });
	}
	// accessing the file
	const file = req.files.file;

	const dirName = randomKey();
	const dirPath = path.join(BASE_PATH, "uploads", dirName);
	createDir(dirPath);

	const filePath = path.join(BASE_PATH, "uploads", dirName, file.name);
	const publicPath = path.join("/uploads", dirName, file.name);

	//  mv() method places the file inside public directory
	file.mv(filePath, function (err) {
		if (err) {
			console.log(err);
			return res.status(500).send({ msg: "Error occured" });
		}
		// returing the response with file path and name
		return res.json({ name: file.name, path: publicPath });
	});
});

// index
app.get("/api/:resources", function (req, res) {
	const resources = req.params.resources;
	const ext = path.extname(resources);
	if (ext === "") {
		console.log("file extension is required.");
		res.sendStatus(400);
		return;
	}

	const dirName = path.basename(resources, ext);
	const dirPath = path.join(BASE_PATH, dirName);

	if (!fs.existsSync(dirPath)) {
		res.sendStatus(404);
		return;
	}

	const files = fs
		.readdirSync(dirPath)
		.map((file) => {
			const filename = path.basename(file);
			const { birthtime, mtime, size } = fs.statSync(
				path.join(dirPath, file),
			);
			return {
				filename,
				birthtime,
				mtime,
				size,
			};
		})
		.filter((obj) => path.extname(obj.filename) === ext);

	res.json(files);
});

// create resource
// POST /api/entries.json  # will create json file
app.post("/api/:resources", function (req, res) {
	const resources = req.params.resources;
	const ext = path.extname(resources);
	if (ext === "") {
		console.log("file extension is required.");
		res.sendStatus(400);
		return;
	}

	const dirName = path.basename(resources, ext);
	const dirPath = path.join(BASE_PATH, dirName);
	createDir(dirPath);

	const key = randomKey();
	const fileName = key + ext;
	const filePath = path.join(BASE_PATH, dirName, fileName);
	const publicPath = path.join("/", dirName, fileName);

	let content = req.body;

	fs.writeFile(filePath, content, "utf8", function () {
		res.send({ id: key, path: publicPath });
	});
});

// show
app.get("/api/:resources/:id", function (req, res) {
	const filePath = getAPIFilePath(req);
	console.log(filePath);

	if (!fs.existsSync(filePath)) {
		res.sendStatus(404);
		return;
	}

	// TODO: check file under BASE_PATH
	// res.sendFile(filePath, { root: __dirname });
	res.sendFile(filePath);
});

// update resource
app.put("/api/:resources/:id", function (req, res) {
	const dirName = req.params.resources;
	const dirPath = path.join(BASE_PATH, dirName);
	createDir(dirPath);

	const filePath = getAPIFilePath(req);
	console.log(filePath);

	// const json = JSON.stringify(req.body);
	const content = req.body;
	fs.writeFile(filePath, content, "utf8", function () {
		// TODO: check file under BASE_PATH
		// res.sendFile(filePath, { root: __dirname });
		res.sendFile(filePath);
	});
});

app.delete("/api/:resources/:id", function (req, res) {
	const filePath = getAPIFilePath(req);
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
