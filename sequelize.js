const Sequelize = require("sequelize");
const uniqid = require("uniqid");

const config = require("./config");
const userUtil = require("./user.util");

let ssl = false;
if (config.env === "production") {
  ssl = {
    require: config.env === "production" ? true : false,
    rejectUnauthorized: false, // important - without this Heroku PG fails with error 'self-signed certificate'
  };
}

const sequelize = new Sequelize(config.databaseUrl, {
  logging: false,
  dialect: "postgres",
  dialectOptions: {
    ssl,
  },
});

// Sequelize models
const Model = Sequelize.Model;

// Model: Permit
class Permit extends Model {}
Permit.init(
  {
    // attributes
    id: {
      type: Sequelize.STRING,
      defaultValue: () => {
        return uniqid("per_");
      },
      primaryKey: true,
    },
    name: {
      field: "name",
      type: Sequelize.STRING,
    },
    passphrase: {
      field: "passphrase",
      type: Sequelize.STRING,
      // NB - application should enforce uniqueness
    },
    maximumEntries: {
      field: "maximum_entries",
      type: Sequelize.INTEGER,
    },
    expiresAt: {
      field: "expires_at",
      type: Sequelize.DATE,
    },
    isEnabled: {
      field: "is_enabled",
      type: Sequelize.BOOLEAN,
    },
    openTimes: {
      field: "open_times",
      type: Sequelize.JSON, // schema like https://www.npmjs.com/package/@phoenix344/opening-hours
    },
    // basic model info
    createdAt: {
      field: "created_at",
      type: Sequelize.DATE,
    },
    updatedAt: {
      field: "updated_at",
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: "Permit",
    timestamps: true,
  }
);

class Knock extends Model {}
Knock.init(
  {
    // attributes
    id: {
      type: Sequelize.STRING,
      defaultValue: () => {
        return uniqid("knk_");
      },
      primaryKey: true,
    },
    granted: {
      field: "granted",
      type: Sequelize.BOOLEAN,
    },
    denialReason: {
      field: "denial_reason",
      type: Sequelize.STRING,
    },
    // basic model info
    createdAt: {
      field: "created_at",
      type: Sequelize.DATE,
    },
    updatedAt: {
      field: "updated_at",
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: "Knock",
    timestamps: true,
    defaultScope: {
      include: [
        {
          model: Permit,
          as: "permit",
        },
      ],
    },
  }
);

Knock.belongsTo(Permit, {
  as: "permit",
  foreignKey: {
    field: "permit_id",
    type: Sequelize.STRING,
    name: "permitId",
  },
  onDelete: "cascade", // deleting a licence will delete all activations owned by that user
});

// model: Users
class User extends Model {}
User.init(
  {
    // attributes
    id: {
      type: Sequelize.STRING,
      defaultValue: () => {
        return uniqid("usr_");
      },
      primaryKey: true,
    },
    emailAddress: {
      field: "email_address",
      type: Sequelize.STRING,
    },
    phoneNumber: {
      field: "phone_number",
      type: Sequelize.STRING,
    },
    // basic model info
    createdAt: {
      field: "created_at",
      type: Sequelize.DATE,
    },
    updatedAt: {
      field: "updated_at",
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
  }
);

User.prototype.sendPasswordlessAuthenticationEmail =
  userUtil.sendPasswordlessAuthenticationEmail;

Permit.belongsTo(User, {
  as: "user",
  foreignKey: {
    field: "creator_id",
    type: Sequelize.STRING,
    name: "creatorId",
  },
  onDelete: "cascade", // deleting a user will delete all permits owned by that user
});

module.exports = sequelize;
