const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

// Usage:
// node scripts/setUserRole.js --email=admin@test.com --role=admin
// or
// node scripts/setUserRole.js --set-missing=staff

const argv = require("minimist")(process.argv.slice(2));

const run = async () => {
  try {
    await connectDB();

    if (argv.email && argv.role) {
      const email = argv.email;
      const role = argv.role;
      const user = await User.findOneAndUpdate(
        { email },
        { $set: { role } },
        { new: true }
      );
      if (!user) {
        console.log(`No user found with email ${email}`);
      } else {
        console.log(`Updated user ${email} -> role=${role}`);
        console.log(user);
      }
      process.exit(0);
    }

    if (argv["set-missing"]) {
      const fillRole = argv["set-missing"];
      const res = await User.updateMany(
        { $or: [{ role: { $exists: false } }, { role: null }, { role: "" }] },
        { $set: { role: fillRole } }
      );
      console.log(
        `Updated ${
          res.modifiedCount || res.nModified || 0
        } users to role='${fillRole}'`
      );
      process.exit(0);
    }

    console.log("No action specified. See script header for usage.");
    process.exit(1);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

run();
