#!/usr/bin/env node
/**
 * Script de Validação de Configurações OAuth
 * Previne divergências e identifica problemas de configuração automaticamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando configurações OAuth...\n');

// Função para ler arquivo .env
function readEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        env[key.trim()] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    });
    return env;
  } catch (error) {
    console.error(`❌ Erro ao ler ${filePath}:`, error.message);
    return {};
  }
}

// Função para validar configurações
function validateConfigs() {
  const errors = [];
  const warnings = [];
  
  // Lê configurações
  const platformEnv = readEnvFile('./apps/platform/.env.local');
  const dockerCompose = fs.readFileSync('./docker-compose.yml', 'utf-8');
  
  // 1. Validação de consistência de portas
  console.log('📋 Validando consistência de portas...');
  
  const apiPortFromEnv = platformEnv.NEXT_PUBLIC_API_URL?.match(/:(\d+)/)?.[1];
  const apiPortFromDocker = dockerCompose.match(/api:[\s\S]*?ports:[\s\S]*?- "(\d+):/)?.[1];
  
  if (apiPortFromEnv !== apiPortFromDocker) {
    errors.push({
      type: 'PORT_MISMATCH',
      message: `NEXT_PUBLIC_API_URL porta ${apiPortFromEnv} não coincide com docker-compose porta ${apiPortFromDocker}`,
      fix: `Ajustar NEXT_PUBLIC_API_URL para http://localhost:${apiPortFromDocker}`
    });
  }
  
  // 2. Validação de URLs do NextAuth
  console.log('🔐 Validando configurações OAuth...');
  
  const requiredEnvVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET'
  ];
  
  requiredEnvVars.forEach(varName => {
    if (!platformEnv[varName]) {
      errors.push({
        type: 'MISSING_ENV_VAR',
        message: `Variável ${varName} não encontrada`,
        fix: `Adicionar ${varName} no arquivo .env.local`
      });
    }
  });
  
  // 3. Validação da URL base do NextAuth
  if (platformEnv.NEXTAUTH_URL && !platformEnv.NEXTAUTH_URL.startsWith('http://localhost:3000')) {
    warnings.push({
      type: 'NEXTAUTH_URL_WARNING',
      message: `NEXTAUTH_URL deve ser http://localhost:3000 para desenvolvimento local`,
      current: platformEnv.NEXTAUTH_URL
    });
  }
  
  // 4. URLs de callback corretas
  const callbackUrls = {
    github: 'http://localhost:3000/api/auth/callback/github',
    google: 'http://localhost:3000/api/auth/callback/google'
  };
  
  console.log('🔗 URLs de callback que devem estar configuradas nos provedores OAuth:');
  console.log(`   GitHub: ${callbackUrls.github}`);
  console.log(`   Google: ${callbackUrls.google}\n`);
  
  return { errors, warnings };
}

// Função para verificar banco de dados
async function validateDatabase() {
  console.log('🗄️ Validando banco de dados...');
  
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execPromise = promisify(exec);
    
    const result = await execPromise(
      'COMPOSE_DOCKER_CLI_BUILD=0 docker compose exec -T postgres psql -U user -d mydb -c "SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' AND table_name IN (\'User\', \'Account\', \'Session\', \'VerificationToken\');"'
    );
    
    const tables = result.stdout.split('\n').filter(line => line.trim() && !line.includes('table_name') && !line.includes('-')).map(line => line.trim());
    
    const requiredTables = ['User', 'Account', 'Session', 'VerificationToken'];
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`❌ Tabelas ausentes: ${missingTables.join(', ')}`);
      console.log('💡 Execute: npm run db:migrate');
      return false;
    } else {
      console.log('✅ Todas as tabelas NextAuth.js estão presentes');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Não foi possível verificar banco de dados (pode não estar rodando)');
    return null;
  }
}

// Execução principal
async function main() {
  const { errors, warnings } = validateConfigs();
  
  // Mostra warnings
  if (warnings.length > 0) {
    console.log('⚠️  Avisos:');
    warnings.forEach(warning => {
      console.log(`   ${warning.message}`);
      if (warning.current) console.log(`   Atual: ${warning.current}`);
    });
    console.log();
  }
  
  // Mostra erros
  if (errors.length > 0) {
    console.log('❌ Erros encontrados:');
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error.message}`);
      console.log(`      Solução: ${error.fix}`);
    });
    console.log();
  }
  
  // Valida banco de dados
  await validateDatabase();
  
  // Resultado final
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Todas as configurações estão corretas!');
    console.log('\n🚀 Para iniciar o sistema:');
    console.log('   docker-compose up -d postgres redis');
    console.log('   npm run dev:platform');
  } else {
    console.log(`\n📊 Resultado: ${errors.length} erros, ${warnings.length} avisos`);
    process.exit(errors.length > 0 ? 1 : 0);
  }
}

main().catch(console.error);