"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//**************************************************************** 
//Function to send messages to PlaySMS apps for bus status updates
// Moonspec Design, Copyright 2018
//****************************************************************
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
exports.sendPushNotifcation = functions.database.ref('/Messages/{id}').onWrite((data, context) => {
    //if a delete then don't run the rest of the code
    if (data.before.exists()) {
        console.log('Deleting record');
        return null;
    }
    //next figure out how to store tokens and then use them to send messages
    const snapshot = data.after;
    const val = snapshot.val();
    const db = admin.firestore();
    let tokenOut = "no match";
    var tokenDocs = db.collection('userFcmtokens');
    var queryRef = tokenDocs.where('email', '==', val.Receiver).get()
        .then(snap => {
        snap.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            //console.log('Receiver from message db => ',  val.Receiver);
            //console.log('UserDB data.Email is => ', doc.data().email);
            //console.log('UserDB Email is => ', doc.email());
            if (val.Receiver === doc.data().email) {
                tokenOut = doc.data().fcmToken;
                console.log('got a match! ', doc.data().email);
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
                            icon: 'default'
                        }
                    },
                    token: tokenOut
                };
                //console.log(messageOut);
                //dryRun variable to true means the message is validated but not sent.  Good for debugging
                let dryRun = true;
                admin.messaging().send(messageOut, dryRun)
                    .then((response) => {
                    console.log('Token Validation Ok, Sending meesage');
                    dryRun = false;
                    admin.messaging().send(messageOut, dryRun)
                        .then((responseReal) => {
                        console.log('Message send Successful! ', responseReal);
                    })
                        .catch((errorReal) => {
                        console.log('Message send Failure! ', errorReal);
                    });
                })
                    .catch((error) => {
                    console.log('Error Validating Message/Token : ', error);
                });
            }
        });
    })
        .catch(err => {
        console.log('Error getting documents', err);
    });
});
//# sourceMappingURL=index.js.map