const bcrypt = require('bcryptjs');
const { getUserRepository, getUserProfileRepository } = require('../src/config/database');

async function createUsers() {
  try {
    await require('../src/config/database').initDatabase();
    
    const userRepo = getUserRepository();
    const profileRepo = getUserProfileRepository();
    
    // Criar ou atualizar admin
    let existingAdmin = await userRepo.findOne({ where: { email: 'admin@admin.com' } });
    
    if (existingAdmin) {
      console.log('✅ Usuário admin já existe!');
      await userRepo.update({ id: existingAdmin.id }, { role: 'admin' });
      console.log('✅ Role atualizado para admin');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = userRepo.create({
        email: 'admin@admin.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin',
        isActive: true
      });
      
      await userRepo.save(admin);
      
      const profile = profileRepo.create({
        userId: admin.id,
        monthlyIncome: 5000,
        spendingLimit: 3000
      });
      
      await profileRepo.save(profile);
      
      console.log('✅ Usuário admin criado com sucesso!');
    }
    
    // Criar ou atualizar user normal
    let existingUser = await userRepo.findOne({ where: { email: 'user@user.com' } });
    
    if (existingUser) {
      console.log('✅ Usuário user já existe!');
      await userRepo.update({ id: existingUser.id }, { role: 'normal' });
      console.log('✅ Role atualizado para normal');
    } else {
      const hashedPassword = await bcrypt.hash('user123', 10);
      
      const user = userRepo.create({
        email: 'user@user.com',
        password: hashedPassword,
        name: 'Usuário Teste',
        role: 'normal',
        age: 30,
        isActive: true
      });
      
      await userRepo.save(user);
      
      const profile = profileRepo.create({
        userId: user.id,
        monthlyIncome: 3000,
        spendingLimit: 2000
      });
      
      await profileRepo.save(profile);
      
      console.log('✅ Usuário user criado com sucesso!');
    }
    
    console.log('\n📋 Credenciais de teste:');
    console.log('Admin:');
    console.log('  Email: admin@admin.com');
    console.log('  Senha: admin123');
    console.log('\nUser:');
    console.log('  Email: user@user.com');
    console.log('  Senha: user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
    process.exit(1);
  }
}

createUsers();

