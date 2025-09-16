const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

// =================== SIGNUP ===================
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });

        // Register user with passport-local-mongoose
        const registeredUser = await User.register(user, password);

        // Automatically login after signup
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to the Listings App!");
            res.redirect("/listings");
        });
    } catch (e) {
        console.log(e);
        req.flash("error", e.message); // optional flash message
        res.redirect("/signup");
    }
});

// =================== LOGIN ===================
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password!"
}), (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
});

// =================== LOGOUT ===================
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
});

module.exports = router;

