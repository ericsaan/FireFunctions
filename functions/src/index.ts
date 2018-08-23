import { print } from "util";

//import * as functions from 'firebase-functions';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.sendPushNotifcation = functions.database.ref('/Messages/{id}').onWrite(event => {
    const payload = {
        notification: {
            title: 'Bus Ride Notifcation',
            body: 'Bus Status Update',
            sound: 'default',
            badge: '1'
            
        
        }
    };
    
//next figure out how to store tokens and then use them to send messages

   const token = "daI69yvIWjM:APA91bEr9laaPA4gVPYuQ-3NBgZB341MiWCId1KfUXYEBlKMQNC4TjRly7-jZ7rtFo9OHGkPQ6UbuHaPoVI1AXhfcF65pzbUbOyXzkpwhbkaVdgA-eF3pftMao9bE6tR_Jr4oIvk6baf";
    return admin.messaging().sendToDevice(token, payload).then(response => {
        print('good send');
    });
});


