var sys = require('sys')
var exec = require('child_process').exec;

const path = require('path');
const express = require('express');
const app = express();
const publicPath = path.join(__dirname, '../build');

app.use(express.static(publicPath));

app.get('/cmd', (req, res) => {
    console.log("Executing command:",req.query.cmd.json_graph);
    exec(req.query.cmd.json_graph, function(err, stdout, stderr) {
        console.log("Executing result:",stdout);
        res.send(stdout);
    });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('index.html', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(3000, () => {
  console.log('Server is up!');
});
