const bcrypt = require('bcryptjs');
const { getUserRepository, getUserProfileRepository } = require('../src/config/database');

async function createAdmin() {
  try {
    await require('../src/config/database').initDatabase();
    
    const userRepo = getUserRepository();
    const profileRepo = getUserProfileRepository();
    
    // Verificar se admin já existe
    const existingAdmin = await userRepo.findOne({ where: { email: 'admin@admin.com' } });
    
    if (existingAdmin) {
      console.log('✅ Usuário admin já existe!');
      // Atualizar para garantir que é admin
      await userRepo.update({ id: existingAdmin.id }, { role: 'admin' });
      console.log('✅ Role atualizado para admin');
      return;
    }
    
    // Criar admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = userRepo.create({
      email: 'admin@admin.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      isActive: true
    });
    
    await userRepo.save(admin);
    
    // Criar perfil
    const profile = profileRepo.create({
      userId: admin.id,
      monthlyIncome: 0,
      spendingLimit: 0
    });
    
    await profileRepo.save(profile);
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Email: admin@admin.com');
    console.log('Senha: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  }
}

createAdmin();

