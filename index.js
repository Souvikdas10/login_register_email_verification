const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const userAuth = require("./middleware/UserAuth");
const session = require('express-session');
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'abhishek',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(cookieParser())
app.use(express.urlencoded({
    extended: true
}));

// app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", "views");

const dbcon = "mongodb+srv://souvikdb:cSgmsmo8GCvTW05X@cluster0.bsndvpo.mongodb.net/Auth_jwt_emailverify";

app.use(userAuth.authJwt);

const userRoute = require("./route/User");
app.use(userRoute);

port = process.env.PORT || 5634;

mongoose.connect(dbcon, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res => {
    app.listen(port, () => {
        console.log("Database Connected...");
        console.log(`Server Running On http://localhost:${port}`);
    })
}).catch(err => {
    console.log(err);
})