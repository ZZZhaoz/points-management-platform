const express = require("express");
const router = express.Router();

const transactions = require("./transactions");
const user = require("./user");
const promotions = require("./promotions");
const auth = require("./auth");
const events = require("./event");

router.use("/auth", auth);
router.use("/transactions", transactions);
router.use("/users", user);
router.use("/promotions", promotions);
router.use("/events", events);

module.exports = router;