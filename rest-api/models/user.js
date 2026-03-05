const { roles } = require('../config');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fabricClientId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fabricOrg: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    apiKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    userType: {
      type: DataTypes.ENUM(...Object.values(roles)),
      allowNull: false,
    },
   
    apiKeySecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    
  }, {
    timestamps: true,
    defaultScope: {
      attributes: {
        exclude: ['password'],
      },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
    indexes: [{
      unique: true,
      fields: ['email'],
    }],
  });

  return User;
};
