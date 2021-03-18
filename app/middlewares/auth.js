const jwt = require("jsonwebtoken");
const SendResponse = require("../utils/sendresponse");
const sendResponse = new SendResponse();

//In real world, the ref tokens should be kept in redish db some other cache db
let refTokenList = [];

function getAccessToken(payload) {
    try {        
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 30 });
    } catch (error) {
        console.log(error);   
    }
}

function getReferenceToken(payload) {
    try {
        const refToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
        if(!refTokenList.includes(refToken)) {
            refTokenList.push(refToken);
        }
        return refToken; 
    } catch (error) {
        console.log(error);   
    }
}

function generateAccessAndReferenceToken(payload) {
    try {
        const refToken = getReferenceToken(payload);
        const accessToken = getAccessToken(payload);
        return {
            "accessToken": accessToken,
            "referenceToken": refToken
        }
    } catch (error) {
        console.log(error);
    }
}

function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        const accessToken = authHeader && authHeader.split(" ")[1];
        if(accessToken == null) {
            sendResponse.setError(401, "Forbidden request");
            sendResponse.send(res);
        }
        //if token present
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
            if(error) {
                console.log(error);
                sendResponse.setError(403, "Invalid access token");
                sendResponse.send(res);
            }
            req.payload = payload;
            next();
        });
    } catch (error) {
        console.log(error);
    }
}

function generateAccessTokenFromRefToken(req, res, next) {
    try {
        const refToken = req.body.refToken;
        if(!refToken) {
            sendResponse.setSuccess(401, 'Bad request', {"status": "failed"});
            return sendResponse.send(res);
        }
        if(!refTokenList.includes(refToken)) {
            sendResponse.setSuccess(403, 'Invalid Reference Token', {"status": "failed"});
            return sendResponse.send(res);
        }
        //if reference token present
        jwt.verify(refToken, process.env.REFRESH_TOKEN_SECRET, (error, payload) => {
            if(error) {
                console.log(error);
                sendResponse.setSuccess(403, 'Invalid Reference Token', {"status": "failed"});
                return sendResponse.send(res);
            }
            const newPayLoad = { "name": payload.name };
            const newAccessToken = getAccessToken(newPayLoad);
            const accessAndReferenceToken = {
                "accessToken": newAccessToken,
                "referenceToken": refToken
            }
            sendResponse.setSuccess(200, 'Success', accessAndReferenceToken);
            return sendResponse.send(res);
        });

    } catch (error) {
        console.log(error);
    }
}

function deleteRefToken(refToken) {
    refTokenList = refTokenList.filter((token) => token !== refToken);
}

module.exports = { authenticateToken, generateAccessTokenFromRefToken, generateAccessAndReferenceToken, 
    deleteRefToken }