// // index.js
// const express = require('express');
// const app = express();
// const port = 3030;
// const mongoose = require('mongoose');
// const path = require('path');
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const session = require('express-session');
// const flash = require("connect-flash");
// const passport = require("passport");
// const localStrategy = require("passport-local");
// const wrapAsync = require("./utils/wrapAsync");
// const { isLoggedIn } = require('./views/middleware.js');

// const Listing = require("./models/listing.js");
// const Review = require("./models/review.js");
// const User = require("./models/user.js");

// mongoose.connect(process.env.ATLASDB_URL)
// .then(() => {
//     console.log("MONGO CONNECTION OPEN!!!");
// })
// .catch(err => {
//     console.log("OH NO MONGO CONNECTION ERROR!!!!");
//     console.log(err);
// });

// // require("dotenv").config();
// // // const mongoose = require("mongoose");

// // mongoose.connect(process.env.MONGO_URL, {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // })
// // .then(() => console.log("✅ MongoDB Connected"))
// // .catch(err => console.error("MongoDB Connection Error:", err));



// // ---------------------- App configuration ----------------------
// app.engine('ejs', ejsMate);
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.static(path.join(__dirname, "/public")));
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));



// // 
// // ---------------------- Define Mongo Store ----------------------
// const store = MongoStore.create({
//     mongoUrl: process.env.ATLASDB_URL, // सुनिश्चित करें कि नाम बिल्कुल सही है!
//     touchAfter: 24 * 3600, // हर 24 घंटे में सेशन अपडेट होगा
//     // आप चाहें तो यहां crypto section भी जोड़ सकते हैं, पर यह न्यूनतम कॉन्फ़िगरेशन है
// });

// store.on("error", (err) => {
//     console.log("ERROR IN MONGO SESSION STORE", err);
// });
// // 
// // ---------------------- Session & Flash ----------------------
// // const sessionOptions = {
// //     store: store, // <--- यहाँ नया MongoStore जोड़ें!
// //     secret: "mysuperseretcode", // यह आपके secret से मैच होना चाहिए
// //     resave: false,
// //     saveUninitialized: false, // या इसे true भी कर सकते हैं
// //     cookie: {
// //         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
// //         maxAge: 1000 * 60 * 60 * 24 * 7,
// //     }
// // };
// // ... बाकी कोड जैसा है वैसा ही रहेगा
// // ---------------------- Session & Flash ----------------------
// const sessionOptions = {
//     secret: "mysuperseretcode",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7,
//     }
// };
// app.use(session(sessionOptions));
// app.use(flash());

// // ---------------------- Passport ----------------------
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// // ---------------------- Middleware for locals ----------------------
// app.use((req, res, next) => {
//     res.locals.currentUser = req.user;
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     next();
// });

// // ---------------------- Routes ----------------------

// // Home / API
// app.get('/', (req, res) => {
//    res.redirect("/listings");
// });

// // Demo user route
// app.get("/demouser", async (req,res) => {
//     let fakeUser = new User({ email: "student@gmail.com", username: "john" });
//     let registerUser = await User.register(fakeUser, "chicken");
//     res.send(registerUser);
// });

// // ---------------------- Listings Routes ----------------------

// // Show all listings
// app.get("/listings", async (req,res) =>{
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
// });

// // New listing form
// app.get("/listings/new", isLoggedIn, (req,res) =>{
//     res.render("listings/new.ejs");
// });

// // Create new listing
// app.post("/listings", isLoggedIn, async (req, res, next) => {
//     try {
//         const newListing = new Listing(req.body.listing);

//         // Assign logged-in user as owner
//         newListing.owner = req.user._id;

//         // If image URL provided, save it as object
//         if (req.body.listing.image && req.body.listing.image.trim() !== "") {
//             newListing.image = { url: req.body.listing.image, filename: "listingimage" };
//         }

//         await newListing.save();
//         res.redirect(`/listings/${newListing._id}`);
//     } catch (err) {
//         next(err);
//     }
// });



// // Show single listing
// app.get("/listings/:id", async (req,res) =>{
//     const { id } = req.params;
//     const listing = await Listing.findById(id)
//         .populate("owner")
//         .populate({
//             path: "reviews",
//             populate: { path: "author" }  // populate each review's author
//         });
//     res.render("listings/show.ejs", { listing, currentUser: req.user });
// });

// // Edit listing form
// app.get("/listings/:id/edit", isLoggedIn, async (req,res) =>{
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });
// });

// // Update listing
// app.put("/listings/:id", isLoggedIn, async (req,res) =>{
//     const { id } = req.params;
//     const updatedData = req.body.listing;

//     if (updatedData.image && updatedData.image.trim() !== "") {
//         updatedData.image = { url: updatedData.image, filename: 'listingimage' };
//     } else {
//         delete updatedData.image; // keep old image
//     }

//     await Listing.findByIdAndUpdate(id, updatedData, { new: true });
//     res.redirect(`/listings/${id}`);
// });

// // Delete listing
// app.delete("/listings/:id", isLoggedIn, async (req,res) =>{
//     const { id } = req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// });

// // ---------------------- Reviews Routes ----------------------

// // Create new review
// app.post("/listings/:id/reviews", isLoggedIn, async (req,res) => {
//     const listing = await Listing.findById(req.params.id);
//     const newReview = new Review(req.body.review);
//     newReview.author = req.user._id; // Assign logged-in user as author
//     await newReview.save();
//     listing.reviews.push(newReview);
//     await listing.save();
//     res.redirect(`/listings/${listing._id}`);
// });

// // Delete review
// app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, wrapAsync(async(req,res)=>{
//     const { id, reviewId } = req.params;
//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }));

// // ---------------------- User Routes ----------------------
// const userRoutes = require('./routes/user.js');
// app.use("/", userRoutes);

// // ---------------------- Fallback ----------------------
// app.use((req,res) => {
//     res.redirect("/listings");
// });

// // ---------------------- Start Server ----------------------
// app.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
// });
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(` Server running on port ${PORT}`);
// });


// index.js
require("dotenv").config();
const express = require('express');
const app = express();
const port = 3030; 
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const wrapAsync = require("./utils/wrapAsync");
const { isLoggedIn } = require('./views/middleware.js');
// -------------------- CRITICAL FIX --------------------
const MongoStore = require('connect-mongo'); 

const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL; // Use a single variable

mongoose.connect(dbUrl)
.then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
})
.catch(err => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
});

// ---------------------- App configuration ----------------------
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ---------------------- Define Mongo Store ----------------------
const store = MongoStore.create({
    mongoUrl: dbUrl, 
    touchAfter: 24 * 3600, 
    // It's recommended to add a secret for better security, e.g.,
    // crypto: { secret: process.env.SESSION_SECRET || 'a-strong-secret' }
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

// ---------------------- Session & Flash ----------------------
const sessionOptions = {
    // -------------------- CRITICAL FIX --------------------
    store: store, 
    secret: "mysuperseretcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, // Security best practice
    }
};
app.use(session(sessionOptions));
app.use(flash());

// ---------------------- Passport ----------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---------------------- Middleware for locals ----------------------
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    // Clear flash messages for the next request
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// ---------------------- Routes ----------------------

// Home / API
app.get('/', (req, res) => {
    res.redirect("/listings");
});

// Demo user route
app.get("/demouser", async (req,res) => {
    let fakeUser = new User({ email: "student@gmail.com", username: "john" });
    let registerUser = await User.register(fakeUser, "chicken");
    res.send(registerUser);
});

// ---------------------- Listings Routes ----------------------
// Show all listings
app.get("/listings", async (req,res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

// New listing form
app.get("/listings/new", isLoggedIn, (req,res) =>{
    res.render("listings/new.ejs");
});

// Create new listing
app.post("/listings", isLoggedIn, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.body.listing.image && req.body.listing.image.trim() !== "") {
        newListing.image = { url: req.body.listing.image, filename: "listingimage" };
    }

    await newListing.save();
    res.redirect(`/listings/${newListing._id}`);
}));

// Show single listing
app.get("/listings/:id", async (req,res) =>{
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: { path: "author" }
        });
    res.render("listings/show.ejs", { listing, currentUser: req.user });
});

// Edit listing form
app.get("/listings/:id/edit", isLoggedIn, async (req,res) =>{
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

// Update listing
app.put("/listings/:id", isLoggedIn, async (req,res) =>{
    const { id } = req.params;
    const updatedData = req.body.listing;

    if (updatedData.image && updatedData.image.trim() !== "") {
        updatedData.image = { url: updatedData.image, filename: 'listingimage' };
    } else {
        delete updatedData.image; 
    }

    await Listing.findByIdAndUpdate(id, updatedData, { new: true });
    res.redirect(`/listings/${id}`);
});

// Delete listing
app.delete("/listings/:id", isLoggedIn, async (req,res) =>{
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

// ---------------------- Reviews Routes ----------------------

// Create new review
app.post("/listings/:id/reviews", isLoggedIn, wrapAsync(async (req,res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id; 
    await newReview.save();
    listing.reviews.push(newReview);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

// Delete review
app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, wrapAsync(async(req,res)=>{
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

// ---------------------- User Routes ----------------------
const userRoutes = require('./routes/user.js');
app.use("/", userRoutes);

// ---------------------- Fallback & Error Handling ----------------------

// 404 Handler
app.use((req, res, next) => {
    next(new Error(`Page Not Found (404) for route: ${req.originalUrl}`));
});

// Global Error Handler (to catch errors from wrapAsync)
app.use((err, req, res, next) => {
    console.error(err.stack);
    req.flash("error", err.message);
    res.redirect("/listings");
});

// ---------------------- Start Server ----------------------
// -------------------- CRITICAL FIX --------------------
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});