const config = require("./config");
const sequelize = require("./sequelize");
const app = require("./express");

const models = sequelize.models;

// sync models with DB
const syncOptions = {};
if (config.env === "development") {
  syncOptions.force = true;
} else {
  syncOptions.alter = {
    drop: false,
  };
}

sequelize
  .sync(syncOptions)
  .then(() => {
    // start the express listener
    app.listen(config.port, () => {
      console.log(
        "info",
        `Express server started on port ${config.port} (${config.env})`
      );
    });

    // check if we need to create an administrator
    return findOrCreateAdministrator();
  })
  .catch((err) => {
    console.error(err);
  });

// this function is for convenience - when a server is started for the first time, it creates an admin user
function findOrCreateAdministrator() {
  return new Promise((resolve, reject) => {
    models.User.findOne()
      .then((user) => {
        if (!user) {
          console.log("No users exist, will create one.");
          return models.User.create({
            emailAddress: config.defaultAdministratorEmailAddress,
          });
        } else {
          return null;
        }
      })
      .then((result) => {
        if (result) {
          console.log(
            `Created administrator. Email address: ${config.defaultAdministratorEmailAddress}`
          );
        }
        return resolve(result);
      })
      .catch((err) => {
        console.log("Error creating administrator: ", err);
        return reject(err);
      });
  });
}
