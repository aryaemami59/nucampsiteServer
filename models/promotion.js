const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
require("mongoose-currency").loadType(mongoose);
const { Currency } = Types;

const promotionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    cost: {
      type: Currency,
      required: true,
    },
    featured: {
      type: Boolean,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Promotion = model("Promotion", promotionSchema);

module.exports = Promotion;
