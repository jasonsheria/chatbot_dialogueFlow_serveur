var bcrypt = require('bcrypt');
var jwtutils = require('../utils/jwt.utils.js');
var models = require('../models');
const multer = require("multer");
const fs = require("fs");
const path = require('path');
const user = require('../models/user.js');
const dialogflow = require('dialogflow');
const uuid = require('uuid');

// Routes
module.exports = {


    profile: function (req, res) {

        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var adresse = req.body.adresse;
        var telephone = req.body.telephone;
        var headerAuth = req.headers['authorization'];
        var userId = jwtutils.getUserId(headerAuth);
        if (userId < 0) {
            return res.status(400).json({
                'err': 'wrong token'
            });
        }

        models.Profile.findOne({
            where: { UserId: userId }
        })
            .then(function (FoundUser) {

                if (!FoundUser) {
                    var newUser = models.Profile.create({
                        firstName: firstName,
                        lastName: lastName,
                        UserId: userId,
                        adresse: adresse,
                        telephone: telephone

                    })
                        .then(function (newUser) {
                            return res.status(201).json({
                                'Profile': newUser
                            })
                        })
                        .catch(function (err) {
                            return res.status(201).json({
                                'Profile': newUser
                            })
                        })
                } else {
                    console.log("trouver")
                    models.Profile.update({
                        firstName: firstName ? firstName : FoundUser.firstName,
                        lastName: lastName ? firstName : FoundUser.firstName,
                        telephone: telephone ? telephone : FoundUser.telephone,
                        adresse: adresse ? adresse : FoundUser.adresse,

                    },

                        { where: { id: FoundUser.id } }
                    )
                        .then(function (newprofile) {
                            return res.status(201).json({
                                'Profile': newprofile
                            })
                        })
                        .catch(function (error) {
                            return res.status(500).json({
                                'error': error
                            })
                        })
                }
            })
            .catch(function (error) {
                return res.status(500).json({
                    'error': error
                })
            })
    },

    register: function (req, res) {


        var email = req.body.email;
        var username = req.body.name;
        var password = req.body.password;

        if (email == null || username == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameter' })
        }

        // TODO

        models.User.findOne({
            attributes: ['email'],
            where: { email: email }

        })
            .then(function (userFound) {
                if (!userFound) {
                    bcrypt.hash(password, 5, function (err, bcryptedPassword) {
                        var newUser = models.User.create({
                            email: email,
                            username: username,
                            password: bcryptedPassword,
                            isAdmin: 0

                        })
                            .then(function (newUser) {
                                return res.status(201).json({
                                    'user': newUser
                                })

                            })
                            .catch(function (err) {
                                return res.status(500).json({
                                    'error': 'cannot add User'
                                });
                            });
                    });
                }
                else {
                    return res.status(409).json({ 'error': 'user is already exist' })
                }
            })
            .catch(function (err) {
                return res.status(500).jon({ 'error': 'unable to verify user' });
            })
    },

    login: function (req, res) {

        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json({ 'error': 'missing Paramter of login ' });
        }
        // TODO

        models.User.findOne({
            where: { email: email }
        })
            .then(function (userFound) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
                        if (resBycrypt) {
                            return res.status(200).json({
                                'user': userFound,
                                'token': jwtutils.generateTokenForUser(userFound)
                            })
                        }
                    })
                } else {
                    return res.status(200).json(
                        'error : user not found '
                    )

                }

            }).catch(function (error) {
                return res.status(200).json({
                    'error': error,
                })
            })
    },
    getUser: function (req, res) {

        var headerAuth = req.headers['authorization'];
        var userId = jwtutils.getUserId(headerAuth);
        if (userId < 0) {
            return res.status(400).json({
                'err': 'wrong token'
            });
        }

        models.User.findOne({
            attributes: ['id', 'email', 'username'],
            where: { id: userId }
        })
            .then(function (user) {
                if (user) {
                    res.status(201).json(user);
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            })
            .catch(function (err) {

                res.status(500).json({ 'error': 'cannot fetch user' })

            })
    },
    upload: function (req, res) {
        var headerAuth = req.headers['authorization'];
        var userId = jwtutils.getUserId(headerAuth);

        if (userId < 0) {
            return res.status(400).json({
                'err': 'wrong token'
            });
        }
        models.Profile.findOne({
            where: { UserId: userId }
        })
            .then(function (FoundProfile) {
                let format = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']

                var storage = multer.diskStorage({
                    destination: function (req, file, callback) {
                        callback(null, '/public/Images');
                    },
                    filename: function (req, file, callback) {
                        callback(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
                    }
                });
                var upload = multer({ storage: storage }).single('avatar');
                upload(req, res, function (err) {
                    if (err) {
                        return res.end(err);
                    }
                    // console.log(req.file.filename)
                    var path = req.file.filename;
                    var avt = req.file.mimetype
                    const baseUrl = `${req.protocol}://${req.headers.host}` + "/Images/" + path;
                    console.log(baseUrl)
                    format.filter((forma) => {
                        if (forma == avt) {
                            console.log(forma + "==" + avt);
                        }
                    })
                    res.end("File is uploaded");
                });


                // save to data
                // if(FoundProfile){
                //     newP = models.Profile.update({
                //         image : (req.file).originalname
                //     },
                //     { where : { id : FoundProfile.id} },
                //     )
                // }
            })


    },
    sendMessage: async function (req, res, next) {
        var headerAuth = req.body.token;
        var userId = jwtutils.getUserId(headerAuth);
        var message = req.body.message;
        // var message="salut";
        if (userId < 0) {
            return res.status(400).json({
                'err': 'wrong token'
            });
        }
        models.User.findOne({
            attributes: ['id', 'email', 'username'],
            where: { id: userId }
        })
            .then(function (user) {


                if (user) {
                    console.log(userId)

                    models.Message.create({
                        content: message,
                        idUser: userId,
                        type: 1
                    })
                        .then(async function (messages) {
                            var msg = 'null';
                              projectId = 'ass-bot-qkum'
                                // A unique identifier for the given session
                                const sessionId = uuid.v4();

                                // Create a new session
                                const sessionClient = new dialogflow.SessionsClient({
                                    "keyFilename": "../ass-bot-qkum-2f008814628c.json"
                                }

                                );
                                const sessionPath = sessionClient.sessionPath(projectId, sessionId);

                                // The text query request.
                                const request = {
                                    session: sessionPath,
                                    queryInput: {
                                        text: {
                                            // The query to send to the dialogflow agent
                                            text: message,
                                            // The language used by the client (en-US)
                                            languageCode: 'French—fr',
                                        },
                                    },
                                };

                                // Send request and log result
                                const responses = await sessionClient.detectIntent(request);
                                console.log('Detected intent');
                                const result = responses[0].queryResult;
                                console.log(`  Query: ${result.queryText}`);
                                console.log(`  Response: ${result.fulfillmentText}`);
                                msg=result.fulfillmentText;
                                if (result.intent) {
                                   console.log(`  Intent: ${result.intent.displayName}`);

                                } else {
                                  console.log(`  No intent matched.`);
                                }
                             msg = `${result.fulfillmentText}`;
                                
                            
                         
                           console.log(msg);
                           if(msg){
                                models.Message.create({
                                    content: msg,
                                    idUser: userId,
                                    type: 2
                                })
                           }
                         res.status(200).json({ 'message': msg })

                        })

                } else {
                    res.status(500).json({ 'error': 'user not found' });
                }
            })
            .catch(function (err) {

                res.status(200).json({ 'error': 'cannot not send' })

            })
    },
    getMessage: function (req, res, next) {

        var headerAuth = req.headers['authorization'];
        var userId = jwtutils.getUserId(headerAuth);
        if (userId < 0) {
            return res.status(400).json({
                'err': 'wrong token'
            });
        }

        models.User.findOne({
            attributes: ['id', 'email', 'username'],
            where: { id: userId }
        })
            .then(function (user) {
                if (user) {
                    const messages = models.Message.findAll({
                        attributes: ['content', 'type', 'createdAt'],
                        where: {
                            idUser: userId
                        }
                    })
                        .then(function (messages) {
                            if (messages == null) {
                                res.status(200).json(
                                    messages = [
                                        {
                                            content: "why can i help you?",
                                            createdAt: "2023-12-31T12:37:59.000Z",
                                            type: 2
                                        }
                                    ])

                            } else {
                                res.status(200).json(messages)

                            }
                        })


                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            })
            .catch(function (err) {

                res.status(500).json({ 'error': 'cannot fetch user' })

            })
    },
}


