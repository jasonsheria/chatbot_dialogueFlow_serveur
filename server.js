var express = require('express');
var server = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var apiRouter = require('./apiRoute').router;
var cors = require('cors');
const path = require('path')
// create application/x-www-form-urlencoded parser
server.use(bodyParser.urlencoded({ extended:true }));
server.use(jsonParser);
// const dialogflow = require('dialogflow');
// const uuid = require('uuid');
const corsoptions = {
    origin : '*',
    Credential : true,
    // control-allow-Credential : true,
   optionsuccesstatus:200,
}
server.use(cors(corsoptions))

/
// Config route

server.get('/', function(req, res){
    res.setHeader('Content-Type','text/html');
    res.setHeader('FormData','text/html');
    res.status(200).send('</h1> Bonjour Jason </h1>');
});

// dialogueFlow

// async function runSample(projectId = 'ass-bot-qkum') {
//     // A unique identifier for the given session
//     const sessionId = uuid.v4();
   
//     // Create a new session
//     const sessionClient = new dialogflow.SessionsClient({
//         "keyFilename" :"../server/ass-bot-qkum-2f008814628c.json"
//     }
    
//     );
//     const sessionPath = sessionClient.sessionPath(projectId, sessionId);
   
//     // The text query request.
//     const request = {
//       session: sessionPath,
//       queryInput: {
//         text: {
//           // The query to send to the dialogflow agent
//           text: 'can I apply from abroad?',
//           // The language used by the client (en-US)
//           languageCode: 'French—fr',
//         },
//       },
//     };
   
//     // Send request and log result
//     const responses = await sessionClient.detectIntent(request);
//     console.log('Detected intent');
//     const result = responses[0].queryResult;
//     console.log(`  Query: ${result.queryText}`);
//     console.log(`  Response: ${result.fulfillmentText}`);
//     if (result.intent) {
//       console.log(`  Intent: ${result.intent.displayName}`);
//     } else {
//       console.log(`  No intent matched.`);
//     }
//   }
// runSample();



// End DialogueFlow









server.use('/api', apiRouter);
server.use(express.static('public'))
const port= process.env.port || 5000;
server.listen(port, function(){
    console.log('server en écoute')
})
