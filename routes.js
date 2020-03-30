'use strict';

module.exports = function (app) {
    const pantauAPI = require('./controller');

    // const firebaseAdmin = require('firebase-admin');

    // firebaseAdmin.initializeApp({
    //     credential: firebaseAdmin.credential.cert(serviceAccount), // Or credential
    //     databaseURL: 'https://putrihuriati-101b5.firebaseio.com'
    // });

    app.route('/')
        .get(pantauAPI.index);

    app.route('/people-around-me')
        .post(pantauAPI.peopleAround);

    app.route('/stopover-history')
        .post(pantauAPI.stopoverHistory);

};