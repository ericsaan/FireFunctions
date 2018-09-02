import { exists } from "fs";

//**************************************************************** 
//Function to send messages to PlaySMS apps for bus status updates
// Moonspec Design, Copyright 2018
//****************************************************************

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
   
    exports.sendPushNotifcation = functions.database.ref('/Messages/{id}').onWrite((data, context )=> {
       
      
//next figure out how to store tokens and then use them to send messages
//in future iteration we will actually read this from firestore as we figure out how to keep it 
//maintatined...ees
const snapshot = data.after;
const val = snapshot.val();


const db = admin.firestore();



//const tokenArray = queryRef;
// [
//   {"token": "fm4b48_BOjg:APA91bFzg3QL58jhHa8rhvpHxZk6q0LwCPxMgbRw8yrbs_yMufyLEtZu5ENlKWWpFXhqmBdV9hRtHu5kvyRzKh1BiJmRkq6icw2Mn4MS8-fM-GP5G3Dr1qYBJGUIt4uUkrlwrP7rJExP", "sender": "ericsaan@gmail.com"},
//   {"token": "fm4b48_BOjg:APA91bFzg3QL58jhHa8rhvpHxZk6q0LwCPxMgbRw8yrbs_yMufyLEtZu5ENlKWWpFXhqmBdV9hRtHu5kvyRzKh1BiJmRkq6icw2Mn4MS8-fM-GP5G3Dr1qYBJGUIt4uUkrlwrP7rJExP", "sender": "ericsaan@gmail.com"},
//   {"token": "fm4b48_BOjg:APA91bFzg3QL58jhHa8rhvpHxZk6q0LwCPxMgbRw8yrbs_yMufyLEtZu5ENlKWWpFXhqmBdV9hRtHu5kvyRzKh1BiJmRkq6icw2Mn4MS8-fM-GP5G3Dr1qYBJGUIt4uUkrlwrP7rJExP", "sender": "ericsaan@gmail.com"}

// ];
 
let tokenOut = "no match";  

var tokenDocs = db.collection('userFcmtokens');
var queryRef = tokenDocs.where('email', '==',val.Receiver).get()
.then(snap => {
    snap.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        
        console.log('Receiver from message db => ',  val.Receiver);
        console.log('UserDB data.Email is => ', doc.data().email);
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

            console.log(messageOut);

            //dryRun variable to true means the message is validated but not sent.  Good for debugging
            const dryRun = false;

            admin.messaging().send(messageOut, dryRun)
            .then((response) => {
                console.log('Message send successful! ',response);
            })
            .catch((error) => {
                console.log('Error sending message : ',error);
            });
        }
    });
})
.catch(err => {
    console.log('Error getting documents',err);
});
    


  



});


