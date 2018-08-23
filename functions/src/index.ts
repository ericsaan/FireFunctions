
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
   
    exports.sendPushNotifcation = functions.database.ref('/Messages/{id}').onWrite((data, context )=> {
       
        //const receiverPhoneNumber :string = data.phoneNumber;
       
        const payload = {
        notification: {
            title: 'Bus Ride Notifcation',
            body: 'Bus Ride Status Change',
            sound: 'default',
            badge: '1'
       
        
        }
    };

//next figure out how to store tokens and then use them to send messages
//in future iteration we will actually read this from firestore as we figure out how to keep it 
//maintatined...ees

const tokenArray = 
[
  {"token": "daI69yvIWjM:APA91bEr9laaPA4gVPYuQ-3NBgZB341MiWCId1KfUXYEBlKMQNC4TjRly7-jZ7rtFo9OHGkPQ6UbuHaPoVI1AXhfcF65pzbUbOyXzkpwhbkaVdgA-eF3pftMao9bE6tR_Jr4oIvk6baf", "phoneNumber": "4252411879"},
  {"token": "daI69yvIWjM:APA91bEr9laaPA4gVPYuQ-3NBgZB341MiWCId1KfUXYEBlKMQNC4TjRly7-jZ7rtFo9OHGkPQ6UbuHaPoVI1AXhfcF65pzbUbOyXzkpwhbkaVdgA-eF3pftMao9bE6tR_Jr4oIvk6baf", "phoneNumber": "4252411902"},
  {"token": "daI69yvIWjM:APA91bEr9laaPA4gVPYuQ-3NBgZB341MiWCId1KfUXYEBlKMQNC4TjRly7-jZ7rtFo9OHGkPQ6UbuHaPoVI1AXhfcF65pzbUbOyXzkpwhbkaVdgA-eF3pftMao9bE6tR_Jr4oIvk6baf", "phoneNumber": "4257851934"}

];
const snapshot = data.after;
const val = snapshot.val();
 
let tokenOut = "";  
tokenArray.forEach( function(value) {
    if (value.phoneNumber === val.Receiver) {
        tokenOut = value.token;
        // console.log('got a match!');
        // console.log('Receiver In');
        // console.log(val.Receiver);
        // console.log('TokenArray');
        // console.log(value.phoneNumber);
    }
    
})
  
  return admin.messaging().sendToDevice(tokenOut, payload).then(response => {
        //console.log('good send');
    });
});


