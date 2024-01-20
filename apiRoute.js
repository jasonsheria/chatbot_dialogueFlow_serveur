var express = require('express');
var usersctrl = require('./Controllers/userCtrl');

// Routes
    exports.router=(function(){
        var apiRouter= express.Router();
    apiRouter.route('/register').post(usersctrl.register);
    apiRouter.route('/login').post(usersctrl.login);
    apiRouter.route('/me').get(usersctrl.getUser);

    apiRouter.route('/profile').post(usersctrl.profile);
    apiRouter.route('/upload').post(usersctrl.upload);

    // Routes for  messages

    apiRouter.route('/send').post(usersctrl.sendMessage);
    apiRouter.route('/getMessage').get(usersctrl.getMessage);
   
    return apiRouter;

})();