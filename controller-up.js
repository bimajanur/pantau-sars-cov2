'use strict'

const response = require('./res')
const moment = require('moment-timezone')
moment.tz.setDefault("Asia/Jakarta")

const firebase = require('firebase')
// Initialize Firebase
const config = {
    apiKey: "AIzaSyAPTveRXaamGZRhTpyUq9_JDh6M41Z-rxA",
    authDomain: "coronaapps-b9e75.firebaseapp.com",
    databaseURL: "https://coronaapps-b9e75.firebaseio.com",
    projectId: "coronaapps-b9e75",
    storageBucket: "coronaapps-b9e75.appspot.com",
    messagingSenderId: "258467893706",
    appId: "1:258467893706:web:2e1050258655ba7148ff33"
}
// const config = {
//     databaseURL: "https://coronaapps-3200d.firebaseio.com/",
// }
firebase.initializeApp(config)

//Get data From json

exports.index = function (req, res) {
    response.info("Pantau COVID-19 is in the house!", res)
}

const getDistanceInMeter = function ({ checkPoint, centerPoint }) {

    let ky = 40000 / 360 * 1000
    let kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky
    let dx = Math.abs(centerPoint.lon - checkPoint.lon) * kx
    let dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky
    return Math.sqrt(dx * dx + dy * dy)

}

var groupBy = function (arrayObj, byKey) {
    return arrayObj.reduce(function (accumulator, curObj) {
        (accumulator[curObj[byKey]] = accumulator[curObj[byKey]] || []).push(curObj)
        return accumulator
    }, {})
}

exports.peopleAround = async function (req, res) {

    const { lat, lon, time, maxDistance, timespan, userId } = req.body
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

    let trackingArr = []
    await Object.keys(trackingList).forEach(function (key, idx) {
        trackingList[key].key = key
        trackingArr.push(trackingList[key])
    })

    let centerTime = moment(time, "YYYY-MM-DDTHH:mm")

    trackingArr = trackingArr.map(tracking => {
        //add distance
        tracking.distance = getDistanceInMeter({
            checkPoint: {
                lat: tracking.Latitute,
                lon: tracking.Longitute
            }, centerPoint: {
                lat: lat,
                lon: lon
            }
        })

        //add timespan
        let checkingTime = moment(tracking.Tanggal, "MMM DD, YYYY hh.mm.ss a")
        var duration = moment.duration(centerTime.diff(checkingTime))
        var asminutes = duration.asMinutes()
        tracking.timespan = asminutes

        return tracking
    })

    trackingArr = trackingArr.filter(tracking => {
        let byDistance = true
        let byTimespan = true
        let byUserId = true

        //filter by Distance
        if (maxDistance != null)
            byDistance = tracking.distance <= (maxDistance * 1)

        //filter by Timespan
        if (timespan != null)
            byTimespan = tracking.timespan <= timespan

        //filter by userId
        if (userId != null)
            byUserId = tracking.idUser != userId

        return byDistance && byTimespan && byUserId
    })

    // console.log(groupBy(trackingArr, 'idUser'))

    trackingArr = groupBy(trackingArr, 'idUser')

    // console.log(trackingArr)

    let returnRes = {
        body: req.body,
        snapshot: trackingArr,
    }
    response.info(returnRes, res)

}

exports.stopoverHistory = async function (req, res) {

    const { userId, dataFromTime, placeRadius } = req.body
    const db = firebase.database()
    const ref = db.ref("Tracking")

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

    let dataFromTimeMoment = moment(dataFromTime, "YYYY-MM-DDTHH:mm")
    console.log("dataFromTimeMoment", dataFromTimeMoment.toDate())

    let trackingArr = []
    await Object.keys(trackingList).forEach(function (key, idx) {
        trackingList[key].key = key
        trackingArr.push(trackingList[key])
    })

    //filter by userId
    trackingArr = trackingArr.filter(tracking => {
        let byUserId = true
        let byDataFromTime = true

        //filter by userId
        if (userId != null)
            byUserId = tracking.idUser == userId

        //filter by dataFromTime
        if (dataFromTime != null) {
            let checkingTime = moment(tracking.Tanggal, "MMM DD, YYYY hh.mm.ss a")
            let isafter = checkingTime.isAfter(dataFromTimeMoment)
            byDataFromTime = isafter
        }

        return byUserId && byDataFromTime
    })

    // grouping by place chronologically
    let trackingArrPos = []
    let centerTracking = {}
    for (let i = 0; i < trackingArr.length; i++) {
        let pos = {}
        let currentTracking = trackingArr[i]

        if (i == 0) {
            centerTracking = trackingArr[i]
            pos = {
                centerLat: currentTracking.Latitute,
                centerLon: currentTracking.Longitute,
                fromTime: moment(currentTracking.Tanggal, "MMM DD, YYYY hh.mm.ss a").toDate(),
                toTime: moment(currentTracking.Tanggal, "MMM DD, YYYY hh.mm.ss a").toDate(),
            }

            trackingArrPos.push(pos)

        } else {

            let posDistance = getDistanceInMeter({
                checkPoint: {
                    lat: currentTracking.Latitute,
                    lon: currentTracking.Longitute
                }, centerPoint: {
                    lat: centerTracking.Latitute,
                    lon: centerTracking.Longitute
                }
            })

            if (posDistance > (placeRadius || 20)) {
                centerTracking = currentTracking

                pos = {
                    centerLat: centerTracking.Latitute,
                    centerLon: centerTracking.Longitute,
                    fromTime: moment(centerTracking.Tanggal, "MMM DD, YYYY hh.mm.ss a").toDate(),
                    toTime: moment(centerTracking.Tanggal, "MMM DD, YYYY hh.mm.ss a").toDate(),
                }

                trackingArrPos.push(pos)
            } else {
                let currentTrackingTanggal = moment(currentTracking.Tanggal, "MMM DD, YYYY hh.mm.ss a")
                pos = {
                    centerLat: centerTracking.Latitute,
                    centerLon: centerTracking.Longitute,
                    fromTime: moment(centerTracking.Tanggal, "MMM DD, YYYY hh.mm.ss a").toDate(),
                    toTime: moment(currentTracking.Tanggal, "MMM DD, YYYY hh.mm.ss a").toDate(),
                }

                trackingArrPos[trackingArrPos.length - 1] = pos
            }

        }
    }

    console.log(trackingArrPos)

    let returnRes = {
        body: req.body,
        snapshot: trackingArrPos,
    }
    response.info(returnRes, res)

}

var groupByA = function (arrayObj, byKey) {
    return arrayObj.reduce(function (accumulator, curObj) {
        // let a = []
        // if (accumulator[curObj[byKey]] != null) {
        //     a = accumulator[curObj[byKey]]
        // }
        // a.push(curObj)

        (accumulator[curObj[byKey]] = accumulator[curObj[byKey]] || []).push(curObj)
        return accumulator
    }, {})
}
