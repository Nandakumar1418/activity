'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var http = require('https');

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path, 
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {

    console.log("5 -- For Edit");    
    console.log("4");    
    console.log("3");    
    console.log("2");    
    console.log("1");    
    //console.log("Edited: "+req.body.inArguments[0]);    
    
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    
    console.log("5 -- For Save");    
    console.log("4");    
    console.log("3");    
    console.log("2");    
    console.log("1");    
    //console.log("Saved: "+req.body.inArguments[0]);
    
    // Data from the req and put it in an array accessible to the main app.
    console.log( req.body );
    logData(req);
    res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {

    console.log("5 -- For Execute");    
    console.log("4");    
    console.log("3");    
    console.log("2");    
    console.log("1");    
    console.log("Executed: " + req.body.inArguments[0]);
    console.log("Executed JSON: " + JSON.stringify(req.body.inArguments[0]));
    
    var requestBody = req.body.inArguments[0];

    const accountSid = requestBody.accountSid;
    const authToken = requestBody.authToken;
    const to = requestBody.to;
    const from = requestBody.messagingService;
    const body = requestBody.body;
    const contactKey = requestBody.contactKey;

    const https = require('https');

    const getToken = () => {
        return new Promise((resolve, reject) => {
            const tokenData = JSON.stringify({
                "grant_type": "client_credentials",
                "client_id": "bj7x3dtz35bgk1nm0vb1o19n",
                "client_secret": "oEm690UazJe4Nq7m4EVEvQvE"
            });
    
            const tokenOptions = {
                hostname: 'mc2-qgk1nhxg1mljb37pr3-6x9q4.auth.marketingcloudapis.com',
                port: 443,
                path: '/v2/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': tokenData.length
                }
            };
    
            const tokenReq = https.request(tokenOptions, (tokenRes) => {
                let tokenResponseBody = '';
    
                tokenRes.on('data', (chunk) => {
                    tokenResponseBody += chunk;
                });
    
                tokenRes.on('end', () => {
                    if (tokenRes.statusCode === 200) {
                        const tokenResponseJson = JSON.parse(tokenResponseBody);
                        resolve(tokenResponseJson.access_token);
                    } else {
                        reject(`Failed to obtain token. Status code: ${tokenRes.statusCode}`);
                    }
                });
            });
    
            tokenReq.on('error', (e) => {
                reject(`Problem with token request: ${e.message}`);
            });
    
            tokenReq.write(tokenData);
            tokenReq.end();
        });
    };
    
    const getDataExtensionRecord = (externalKey, filterField, filterValue, accessToken) => {
        return new Promise((resolve, reject) => {
            console.log('DE Details', `/data/v1/customobjectdata/key/${externalKey}/rowset?$filter=${filterField} eq '${filterValue}'`);
            const options = {
                hostname: 'mc2-qgk1nhxg1mljb37pr3-6x9q4.rest.marketingcloudapis.com',
                path: `/data/v1/customobjectdata/key/${externalKey}/rowset?$filter=${filterField} eq '${filterValue}'`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const req = https.request(options, (res) => {
                let data = '';
    
                res.on('data', (chunk) => {
                    data += chunk;
                });
    
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(`Failed to fetch record. Status code: ${res.statusCode}`);
                    }
                });
            });
    
            req.on('error', (e) => {
                reject(`Problem with request: ${e.message}`);
            });
    
            req.end();
        });
    };

    const insertRecord = (accessToken) => {
        return new Promise((resolve, reject) => {
            const recordData = JSON.stringify([
                {
                    "keys": {
                        "ContactId": contactKey
                    },
                    "values": {
                        "Message": body,
                        "Date": "12-12-2023"
                    }
                }
            ]);
    
            const recordOptions = {
                hostname: 'mc2-qgk1nhxg1mljb37pr3-6x9q4.rest.marketingcloudapis.com',
                port: 443,
                path: '/hub/v1/dataevents/key:EAB3AF1A-A7A9-4CAD-88D7-87BFF29AD607/rowset',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Length': recordData.length
                }
            };
    
            const recordReq = https.request(recordOptions, (recordRes) => {
                let recordResponseBody = '';
    
                recordRes.on('data', (chunk) => {
                    recordResponseBody += chunk;
                });
    
                recordRes.on('end', () => {
                    if (recordRes.statusCode === 200 || recordRes.statusCode === 201) {
                        resolve(`Record inserted successfully. Response: ${recordResponseBody}`);
                    } else {
                        reject(`Failed to insert record. Status code: ${recordRes.statusCode}, Response: ${recordResponseBody}`);
                    }
                });
            });
    
            recordReq.on('error', (e) => {
                reject(`Problem with record request: ${e.message}`);
            });
    
            recordReq.write(recordData);
            recordReq.end();
        });
    };

    getToken()
        .then((accessToken) => {
            console.log('Access Token:', accessToken);
            return getDataExtensionRecord('F9C901F0-F2E7-460F-8FD1-4397E7367C9B', 'contactKey', contactKey, accessToken)
                .then((record) => {
                    console.log('Fetched record:', record);
                    console.log('Fetched record JSON:', JSON.stringify(record));
                    // Perform any necessary operations with the fetched record
                    return insertRecord(accessToken);
                });
        })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.error(error);
        });

    // FOR TESTING
    logData(req);
    res.send(200, 'Execute');

    // Used to decode JWT
    // JWT(req.body, process.env.jwtSecret, (err, decoded) => {

    //     // verification error -> unauthorized request
    //     if (err) {
    //         console.error(err);
    //         return res.status(401).end();
    //     }

    //     if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            
    //         // decoded in arguments
    //         var decodedArgs = decoded.inArguments[0];
            
    //         logData(req);
    //         res.send(200, 'Execute');
    //     } else {
    //         console.error('inArguments invalid.');
    //         return res.status(400).end();
    //     }
    // });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {

    console.log("5 -- For Publish");    
    console.log("4");    
    console.log("3");    
    console.log("2");    
    console.log("1");    
    //console.log("Published: "+req.body.inArguments[0]);        
    
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
//     logData(req);
     res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {

    console.log("5 -- For Validate");    
    console.log("4");    
    console.log("3");    
    console.log("2");    
    console.log("1");    
    //console.log("Validated: "+req.body.inArguments[0]);       
    
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Validate');
};
