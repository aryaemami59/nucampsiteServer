const routerName = "campsite";
const express = require("express");
const Campsite = require(`../models/${routerName}`);
const { verifyAdmin, verifyUser } = require("../authenticate");
const { cors, corsWithOptions } = require("./cors");

const campsiteRouter = express.Router();

campsiteRouter
  .route("/")
  .options(corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors, (req, res, next) => {
    Campsite.find()
      .populate("comments.author")
      .then(campsites => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(campsites);
      })
      .catch(err => next(err));
  })
  .post(corsWithOptions, verifyUser, verifyAdmin, ({ body }, res, next) => {
    Campsite.create(body)
      .then(campsite => {
        console.log(`${routerName} Created `, campsite);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(campsite);
      })
      .catch(err => next(err));
  })
  .put(corsWithOptions, verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /${routerName}s`);
  })
  .delete(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    Campsite.deleteMany()
      .then(response => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch(err => next(err));
  });

campsiteRouter
  .route(`/:${routerName}Id`)
  .options(corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors, ({ params: { campsiteId } }, res, next) => {
    Campsite.findById(campsiteId)
      .populate("comments.author")
      .then(campsite => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(campsite);
      })
      .catch(err => next(err));
  })
  .post(corsWithOptions, verifyUser, ({ params: { campsiteId } }, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /${routerName}s/${campsiteId}`);
  })
  .put(
    corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ params: { campsiteId }, body: $set }, res, next) => {
      Campsite.findByIdAndUpdate(campsiteId, { $set }, { new: true })
        .then(campsite => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(campsite);
        })
        .catch(err => next(err));
    }
  )
  .delete(
    corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ params: { campsiteId } }, res, next) => {
      Campsite.findByIdAndDelete(campsiteId)
        .then(response => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch(err => next(err));
    }
  );

campsiteRouter
  .route(`/:${routerName}Id/comments`)
  .options(corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors, ({ params: { campsiteId } }, res, next) => {
    Campsite.findById(campsiteId)
      .populate("comments.author")
      .then(campsite => {
        if (campsite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(campsite.comments);
          return;
        }
        err = new Error(`Campsite ${campsiteId} not found`);
        err.status = 404;
        return next(err);
      })
      .catch(err => next(err));
  })
  .post(
    corsWithOptions,
    verifyUser,
    ({ params: { campsiteId }, body, user }, res, next) => {
      Campsite.findById(campsiteId)
        .then(campsite => {
          if (campsite) {
            body.author = user._id;
            campsite.comments.push(body);
            campsite
              .save()
              .then(campsite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(campsite);
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
  .put(
    corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ params: { campsiteId } }, res) => {
      res.statusCode = 403;
      res.end(
        `PUT operation not supported on /${routerName}s/${campsiteId}/comments`
      );
    }
  )
  .delete(
    corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ params: { campsiteId } }, res, next) => {
      Campsite.findById(campsiteId)
        .then(campsite => {
          const { comments } = campsite;
          if (campsite) {
            for (let i = comments.length - 1; i >= 0; i--) {
              campsite.comments.id(comments[i]._id).remove();
            }
            campsite
              .save()
              .then(campsite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(campsite);
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
  );

campsiteRouter
  .route(`/:${routerName}Id/comments/:commentId`)
  .options(corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors, ({ params: { campsiteId, commentId } }, res, next) => {
    Campsite.findById(campsiteId)
      .populate("comments.author")
      .then(campsite => {
        if (campsite?.comments.id(commentId)) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(campsite.comments.id(commentId));
          return;
        }
        err = !campsite
          ? new Error(`${routerName} ${campsiteId} not found`)
          : new Error(`Comment ${commentId} not found`);
        err.status = 404;
        return next(err);
      })
      .catch(err => next(err));
  })
  .post(
    corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ params: { campsiteId, commentId } }, res) => {
      res.statusCode = 403;
      res.end(
        `POST operation not supported on /${routerName}s/${campsiteId}/comments/${commentId}`
      );
    }
  )
  .put(
    corsWithOptions,
    verifyUser,
    ({ body, params: { campsiteId, commentId }, user: { _id } }, res, next) => {
      const { text, rating } = body;
      Campsite.findById(campsiteId)
        .then(campsite => {
          if (campsite?.comments.id(commentId)?.author.equals(_id)) {
            if (rating) {
              campsite.comments.id(commentId).rating = rating;
            }
            if (text) {
              campsite.comments.id(commentId).text = text;
            }
            campsite
              .save()
              .then(campsite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(campsite);
              })
              .catch(err => next(err));
          } else {
            if (!campsite) {
              err = new Error(`Campsite ${campsiteId} not found`);
              err.status = 404;
            } else if (!campsite.comments.id(commentId)) {
              err = new Error(`Comment ${commentId} not found`);
              err.status = 404;
            } else {
              err = new Error(
                "You are not authorized to perform this operation!"
              );
              err.status = 403;
            }
            return next(err);
          }
        })
        .catch(err => next(err));
    }
  )
  .delete(
    corsWithOptions,
    verifyUser,
    ({ params: { campsiteId, commentId }, user: { _id } }, res, next) => {
      Campsite.findById(campsiteId)
        .then(campsite => {
          if (campsite?.comments.id(commentId)?.author.equals(_id)) {
            campsite.comments.id(commentId).remove();
            campsite
              .save()
              .then(campsite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(campsite);
              })
              .catch(err => next(err));
          } else {
            if (!campsite) {
              err = new Error(`${routerName} ${campsiteId} not found`);
              err.status = 404;
            } else if (!campsite.comments.id(commentId)) {
              err = new Error(`Comment ${commentId} not found`);
              err.status = 404;
            } else {
              err = new Error(
                "You are not authorized to perform this operation!"
              );
              err.status = 403;
            }
            return next(err);
          }
        })
        .catch(err => next(err));
    }
  );

module.exports = campsiteRouter;
