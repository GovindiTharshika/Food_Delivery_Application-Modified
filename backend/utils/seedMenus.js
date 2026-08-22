const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

const Restaurant = require("../models/restaurant");
const Menu = require("../models/menu");
const FoodItem = require("../models/foodItem");

dotenv.config({ path: "backend/config/config.env" });

const seedMenus = async () => {
  try {
    await connectDatabase();

    await Menu.deleteMany();
    await FoodItem.deleteMany();

    const restaurants = await Restaurant.find();

    for (let restaurant of restaurants) {
      // Create some FoodItems
      const item1 = await FoodItem.create({
        name: `${restaurant.name} Special Starter`,
        price: 250,
        description: "Delicious start to your meal.",
        stock: 50,
        ratings: 4.5,
        restaurant: restaurant._id,
        images: [{ public_id: "starter", url: "/images/image5.jpg" }]
      });

      const item2 = await FoodItem.create({
        name: `${restaurant.name} Main Course`,
        price: 450,
        description: "Hearty and fulfilling main dish.",
        stock: 30,
        ratings: 4.8,
        restaurant: restaurant._id,
        images: [{ public_id: "main", url: "/images/image6.jpg" }]
      });

      const item3 = await FoodItem.create({
        name: `${restaurant.name} Dessert`,
        price: 150,
        description: "Sweet finish to your meal.",
        stock: 20,
        ratings: 4.9,
        restaurant: restaurant._id,
        images: [{ public_id: "dessert", url: "/images/image8.jpg" }]
      });

      // Create a Menu for the restaurant
      await Menu.create({
        restaurant: restaurant._id,
        menu: [
          {
            category: "Starters",
            items: [item1._id]
          },
          {
            category: "Main Course",
            items: [item2._id]
          },
          {
            category: "Desserts",
            items: [item3._id]
          }
        ]
      });
      
      // Update the food items with the newly created menu reference
      const createdMenu = await Menu.findOne({ restaurant: restaurant._id });
      item1.menu = createdMenu._id;
      await item1.save();
      item2.menu = createdMenu._id;
      await item2.save();
      item3.menu = createdMenu._id;
      await item3.save();
    }

    console.log("Menus and FoodItems seeded successfully for all restaurants!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedMenus();
