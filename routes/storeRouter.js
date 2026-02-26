const express = require('express');
const storeRouter = express.Router();
const storeController = require('../controllers/storeController');
storeRouter.get("/", storeController.getIndex);
storeRouter.get("/bookings", storeController.getBookings);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/favourites", storeController.getFavouriteList);


storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", storeController.postAddToFavourite);
module.exports = storeRouter;