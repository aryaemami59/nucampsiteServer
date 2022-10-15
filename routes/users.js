const express = require("express");
const User = require("../models/user");
const passport = require("passport");
const { verifyAdmin, verifyUser, getToken } = require("../authenticate");

const router = express.Router();

/* GET users listing. */
router.get("/", verifyUser, verifyAdmin, (req, res, next) => {
  User.find()
    .then(users => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(users);
    })
    .catch(err => next(err));
});

router.post("/signup", (req, res) => {
  const { username, password, firstname, lastname } = req.body;
  User.register(new User({ username }), password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ err });
      return;
    }
    user.firstname = firstname ?? undefined;
    user.lastname = lastname ?? undefined;
    user.save(err => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err });
        return;
      }
      passport.authenticate("local")(req, res, () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "Registration Successful!" });
      });
    });
  });
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  const { _id } = req.user;
  const token = getToken({ _id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: true,
    token,
    status: "You are successfully logged in!",
  });
});

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
    return;
  }
  const err = new Error("You are not logged in!");
  err.status = 401;
  return next(err);
});

module.exports = router;
