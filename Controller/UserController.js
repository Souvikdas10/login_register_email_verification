const Usermodel = require('../model/Usermodel')
const Tokenmodel = require('../model/token')
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

userAuth = (req, res, next) => {
    if (req.user) {
        console.log('aa', req.user);
        next();
    } else {
        console.log('bb', req.user);
        res.redirect("/login");
    }
}

const home = (req, res) => {
    res.render('home', {
        data: req.user,
    })
}
const dashboard = (req, res) => {
    if (req.user) {
        Usermodel.find({}, function (err, userDetails) {
            if (!err) {
                res.render('dashboard', {
                    data: req.user,
                    details: userDetails,
                    message: req.flash('message'),
                })
            } else {
                console.log(err);
            }
        })
    }
}
const register = (req, res) => {
    res.render('register', {
        message: req.flash('message'),
        data: req.user,
    })
}

const registerCreate = (req, res) => {
    Usermodel({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    }).save().then((user) => {
        if (user) {
            // generate token
            Tokenmodel({
                _userId: user._id,
                token: crypto.randomBytes(16).toString('hex')
            }).save().then((token) => {
                if (token) {
                    var transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        secure: false,
                        requireTLS: true,
                        auth: {
                            user: "dassouvik9991@gmail.com",
                            pass: "xvyosdscrianoksg"                           
                        }
                    });
                    var mailOptions = {
                        from: 'no-reply@xyz.com',
                        to: user.email,
                        subject: 'Account Verification',
                        // text: 'Hello ' + req.body.name + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n'
                        text: 'Hello ' + req.body.name + ',\n\n' + 'Thank You! for contacting' + ',\n\n'+ 'As soon as possible we are contact you'
                    };
                    transporter.sendMail(mailOptions, function (err) {
                        if (err) {
                            console.log("Techniclal Issue...");
                        } else {
                            req.flash("message", "A Verfication Email Sent To Your Mail ID.... Please Verify By Click The Link.... It Will Expire By 24 Hrs...");
                            res.redirect("/login");
                        }
                    });
                } else {
                    console.log("Error When Create Token...", err);
                }
            })

        } else {
            console.log("Error When Create User...", err);
        }
    })
}



const confirmation = (req, res) => {
    Tokenmodel.findOne({ token: req.params.token }, (err, token) => {
        if (!token) {
            console.log("Verification Link May Be Expired :(");
        } else {
            Usermodel.findOne({ _id: token._userId, email: req.params.email }, (err, user) => {
                if (!user) {
                    req.flash("message", "User Not Found");
                    res.redirect("/login");
                } else if (user.isVerified) {
                    req.flash("message", "User Already Verified");
                    res.redirect("/login");
                } else {
                    user.isVerified = true;
                    user.save().then(result => {
                        req.flash("message", "Your Account Verified Successfully");
                        res.redirect("/login");
                    }).catch(err => {
                        console.log("Something Went Wrong...", err);
                    })
                }
            })
        }
    })
}



const login = (req, res) => {
    loginData = {}
    loginData.email = (req.cookies.email) ? req.cookies.email : undefined
    loginData.password = (req.cookies.password) ? req.cookies.password : undefined
    res.render('login', {
        data: loginData,
        data: req.user,
        message: req.flash('message'),
    })
}

const loginCreate = (req, res) => {
    Usermodel.findOne({
        email: req.body.email
    }, (err, data) => {
        if (data) {
            if (data.isVerified) {
                const hashPassword = data.password;
                if (bcrypt.compareSync(req.body.password, hashPassword)) {
                    const token = jwt.sign({
                        id: data._id,
                        name: data.name
                    }, "Souvik@123", { expiresIn: '5m' });
                    res.cookie("token", token);
                    if (req.body.rememberme) {
                        res.cookie('email', req.body.email)
                        res.cookie('password', req.body.password)
                    }
                    console.log(data);
                    req.flash("message", "Login Successfully");
                    res.redirect("/dashboard");
                } else {
                    console.log("Invalid Password...");
                    req.flash("message", "Invalid Password");
                    res.redirect("/login");
                }
            } else {
                console.log("Account Is Not Verified");
                req.flash("message", "Account Is Not Verified");
                res.redirect("/login");
            }
        } else {
            console.log("Invalid Email...");
            req.flash("message", "Invalid Email");
            res.redirect("/login");
        }
    })
}


const logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
}

module.exports = {
    home,
    dashboard,
    register,
    registerCreate,
    confirmation,
    login,
    loginCreate,
    logout,
    userAuth,

}