const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

// Import models
const Restaurant = require("../models/restaurant");
const Menu = require("../models/menu");
const Order = require("../models/order");
const Coupon = require("../models/couponModel");
const Review = require("../models/reviewModel");
const User = require("../models/user");
const FoodItem = require("../models/foodItem");

dotenv.config({ path: "backend/config/config.env" });

const seedAll = async () => {
  try {
    await connectDatabase();

    // Add a Restaurant
    const restaurant = await Restaurant.create({
      name: "The Great Pizza Place",
      isVeg: false,
      address: "123 Pizza Street, Food City",
      ratings: 4.5,
      numOfReviews: 1,
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.730610]
      },
      images: [
        {
          public_id: "restaurant_img",
          url: "https://example.com/restaurant.jpg"
        }
      ]
    });

    console.log("Restaurant created");

    // Add a FoodItem (just to link menu)
    const foodItem = await FoodItem.findOne();

    // Add a Menu
    if (foodItem) {
      await Menu.create({
        menu: [
          {
            category: "Pizzas",
            items: [foodItem._id]
          }
        ],
        restaurant: restaurant._id
      });
      console.log("Menu created");
    }

    // Add a Coupon
    await Coupon.create({
      couponName: "DISCOUNT10",
      subTitle: "Get 10% off",
      minAmount: 20,
      maxDiscount: 5,
      discount: 10,
      details: "Valid on all orders above $20",
      expire: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    });
    console.log("Coupon created");

    // Add a User if one doesn't exist
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: "Test User",
        email: "testuser@example.com",
        password: "Password123!",
        passwordConfirm: "Password123!",
        avatar: { public_id: "avatar", url: "https://example.com/avatar.jpg" },
        phoneNumber: "1234567890",
        role: "user"
      });
    }

    // Add a Review
    if (foodItem) {
      await Review.create({
        rating: 5,
        comment: "Great food!",
        createdAt: Date.now(),
        user: user._id,
        fooditem: foodItem._id
      });
      console.log("Review created");

      // Add an Order
      await Order.create({
        deliveryInfo: {
          address: "123 Test St",
          city: "Test City",
          phoneNo: "1234567890",
          postalCode: "12345",
          country: "Test Country"
        },
        restaurant: restaurant._id,
        user: user._id,
        orderItems: [
          {
            name: foodItem.name,
            quantity: 1,
            image: "https://example.com/item.jpg",
            price: foodItem.price,
            fooditem: foodItem._id
          }
        ],
        paymentInfo: { id: "pi_test", status: "succeeded" },
        itemsPrice: foodItem.price,
        taxPrice: 1.0,
        deliveryCharge: 2.0,
        finalTotal: foodItem.price + 3.0,
        orderStatus: "Delivered"
      });
      console.log("Order created");
    }

    console.log("Data seeding for all tables completed!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAll();
