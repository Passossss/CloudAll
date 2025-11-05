/**
 * Domain Entity - Transaction
 * Pure domain model without infrastructure concerns
 */
class Transaction {
  constructor(id, userId, amount, description, category, type, date, tags, isRecurring, recurringPeriod) {
    this.id = id;
    this.userId = userId;
    this.amount = amount;
    this.description = description;
    this.category = category;
    this.type = type; // 'income' or 'expense'
    this.date = date || new Date();
    this.tags = tags || [];
    this.isRecurring = isRecurring || false;
    this.recurringPeriod = recurringPeriod || null;
  }

  // Domain business rules
  isIncome() {
    return this.type === 'income';
  }

  isExpense() {
    return this.type === 'expense';
  }

  getAbsoluteAmount() {
    return Math.abs(this.amount);
  }

  normalizeAmount() {
    if (this.type === 'expense' && this.amount > 0) {
      this.amount = -Math.abs(this.amount);
    } else if (this.type === 'income' && this.amount < 0) {
      this.amount = Math.abs(this.amount);
    }
  }

  isValid() {
    return this.userId &&
           this.amount !== undefined &&
           this.amount !== 0 &&
           this.description &&
           this.category &&
           (this.type === 'income' || this.type === 'expense');
  }
}

module.exports = Transaction;

