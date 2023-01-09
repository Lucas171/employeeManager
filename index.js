const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

//
const session = require("express-session");
const cookieParser = require("cookie-parser");
// const { reset } = require("nodemon");
const bcrypt = require("bcrypt");
const saltRounds = 10;

//
const app = express();
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(
    session({ secret: "SecretKey!", resave: true, saveUninitialized: true })
);
app.use(bodyParser.json());
const uri = "mongodb+srv://Lucas17:Samyu177@cluster0.frfuy.mongodb.net/Payroll";
mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB Connected…");
    })
    .catch((err) => console.log(err));

// GLOBAL VARIABLES
var admins = 0;
var employees = 0;

const positions = [
    "Administrative Assistant",
    "Receptionist",
    "Office Manager",
    "Auditing Clerk",
    "Bookkeeper",
    "Account Executive",
    "Branch Manager",
    "Business Manager",
    "Quality Control Coordinator",
    "Administrative Manager",
    "Chief Executive Officer",
    "Business Analyst",
    "Risk Manager",
    "Human Resources",
    "Office Assistant",
    "Secretary",
    "Office Clerk",
    "File Clerk",
    "Account Collector",
    "Administrative Specialist",
    "Executive Assistant",
    "Program Administrator",
    "Program Manager",
    "Administrative Analyst",
    "Data Entry",
];

const payScale = [
    "$45,000/yr",
    "$35/hr",
    "$28/hr",
    "$30hr",
    "$67,000/yr",
    "$22/hr",
    "$66,000/yr",
    "$71,000/yr",
    "$19/hr",
];
const phoneNumbers = [
    "(503) 123-4567",
    "(646) 123-4567",
    "(503) 987-6543",
    "(503) 234-5678",
    "(212) 123-4567",
    "(416) 123-4567",
    "(513) 123-4567",
    "(616) 123-4567",
    "(513) 987-6543",
    "(513) 234-5678",
    "(222) 123-4567",
    "(426) 123-4567",
    "(523) 123-4567",
    "(626) 123-4567",
    "(523) 987-6543",
    "(523) 234-5678",
    "(232) 123-4567",
    "(436) 123-4567",
];
let globalEmail = "";
// SCHEMAS ///////////////////////////

const userSchema = new mongoose.Schema({
    email: String,
    fName: String,
    lName: String,
    password: String,
    admin: Boolean,
    position: String,
    currentPay: String,
    department: String,
    yearsWorked: Number,
    number: String,
    tel: String,
});

const User = mongoose.model("User", userSchema);

// FUNCTIONS
function checkSignIn(req, res, next) {
    if (req.session.user) {
        next(); //If session exists, proceed to page
    } else {
        res.render("index.ejs", {
            //changed
            message: null,
            color: null,
        });
    }
}

function removeSignIn(req, res, next) {
    // Auth.findOneAndDelete({ name: "authentication" }, (err, auth) => {
    //     next();
    // });
    next();
}

// APP.USE
app.use(bodyParser.urlencoded({ extended: true }));

// / Route ///////////////////
app.get("/", checkSignIn, (req, res, next) => {
    let user = req.session.user;
    User.findOne({ email: user }, (err, userfound) => {
        User.find({ admin: false }, (err, employeeArr) => {
            employees = employeeArr.length;
            User.find({ admin: true }, (err, adminArr) => {
                admins = adminArr.length;
                res.render("homePage", {
                    title: userfound.fName,
                    adminCount: admins,
                    employeeCount: employees,
                    employeeArr: employeeArr,
                    adminArr: adminArr,
                    adminUser: userfound.admin,
                    currentUser: userfound.email,
                    userType: userfound.admin,
                    message: null,
                    color: null,
                });
            });
        });
    });
});
app.post("/", (req, res) => {
    User.findOne({ email: req.body.email.toLowerCase() }, (err, user) => {
        if (err) {
            console.log(err);
            res.render("index.ejs", {
                message: "An error has occured. Please try again.",
                color: "danger",
            });
        } else if (user === null) {
            res.render("signup.ejs", {
                message: "Looks like you dont have an account. Sign up",
                color: "warning",
            });
        } else if (user) {
            bcrypt.compare(
                req.body.password,
                user.password,
                function (err, result) {
                    if (result == true) {
                        req.session.user = user.email;
                        res.redirect("/");
                    } else {
                        res.render("index.ejs", {
                            message:
                                "Email or password is incorrect. Try again.",
                            color: "danger",
                        });
                    }
                }
            );
        }
    });
});
// /signup Route ///////////////////

app.get("/signup", (req, res) => {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signup.ejs", {
            message: null,
            color: null,
        });
    }
});
app.post("/signup", (req, res) => {
    let password = req.body.password;
    let password2 = req.body.password2;
    var lName = req.body.lName;
    var fName = req.body.fName;
    let email = req.body.email.toLowerCase();
    let isAdmin = req.body.type === "true";
    let yearsWorked = Math.floor(Math.random() * 20) + 5;
    let tel = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
    let currentPay = payScale[Math.floor(Math.random() * payScale.length)];
    let position = positions[Math.floor(Math.random() * positions.length)];
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else if (user == null) {
            if (password === password2) {
                bcrypt.hash(
                    req.body.password,
                    saltRounds,
                    function (err, hash) {
                        async function update() {
                            try {
                                const user = new User({
                                    email: email,
                                    fName: fName,
                                    lName: lName,
                                    password: hash,
                                    admin: isAdmin,
                                    currentPay: currentPay,
                                    yearsWorked: yearsWorked,
                                    tel: tel,
                                    position: position,
                                });
                                await user.save();
                                req.session.user = user.email;

                                await User.find(
                                    { admin: false },
                                    (err, employeeArr) => {
                                        employees = employeeArr.length;
                                        User.find(
                                            { admin: true },
                                            (err, adminArr) => {
                                                admins = adminArr.length;
                                                res.render("homePage", {
                                                    title: user.fName,
                                                    adminCount: admins,
                                                    employeeCount: employees,
                                                    employeeArr: employeeArr,
                                                    adminArr: adminArr,
                                                    adminUser: user.admin,
                                                    currentUser: user.email,
                                                    userType: user.admin,
                                                    message: null,
                                                    color: null,
                                                });
                                            }
                                        );
                                    }
                                );
                            } catch (err) {
                                console.log(err);
                            }
                        }
                        update();
                    }
                );
            } else {
                res.render("signup.ejs", {
                    message: "Passwords do not match. Try Again.",
                    color: "danger",
                });
            }
        } else if (user) {
            res.render("index.ejs", {
                message: "Looks like you already have an account. Please Login",
                color: "warning",
            });
        }
    });
});

app.post("/signup2", removeSignIn, (req, res, next) => {
    res.render("signup.ejs", {
        message: null,
        color: null,
    });
});

//  /logout route /////////////////////////////

app.post("/logout", removeSignIn, (req, res, next) => {
    req.session.destroy(function () {});
    res.render("index.ejs", {
        message: "You have successfully logged out.",
        color: "success",
    });
});

app.post("/deleteRecord", checkSignIn, (req, res, next) => {
    User.findOneAndDelete({ email: req.session.user }, (err, user) => {
        if (user === null) {
            res.render("index.ejs", {
                message: "An error has occured. Please try agin.",
                color: "danger",
            });
        } else if (user) {
            req.session.destroy(function () {});
            res.render("signup.ejs", {
                message: "Your account has been successfully deleted.",
                color: "success",
            });
        }
    });
});

app.post("/editRecord", checkSignIn, (req, res, next) => {
    var fName = req.body.fName;
    var lName = req.body.lName;
    var position = "";
    var yearsWorked = 0;
    var email = req.body.email;
    console.log(req.body);

    User.findOne({ email: email }, (err, userFound) => {
        if (fName === "") {
            fName = userFound.fName;
        }
        if (lName === "") {
            lName = userFound.lName;
        }
        if (userFound.admin) {
            position = req.body.position;
            yearsWorked = req.body.yearWorked;
            alert(position, yearsWorked)
            if (position === undefined || position === "") {
                position = userFound.position;
            }
            if (yearsWorked === undefined || yearsWorked === "") {
                yearsWorked = userFound.yearsWorked;
            }
        } else if (!userFound.admin) {
            position = userFound.position;
            yearsWorked = userFound.yearsWorked;
        }

        User.findOneAndUpdate(
            { email: userFound.email },
            {
                fName: fName,
                lName: lName,
                position: position,
                yearsWorked: yearsWorked,
            },
            (err, user) => {
                User.find({ admin: false }, (err, employeeArr) => {
                    employees = employeeArr.length;
                    User.find({ admin: true }, (err, adminArr) => {
                        admins = adminArr.length;
                        res.render("homePage", {
                            title: user.fName,
                            adminCount: admins,
                            employeeCount: employees,
                            employeeArr: employeeArr,
                            adminArr: adminArr,
                            adminUser: user.admin,
                            currentUser: user.email,
                            userType: user.admin,
                            message: "Changes were saved.",
                            color: "success",
                        });
                    });
                });
            }
        );
    });
    // });
});

app.post("/test", (req, res) => {
    req.session.user = req.body.email;
    res.redirect("/");
});
// remaining routes
app.get("*", checkSignIn, function (req, res) {
    res.redirect("/");
});

// APP.LISTEN///////////////////
let port = process.env.PORT;

if (port == null || port == "") {
    port = 3000;
}
app.listen(port, (req, res) => {
    console.log("server is running");
});
