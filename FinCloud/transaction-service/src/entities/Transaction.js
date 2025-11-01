const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Transaction',
  tableName: 'transactions',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
      objectId: true
    },
    userId: {
      type: 'string',
      nullable: false
    },
    amount: {
      type: 'number',
      nullable: false
    },
    description: {
      type: 'string',
      length: 200,
      nullable: false
    },
    category: {
      type: 'enum',
      enum: [
        'food', 'transport', 'entertainment', 'shopping', 'bills',
        'health', 'education', 'salary', 'freelance', 'investment',
        'gift', 'other'
      ],
      nullable: false
    },
    type: {
      type: 'enum',
      enum: ['income', 'expense'],
      nullable: false
    },
    date: {
      type: 'date',
      nullable: false,
      default: () => new Date()
    },
    tags: {
      type: 'simple-array',
      nullable: true
    },
    isRecurring: {
      type: 'boolean',
      default: false
    },
    recurringPeriod: {
      type: 'enum',
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      nullable: true
    },
    createdAt: {
      type: 'date',
      createDate: true,
      default: () => new Date()
    },
    updatedAt: {
      type: 'date',
      updateDate: true,
      default: () => new Date()
    }
  }
});
