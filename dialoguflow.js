
async function runSample(projectId = 'ass-bot-qkum',message) {
  // A unique identifier for the given session
  const sessionId = uuid.v4();
 
  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
      "keyFilename" :"../server/ass-bot-qkum-2f008814628c.json"
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
  
  if (result.intent) {
     console.log(`  Intent: ${result.intent.displayName}`);
   
  } else {
    console.log(`  No intent matched.`);
  }
  return result.fulfillmentText;
}
