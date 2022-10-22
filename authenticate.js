const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const FacebookTokenStrategy = require("passport-facebook-token");

const {
  facebook: { clientID, clientSecret },
  secretKey,
} = require("./config.js");

exports.facebookPassport = passport.use(
  new FacebookTokenStrategy(
    { clientID, clientSecret },
    (
      accessToken,
      refreshToken,
      {
        id: facebookId,
        displayName: username,
        name: { givenName, familyName },
      },
      done
    ) => {
      User.findOne({ facebookId }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (!err && user) {
          return done(null, user);
        }
        user = new User({ username });
        user.facebookId = facebookId;
        user.firstname = givenName;
        user.lastname = familyName;
        user.save((err, user) => (err ? done(err, false) : done(null, user)));
      });
    }
  )
);

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => jwt.sign(user, secretKey, { expiresIn: 3600 });

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload:", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) =>
      err ? done(err, false) : user ? done(null, user) : done(null, false)
    );
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });
exports.verifyAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user.admin) {
    return next();
  }
  err = new Error("You are not authorized to perform this operation!");
  err.status = 403;
  return next(err);
};
