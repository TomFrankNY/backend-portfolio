// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var validUrl = require('valid-url')
// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
const { request } = require('express');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use('/public', express.static(`${process.cwd()}/public`));

// http://expressjs.com/en/starter/basic-routing.html
// app.get("/", function (req, res) {
  //   res.sendFile(__dirname + '/views/index.html');
  // });
  
  app.get("/timestamp", function (req, res) {
    res. sendFile(__dirname + '/views/timestamp.html');
  });
  
  app.get("/requestHeaderParser", function (req, res) {
    res.sendFile(__dirname + '/views/requestHeaderParser.html');
  });
  
  app.get("/urlShortenerMicroservice", function (req, res) {
    res.sendFile(__dirname + '/views/urlShortenerMicroservice.html');
  });
  
  
  // your first API endpoint... 
  app.get("/api/hello", function (req, res) {
    res.json({greeting: 'hello API'});
  });
  
  
  // short url project
  let counter = 0;
  let shortenedUrls = {};
  
app.use(bodyParser.urlencoded({ extended: false}));

app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  // check if url is valid
  if (!validUrl(url)) {
    res.send({ error: 'invalid url'})
    return;
  }
  counter += 1;  
  console.log(url);
  shortenedUrls[counter] = url
  console.log(shortenedUrls);
  res.send({original_url: req.body.url, short_url: counter});
}) 

app.get('/api/shorturl/:id', function(req, res) {
  const id = req.params.id;
  const url = shortenedUrls[id];
  res.redirect(url);
})


// header request project
app.get("/api/whoami", function(req, res){
  res.json({
    "ipaddress": req.connection.remoteAddress,
    "language":req.headers["accept-language"],
    "software":req.headers["user-agent"]
  })
});
// timestamp project
app.get("/api/", function(req, res){
  var now = new Date()
  res.json({
    "unix": now.getTime(),
    "utc": now.toUTCString()
  });
});


app.get("/api/:date", function(req, res){
  let dateString = req.params.date;

  if (parseInt(dateString) > 10000) {
    let unixTime = new Date(parseInt(dateString));
    res.json({
      "unix":unixTime.getTime(),
      "utc": unixTime.toUTCString()
    }); 

  }

  let passedInValue = new Date(dateString);

  if (passedInValue == "Invalid Date") {
    res.json({"error" : "Invalid Date" });
  } else {
    res.json({
      "unix": passedInValue.getTime(),
      "utc": passedInValue.toUTCString()
    })
  }

});


// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
