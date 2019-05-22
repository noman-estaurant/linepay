"use strict";

require("dotenv").config();

const router = require("express").Router();
const uuid = require("uuid/v4");
const cache = require("memory-cache"); // To save order information.
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

router.get("/bang", (req, res, next) => {
    if (req.query.productName){
        if (req.query.productName.length > 40){
            throw new Error(`product_name too long. Up to 40 letters.`);
        }
    }
    if (req.query.amount){
        if (Number(req.query.amount) === NaN){
            throw new Error(`Invalid amount.`);
        }
    }

    let productName = req.query.productName || "黑膠鮮檸鮭魚堡";
    let amount = Number(req.query.amount) || 160;

    let options = {
        productImageUrl:'https://i.imgur.com/aww9AwK.jpg',
        productName: productName,
        amount: amount,
        currency: "TWD",
        orderId: uuid(),
        confirmUrl: `https://${req.hostname}:5543${req.baseUrl}/confirm`,
        confirmUrlType: "SERVER"
    }

    pay.reserve(options).then((response) => {
        let reservation = options;
        reservation.transactionId = response.info.transactionId;

        debug(`Reservation was made. Detail is following.`);
        debug(reservation);

        // Save order information
        cache.put(reservation.transactionId, reservation);

        res.redirect(response.info.paymentUrl.web);
    })
});

router.get("/confirm", (req, res, next) => {
    res.send("Hello Amigo!")

    debug(`transactionId is ${req.query.transactionId}`);
    let reservation = cache.get(req.query.transactionId);

    if (!reservation){
        throw new Error("Reservation not found.");
    }

    debug(`Retrieved following reservation.`);
    debug(reservation);

    let options = {
        transactionId: req.query.transactionId,
        amount: reservation.amount,
        currency: reservation.currency
    }

    debug(`Going to confirm payment with following options.`);
    debug(options);

    pay.confirm(options).then((response) => {
        res.json(response);
    });
});

module.exports = router;
