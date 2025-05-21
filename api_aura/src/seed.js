import mongoose from "mongoose";
import dotenv from "dotenv";
import seedAuthorities from "./seed/authorities.seed.js";
import seedUsers from "./seed/users_dev.seed.js";

dotenv.config();

const runSeeds = async () => {
  try {
    console.log("Starting the seeding process...");
    await seedAuthorities();
    await seedUsers();
    console.log("Seeding process completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during the seeding process:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

runSeeds();
