// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var isUrl = require('is-url')
var cors = require('cors');
var mongoose = require('mongoose')
const { Schema } = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
  });  
  
 
  app.get("/timestamp", function (req, res) {
    res. sendFile(__dirname + '/views/timestamp.html');
  });
  
  app.get("/requestHeaderParser", function (req, res) {
    res.sendFile(__dirname + '/views/requestHeaderParser.html');
  });
  
  app.get("/urlShortenerMicroservice", function (req, res) {
    res.sendFile(__dirname + '/views/urlShortenerMicroservice.html');
  });
  
  app.get("/exerciseTracker", function (req, res) {
    res.sendFile(__dirname + '/views/exerciseTracker.html');
  });
  
  
  // your first API endpoint... 
  app.get("/api/hello", function (req, res) {
    res.json({greeting: 'hello API'});
  });
  
// exercise tracker project
const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  logs: [{
    date: String,
    duration: Number,
    description: String
  }],
  count: Number
})

const User = mongoose.model("User", userSchema);
// const Exercise = mongoose.model("Exercise", exerciseSchema);

app.route("/api/users")
  .post ((req, res) => {
    const username = req.body.username
    const user = new User ({ username })
    user.save((err, data) => {
      if (err) {
        res.json({error: err})
      }
      res.json(data)
    })
})

  .get((req, res) => {
    User.find((err, data) => {
      if (data) {
        res.json(data)
      }
    })
  })

  app.post('/api/users/:_id/exercises', (req, res) =>{
    const { description } = req.body
    const duration = parseInt(req.body.duration)
    const date = req.body.date ? "Mon Jan 02 1991" : "Mon Jan 01 2020"
    const id = req.params._id

  const exercise = {
    date,
    duration,
    description,
  }

    User.findByIdAndUpdate(id, { $push: { logs: exercise} }, {new:true}, (err, user) => {
    if (user){
      const updatedExercise = {
        _id: id,
        username: user.username,
        ...exercise
      };
    }
    })
  })
    // User.findById(id, (err, user) => {
    //   if (user) {
    //     const username = user.username;
    //     const exercise = {
    //       description,
    //       duration,
    //       date,
    //     }

    //     if (!user.log) {
    //       user.log = [exercise]
    //     }
        
    //       user.log.push(exercise)
        
    //     user.save((err, data) => {
    //       if (data) {
    //         exercise.username = username
    //         exercise._id = id
    //         res.json(exercise)
    //       }
    //     })
    //   }
    // })
  // })
  //       res.send("Could not find user");
  //     }else{
  //       const newExercise = new Exercise({
  //         userId: id,
  //         description,
  //         duration,
  //         date: new Date(date)
  //       })
  //       newExercise.save((err, data) => {
  //         if(err || !data){
  //           res.send("There was an error saving this exercise")
  //         }else {
  //           const { description, duration, date, _id} = data;
  //           res.json({
  //             username: userData.username,
  //             description,
  //             duration,
  //             date: date.toDateString(),
  //             _id: userData.id
  //         })
  //         }
  //       })
  //     }
  //   })
  // })
  
  // app.get("/api/users/:id/logs", (req, res) =>{
  //   const { from, to, limit } = req.query;
  //   const {id} = req.params;
  //   User.findById(id, (err, userData) => {
  //     if(err || !userData){
  //       res.send("Could not find user");
  //     }else{
  //       let dateObj = {}
  //         if(from){
  //           dateObj["$gte"] = new Date(from)
  //         }
  //         if(to){
  //           dateObj["$lte"] = new Date(to)
  //         }
        
  //       let filter = {
  //         userId: id
  //       }
  //       if(from || to){
  //         filter.date = dateObj
  //       }
  //       let nonNullLimit = limit ?? 500
  //       Exercise.find(filter).limit(+nonNullLimit).exec((err, data) => {
  //         if(err || !data){
  //           res.json([])
  //         }else{
  //           const count = data.length
  //           const rawLog = data
  //           const {username, _id} = userData;
  //           const log = rawLog.map((l) => ({
  //             description: l.description,
  //             duration: l.duration,
  //             date: l.date.toDateString()
  //           }))
  //           res.json({username, count, _id, log})
  //         }
  //       })
  //     }
  //     })
  // })

  app.get('/mongo-health', (req, res) => {
    res.json({ status: mongoose.connection.readyState
    })
  })
  
  // short url project
  let counter = 0;
  let shortenedUrls = {};
  


app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  // check if url is valid
  if (!isUrl(url)) {
    res.json({ error: 'invalid url'});
    return;
  }
  counter += 1;  
  shortenedUrls[counter] = url
  res.json({original_url: req.body.url, short_url: counter});
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
