// File: routes/listings.js
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Review = require("../models/review");

// =================== Middleware to check if logged in ===================
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.flash("error", "You must be logged in to do that");
    res.redirect("/login");
}

// =================== SHOW ALL LISTINGS ===================
router.get("/", async (req, res) => {
    try {
        const listings = await Listing.find({});
        res.render("listings/index", { listings, currentUser: req.user });
    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
});

// =================== NEW LISTING FORM ===================
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});

// =================== CREATE NEW LISTING ===================
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id; // assign logged-in user
        await newListing.save();
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.log(err);
        res.redirect("/listings/new");
    }
});

// =================== SHOW SINGLE LISTING ===================
router.get("/:id", async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate("owner")
            .populate({
                path: "reviews",
                populate: { path: "author" } // populate author inside each review
            });
        res.render("listings/show", { listing, currentUser: req.user });
    } catch (err) {
        console.log(err);
        res.redirect("/listings");
    }
});

// =================== EDIT LISTING FORM ===================
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        res.render("listings/edit", { listing });
    } catch (err) {
        console.log(err);
        res.redirect("/listings");
    }
});

// =================== UPDATE LISTING ===================
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const updatedData = req.body.listing;
        if (!updatedData.image || updatedData.image.trim() === "") delete updatedData.image;
        const listing = await Listing.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        console.log(err);
        res.redirect("/listings");
    }
});

// =================== DELETE LISTING ===================
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        await Listing.findByIdAndDelete(req.params.id);
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
        res.redirect("/listings");
    }
});

// =================== CREATE REVIEW ===================
router.post("/:id/reviews", isLoggedIn, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id; // assign logged-in user
        listing.reviews.push(review);
        await review.save();
        await listing.save();
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        console.log(err);
        res.redirect(`/listings/${req.params.id}`);
    }
});

// =================== DELETE REVIEW ===================
router.delete("/:id/reviews/:reviewId", isLoggedIn, async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.log(err);
        res.redirect(`/listings/${req.params.id}`);
    }
});

module.exports = router;
