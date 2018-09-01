//**************************************************************** 
//Function to send messages to PlaySMS apps for bus status updates
// Moonspec Design, Copyright 2018
//****************************************************************
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
exports.sendPushNotifcation = functions.database.ref('/Messages/{id}').onWrite((data, context) => {
    //next figure out how to store tokens and then use them to send messages
    //in future iteration we will actually read this from firestore as we figure out how to keep it 
    //maintatined...ees
    const tokenArray = [
        { "token": "daI69yvIWjM:APA91bEr9laaPA4gVPYuQ-3NBgZB341MiWCId1KfUXYEBlKMQNC4TjRly7-jZ7rtFo9OHGkPQ6UbuHaPoVI1AXhfcF65pzbUbOyXzkpwhbkaVdgA-eF3pftMao9bE6tR_Jr4oIvk6baf", "phoneNumber": "4252411879" },
        { "token": "daI69yvIWjM:APA91bEr9laaPA4gVPYuQ-3NBgZB341MiWCId1KfUXYEBlKMQNC4TjRly7-jZ7rtFo9OHGkPQ6UbuHaPoVI1AXhfcF65pzbUbOyXzkpwhbkaVdgA-eF3pftMao9bE6tR_Jr4oIvk6baf", "phoneNumber": "4252411902" },
        { "token": "daI69yvIWjM:APA91bEr9laaPA4gVPYuQ-3NBgZB341MiWCId1KfUXYEBlKMQNC4TjRly7-jZ7rtFo9OHGkPQ6UbuHaPoVI1AXhfcF65pzbUbOyXzkpwhbkaVdgA-eF3pftMao9bE6tR_Jr4oIvk6baf", "phoneNumber": "4257851934" }
    ];
    const snapshot = data.after;
    const val = snapshot.val();
    let tokenOut = "";
    tokenArray.forEach(function (value) {
        if (value.phoneNumber === val.Receiver) {
            tokenOut = value.token;
            // console.log('got a match!');
            // console.log('Receiver In');
            // console.log(val.Receiver);
            // console.log('TokenArray');
            // console.log(value.phoneNumber);
        }
    });
    //now generate the payload for the message
    const messageOut = {
        notification: {
            title: 'Bus Ride Notification- ' + val.Sender,
            body: String(val.MessageBody)
        },
        webpush: {
            notification: {
                sound: 'default',
                badge: '1',
                icon: 'cartoon-school-bus-clipart-17.png'
            }
        },
        token: tokenOut
    };
    console.log(messageOut);
    //dryRun variable to true means the message is validated but not sent.  Good for debugging
    const dryRun = false;
    admin.messaging().send(messageOut, dryRun)
        .then((response) => {
        console.log('Dry run successful!', response);
    })
        .catch((error) => {
        console.log('Error sending message dry run: ', error);
    });
});
//# sourceMappingURL=index.js.map