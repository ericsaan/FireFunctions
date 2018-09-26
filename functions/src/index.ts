import { runInThisContext } from "vm";

//import * as moment from 'moment';

//import { ClientResponse } from "http";

//import { exists } from "fs";

//**************************************************************** 
//Function to send messages to PlaySMS apps for bus status updates
// Moonspec Design, Copyright 2018
//****************************************************************

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.sendPushNotifcation = functions.database.ref('/Messages/{id}').onWrite((data, context )=> {

//if a delete then don't run the rest of the code
if (data.before.exists()){
    console.log('Deleting record');
    return null;
}
    

//next figure out how to store tokens and then use them to send messages
const snapshot = data.after;
const val = snapshot.val();

const db = admin.firestore();
//db.settings({ timestampsInSnapshots: true });

let tokenOut = "no match";  

const tokenDocs = db.collection('userFcmtokens');
    const queryRef = tokenDocs.where('email', '==',val.Receiver).get()
    .then(snap => {
        snap.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
            const messageEmail = val.Receiver.toUpperCase();  //database message receiver
            const userEmail = doc.data().email.toUpperCase();
            // if val.ReceiverName <> "" {
            //     userEmail = val.ReceiverName
            // }
            // console.log('messageEmail is-> ',messageEmail);
            // console.log('userEmail -> ',userEmail);

            //if (val.Receiver === doc.data().email) {
            if (messageEmail === userEmail) {
                tokenOut = doc.data().fcmToken;
            // console.log('got a match! ', doc.data().email);

                //now generate the payload for the message

                const messageOut = {
                    notification: {
                        title: 'Bus Ride Notification- ' + val.Sender,
                        body: String(val.MessageBody)
                    },
                    token: tokenOut
                    };
                //console.log(messageOut);

                //dryRun variable to true means the message is validated but not sent.  Good for debugging
                const dryRun = false;

                admin.messaging().send(messageOut, dryRun)
                .then((response) => {
                    //console.log('Token Validation Ok, Sending meesage');
                    // dryRun = false;
                    // admin.messaging().send(messageOut, dryRun)
                    // .then((responseReal) => {
                        console.log('Message send Successful! ',response);
                    // })
                    // .catch((errorReal) => {
                    //     console.log('Message send Failure! ',errorReal);
                    // });
                })
                .catch((error) => { 
                  //  console.log('Error Validating Message/Token : ',error);
                    console.log('Message send Failure! ',error);
                });
            }
        });
       // return true
    })
    .catch(err => {
        console.log('Error getting documents',err);
       return false
    });
    
    });
    
    
    //******************************************************************************************
    // Now the function we will call from CRON to delete old user messages: > 2 days old
    //******************************************************************************************

    
    exports.deleteOldMessages = functions.https.onRequest ((req, res) => {
        const db = admin.database();
        const ref = db.ref('/Messages/');  
   
        ref.once('value')
        .then(function (snapshot) {
          
            snapshot.forEach(doc => 
                {
               
                    const nowDate = new Date();
                    const messageDate = doc.val().DateString;
                    console.log ('now date is-> ',nowDate);
                    console.log ('message Date is-> ', messageDate);

                    console.log(doc.val().DateString);
                    const indexOfComma = messageDate.indexOf(",");
                    const messageDateString = messageDate.substr(indexOfComma-2, 2);
                    const messageDateInt = Number(messageDateString);
                    const nowDay = nowDate.getDate();

                    console.log('now day is-> ',nowDay);
                    console.log('messageDateInt-> ',messageDateInt);

                    if ((messageDateInt === nowDay) || messageDateInt === (nowDay - 1) || messageDateInt === (nowDay - 2)) {
                        console.log('Do nothing');
                        
                     } else {
                        console.log('Deleting message): ', doc.val().DateString); 
                        
                        //db.ref('Messages/' + doc.val().DateString).remove()
                        //ref.delete(doc.ref)
                        //
                        db.child(doc.val()).removeValue()  //not currently working
                        .then (() => {
                           console.log('Deleted message'); 
                       })
                       .catch(function(errorDeleteNotReal) {
                       
                           console.log('Error Deleting Message: ',errorDeleteNotReal);
                           
                       });
                     }
                    


                });
        });
                  
            //console.log ('Done Scouring old Bus messages');
            res.status(200).send(`Delete Old Messages Done!`);    
    
    });  //enddeleteoldmesssages
    
    //******************************************************************************************
    // Now the function we will call from CRON to delete old user device tokens
    //******************************************************************************************


    exports.deleteOldDevices = functions.https.onRequest ((req, res) => {
        
        const db = admin.firestore();
        //db.settings({ timestampsInSnapshots: true });

        let tokenOut = "no match";  

        const tokenDocs = db.collection('userFcmtokens').get()
        .then(snap => 
            {
            snap.forEach(doc => 
                {
                //console.log(doc.id, '=>', doc.data());
                tokenOut = doc.data().fcmToken;
                    //console.log('token out is -> ',tokenOut);
                    //now generate the payload for the message
                    const messageOut = {
                        notification: {
                            title: 'Bus Ride Notification- ',
                            body: 'Token Check'
                        },
                       
                        token: tokenOut
                        };
                    //console.log(messageOut);

                    //dryRun variable to true means the message is validated but not sent.  Good for debugging
                    const dryRun = true;

                    admin.messaging().send(messageOut, dryRun)
                    .then((response) => {
                        console.log('Token Validation Ok ', doc.data().email, doc.data().fcmToken);
                        //since ok validation we don't need to delete the record
                    })
                    .catch((error) => {
                        console.log('Error Validating Message/Token : ',error, doc.data().fcmToken);
                        const returnCode = error.code;

                        if (returnCode === "messaging/registration-token-not-registered")
                        {
                                doc.ref.delete().then (() => {
                                    console.log('Deleted token (after doc.delete): ', doc.data().fcmToken); 
                                })
                                .catch(function(errorDelete) {
                                
                                    console.log('Error Deleted User-Device Combination: ',errorDelete);
                                    
                                });
                                
                        };
                    });
                
            })
            console.log ('Done Scouring FCM Token Records');
            //return Promise.resolve("Delete FCMTokens Job Completed Successfuly");
            res.status(200).send(`Delete Users Done!`);
        })
        .catch(err => {
            console.log('Error getting documents',err);
            res.status(501);
        });
        //res.status(200).send(`Delete Users Done for Real!`);

});


exports.sendPushNotifcationFireStore = functions.firestore
    .document('messages/{id}')
    .onCreate((data, context) => {

    //if a delete then don't run the rest of the code
    // if (data.before.exists()){
    //     console.log('Deleting record');
    //     return null;
    // }
        
    
    //next figure out how to store tokens and then use them to send messages
    const snapshot = data.data();
   // const val = snapshot.val();
    const receiverOut = snapshot.Receiver;
    const senderOut = snapshot.Sender;
    const senderNameOut = snapshot.SenderName;
    const messageBodyOut = snapshot.MessageBody;

    const db = admin.firestore();
    //db.settings({ timestampsInSnapshots: true });
    
    let tokenOut = "no match";  
    
    const tokenDocs = db.collection('userFcmtokens');
        const queryRef = tokenDocs.where('email', '==',receiverOut).get()
        .then(snap => {
            snap.forEach(doc => {
            // console.log(doc.id, '=>', doc.data());
                const messageEmail = receiverOut.toUpperCase();  //database message receiver
                const userEmail = doc.data().email.toUpperCase();
                
                console.log('messageEmail is-> ',messageEmail);
                console.log('userEmail -> ',userEmail);
    
                //if (val.Receiver === doc.data().email) {
                if (messageEmail === userEmail) {
                    tokenOut = doc.data().fcmToken;
                // console.log('got a match! ', doc.data().email);
    
                    //now generate the payload for the message
                    let outName = "";

                    if (senderNameOut !== "")
                    {
                        outName = senderNameOut;  //i.e., use nickname
                    } else {
                        outName = senderOut;
                    }

                    const messageOut = {
                        notification: {
                            title: 'Bus Ride Notification- ' + outName,
                            body: String(messageBodyOut)
                        },
                        token: tokenOut
                        };
                    //console.log(messageOut);
    
                    //dryRun variable to true means the message is validated but not sent.  Good for debugging
                    const dryRun = false;
    
                    admin.messaging().send(messageOut, dryRun)
                    .then((response) => {
                        //console.log('Token Validation Ok, Sending meesage');
                        // dryRun = false;
                        // admin.messaging().send(messageOut, dryRun)
                        // .then((responseReal) => {
                            console.log('Message send Successful! ',response);
                        // })
                        // .catch((errorReal) => {
                        //     console.log('Message send Failure! ',errorReal);
                        // });
                    })
                    .catch((error) => { 
                      //  console.log('Error Validating Message/Token : ',error);
                        console.log('Message send Failure! ',error);
                    });
                }
            });
           // return true
        })
        .catch(err => {
            console.log('Error getting documents',err);
           return false
        });
        
        });
        