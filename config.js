const clientSecret = require("./secret");

module.exports = {
  secretKey: "12345-67890-09876-54321",
  mongoUrl: "mongodb://localhost:27017/nucampsite",
  facebook: {
    clientId: "672747664172332",
    clientSecret,
  },
};
