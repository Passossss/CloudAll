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
      nullable: false,
      name: 'user_id'
    },
    monthlyIncome: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
      name: 'monthly_income'
    },
    financialGoals: {
      type: 'nvarchar',
      length: 'MAX',
      nullable: true,
      name: 'financial_goals'
    },
    spendingLimit: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
      name: 'spending_limit'
    },
    createdAt: {
      type: 'datetime2',
      createDate: true,
      default: () => 'GETDATE()',
      name: 'created_at'
    },
    updatedAt: {
      type: 'datetime2',
      updateDate: true,
      default: () => 'GETDATE()',
      name: 'updated_at'
    }
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id'
      },
      onDelete: 'CASCADE'
    }
  }
});
