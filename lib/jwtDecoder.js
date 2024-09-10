'use strict';

/*module.exports = (body, secret, cb) => {
	if (!body) {
		return cb(new Error('invalid jwtdata'));
	}

	require('jsonwebtoken').verify(body.toString('utf8'), secret, {
		algorithm: 'HS256'
	}, cb);
};*/


const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const token = req.body.token || req.headers['authorization']; // Fetch token from body or headers

    if (!token) {
        return res.status(401).send('No token provided.');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Failed to authenticate token.');
        }

        req.user = decoded; // Save decoded token payload in request
        next();
    });
};

module.exports = verifyJWT;
