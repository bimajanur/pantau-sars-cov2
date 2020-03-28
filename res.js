'use strict';

exports.info = function (values, res) {
    let data = {
        status: {
            code: 200,
            message: 'OK',
        },
        payload: values
    };
    res.json(data);
    res.end();
};