'use strict';

module.exports = function (app) {
    const todoList = require('./controller');

    // const firebaseAdmin = require('firebase-admin');

    // firebaseAdmin.initializeApp({
    //     credential: firebaseAdmin.credential.cert(serviceAccount), // Or credential
    //     databaseURL: 'https://putrihuriati-101b5.firebaseio.com'
    // });

    app.route('/')
        .get(todoList.index);

    app.route('/people-around-me')
        .post(todoList.peopleAround);

};