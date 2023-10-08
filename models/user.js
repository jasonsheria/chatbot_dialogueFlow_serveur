'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(Models) {
      // define association here
      Models.User.hasMany(Models.Message,{ foreignKey: 'id_user'})
      // models.User.hasMany(models.Messages)
    }
  }
  User.init({
    // id: DataTypes.INTEGER,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN
  },
  {
    sequelize,
    modelName: 'User',
  }
  );
  return User;
};

