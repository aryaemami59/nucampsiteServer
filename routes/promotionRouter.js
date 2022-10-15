const routerName = "promotion";
const express = require("express");
const Promotion = require(`../models/${routerName}`);
const authenticate = require("../authenticate");

const promotionRouter = express.Router();

promotionRouter
  .route("/")
  .get((req, res, next) => {
    Promotion.find()
      .then(promotions => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotions);
      })
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.create(req.body)
      .then(promotion => {
        console.log(`${routerName} Created `, promotion);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /${routerName}s`);
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotion.deleteMany()
        .then(response => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch(err => next(err));
    }
  );

promotionRouter
  .route(`/:${routerName}Id`)
  .get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then(promotion => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /${routerName}s/${req.params.promotionId}`
    );
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.findByIdAndUpdate(
      req.params.promotionId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then(promotion => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch(err => next(err));
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotion.findByIdAndDelete(req.params.promotionId)
        .then(response => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch(err => next(err));
    }
  );

module.exports = promotionRouter;
