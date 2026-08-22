const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

const Restaurant = require("../models/restaurant");

dotenv.config({ path: "backend/config/config.env" });

const seedRestaurants = async () => {
  try {
    await connectDatabase();

    await Restaurant.deleteMany(); // Clear existing restaurants

    const restaurants = [
      {
        name: "Cafe Coffee Day - The Square",
        isVeg: false,
        address: "23/2 Coffee Day Square, Vittal Mallya Road, Near Cubbon Park, Bengaluru, Karnataka, 560001",
        ratings: 5,
        numOfReviews: 50,
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716]
        },
        images: [
          {
            public_id: "ccd_square",
            url: "/images/image1.jpg"
          }
        ]
      },
      {
        name: "Hotel Empire",
        isVeg: false,
        address: "78, Central St, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka 560001",
        ratings: 4,
        numOfReviews: 60,
        location: {
          type: "Point",
          coordinates: [77.6030, 12.9837]
        },
        images: [
          {
            public_id: "hotel_empire",
            url: "/images/image2.jpg"
          }
        ]
      },
      {
        name: "Pizza Hut",
        isVeg: false,
        address: "Gandhi Bazaar Main Rd, next to McDonalds, Gandhi Bazaar, Basavanagudi, Bengaluru, Karnataka 560004",
        ratings: 3.5,
        numOfReviews: 20,
        location: {
          type: "Point",
          coordinates: [77.5707, 12.9463]
        },
        images: [
          {
            public_id: "pizza_hut",
            url: "/images/image 3.jpg"
          }
        ]
      },
      {
        name: "Daily Sushi",
        isVeg: false,
        address: "1, 1, 1st floor, Museum Rd, Haridevpur, Ashok Nagar, Bengaluru, Karnataka 560001",
        ratings: 4.5,
        numOfReviews: 10,
        location: {
          type: "Point",
          coordinates: [77.6015, 12.9723]
        },
        images: [
          {
            public_id: "daily_sushi",
            url: "/images/image4.jpg"
          }
        ]
      },
      {
        name: "Meghana Foods",
        isVeg: false,
        address: "57/1, 1st Floor, Jayalaxmi Chambers, Residency Road, Bengaluru, Karnataka 560025",
        ratings: 4.5,
        numOfReviews: 120,
        location: {
          type: "Point",
          coordinates: [77.6052, 12.9734]
        },
        images: [
          {
            public_id: "meghana_foods",
            url: "/images/image5.jpg"
          }
        ]
      },
      {
        name: "Truffles",
        isVeg: false,
        address: "28, 4th B Cross, 5th Block, Koramangala, Bengaluru, Karnataka 560095",
        ratings: 4,
        numOfReviews: 150,
        location: {
          type: "Point",
          coordinates: [77.6186, 12.9344]
        },
        images: [
          {
            public_id: "truffles",
            url: "/images/image6.jpg"
          }
        ]
      },
      {
        name: "Nagarjuna",
        isVeg: false,
        address: "44/1, Residency Road, Bengaluru, Karnataka 560025",
        ratings: 4.5,
        numOfReviews: 90,
        location: {
          type: "Point",
          coordinates: [77.6041, 12.9728]
        },
        images: [
          {
            public_id: "nagarjuna",
            url: "/images/image7.jpg"
          }
        ]
      },
      {
        name: "Glen's Bakehouse",
        isVeg: false,
        address: "297, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
        ratings: 4,
        numOfReviews: 80,
        location: {
          type: "Point",
          coordinates: [77.6405, 12.9782]
        },
        images: [
          {
            public_id: "glens",
            url: "/images/image8.jpg"
          }
        ]
      }
    ];

    await Restaurant.insertMany(restaurants);
    console.log("8 Restaurants seeded successfully with local images!");
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedRestaurants();
