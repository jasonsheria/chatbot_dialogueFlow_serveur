var express = require('express');
var server = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var apiRouter = require('./apiRoute').router;
var cors = require('cors');
// create application/x-www-form-urlencoded parser
server.use(bodyParser.urlencoded({ extended:true }));
server.use(jsonParser);
const corsoptions = {
    origin : 'http://localhost:3000',
    Credential : true,
   // access-control-allow-Credential : true,
   optionsuccesstatus:200
}
server.use(cors(corsoptions))



// Config route

server.get('/', function(req, res){
    res.setHeader('Content-Type','text/html');
    res.status(200).send('</h1> Bonjour Jason </h1>');
});
server.use('/api', apiRouter);
server.listen(8082, function(){
    // console.log('server en écoute')
})
