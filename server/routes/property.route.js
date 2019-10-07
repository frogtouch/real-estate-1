const { celebrate: validate } = require("celebrate");
const express = require("express");

const authToken = require("../policies/auth.policy");
const IsSeller = require("../middlewares/is-seller.middleware");
const uploadFile = require("../middlewares/file-upload");
const propertyValidation = require("../validations/property.validation");
const propertyCtrl = require("../controllers/property.controller");

const router = express.Router();

router.route("/create").post(
  [
    authToken,
    IsSeller,
    validate(propertyValidation.createProperty, {
      abortEarly: false
    }),
    // uploadFile("property-images")
  ],
  propertyCtrl.createProperty
);

router.route("/view/:id").get(propertyCtrl.viewProperty);

router.route("/agencyProperty").get(propertyCtrl.getAgencyProperties);

router.route("/search").get(propertyCtrl.propertyFeed);

module.exports = router;
