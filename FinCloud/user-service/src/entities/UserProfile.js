const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'UserProfile',
  tableName: 'user_profiles',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    userId: {
      type: 'uuid',
      nullable: false
    },
    monthlyIncome: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0
    },
    financialGoals: {
      type: 'nvarchar',
      length: 'MAX',
      nullable: true
    },
    spendingLimit: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0
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
    }
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id'
      },
      onDelete: 'CASCADE'
    }
  }
});
