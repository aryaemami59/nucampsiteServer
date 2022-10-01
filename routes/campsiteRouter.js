const express = require("express");
const campsiteRouter = express.Router();
const routerName = "campsite";

campsiteRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res) => {
    res.end(`Will send all the ${routerName}s to you`);
  })
  .post((req, res) => {
    res.end(
      `Will add the ${routerName}: ${req.body.name} with description: ${req.body.description}`
    );
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /${routerName}s`);
  })
  .delete((req, res) => {
    res.end(`Deleting all ${routerName}s`);
  });

campsiteRouter
  .route(`/:${routerName}Id`)
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res) => {
    res.end(
      `Will send details of the ${routerName}: ${req.params.campsiteId} to you`
    );
  })
  .post((req, res) => {
    res.end(
      `POST operation not supported on /${routerName}s/${req.params.campsiteId}`
    );
  })
  .put((req, res) => {
    res.end(
      `Updating the ${routerName}: ${req.params.campsiteId} \nWill replace with the ${routerName}: ${req.body.name} \n\twith description: ${req.body.description}`
    );
  })
  .delete((req, res) => {
    res.end(`Deleting ${routerName}: ${req.params.campsiteId}`);
  });

module.exports = campsiteRouter;
