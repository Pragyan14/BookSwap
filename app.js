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
const { User,TempUser } = require("./models");

const app = express();

// Generate random book id
function generateBookId(userId, bookTitle) {
  const titlePortion = bookTitle.slice(0, 3);

  const timestampSuffix = Date.now().toString().slice(-6);

  const uniqueId = `BS${userId}${titlePortion}${timestampSuffix}`;
  return uniqueId.toUpperCase();
}

// SENDING MAIL FUNCTION
async function sendOtpEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAILFOROTP,
        pass: process.env.EMAILPASSWORD,
      },
    });

    const mailOptions = {
      from: "noreply_BookSwap@gmail.com",
      to: email,
      subject: "Test Email from BookSwap",
      text: `This is a test email sent from BookSwap and your OTP is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.response);
    return "Email sent successfully!";
  } catch (error) {
    console.error("Error sending email:", error);
    return "Error sending email.";
  }
}

// Configure Passport.js
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Field name for email in the signin form
      passwordField: "password", // Field name for password in the signin form
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const passwordHash = crypto
          .createHash("sha256")
          .update(password + user.password_salt)
          .digest("hex");

        if (passwordHash !== user.password_hash) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (user_id, done) => {
  User.findOne({ where: { user_id: user_id } })
    .then((user) => {
      if (!user) {
        return done(new Error("User not found"));
      }
      return done(null, user);
    })
    .catch((err) => {
      return done(err);
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

/* SIGNIN ROUTE 
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

      // Redirect to the home page upon successful signin.
      return res.redirect("/");
    });
  })(req, res, next);
});

/* SIGNUP ROUTE 
-------------------------------------------------------------*/
app.get("/signup", (req, res) => {
  res.render("signup", { error: false });
});

app.post("/signup", async function (req, res) {
  const { email, password } = req.body;

  // Check if the email is already registered
  User.findOne({ attributes: ["email"], where: { email: email } })
    .then((user) => {
      if (user) {
        return res.render("signup", { error: true });
      }

      // The email is not registered, proceed with user registration email and password are saved in temp table until users verfiy otp
      const otp = Math.floor(100000 + Math.random() * 900000);
      sendOtpEmail(email, otp);

      const passwordSalt = crypto.randomBytes(16).toString("hex");
      const passwordHash = crypto
        .createHash("sha256")
        .update(password + passwordSalt)
        .digest("hex");

      TempUser.create({ email: email, password_hash: passwordHash, password_salt: passwordSalt, otp: otp,})
        .then((createdTempUser) => {
          console.log(
            "New user created and inserted successfully in temp table"
          );
          res.render("verfiy-otp", {
            newRecordId: createdTempUser.id,
            error: false,
          });
        })
        .catch((err) => {
          console.error("Error creating temp user:", err);
        });
    })
    .catch((err) => {
      console.error("Error checking existing user:", err);
    });
});

/* VERFIY-OTP ROUTE 
-------------------------------------------------------------*/
// app.get("/verfiy-otp",checkFormSubmitted,(req,res) => {
//   res.render("verfiy-otp");
// });

app.post("/verfiy-otp", (req, res) => {
  const { id, otp } = req.body;
  TempUser.findOne({ where: { id: id, otp: otp } })
    .then((tempUser) => {
      if (!tempUser) {
        // Wrong OTP submited by users
        return res.render("verfiy-otp", { newRecordId: req.body.id, error: true,});
      }

      // OTP is verfied, now transfer data from temp table to main table and also delete from temp table
      const { email, password_hash, password_salt } = tempUser;
      User.create({ email: email, password_hash: password_hash, password_salt: password_salt,})
        .then(() => {
          // Delete the temporary record
          return TempUser.destroy({ where: { id: id } });
        })
        .then(() => {
          console.log(
            "Transfer temporary user from temporary table to main table and delete it"
          );
          res.redirect("/signin");
        })
        .catch((err) => {
          console.error("Error in delete and transfer query: ", err);
        });
    })
    .catch((err) => {
      console.log("error in verfiy otp query: ", err);
    });
});

/* HOME ROUTE 
-------------------------------------------------------------*/
app.get("/", async (req, res) => {
  res.render("home");
});

/* PROFILE ROUTE 
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

// app.post("/profile", function (req, res) {
//   const updateQuery =
//     "UPDATE users SET full_name=?,contact=?,address=? WHERE user_id=?";
//   db.query(
//     updateQuery,
//     [req.body.full_name, req.body.contact, req.body.address, req.user.user_id],
//     (err) => {
//       if (err) {
//         console.log("error in update query of profile: ", err);
//       } else {
//         console.log("profile update success");
//         return res.send("success");
//       }
//     }
//   );
// });

// UPLOAD BOOK
// app.post("/uploadBook", (req, res) => {
//   if (req.isAuthenticated()) {
//     // console.log(req.body);
//     const userId = req.user.user_id;
//     const bookTitle = req.body.title;
//     const uniqueBookId = generateBookId(userId, bookTitle);
//     // console.log(uniqueBookId);
//     const insertQuery =
//       "INSERT INTO books(book_id,user_id,title,author,book_description) VALUES (?,?,?,?,?)";
//     db.query(
//       insertQuery,
//       [
//         uniqueBookId,
//         userId,
//         req.body.title,
//         req.body.author,
//         req.body.book_description,
//       ],
//       (err, rows) => {
//         if (err) {
//           console.log("Error in insert ", err);
//         } else {
//           return res.send("success");
//         }
//       }
//     );
//   }
// });

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
