const routerName = "favorite";
const express = require("express");
const Favorite = require(`../models/${routerName}`);
const { verifyUser } = require("../authenticate");
const cors = require("./cors");
const Campsite = require(`../models/campsite`);

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then(favorites => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          req.body.forEach(campsite => {
            if (!favorite.campsites.includes(campsite._id)) {
              favorite.campsites.push(campsite._id);
            }
          });
          favorite
            .save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch(err => next(err));
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body })
            .then(favorite => {
              console.log(`${routerName} Created `, favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /${routerName}s`);
  })
  .delete(cors.corsWithOptions, verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        } else {
          res.setHeader("Content-Type", "text/plain");
          res.end(`You do not have any ${routerName}s to delete.`);
        }
      })
      .catch(err => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /${routerName}s:/campsiteId`);
  })
  .post(cors.corsWithOptions, verifyUser, (req, res, next) => {
    // console.log(Campsite.findById(req.params.campsiteId));
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        console.log(campsite, "campsite");
        if (campsite) {
          Favorite.findOne({ user: req.user._id })
            .then(favorite => {
              if (favorite) {
                if (!favorite.campsites.includes(req.params.campsiteId)) {
                  favorite.campsites.push(req.params.campsiteId);
                  favorite
                    .save()
                    .then(favorite => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    })
                    .catch(err => next(err));
                } else {
                  res.setHeader("Content-Type", "text/plain");
                  res.end(
                    `That campsite is already in the list of ${routerName}s!`
                  );
                  // err = new Error(
                  //   `That campsite is already in the list of ${routerName}s!`
                  // );
                  // err.status = 404;
                  // return next(err);
                }
              } else {
                Favorite.create({
                  user: req.user._id,
                  campsites: [req.params.campsiteId],
                })
                  .then(favorite => {
                    console.log(`${routerName} Created `, favorite);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  })
                  .catch(err => next(err));
              }
            })
            .catch(err => next(err));
        } else {
          // res.statusCode = 404;
          // res.setHeader("Content-Type", "text/plain");
          // res.end(`${routerName} ${req.params.campsiteId} not found`);
          err = new Error(`${routerName} ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /${routerName}s/${req.params.campsiteId}`
    );
  })
  .delete(cors.corsWithOptions, verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          favorite.campsites = favorite.campsites.filter(
            campsite => campsite.toString() !== req.params.campsiteId
          );
          favorite
            .save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch(err => next(err));
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain");
          res.end(`there are no ${routerName}s to delete.`);
        }
      })
      .catch(err => next(err));
  });

module.exports = favoriteRouter;
