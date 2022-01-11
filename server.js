const express = require('express');
const app = express();
const PORT = 9090;

app.get("/", function(req, res){
  res.send("Hello World!");
});


const server = app.listen(PORT, function(){
  const { address, port } = server.address();

  console.log("url: http://%s:%s", address, port);
});

