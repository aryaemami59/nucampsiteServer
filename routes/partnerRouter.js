const routerName = "partner";
const express = require("express");
const Partner = require(`../models/${routerName}`);
const { verifyAdmin, verifyUser } = require("../authenticate");
const cors = require("./cors");

const partnerRouter = express.Router();

partnerRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Partner.find()
      .then(partners => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partners);
      })
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ body }, res, next) => {
      Partner.create(body)
        .then(partner => {
          console.log(`${routerName} Created `, partner);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(partner);
        })
        .catch(err => next(err));
    }
  )
  .put(cors.corsWithOptions, verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /${routerName}s`);
  })
  .delete(cors.corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    Partner.deleteMany()
      .then(response => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch(err => next(err));
  });

partnerRouter
  .route(`/:${routerName}Id`)
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, ({ params: { partnerId } }, res, next) => {
    Partner.findById(partnerId)
      .then(partner => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner);
      })
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, verifyUser, ({ params: { partnerId } }, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /${routerName}s/${partnerId}`);
  })
  .put(
    cors.corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ params: { partnerId }, body: $set }, res, next) => {
      Partner.findByIdAndUpdate(partnerId, { $set }, { new: true })
        .then(partner => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(partner);
        })
        .catch(err => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    verifyUser,
    verifyAdmin,
    ({ params: { partnerId } }, res, next) => {
      Partner.findByIdAndDelete(partnerId)
        .then(response => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch(err => next(err));
    }
  );

module.exports = partnerRouter;
