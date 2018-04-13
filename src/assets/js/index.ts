const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.fcmSend = functions.database.ref('/messages/{userId}/{messageId}').onCreate(event => {


const message = event.data.val();
const userId = event.params.userId;

const payload = {
  notification: {
    title: message.title,
    body: message.body,
    icon: 'https://placeimg.com/250/250/people'
  }
};


admin.database()
  .ref(`/fcmTokens/${userId}`)
  .once('value')
  .then(token => token.val()
)
.
then(userFcmToken => {
  return admin.messaging().sendToDevice(userFcmToken, payload);
}
)
.
then(res => {
  console.log('Sent Successfully', res);
})
.
catch(err => {
  console.log(err);
})
;

})
;
