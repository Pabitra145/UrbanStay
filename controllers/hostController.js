const Home = require('../models/home');
const fs = require('fs');
exports.getAddHome = (req,res,next) => {
    res.render('host/edit-home', {pagetitle: 'Add home to airbnb', editing:false, isLoggedIn: req.isLoggedIn, user: req.session.user});
}
exports.getHostHomes = (req, res, next) => {
    Home.find().then((registeredHomes) => {res.render('host/host-home-list', {registeredHomes: registeredHomes, pagetitle: 'host homes list', currentPage: 'host-homes', isLoggedIn: req.isLoggedIn, user: req.session.user})});


};
exports.postAddHome = (req, res, next) => {
    console.log(req.body);
    const {houseName, description, pricePerNight, location, locationName, rating} = req.body;

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const photo = req.file.path;
    const home = new Home({houseName, description, pricePerNight, location, locationName, photo, rating}


);
    home.save().then(() => {
        console.log("home added successfully");
    })
        res.redirect('/host/host-home-list');
};
exports.getEditHome = (req, res, next) => {
    console.log("came here for editing");
    const homeId = req.params.homeId;
    const editing = req.query.editing === 'true';
    Home.findById(homeId).then((home) => {
        if (!home) {
            return res.redirect('/host/host-home-list');
        }
        res.render('host/edit-home', {home: home, pagetitle: 'Edit Home', editing: editing, isLoggedIn: req.isLoggedIn, user: req.session.user});
    }).catch(err => {
        console.log("error finding home for editing", err);
    })};
exports.postEditHome = (req, res, next) => {
    const{id, houseName, description, pricePerNight, location, locationName, rating} = req.body;
    Home.findById(id).then((home) => {
        home.houseName = houseName;
        home.description = description;
        home.pricePerNight = pricePerNight;
        home.location = location;
        home.locationName = locationName;
        home.rating = rating;
        if (req.file) {
            fs.unlink(home.photo, (err) => {
                if (err) {
                    console.log("error deleting old photo", err);
                }
                    console.log("old photo deleted successfully");
                });
        home.photo = req.file.path;
            }
        home.save().then((result) => {
            console.log("home updated successfully", result);
        }).catch(err => {
            console.log("error updating home", err);
        })
        res.redirect('/host/host-home-list');
    }).catch(err => {
        console.log("error finding home for editing", err);
    })};
exports.postDeleteHome = (req, res, next) => {
    const homeId = req.params.homeId;
    console.log("deleting home with id", homeId);
    Home.findByIdAndDelete(homeId).then(() => {
        console.log("home deleted successfully");
        res.redirect('/host/host-home-list');
    }).catch(err => {
        console.log("error deleting home", err);
    })};