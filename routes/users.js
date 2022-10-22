const express = require("express");
const User = require("../models/user");
const passport = require("passport");
const { verifyAdmin, verifyUser, getToken } = require("../authenticate");
const { corsWithOptions } = require("./cors");

const router = express.Router();

/* GET users listing. */
router.get("/", corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
  User.find()
    .then(users => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(users);
    })
    .catch(err => next(err));
});

router.post(
  "/signup",
  corsWithOptions,
  ({ body: { username, password, firstname, lastname } }, res) => {
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
  }
);

router.post(
  "/login",
  corsWithOptions,
  passport.authenticate("local"),
  ({ user: { _id } }, res) => {
    const token = getToken({ _id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token,
      status: "You are successfully logged in!",
    });
  }
);

router.get("/logout", corsWithOptions, ({ session }, res, next) => {
  if (session) {
    session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
    return;
  }
  const err = new Error("You are not logged in!");
  err.status = 401;
  return next(err);
});

router.get(
  "/facebook/token",
  passport.authenticate("facebook-token"),
  ({ user }, res) => {
    if (user) {
      const { _id } = user;
      const token = getToken({ _id });
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        token,
        status: "You are successfully logged in!",
      });
    }
  }
);

module.exports = router;
