/**
 * This is a node.js development server for Amp.
 * It requires Node.js Connect https://github.com/senchalabs/connect
 * 
 * If you want to develop or demo Amp, instead of 
 * opening the index.html file run "node server.js" in your 
 * shell and visit http://localhost:3000.
 * 
 * If you don't/can't have node then just open the index.html file 
 * and remove all "/static" prefixes on included .js and .css files.
**/
var fs      = require('fs');
var path    = require('path');
var connect = require('connect');
var http    = require('http');
var server  = connect();

var countries = JSON.parse( fs.readFileSync("static/data/countries.json") );

server.use(connect.query());
server.use('/static', connect.static( path.join(__dirname + '/static')  ));

server.use('/static', function(req, res, next){
  res.writeHead(404, "Not Found");
  return res.end("Page Not Found");
});

server.use('/grid', function(req, res, next){
  var page = req.query.p;
  var size = req.query.s;

  if(page % 2 === 0){
    res.end(JSON.stringify([
      { "date": "2015-04-11", "disbursement": 1000000, "interestRate": 4.1, "accrued": 44000, "comment": "Second disbursement" },
      { "date": "2016-06-11", "disbursement": 0, "interestRate": 4.4, "accrued": 82000, "comment": "Fifth period" },
      { "date": "2017-05-11", "disbursement": 0, "interestRate": 4.4, "repayment": 1000000, "accrued": 88000, "comment": "Sixth Period and partial repayment." }
    ]));
  }
  else if(page % 3 === 0){
    res.end(JSON.stringify([
      { "date": "2018-05-12", "disbursement": 1000000, "interestRate": 4.1, "accrued": 44000, "comment": "Third disbursement" },
      { "date": "2019-05-13", "disbursement": 0, "interestRate": 4.4, "accrued": 82000, "comment": "Eighth period" },
      { "date": "2020-05-14", "disbursement": 0, "repayment": 2000000, "accrued": 88000, "comment": "Final period and repayment." }
    ]));
  }
  else {
    res.end(JSON.stringify([
      { "date": "2012-05-11", "disbursement": 1000000, "interestRate": 4.1, "accrued": 0, "comment": "Initial disbursement" },
      { "date": "2013-05-11", "disbursement": 0, "interestRate": 4.4, "accrued": 41000, "comment": "First period" },
      { "date": "2014-05-11", "disbursement": 0, "interestRate": 4.4, "accrued": 44000, "comment": "Second period." }
    ]));
  }
});

server.use('/ajax', function(req, res, next){
  setTimeout(function(){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end( JSON.stringify(countries.filter( function(count){return ~count.label.toLowerCase().indexOf(req.query.q.toLowerCase());} ), 'utf-8') );
  }, 100); // Simulate slow server
});

server.use('/data', function(req, res, next){
  setTimeout(function(){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(fs.readFileSync('js/data.json'));
  }, 100); // Simulate slow server
});

server.use('/', function(req, res, next){
  res.writeHead(200, {'Content-Type': 'text/html'});
  fs.createReadStream("index.html").pipe(res);
});

http.createServer(server).listen(3000);
console.log("Development server running at 127.0.0.1:3000. Powered by Node.js " + process.versions.node + ".");
