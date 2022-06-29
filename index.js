// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var port = process.env.PORT;
var bodyParser = require('body-parser');
var isUrl = require('is-url');
var cors = require('cors');
var mongoose = require('mongoose');
const { Schema } = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
// app.use(cors())
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }))
// app.use(express.json())

// http://expressjs.com/en/starter/basic-routing.html

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
  
  app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
  });   
   
 

  // your first API endpoint... 
  app.get("/api/hello", function (req, res) {
    res.json({greeting: 'hello API'});
  });
  
// // exercise tracker project

const userSchema = new Schema ({
  "username": String,
})

const exerciseSchema = new Schema({
 "username": String,
 "date": Date,
 "duration": Number,
 "description": String,
})

const logSchema = new Schema({
 "username": String,
 "count": Number,
 "log": Array,
})

const UserInfo = mongoose.model('userInfo', userSchema);
const ExerciseInfo = mongoose.model('exerciseInfo', exerciseSchema);
const LogInfo = mongoose.model('logInfo', logSchema);

app.post('/api/users', (req, res) => {
  UserInfo.find({ "username": req.body.username}, (err, userData) => {
    if (err) {
      console.log("Error with server=> ", err)
    } else {
      if (userData.length === 0) {
        const test = new UserInfo({
          "_id": req.body.id,
          "username": req.body.username,
        })

        test.save((err, data) => {
          if (err) {
            console.log("Error saving data=> ", err)
          } else {
            res.json({
              "_id": data.id,
              "username": data.username,
            })
          }
        })
      } else {
        res.send("Username already Exists")
      }
    }
  })
})

  // #2
app.post('/api/users/:_id/exercises', (req, res) => {
  let idJson = { "id": req.params._id};
  let checkedDate = new Date(req.body.date);
  let idToCheck = idJson.id;

  let noDateHandler = () => {
    if (checkedDate instanceof Date && !isNaN(checkedDate)) {
      return checkedDate
    } else {
      checkedDate = new Date();
    }
  }

  UserInfo.findById(idToCheck, (err, data) => {
    noDateHandler(checkedDate);

    if (err) {
      console.log("error with id=> ", err);
    } else {
      const test = new ExerciseInfo({
        "username": data.username,
        "description": req.body.description,
        "duration": req.body.duration,
        "date": checkedDate.toDateString(),
      })

      test.save((err, data) => {
        if (err) {
          console.log("error saving=> ", err);
        } else {
          console.log("saved exercise successfully");
          res.json({
            "_id": idToCheck,
            "username": data.username,
            "description": data.description,
            "duration": data.duration,
            "date": data.date.toDateString(),
          })
        }
      })
    }
  })
})

  // #3

app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query;
  let idJson = { "id": req.params._id };
  let idToCheck = idJson.id;

  // Check ID
  UserInfo.findById(idToCheck, (err, data) => {
    var query = {
      username: data.username
    }

    if (from !== undefined && to === undefined) {
      query.date = { $gte: new Date(from)}
    } else if (to !== undefined && from === undefined) {
      query.date = { $lte: new Date(to) }
    } else if (from !== undefined && to !== undefined) {
      query.date = { $gte: new Date(from), $lte: new Date(to)}
    }

    let limitChecker = (limit) => {
      let maxLimit = 100;
      if (limit) {
        return limit;
      } else {
        return maxLimit
      }
    }

    if (err) {
      console.log("error with ID=> ", err)
    } else {
  
      ExerciseInfo.find((query), null, {limit: limitChecker(+limit)}, (err, docs) => {
        let loggedArray = [];
        if (err) {
          console.log("error with query=> ", err);
        } else {
  
          let documents = docs;
          let loggedArray = documents.map((item) => {
            return {
              "description": item.description,
              "duration": item.duration,
              "date": item.date.toDateString()
            }
          })
  
          const test = new LogInfo({
            "username": data.username,
            "count": loggedArray.length,
            "log": loggedArray,
          })
  
          test.save((err, data) => {
            if (err) {
              console.log("error saving exercise=> ", err)
            } else {
              console.log("saved exercise successfully");
              res.json({
                "_id": idToCheck,
                "username": data.username,
                "count": data.count,
                "log": loggedArray
              })
            }
          })
        }
      })
    }
  })
})

  // #4
app.get('/api/users', (req, res) => {
  UserInfo.find({}, (err, data) => {
    if (err) {
      res.send("No Users");
    } else {
      res.json(data);
    }
  })
})


// // const userSchema = new Schema({
// //   username: {
// //     type: String,
// //     required: true
// //   },
// //   log: [{
// //     date: String,
// //     duration: Number,
// //     description: String
// //   }],
// //   count: Number
// // });

// // const User = mongoose.model("User", userSchema);
// // // const Exercise = mongoose.model("Exercise", exerciseSchema);

// // app.route("/api/users")
// //   .post ((req, res) => {
// //     const username = req.body.username
// //     const user = new User ({ username, count: 0 })
// //     user.save((err, data) => {
// //       if (err) {
// //         res.json({error: err})
// //       }
// //       res.json(data)
// //     })
// // })
// //   .get((req, res) => {
// //     User.find((err, data) => {
// //       if (data) {
// //         res.json(data)
// //       }
// //     })
// //   })

// //   app.post('/api/users/:_id/exercises', (req, res) =>{
// //     const { description } = req.body
// //     const duration = parseInt(req.body.duration)
// //     // const date = req.body.bdate ? 'Mon Jan 01 1990' : 'Thu Nov 04 2021'
// //     const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
// //     const id = req.params._id

// //   const exercise = {
// //     date,
// //     duration,
// //     description,
// //   }

// //     User.findByIdAndUpdate(id, { 
// //       $push: { log: exercise }, 
// //       $inc: {count: 1} 
// //     }, {new:true}, (err, user) => {
// //     if (user){
// //       const updatedExercise = {
// //         _id: id,
// //         username: user.username,
// //         ...exercise,
// //       };
// //       res.json(updatedExercise)
// //     }
// //     })
// //   })


// //   app.get('/api/users/:_id/logs', (req, res) => {
// //     const { from, to, limit } = req.query

// //     User.findById(req.params._id, (err, user) =>{
// //       if (user) {
// //         if (from || to || limit) {
// //           const logs = user.log
// //           const filteredLogs = logs
// //         .filter(log => {
// //           const formattedLogDate = (new Date(log.date))
// //             .toISOString()
// //             .split('T')[0]
// //             return true
// //         })
       
// //         const slicedLogs = limit ? filteredLogs.slice(0, limit) : filteredLogs
// //         user.log = slicedLogs
// //         }
// //         res.json(user)
// //       }
// //     })
// //   })

// //   app.get('/mongo-health', (req, res) => {
// //     res.json({ status: mongoose.connection.readyState
// //     })
// //   })
  

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
// var listener = app.listen(port, function () {
//   console.log('Your app is listening on port ' + listener.address().port);
// });

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log('Your app is listening on port ' + listener.address().port)
// })