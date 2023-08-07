require("dotenv").config();
const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const mysql = require("mysql");
const bodyparser = require("body-parser");
const crypto = require("crypto");
const ejs = require("ejs");
const { log, error } = require("console");
const nodemailer = require("nodemailer");

const Sequelize = require('sequelize');
const sequelize = new Sequelize('BookSwap', 'root', 'database', {
  host: 'localhost',
  dialect: "mysql"
});

sequelize.authenticate().then(() => {
   console.log('Connection has been established successfully.');
}).catch((error) => {
   console.error('Unable to connect to the database: ', error);
});

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DATABASEPOSSWORD,
  database: "BookSwap",
});
db.connect((err) => {
  if (!err) {
    console.log("successfully connected to mysql database");
  } else {
    console.log("error in connectiong the database");
  }
});

// Configure Passport.js
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Field name for email in the signin form
      passwordField: "password", // Field name for password in the signin form
    },
    (email, password, done) => {
      const query = "SELECT * FROM users WHERE email = ?";
      db.query(query, [email], (err, results) => {
        if (err) return done(err);

        if (results.length === 0) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const user = results[0];
        const passwordHash = crypto
          .createHash("sha256")
          .update(password + user.password_salt)
          .digest("hex");

        if (passwordHash !== user.password_hash) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return done(err);

    if (results.length === 0) {
      return done(new Error("User not found"));
    }

    return done(null, results[0]);
  });
});

// Configure middleware
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
/* TO MAINTAIN SESSION UNTIL BROWSER IS CLOSED
--------------------------------------------------------- */
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
/* -------------------------------------------------------- */

/* TO MAINTAIN SESSION FOR ONE DAY 
--------------------------------------------------------- */
/* const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "mynameispragyan",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
  })
); */
/* -------------------------------------------------------- */

app.use(passport.initialize());
app.use(passport.session());

/* HOME ROUTE 
-------------------------------------------------------------*/
app.get("/", (req, res) => {
  res.render("home");
});

// app.post("/", (req, res) => {
//   console.log(req.body);
//   if (req.body.fName == "pragyan") {
//     return res.send("yes");
//   }
//   return res.send("no");
// });

/* profile ROUTE 
-------------------------------------------------------------*/
app.get("/profile", function (req, res) {
  if (req.isAuthenticated()) {
    const user = req.user;
    delete user.password_hash;
    delete user.password_salt;
    delete user.created_at;
    // console.log(user);
    res.render("profile", { user: user });
  } else {
    res.redirect("/signin");
  }
});

app.post("/profile",function(req,res){
  // console.log(req.body);
  // console.log(req.user);
  const updateQuery = 'UPDATE users SET full_name=?,contact=?,address=? WHERE id=?';
  db.query(updateQuery,[req.body.full_name,req.body.contact,req.body.address,req.user.id],(err)=>{
    if(err){
      console.log("error in update query of profile: ", err);
    } else {
      console.log("profile update success");
      return res.send("success");
    }
  })
})

/* signin ROUTE 
-------------------------------------------------------------*/
app.get("/signin", (req, res) => {
  res.render("signin", { error: false });
});

app.post("/signin", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      // If the user is not found or the email is incorrect, display a custom error message.
      console.log("Invalid id and password");
      return res.render("signin", { error: true });
    }

    // If the user is found and authentication is successful, log in the user.
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      // Redirect to the homer page upon successful signin.
      return res.redirect("/");
    });
  })(req, res, next);
});

/* SENDING MAIL 
-------------------------------------------------------------*/
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILFOROTP,
    pass: process.env.EMAILPASSWORD,
  },
});

/* SIGNUP ROUTE 
-------------------------------------------------------------*/
app.get("/signup", (req, res) => {
  res.render("signup", { error: false });
});

app.post("/signup", function (req, res) {
  const { email, password } = req.body;

  // Check if the email is already registered
  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      // The email is already registered, handle the error (e.g., show an error message)
      return res.render("signup", { error: true });
    }

    // The email is not registered, proceed with user registration (email and password are saved in temp table until users verfiy otp)
    const passwordSalt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto
      .createHash("sha256")
      .update(password + passwordSalt)
      .digest("hex");
    const otp = Math.floor(100000 + Math.random() * 900000);
    const insertQuery =
      "INSERT INTO temp_users ( email, password_hash, password_salt, otp) VALUES (?, ?, ?,?)";

    /* SENDING MAIL 
    -------------------------------------------------------------*/
    const mailOptions = {
      from: "noreply_BookSwap@gmail.com",
      to: email,
      subject: "Test Email from BookSwap",
      text: "This is a test email sent from BookSwap and your otp is: " + otp,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent successfully!");
        // console.log('Response:', info);
      }
    });

    db.query(
      insertQuery,
      [email, passwordHash, passwordSalt, otp],
      (err, results) => {
        if (err) throw err;
        const newRecordId = results.insertId;
        console.log("New user created and inserted Successfully in temp table");
        res.render("verfiy-otp", { newRecordId: newRecordId, error: false });
      }
    );
  });
});


/* VERFIY-OTP ROUTE 
-------------------------------------------------------------*/
// app.get("/verfiy-otp",checkFormSubmitted,(req,res) => {
//   res.render("verfiy-otp");
// });

app.post("/verfiy-otp", (req, res) => {
  const { id, otp } = req.body;
  const query = "SELECT * FROM temp_users WHERE id = ? and otp = ?";
  db.query(query, [id, otp], (err, rows) => {
    if (err) {
      return console.log("Error in query: ", err);
    }
    if (rows.length === 0) {
      // Wrong OTP submited by users
      return res.render("verfiy-otp", {
        newRecordId: req.body.id,
        error: true,
      });
    }
    // OTP is verfied, now transfer data from temp table to main table and also delete from temp table
    const { email, password_hash, password_salt } = rows[0];
    const transferQuery =
      "INSERT INTO users(email, password_hash, password_salt) VALUES (?,?,?)";
    db.query(
      transferQuery,
      [email, password_hash, password_salt],
      (err, result) => {
        if (err) {
          return console.log("Error in transfer Query: ", err);
        }
        const deleteQuery = "DELETE FROM temp_users WHERE id = ?";
        db.query(deleteQuery, [id], (err) => {
          if (err) {
            return console.log("error in delete query: ", err);
          }
          console.log(
            "Transfer and delete success from temp table to main table"
          );
          res.redirect("/signin");
        });
      }
    );
  });
});

/* LOGOUT ROUTE 
-------------------------------------------------------------*/
app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
