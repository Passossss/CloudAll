/**
 * Domain Entity - User
 * Pure domain model without infrastructure concerns
 */
class User {
  constructor(id, email, password, name, age, role, isActive, createdAt, updatedAt) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.age = age;
    this.role = role || 'normal';
    this.isActive = isActive !== undefined ? isActive : true;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // Domain business rules
  canLogin() {
    return this.isActive;
  }

  isAdmin() {
    return this.role === 'admin';
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  updateProfile(name, age) {
    if (name) this.name = name;
    if (age !== undefined) this.age = age;
    this.updatedAt = new Date();
  }

  // Domain validation
  isValid() {
    return this.email && 
           this.password && 
           this.name && 
           this.email.includes('@');
  }
}

module.exports = User;

