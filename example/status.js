'use strict';

module.exports.handler = function(event, context, callback) {
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type' : 'text/plain'
      },
      body: 'OK'
    };

    callback(null, response);
};
