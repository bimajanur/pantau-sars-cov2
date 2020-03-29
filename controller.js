'use strict'

const response = require('./res')
const moment = require('moment-timezone')
moment.tz.setDefault("Asia/Jakarta")

exports.index = function (req, res) {
    response.info("Pantau COVID-19 is in the house!", res)
}

const getDistanceInKm = function ({ checkPoint, centerPoint }) {

    let ky = 40000 / 360 * 1000
    let kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky
    let dx = Math.abs(centerPoint.lon - checkPoint.lon) * kx
    let dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky
    return Math.sqrt(dx * dx + dy * dy)

}

var groupBy = function (arrayObj, byKey) {
    return arrayObj.reduce(function (total, curObj) {
        (total[curObj[byKey]] = total[curObj[byKey]] || []).push(curObj);
        return total;
    }, {});
};

exports.peopleAround = async function (req, res) {

    let trackingArr = {
        idUser:"1",
        position: "Padang TV"
    }
    // console.log(trackingArr)

    let returnRes = {
        body: req.body,
        snapshot: trackingArr,
    }
    response.info(returnRes, res)

}

exports.isMoving = async function (req, res) {
    
    let positionStatus = "static";
    
    let returnData = {
        positionStatus: positionStatus
    }

    let centerTime = moment(time, "YYYY-MM-DDTHH:mm")

    console.log(trackingArr)

    let returnRes = {
        body: req.body,
        snapshot: returnData,
    }
    response.info(returnRes, res)

}