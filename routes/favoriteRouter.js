const routerName = "favorite";
const express = require("express");
const Favorite = require(`../models/${routerName}`);
const { verifyUser } = require("../authenticate");
const { cors, corsWithOptions } = require("./cors");
const Campsite = require(`../models/campsite`);

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors, verifyUser, ({ user: { _id: user } }, res, next) => {
    Favorite.find({ user })
      .populate("user")
      .populate("campsites")
      .then(favorites => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch(err => next(err));
  })
  .post(
    corsWithOptions,
    verifyUser,
    ({ user: { _id: user }, body }, res, next) => {
      Favorite.findOne({ user })
        .then(favorite => {
          if (favorite) {
            body.forEach(campsite => {
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
            return;
          }
          Favorite.create({ user, campsites: body })
            .then(favorite => {
              console.log(`${routerName} Created `, favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch(err => next(err));
        })
        .catch(err => next(err));
    }
  )
  .put(corsWithOptions, verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /${routerName}s`);
  })
  .delete(corsWithOptions, verifyUser, ({ user: { _id: user } }, res, next) => {
    Favorite.findOneAndDelete({ user })
      .then(favorite => {
        if (favorite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
          return;
        }
        res.setHeader("Content-Type", "text/plain");
        res.end(`You do not have any ${routerName}s to delete.`);
      })
      .catch(err => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors, verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /${routerName}s:/campsiteId`);
  })
  .post(
    corsWithOptions,
    verifyUser,
    ({ user: { _id: user }, params: { campsiteId } }, res, next) => {
      Campsite.findById(campsiteId) // Bonus Challenge
        .then(campsite => {
          if (campsite) {
            Favorite.findOne({ user })
              .then(favorite => {
                if (favorite) {
                  if (favorite?.campsites.includes(campsiteId)) {
                    res.setHeader("Content-Type", "text/plain");
                    res.end(`That campsite is already a ${routerName}!`);
                    return;
                  }
                  favorite.campsites.push(campsiteId);
                  favorite
                    .save()
                    .then(favorite => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    })
                    .catch(err => next(err));
                  return;
                }
                Favorite.create({ user, campsites: [campsiteId] })
                  .then(favorite => {
                    console.log(`${routerName} Created `, favorite);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  })
                  .catch(err => next(err));
              })
              .catch(err => next(err));
            return;
          }
          err = new Error(`${routerName} ${campsiteId} not found`);
          err.status = 404;
          return next(err);
        })
        .catch(err => next(err));
    }
  )
  .put(corsWithOptions, verifyUser, ({ params: { campsiteId } }, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /${routerName}s/${campsiteId}`);
  })
  .delete(
    corsWithOptions,
    verifyUser,
    ({ params: { campsiteId }, user: { _id: user } }, res, next) => {
      Favorite.findOne({ user })
        .then(favorite => {
          if (favorite) {
            favorite.campsites = favorite.campsites.filter(
              campsite => campsite.toString() !== campsiteId
            );
            favorite
              .save()
              .then(favorite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              })
              .catch(err => next(err));
            return;
          }
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain");
          res.end(`there are no ${routerName}s to delete.`);
        })
        .catch(err => next(err));
    }
  );

module.exports = favoriteRouter;
