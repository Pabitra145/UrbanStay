require('dotenv').config();
const path = require("path");
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const DB_PATH = process.env.MONGO_URI;
const storeRouter = require('./routes/storeRouter');


const hostRouter = require('./routes/hostRouter');
const authRouter = require('./routes/authRouter');
const rootDir = require('./utils/pathutil');


const multer = require('multer');


const errorsController = require('./controllers/errors');
const {default: mongoose} = require("mongoose");
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
const store = new MongoDBStore({
    uri: DB_PATH,
    collection: 'sessions'
});
const randomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }


    return result;
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, randomString(10) + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const multerOptions = {storage, fileFilter};
app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads",express.static(path.join(rootDir, "uploads")));
app.use("/homes/uploads",express.static(path.join(rootDir, "uploads")));
app.use(session({
    secret: 'my secret key',
    resave: false,
    saveUninitialized: true,
}));


app.use((req, res, next) => {
    req.isLoggedIn = req.session.isLoggedIn;
    next();
    });
app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req, res, next) => {
    if (req.isLoggedIn) {
        next();
    } else {
        res.redirect("/login");
    }});
app.use("/host", hostRouter);
app.use(errorsController.get404);
const PORT = process.env.PORT || 3000;
mongoose.connect(DB_PATH).then(() => {
    console.log("connected to database successfully");
    app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)});
}).catch(err => {
    console.log("error connecting to database", err);
});