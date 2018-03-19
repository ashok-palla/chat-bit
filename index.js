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
          var concatString = '';
          results.forEach((item, key) => {
            concatString += (key + 1) + '.' + (item.FirstName + ' ' + item.LastName).toLocaleLowerCase() + '\n';
          });
          return res.status(200).json({
            speech: 'oh there is ' + results.length + ' ' + req.body.result.parameters.employeeName + '\'s check the list',
            displayText: concatString,
            source: "meritus-bot",
            "data": {
              "google": {
                "expectUserResponse": true,
                "richResponse": {
                  "items": [{
                    "simpleResponse": {
                      "textToSpeech": result.speech
                    }
                  }],
                  "possibleIntents": [{
                    "intent": "assistant.intent.actions.OPTION",
                    "input_value_spec": {
                      "option_value_spec": {
                        "list_select": {
                          "title": "Things to learn about",
                          "items": [{
                              "optionInfo": {
                                "key": "MATH_AND_PRIME",
                                "synonyms": [
                                  "math",
                                  "math and prime",
                                  "prime numbers",
                                  "prime"
                                ]
                              },
                              "title": "Math & prime numbers",
                              "description": "42 is an abundant number because the sum of its proper divisors 54 is greater",
                              "image": {
                                "url": "http://example.com/math_and_prime.jpg",
                                "accessibilityText": "Math & prime numbers"
                              }
                            },
                            {
                              "optionInfo": {
                                "key": "EGYPT",
                                "synonyms": [
                                  "religion",
                                  "egpyt",
                                  "ancient egyptian"
                                ]
                              },
                              "title": "Ancient Egyptian religion",
                              "description": "42 gods who ruled on the fate of the dead in the afterworld. Throughout the under",
                              "image": {
                                "url": "http://example.com/egypt",
                                "accessibilityText": "Egypt"
                              }
                            },
                            {
                              "optionInfo": {
                                "key": "RECIPES",
                                "synonyms": [
                                  "recipes",
                                  "recipe",
                                  "42 recipes"
                                ]
                              },
                              "title": "42 recipes with 42 ingredients",
                              "description": "Here is a beautifully simple recipe that is full of flavor! All you need is some ginger and",
                              "image": {
                                "url": "http://example.com/recipe",
                                "accessibilityText": "Recipe"
                              }
                            }
                          ]
                        }
                      }
                    }
                  }]
                }
              },
              "slack": {
                "text": result.speech
              },
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
