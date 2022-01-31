const express = require("express");
const bodyParser = require("body-parser");

const fs = require("fs");
const path = require("path");
const app = express();

const PORT = 9090;
const BASE_PATH = path.join(__dirname, "public");

console.log(BASE_PATH);

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

function getAPIFilePath(req) {
	const dir = req.params.resources;
	const id = req.params.id;
	const basename = path.basename(id, ".json");
  console.log(BASE_PATH, dir)
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

app.put("/api/:resources/:id", function (req, res) {
  console.log("-- on put", req.body);
	const filePath = getAPIFilePath(req);

	if (!fs.existsSync(filePath)) {
		res.sendStatus(404);
		return;
	}

	const json = JSON.stringify(req.body);
	fs.writeFile(filePath, json, "utf8", function () {
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


app.post('/file_upload', function (req, res) {
  console.log(req.files[0]);  // 上传的文件信息

  let des_file = path.join(BASE_PATH, "uploads", req.files[0].originalname);
  fs.readFile( req.files[0].path, function (err, data) {
    fs.writeFile(des_file, data, function (err) {
      if( err ){
        console.log( err );
      }else{
        response = {
          message:'File uploaded successfully', 
          filename:req.files[0].originalname
        };
      }
      console.log( response );
      res.end( JSON.stringify( response ) );
    });
  });
});

const server = app.listen(PORT, function () {
	const { address, port } = server.address();

	console.log("url: http://%s:%s", address, port);
});
