const User = require("../models/user");
const Home = require("../models/home");
const pagetitle = {
  index: "Airbnb Home",
  homes: "Homes List",
  bookings: "My Bookings",
  favourites: "My Favourites",


  homeDetail: "Home Detail",
};
exports.getIndex = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes,
      pagetitle: pagetitle.index,
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/homelist", {
      registeredHomes,
      pagetitle: pagetitle.homes,
      currentPage: "home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pagetitle: pagetitle.bookings,
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
      user: req.session.user,
  });
};
exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  res.render("store/favourites", {
    favouriteHomes: user.favourites,
    pagetitle: pagetitle.favourites,
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};
exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }

  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(
      (fav) => fav != homeId
    );
    await user.save();
  }
  res.redirect("/favourites");
};
exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      return res.redirect("/homes");
    }
    res.render("store/home-detail", {
      home,
      pagetitle: pagetitle.homeDetail,
      currentPage: "home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};
