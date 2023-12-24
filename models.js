const Sequelize = require("sequelize");
const sequelize = new Sequelize("BookSwap", "root", "database", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
  });
  
  sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch((error) => {
      console.error("Unable to connect to the database: ", error);
    });

const User = sequelize.define(
  "user",
  {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    email: Sequelize.STRING,
    password_hash: Sequelize.STRING,
    password_salt: Sequelize.STRING,
    created_at: Sequelize.DATE,
    full_name: Sequelize.STRING,
    contact: Sequelize.STRING,
    address: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);

const TempUser = sequelize.define(
  "temp_users",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      autoIncrement: true,
    },
    email: Sequelize.STRING,
    password_hash: Sequelize.STRING,
    password_salt: Sequelize.STRING,
    otp: Sequelize.INTEGER,
  },
  {
    timestamps: false,
  }
);

const Book = sequelize.define(
  "books",
  {
    book_id:{
      type: Sequelize.STRING,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull:"false",
      references: {
          model: User,
          key: "user_id",
      },
    },
    title:Sequelize.STRING,
    author:Sequelize.STRING,
    book_description:Sequelize.TEXT,
    pages:Sequelize.INTEGER,
    path:Sequelize.INTEGER
  },
  {
    timestamps: false,
  }
)

Book.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { User, TempUser, Book };