var bcrypt = require('bcrypt');
var jwtutils = require('../utils/jwt.utils.js');
var models = require('../models');

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
                            console.log(err);
                        })
                } else {
                    models.Profile.findOne({ where: { id: userId } })
                        .then(function (profile) {
                            // Check if record exists in db
                            if (profile) {
                               var newprofile= models.Profile.update({
                                    firstName : firstName ? firstName : profile.firstName,
                                    lastName : lastName ? firstName : profile.firstName,
                                    telephone : telephone ? telephone : profile.telephone,
                                    adresse : adresse ? adresse : profile.adresse,
                                    
                                },
                                {where : {id : userId } }
                                )
                                .then(function (newprofile) { 
                                    return res.status(201).json({
                                        'Profile': newprofile
                                    })
                                })
                            }
                        })
                  
                  


                }
            })
    },
    register: function (req, res) {


        var email = req.body.email;
        var username = req.body.username;
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
                }
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
    }

}


