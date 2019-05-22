"use strict";

require("dotenv").config();

const router = require("express").Router();
const uuid = require("uuid/v4");
const debug = require("debug")("line-pay:router");

let line_pay
if (process.env.NODE_ENV == "development"){
    line_pay = require("../module/line-pay");
} else {
    line_pay = require("line-pay");
}

const pay = new line_pay({
    channelId: "1575732116",
    channelSecret: "e0f2b66f628830d869af198cbb5f93ab",
    isSandbox: true
});

router.use("/payy", pay.middleware({
    productName: "黑膠鮮檸鮭魚堡",
    amount: 80,
    currency: "TWD",
    orderId: uuid(),
    capture: false,
    payType: "PREAPPROVED"
}), (req, res, next) => {
    // Now payment should have been completed.
    res.send("Payment has been completed.");
});

module.exports = router;
