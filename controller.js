'use strict'

const response = require('./res')

const firebase = require('firebase')
// Initialize Firebase
// const config = {
//     apiKey: "AIzaSyCV-RJho9f_aIAZHUwO9hIGLTeKDNZQN7c",
//     authDomain: "putrihuriati-101b5.firebaseapp.com",
//     projectId: "putrihuriati-101b5",
//     storageBucket: "putrihuriati-101b5.appspot.com",
//     messagingSenderId: "642993692803",
//     appId: "1:642993692803:web:94084229d7f20bd5",
//     databaseURL: "https://putrihuriati-101b5.firebaseio.com",
// }
const config = {
    databaseURL: "https://coronaapps-3200d.firebaseio.com/",
    // databaseURL: "https://coronaapps-b9e75.firebaseio.com",
}
firebase.initializeApp(config)

//Get data From json

exports.index = function (req, res) {
    response.info("Pantau COVID-19 is in the house!", res)
}

// const arePointsNear = function (checkPoint, centerPoint, km) {
//     let ky = 40000 / 360
//     let kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky
//     let dx = Math.abs(centerPoint.lon - checkPoint.lon) * kx
//     let dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky
//     return Math.sqrt(dx * dx + dy * dy) <= km
// }

const getDistanceInKm = function ({ checkPoint, centerPoint }) {
    let ky = 40000 / 360
    let kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky
    let dx = Math.abs(centerPoint.lon - checkPoint.lon) * kx
    let dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky
    return Math.sqrt(dx * dx + dy * dy)
}

exports.peopleAround = async function (req, res) {
    const { lat, lon } = req.body
    const db = firebase.database()
    const ref = db.ref("Tracking")
    // const ref = db.ref("Lapor")

    let trackingList = await ref.once('value',
        snapshot => {
            let trackingData = snapshot.val()
            return trackingData
        },
        errorObject => {
            return errorObject.code
        }
    )

    trackingList = JSON.parse(JSON.stringify(trackingList))

    let trackingArr = [];
    await Object.keys(trackingList).forEach(function (key, idx) {
        trackingList[key].key = key
        trackingArr.push(trackingList[key])
    })

    console.log(trackingArr)

    trackingArr = trackingArr.map(tracking => {
        tracking.distance = getDistanceInKm({
            checkPoint: {
                lat: tracking.Latitute,
                lon: tracking.Longitute
            }, centerPoint: {
                lat: -0.9408239,
                lon: 100.4466765
            }
        })

        return tracking
    })

    let returnRes = {
        body: req.body,
        snapshot: trackingArr,
        names: ["Tony", "Lisa", "Michael", "Ginger", "Food"],
    }
    response.info(returnRes, res)

}