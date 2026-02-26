const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pagetitle: "Login",
    currentPage: "login",


    isLoggedIn: false,
    errors: [],
    oldInput: { email: "" },
    user: {},
  });
};
exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pagetitle: "Signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "",
    },
    user: {},
  });
};

/* =========================
   POST SIGNUP
========================= */
exports.postSignup = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name should be atleast 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name should contain only alphabets"),

  check("lastName")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name should contain only alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 4 })
    .withMessage("Password should be atleast 4 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain atleast one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain atleast one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain atleast one number")
    .matches(/[!@&]/)
    .withMessage("Password should contain atleast one special character")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),
  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pagetitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map((err) => err.msg),
        oldInput: {
          firstName,
          lastName,
          email,
          userType,
        },
        user: {},
      });
    }

    bcrypt.hash(password, 12).then(hashedPassword => {

      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType
      }); 
        return user.save()
    })
        .then(() => {
          res.redirect("/login");
      })
    .catch (err =>{
      return res.status(422).render("auth/signup", {
        pagetitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: [err.message],
        oldInput: {
          firstName,
          lastName,
          email,
          userType,
        },
        user: {},
      });
    });
  },
];

/* =========================
   POST LOGIN
========================= */
exports.postLogin = async (req, res, next) => {
  console.log("POST /login HIT");
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(422).render("auth/login", {
        pagetitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["User does not exist"],
        oldInput: { email },
        user: {},
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(422).render("auth/login", {
        pagetitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["Invalid Password"],
        oldInput: { email },
        user: {},
      });
    }

    req.session.isLoggedIn = true;
    req.session.user = user;

    await req.session.save();
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

/* =========================
   POST LOGOUT
========================= */
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};