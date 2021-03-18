const SendResponse = require("../utils/sendresponse");
const util = require("../utils/util");
const auth = require("../middlewares/auth");
const sendResponse = new SendResponse();

function getPosts(req, res, next) {
    try {
        const posts = util.getPosts();
        if(req.payload) {
            const post = posts.filter((mypost) => mypost.username === req.payload.name);
            sendResponse.setSuccess(200, 'Success', post);
            return sendResponse.send(res);
        }        
    } catch (error) {
        console.log(error);
    }
}

function login(req, res, next) {
    try {
        //First write code for authenticaton by using username and password
        //Once authentication done successfully then write code for token handling

        const user = { "name": req.body.username };
        const accessAndReferenceToken = auth.generateAccessAndReferenceToken(user);
        sendResponse.setSuccess(200, 'Success', accessAndReferenceToken);
        return sendResponse.send(res);
    } catch (error) {
        console.log(error);
    }
}

function generateAccessTokenFromRefToken(req, res, next) {
    try {        
        auth.generateAccessTokenFromRefToken(req, res);
    } catch (error) {
        console.log(error);
    }
}

function logout(req, res, next) {
    try {
        const refToken = req.body.refToken;
        if(!refToken) {
            sendResponse.setSuccess(401, 'Bad request', "Reference Token is missing");
            return sendResponse.send(res);
        }
        auth.deleteRefToken(refToken);
        sendResponse.setSuccess(200, 'Success', "Logged out successfully");
        return sendResponse.send(res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getPosts, login, generateAccessTokenFromRefToken, logout }