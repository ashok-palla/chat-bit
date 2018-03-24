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
  if (req.body.result.metadata.intentName === "shift_my_pc - checking_employee_ID") {
    data_layer.shift_my_pc(req.body.result.contexts[3].parameters, (results) => {
      if (results[''] === '' || results === '') {
        return res.status(200).json({
          speech: 'I couldn\'t find your employee ID, can you please repeat it again',
          displayText: 'I couldn\'t find your employee ID, can you please repeat it again',
          source: "meritus-bot"
        });
      }
      mailer.sendMail({
        to: '"' + (results.name).toLocaleLowerCase() + '" <' + results.emailID + '>',
        subject: results.emailSubject,
        text: results.name + ', a request has been initiated on you behalf with a tracking number ' + results.token
      });
      return res.status(200).json({
        speech: results.name + ', a request has been initiated on you behalf with a tracking number ' + results.token,
        displayText: results.name + ', a request has been initiated on you behalf with a tracking number ' + results.token,
        source: "meritus-bot"
      });
    });
  }
  else if (req.body.result.metadata.intentName === "know_employee_info_by_name") {
    data_layer.employeeSearch(req.body.result.parameters, (results) => {
      return res.status(200).json({
        speech: results,
        displayText: results,
        source: "meritus-bot"
      });
    });
  }
  // Start: Check Employee ID Exist or Not
  else if (req.body.result.metadata.intentName === "domain_issues - custom - custom - custom") {
    data_layer.employeeIdCheck(req.body.result.parameters.employeeId, (results) => {
      if (results.length === 1) {
        return res.status(200).json({
          speech: 'Thank you. we have sent an email to ' + (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ' seeking approval to provide you domain access. once approved we will be given access within 4 hours. \nMeanwhile, you can check the status of your request using the tracking number',
          displayText: 'Thank you. we have sent an email to ' + (results[0].FirstName + ' ' + results[0].LastName).toLocaleLowerCase() + ' seeking approval to provide you domain access. once approved we will be given access within 4 hours. \nMeanwhile, you can check the status of your request using the tracking number',
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
  // Start: Check Employee ID Exist or Not
  else if (req.body.result.metadata.intentName === "domain_issues - custom") {
    data_layer.employeeIdCheck(req.body.result.parameters.employeeId, (results) => {
      if (results.length === 1) {
        return res.status(200).json({
          speech: 'Thank you. Please share the domain name to which access is required.',
          displayText: 'Thank you. Please share the domain name to which access is required.',
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
  // Start: Check Employee ID Exist or Not
  else if (req.body.result.action === "check_employeeid") {
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
        if (results.length === 0) {
          var result = {
            speech: ('no employee exists on ' + req.body.result.parameters.employeeId),
            display: ('no employee exists on ' + req.body.result.parameters.employeeId)
          };
          return res.status(200).json(result);
        }
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
                "items": [{
                  "simpleResponse": {
                    "ssml": results.length > 0 ? "<speak><say-as interpret-as=\"digits\">" + req.body.result.parameters.employeeId + "</say-as> is " + (results[0].FirstName + " " + results[0].LastName).toLocaleLowerCase() + "\'s employee identification number.</speak>" : ('no employee exists on ' + req.body.result.parameters.employeeId),
                  }
                },
                {
                  "basicCard": {
                    "title": (results[0].FirstName + ' ' + results[0].LastName),
                    "subtitle": results[0].Designation,
                    // "formattedText": "**First Name:** " + results[0].FirstName + ", \n"
                    //   + "**Last Name:** " + results[0].LastName,
                    "image": {
                      "url": results[0].imageUrl !== null ? results[0].imageUrl : "http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg",
                      "accessibilityText": (results[0].FirstName + ' ' + results[0].LastName)
                    },
                    "imageDisplayOptions": "DEFAULT"
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
            source: "meritus-bot",
            "data": {
              "google": {
                "expectUserResponse": true,
                "richResponse": {
                  "items": [{
                    "simpleResponse": {
                      "textToSpeech": result.speech
                    }
                  },
                  {
                    "basicCard": {
                      "title": (results[0].FirstName + ' ' + results[0].LastName),
                      "subtitle": results[0].Designation,
                      // "formattedText": "**First Name:** " + results[0].FirstName + ", \n"
                      //   + "**Last Name:** " + results[0].LastName,
                      "image": {
                        "url": results[0].imageUrl !== null ? results[0].imageUrl : "http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg",
                        "accessibilityText": (results[0].FirstName + ' ' + results[0].LastName)
                      },
                      "imageDisplayOptions": "DEFAULT"
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
        } else if (results.length > 1) {
          var items = [];
          var concatString = '';
          results.forEach((item, key) => {
            concatString += (key + 1) + '.' + (item.FirstName + ' ' + item.LastName).toLocaleLowerCase() + '\n';
            items.push({
              "optionInfo": {
                "key": "who is " + item.empId
              },
              "description": item.Designation,
              "image": {
                "url": item.imageUrl !== null ? item.imageUrl : "http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg",
                "accessibilityText": (item.FirstName + ' ' + item.LastName).toLocaleLowerCase()
              },
              "title": (key + 1) + '. ' + (item.FirstName + ' ' + item.LastName).toLocaleLowerCase()
            });
          });
          var listOrCru = { "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec" }
          results.length < 10 ? (listOrCru['carouselSelect'] = { "items": items }) : (listOrCru['listSelect'] = { "items": items });
          return res.status(200).json({
            speech: 'oh there is ' + results.length + ' ' + req.body.result.parameters.employeeName + '\'s check the list',
            displayText: concatString,
            source: "meritus-bot",
            "data": {
              "google": {
                "expectUserResponse": false,
                "richResponse": {
                  "items": [{
                    "simpleResponse": {
                      "textToSpeech": 'oh there is ' + results.length + ' ' + req.body.result.parameters.employeeName + '\'s check the list'
                    }
                  }]
                },
                "systemIntent": {
                  "intent": "actions.intent.OPTION",
                  "data": listOrCru
                }
              }
            }
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
            source: "meritus-bot",
            "data": {
              "google": {
                "expectUserResponse": true,
                "richResponse": {
                  "items": [{
                    "simpleResponse": {
                      "textToSpeech": result.speech
                    }
                  },
                  {
                    "basicCard": {
                      "title": (results[0].FirstName + ' ' + results[0].LastName),
                      "subtitle": results[0].Designation,
                      // "formattedText": "**First Name:** " + results[0].FirstName + ", \n"
                      //   + "**Last Name:** " + results[0].LastName,
                      "image": {
                        "url": results[0].imageUrl !== null ? results[0].imageUrl : "http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg",
                        "accessibilityText": (results[0].FirstName + ' ' + results[0].LastName)
                      },
                      "imageDisplayOptions": "DEFAULT"
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
        } else if (results.length > 1) {
          var items = [];
          var concatString = '';
          results.forEach((item, key) => {
            concatString += (key + 1) + '.' + (item.FirstName + ' ' + item.LastName).toLocaleLowerCase() + '\n';
            items.push({
              "optionInfo": {
                "key": "who is " + item.empId
              },
              "description": item.Designation,
              "image": {
                "url": item.imageUrl !== null ? item.imageUrl : "http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg",
                "accessibilityText": (item.FirstName + ' ' + item.LastName).toLocaleLowerCase()
              },
              "title": (key + 1) + '. ' + (item.FirstName + ' ' + item.LastName).toLocaleLowerCase()
            });
          });
          var listOrCru = { "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec" }
          results.length < 10 ? (listOrCru['carouselSelect'] = { "items": items }) : (listOrCru['listSelect'] = { "items": items });
          return res.status(200).json({
            speech: 'oh there is ' + results.length + ' ' + req.body.result.parameters.employeeName + '\'s check the list',
            displayText: concatString,
            source: "meritus-bot",
            "data": {
              "google": {
                "expectUserResponse": false,
                "richResponse": {
                  "items": [
                    {
                      "simpleResponse": {
                        "textToSpeech": 'oh there is ' + results.length + ' ' + req.body.result.parameters.employeeName + '\'s check the list'
                      }
                    }]
                },
                "systemIntent": {
                  "intent": "actions.intent.OPTION",
                  "data": listOrCru
                }
              }
            }
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
