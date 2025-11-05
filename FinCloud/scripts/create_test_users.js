#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');

const BFF_URL = process.env.BFF_URL || 'http://localhost:3000/api';

const usersToCreate = [
  {
    email: 'admin@admin.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
  },
  {
    email: 'user@user.com',
    password: 'user123',
    name: 'Usuário Teste',
    role: 'normal',
  },
];

async function createUsers() {
  console.log('🔍 Verificando usuários existentes...\n');

  try {
    // Verificar usuários existentes
    const existingUsersResponse = await axios.get(`${BFF_URL}/users`);
    const existingUsers = existingUsersResponse.data.data?.users || existingUsersResponse.data.users || [];
    
    const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));

    for (const userData of usersToCreate) {
      const emailLower = userData.email.toLowerCase();
      
      if (existingEmails.has(emailLower)) {
        console.log(`⚠️  Usuário ${userData.email} já existe. Pulando...`);
        continue;
      }

      try {
        console.log(`📝 Criando usuário: ${userData.email} (${userData.role})...`);
        
        const response = await axios.post(`${BFF_URL}/users/register`, userData);
        
        console.log(`✅ Usuário ${userData.email} criado com sucesso!`);
        console.log(`   ID: ${response.data.user?.id || 'N/A'}`);
        console.log(`   Nome: ${response.data.user?.name || userData.name}`);
        console.log(`   Role: ${response.data.user?.role || userData.role}\n`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️  Usuário ${userData.email} já existe (conflito).\n`);
        } else {
          console.error(`❌ Erro ao criar usuário ${userData.email}:`, error.response?.data || error.message);
          console.log('');
        }
      }
    }

    console.log('\n✅ Processo concluído!');
    console.log('\n📋 Credenciais de teste:');
    console.log('   Admin: admin@admin.com / admin123');
    console.log('   User:  user@user.com / user123');
  } catch (error) {
    console.error('❌ Erro ao verificar/criar usuários:', error.response?.data || error.message);
    process.exit(1);
  }
}

createUsers();


