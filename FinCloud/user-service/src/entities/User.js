const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    email: {
      type: 'nvarchar',
      length: 255,
      unique: true,
      nullable: false
    },
    password: {
      type: 'nvarchar',
      length: 255,
      nullable: false
    },
    name: {
      type: 'nvarchar',
      length: 255,
      nullable: false
    },
    age: {
      type: 'int',
      nullable: true
    },
    createdAt: {
      type: 'datetime2',
      createDate: true,
      default: () => 'GETDATE()'
    },
    updatedAt: {
      type: 'datetime2',
      updateDate: true,
      default: () => 'GETDATE()'
    },
    isActive: {
      type: 'bit',
      default: true
    }
  },
  relations: {
    profile: {
      type: 'one-to-one',
      target: 'UserProfile',
      inverseSide: 'user',
      cascade: true
    }
  }
});
