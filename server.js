const express = require("express");
const util = require("./app/utils/util");
const ctrl = require("./app/controllers/mycontroller");
const auth = require("./app/middlewares/auth")
const app = express();
require("dotenv").config();

app.use(express.json());

app.get('/post', auth.authenticateToken, ctrl.getPosts);
app.post('/login', ctrl.login);
app.post('/token', ctrl.generateAccessTokenFromRefToken);
app.delete('/logout', ctrl.logout);

app.listen(3000);   