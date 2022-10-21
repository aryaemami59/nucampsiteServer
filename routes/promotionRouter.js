const routerName = "promotion";
const express = require("express");
const Promotion = require(`../models/${routerName}`);
const { verifyAdmin, verifyUser } = require("../authenticate");
const cors = require("./cors");

const promotionRouter = express.Router();

promotionRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Promotion.find()
      .then(promotions => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotions);
      })
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ body }, res, next) => {
      Promotion.create(body)
        .then(promotion => {
          console.log(`${routerName} Created `, promotion);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        })
        .catch(err => next(err));
    }
  )
  .put(cors.corsWithOptions, verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /${routerName}s`);
  })
  .delete(cors.corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    Promotion.deleteMany()
      .then(response => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch(err => next(err));
  });

promotionRouter
  .route(`/:${routerName}Id`)
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, ({ params: { promotionId } }, res, next) => {
    Promotion.findById(promotionId)
      .then(promotion => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    verifyUser,
    ({ params: { promotionId } }, res) => {
      res.statusCode = 403;
      res.end(`POST operation not supported on /${routerName}s/${promotionId}`);
    }
  )
  .put(
    cors.corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ params: { promotionId }, body: $set }, res, next) => {
      Promotion.findByIdAndUpdate(promotionId, { $set }, { new: true })
        .then(promotion => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        })
        .catch(err => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ params: { promotionId } }, res, next) => {
      Promotion.findByIdAndDelete(promotionId)
        .then(response => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch(err => next(err));
    }
  );

module.exports = promotionRouter;
