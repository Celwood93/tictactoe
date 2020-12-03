const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const { PubSub } = require("@google-cloud/pubsub");
// Instantiates a client
const pubsub = new PubSub();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloListenPubSub = functions.pubsub
  .topic("test-topic")
  .onPublish(message => {
    let name = null;
    try {
      name = JSON.parse(message).name;
      console.log(name);
    } catch (e) {
      console.error("PubSub message was not JSON", message);
    }
  });

exports.helloSendPubSub = async name => {
  const messageObject = {
    name
  };
  const messageBuffer = JSON.stringify(messageObject);
  const topic = pubsub.topic("test-topic");

  // Publishes a message
  try {
    return (result = await topic.publish(messageBuffer));
  } catch (err) {
    return { error: "failed to get anything" };
  }
};
