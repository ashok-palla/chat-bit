var express = require("express");
var bodyParser = require("body-parser");
var restService = express();
restService.use(bodyParser.urlencoded({
  extended: true
}));
restService.use(bodyParser.json());
var data_layer = require('./dataLayer');
var mailer = require('./nodemailer');

restService.use(errorHandler);
restService.use(function (req, res, next) {
  next();
});

function errorHandler(err, req, res, next) {
  console.log(err);
}
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

restService.post('/meritus_bot', function (req, res) {
  // Start: Check Employee ID Exist or Not
  if (req.body.result.action === "check_employeeid") {
    data_layer.employeeIdCheck(req.body.result.parameters.employeeId, (results) => {
      if (results.length === 1) {
        mailer.sendMail({
          to: '"' + (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ' 👻" <ashok_palla@merilytics.com>',
          subject: "Meritus Bot OTP",
          text: Math.floor(Math.random() * (999999 - (111111 + 1)) + 111111)
        });
        return res.status(200).json({
          speech: (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ', \ni found ' + results[0].EmailID + ' is your email. \nI sent OTP to your mail please check and enter OTP',
          displayText: (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ', \ni found ' + results[0].EmailID + ' is your email. \nI sent OTP to your mail please check and enter OTP',
          source: "meritus-bot"
        });
      } else {
        return res.status(200).json({
          speech: results,
          displayText: results,
          source: "meritus-bot"
        });
      }
    });
  }
  // End: Check Employee ID Exist or Not
  else if (req.body.result.metadata.intentName === "whose_employee_id") {
    if (req.body.result && req.body.result.parameters && req.body.result.parameters.employeeId === "" && req.body.result.parameters.employeeName === "" && req.body.result.parameters.lastName === "") {
      return res.status(200).json({
        speech: 'some of the times i am very difficult to find your question, please try different way',
        displayText: 'some of the times i am very difficult to find your question, please try different way',
        source: "meritus-bot"
      });
    } else if (req.body.result && req.body.result.parameters && req.body.result.parameters.employeeId) {
      data_layer.employeeId(req.body.result.parameters.employeeId, (results) => {
        var result = {
          speech: results.length > 0 ? req.body.result.parameters.employeeId + ' is ' + (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + '\'s employee identification number.' : ('no employee exists on ' + req.body.result.parameters.employeeId),
          display: results.length > 0 ? req.body.result.parameters.employeeId + ' is ' + (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + '\'s employee identification number.' : ('no employee exists on ' + req.body.result.parameters.employeeId)
        };
        return res.status(200).json({
          speech: result.speech,
          displayText: result.display,
          source: "meritus-bot",
          "data": {
            "google": {
              "expectUserResponse": true,
              "richResponse": {
                "items": [
                  {
                    "simpleResponse": {
                      "textToSpeech": result.speech
                    }
                  },
                  {
                    "basicCard": {
                      "title": (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase(),
                      "formattedText": "42 is an even composite number. It\n    is composed of three distinct prime numbers multiplied together. It\n    has a total of eight divisors. 42 is an abundant number, because the\n    sum of its proper divisors 54 is greater than itself. To count from\n    1 to 42 would take you about twenty-one…",
                      "image": {
                        "url": "data:image/jpeg;base64,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",
                        "accessibilityText": (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase()
                      },
                      "imageDisplayOptions": "WHITE"
                    }
                  }
                ]
              }
            },
            "slack": {
              "text": result.speech
            },
          }
        });
      });
    } else if (req.body.result && req.body.result.parameters && req.body.result.parameters.employeeName && req.body.result.parameters.lastName !== "") {
      data_layer.employeeName_lastName(req.body.result.parameters.employeeName, req.body.result.parameters.lastName, (results) => {
        if (results.length === 0) {
          return res.status(200).json({
            speech: ('no employee exists on ' + req.body.result.parameters.employeeName),
            displayText: ('no employee exists with text of ' + req.body.result.parameters.employeeName),
            source: "meritus-bot"
          });
        } else if (results.length === 1) {
          var result = {
            speech: 'I found ' + (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ' is a ' + (results[0].Designation).toLocaleLowerCase(),
            display: 'I found ' + (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ' is a ' + (results[0].Designation).toLocaleLowerCase()
          };
          return res.status(200).json({
            speech: result.speech,
            displayText: result.display,
            source: "meritus-bot"
          });
        } else if (results.length > 1) {
          var concatString = '';
          results.forEach((item, key) => {
            concatString += (key + 1) + '.' + (item.FirstName + ' ' + item.LastName).toLocaleLowerCase() + '\n';
          });
          return res.status(200).json({
            speech: 'oh there is ' + results.length + ' ' + req.body.result.parameters.employeeName + '\'s check the list',
            displayText: concatString,
            source: "meritus-bot"
          });
        } else {
          return res.status(200).json({
            speech: 'there',
            displayText: 'there',
            source: "meritus-bot"
          });
        }
      });
    } else if (req.body.result && req.body.result.parameters && req.body.result.parameters.employeeName) {
      data_layer.employeeName(req.body.result.parameters.employeeName, (results) => {
        if (results.length === 0) {
          return res.status(200).json({
            speech: ('no employee exists on ' + req.body.result.parameters.employeeName),
            displayText: ('no employee exists with text of ' + req.body.result.parameters.employeeName),
            source: "meritus-bot"
          });
        } else if (results.length === 1) {
          var result = {
            speech: 'I found ' + (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ' is a ' + (results[0].Designation).toLocaleLowerCase(),
            display: 'I found ' + (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ' is a ' + (results[0].Designation).toLocaleLowerCase()
          };
          return res.status(200).json({
            speech: result.speech,
            displayText: result.display,
            source: "meritus-bot"
          });
        } else if (results.length > 1) {
          var concatString = '';
          results.forEach((item, key) => {
            concatString += (key + 1) + '.' + (item.FirstName + ' ' + item.LastName).toLocaleLowerCase() + '\n';
          });
          return res.status(200).json({
            speech: 'oh there is ' + results.length + ' ' + req.body.result.parameters.employeeName + '\'s check the list',
            displayText: concatString,
            source: "meritus-bot"
          });
        } else {
          return res.status(200).json({
            speech: 'there',
            displayText: 'there',
            source: "meritus-bot"
          });
        }
      });
    }
  } else if (req.body.result.metadata.intentName === "register_me_next") {
    if (req.body.result && req.body.result.parameters && req.body.result.parameters.email) {
      var isMerEmail = req.body.result.parameters.email.split('@')[1];
      if (isMerEmail === 'merilytics.com') {
        data_layer.emailCheck(req.body.result.parameters.email, (results) => {
          if (results.length === 0) {
            return res.status(200).json({
              speech: ('no employee exists on ' + req.body.result.parameters.employeeName),
              displayText: ('no employee exists with text of ' + req.body.result.parameters.employeeName),
              source: "meritus-bot"
            });
          } else if (results.length === 1) {
            var result = {
              speech: (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ', \nyou are already registered employee and your employee identification is ' + results[0].ID,
              display: (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ', \nyou are already registered employee and your employee identification is ' + results[0].ID
            };
            return res.status(200).json({
              speech: result.speech,
              displayText: result.display,
              source: "meritus-bot"
            });
          }
        });
      } else {
        return res.status(200).json({
          speech: 'please enter merilytics email only',
          displayText: 'please enter merilytics email only',
          source: "meritus-bot"
        });
      }
    }
  } else {
    return res.status(200).json({
      speech: 'i did\'t get you',
      displayText: 'i did\'t get you',
      source: "meritus-bot"
    });
  }
});
restService.post("/echo", function (req, res) {
  var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again.";
  return res.json({
    speech: speech,
    displayText: speech,
    source: "meritus-bot"
  });
});

restService.post("/audio", function (req, res) {
  var speech = "";
  switch (req.body.result.parameters.AudioSample.toLowerCase()) {
    //Speech Synthesis Markup Language 
    case "music one":
      speech =
        '<speak><audio src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
      break;
    case "music two":
      speech =
        '<speak><audio clipBegin="1s" clipEnd="3s" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
      break;
    case "music three":
      speech =
        '<speak><audio repeatCount="2" soundLevel="-15db" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
      break;
    case "music four":
      speech =
        '<speak><audio speed="200%" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
      break;
    case "music five":
      speech =
        '<audio src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio>';
      break;
    case "delay":
      speech =
        '<speak>Let me take a break for 3 seconds. <break time="3s"/> I am back again.</speak>';
      break;
    //https://www.w3.org/TR/speech-synthesis/#S3.2.3
    case "cardinal":
      speech = '<speak><say-as interpret-as="cardinal">12345</say-as></speak>';
      break;
    case "ordinal":
      speech =
        '<speak>I stood <say-as interpret-as="ordinal">10</say-as> in the class exams.</speak>';
      break;
    case "characters":
      speech =
        '<speak>Hello is spelled as <say-as interpret-as="characters">Hello</say-as></speak>';
      break;
    case "fraction":
      speech =
        '<speak>Rather than saying 24+3/4, I should say <say-as interpret-as="fraction">24+3/4</say-as></speak>';
      break;
    case "bleep":
      speech =
        '<speak>I do not want to say <say-as interpret-as="bleep">F&%$#</say-as> word</speak>';
      break;
    case "unit":
      speech =
        '<speak>This road is <say-as interpret-as="unit">50 foot</say-as> wide</speak>';
      break;
    case "verbatim":
      speech =
        '<speak>You spell HELLO as <say-as interpret-as="verbatim">hello</say-as></speak>';
      break;
    case "date one":
      speech =
        '<speak>Today is <say-as interpret-as="date" format="yyyymmdd" detail="1">2017-12-16</say-as></speak>';
      break;
    case "date two":
      speech =
        '<speak>Today is <say-as interpret-as="date" format="dm" detail="1">16-12</say-as></speak>';
      break;
    case "date three":
      speech =
        '<speak>Today is <say-as interpret-as="date" format="dmy" detail="1">16-12-2017</say-as></speak>';
      break;
    case "time":
      speech =
        '<speak>It is <say-as interpret-as="time" format="hms12">2:30pm</say-as> now</speak>';
      break;
    case "telephone one":
      speech =
        '<speak><say-as interpret-as="telephone" format="91">09012345678</say-as> </speak>';
      break;
    case "telephone two":
      speech =
        '<speak><say-as interpret-as="telephone" format="1">(781) 771-7777</say-as> </speak>';
      break;
    // https://www.w3.org/TR/2005/NOTE-ssml-sayas-20050526/#S3.3
    case "alternate":
      speech =
        '<speak>IPL stands for <sub alias="indian premier league">IPL</sub></speak>';
      break;
  }
  return res.json({
    speech: speech,
    displayText: speech,
    source: "meritus-bot"
  });
});

restService.post("/video", function (req, res) {
  return res.json({
    speech: '<speak>  <audio src="http://123telugump3.net/load/A-to-Z/A/Abhimanyudu-(2018)//.48Kbps/01_-_Adige_(From_Abhimanyudu).mp3">did not get your MP3 audio file</audio></speak>',
    displayText: '<speak>  <audio src="http://123telugump3.net/load/A-to-Z/A/Abhimanyudu-(2018)//.48Kbps/01_-_Adige_(From_Abhimanyudu).mp3">did not get your MP3 audio file</audio></speak>',
    source: "meritus-bot"
  });
});

restService.post("/slack-test", function (req, res) {
  var slack_message = {
    text: "Details of JIRA board for Browse and Commerce",
    attachments: [{
      title: "JIRA Board",
      title_link: "http://www.google.com",
      color: "#36a64f",

      fields: [{
        title: "Epic Count",
        value: "50",
        short: "false"
      },
      {
        title: "Story Count",
        value: "40",
        short: "false"
      }
      ],

      thumb_url: "https://stiltsoft.com/blog/wp-content/uploads/2016/01/5.jira_.png"
    },
    {
      title: "Story status count",
      title_link: "http://www.google.com",
      color: "#f49e42",

      fields: [{
        title: "Not started",
        value: "50",
        short: "false"
      },
      {
        title: "Development",
        value: "40",
        short: "false"
      },
      {
        title: "Development",
        value: "40",
        short: "false"
      },
      {
        title: "Development",
        value: "40",
        short: "false"
      }
      ]
    }
    ]
  };
  return res.json({
    speech: "speech",
    displayText: "speech",
    source: "meritus-bot",
    data: {
      slack: slack_message
    }
  });
});

restService.listen(process.env.PORT || 8002, function () {
  console.log("Server up and listening");
});
