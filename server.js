const express = require("express");
const bodyParser = require("body-parser");

const fs = require("fs");
const path = require("path");
const app = express();

const PORT = 9090;


// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/*+json' }))

// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))

const jsonParser = bodyParser.json();
app.use(jsonParser);

app.get("/", function(req, res){
  res.send("Hello World!");
});

const BASE_PATH = "./store";

function createDir(dir){
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

app.get("/api/:resources", function(req, res){
  console.log(req.params);
  const dir = req.params.resources;


});

app.post("/api/:resources", function(req, res){
  const dir = req.params.resources;
  createDir(dir);

  const key = randomKey();
	const filePath = path.join(BASE_PATH, dir, `${key}.json`);

	const json = JSON.stringify(req.body);
	fs.writeFile(filePath, json, "utf8", function(){
		res.send(200);
	});

});

app.get("/api/:resources/:id", function(req, res){
  console.log(req.params);
});

app.put("/api/:resources/:id", function(req, res){
  console.log(req.params);
});

app.delete("/api/:resources/:id", function(req, res){
  console.log(req.params);
});


const server = app.listen(PORT, function(){
  const { address, port } = server.address();

  console.log("url: http://%s:%s", address, port);
});

