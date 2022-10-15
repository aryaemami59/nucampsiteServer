const routerName = "partner";
const express = require("express");
const Partner = require(`../models/${routerName}`);
const { verifyAdmin, verifyUser } = require("../authenticate");

const partnerRouter = express.Router();

partnerRouter
  .route("/")
  .get((req, res, next) => {
    Partner.find()
      .then(partners => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partners);
      })
      .catch(err => next(err));
  })
  .post(verifyUser, verifyAdmin, ({ body }, res, next) => {
    Partner.create(body)
      .then(partner => {
        console.log(`${routerName} Created `, partner);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner);
      })
      .catch(err => next(err));
  })
  .put(verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /${routerName}s`);
  })
  .delete(verifyUser, verifyAdmin, (req, res, next) => {
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
  .get(({ params: { partnerId } }, res, next) => {
    Partner.findById(partnerId)
      .then(partner => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner);
      })
      .catch(err => next(err));
  })
  .post(verifyUser, ({ params: { partnerId } }, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /${routerName}s/${partnerId}`);
  })
  .put(
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
  .delete(verifyUser, verifyAdmin, ({ params: { partnerId } }, res, next) => {
    Partner.findByIdAndDelete(partnerId)
      .then(response => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch(err => next(err));
  });

module.exports = partnerRouter;
