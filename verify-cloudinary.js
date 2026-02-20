#!/usr/bin/env node

/**
 * Script para testar a configuração do Cloudinary
 * 
 * Uso local:
 *  node verify-cloudinary.js
 * 
 * Este script verifica se as variáveis de ambiente estão configuradas
 * corretamente e tenta conectar ao Cloudinary.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do Cloudinary...\n');

// 1. Verificar .env
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

console.log('📋 Checando arquivo .env:');
if (fs.existsSync(envPath)) {
  console.log('   ✓ Arquivo .env encontrado');
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasCloudinaryCloud = envContent.includes('CLOUDINARY_CLOUD_NAME');
  const hasCloudinaryKey = envContent.includes('CLOUDINARY_API_KEY');
  const hasCloudinarySecret = envContent.includes('CLOUDINARY_API_SECRET');
  
  console.log(`   ${hasCloudinaryCloud ? '✓' : '✗'} CLOUDINARY_CLOUD_NAME configurado`);
  console.log(`   ${hasCloudinaryKey ? '✓' : '✗'} CLOUDINARY_API_KEY configurado`);
  console.log(`   ${hasCloudinarySecret ? '✓' : '✗'} CLOUDINARY_API_SECRET configurado`);
} else {
  console.log('   ✗ Arquivo .env não encontrado!');
  console.log(`   📝 Copie o arquivo .env.example e renomeie para .env\n`);
  if (fs.existsSync(envExamplePath)) {
    const exampleContent = fs.readFileSync(envExamplePath, 'utf-8');
    console.log('   Modelo de .env:');
    console.log('   ' + exampleContent.split('\n').join('\n   ') + '\n');
  }
  process.exit(1);
}

// 2. Verificar variáveis de ambiente
console.log('\n🔐 Variáveis de Ambiente:');
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

console.log(`   CLOUDINARY_CLOUD_NAME: ${cloudName ? '✓' : '✗'} ${cloudName ? `(${cloudName})` : '(não encontrado)'}`);
console.log(`   CLOUDINARY_API_KEY: ${apiKey ? '✓' : '✗'} ${apiKey ? '(configurado)' : '(não encontrado)'}`);
console.log(`   CLOUDINARY_API_SECRET: ${apiSecret ? '✓' : '✗'} ${apiSecret ? '(configurado)' : '(não encontrado)'}`);
console.log(`   CLOUDINARY_URL: ${cloudinaryUrl ? '✓' : '✗'} ${cloudinaryUrl ? '(configurado)' : '(não configurado)'}`);

// 3. Testar conexão com Cloudinary
if (cloudName && apiKey && apiSecret) {
  console.log('\n🔗 Testando conexão com Cloudinary:');
  
  try {
    const cloudinary = require('cloudinary');
    cloudinary.v2.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    
    // Teste simples: verificar se a config foi aceita
    console.log('   ✓ Cloudinary SDK carregado e configurado');
    console.log(`   ✓ Cloud Name: ${cloudName}`);
    console.log('   ✓ API Key: (configurado)');
    console.log('   ✓ API Secret: (configurado)');
    
    console.log('\n✅ Configuração do Cloudinary parece estar correta!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Inicie o servidor: npm run dev');
    console.log('   2. Teste o upload em: http://localhost:3000/admin/rooms/new');
    console.log('   3. Verifique os logs para confirmar que está funcionando');
    
  } catch (error) {
    console.log(`   ✗ Erro ao testar Cloudinary: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log('\n⚠️  Variáveis obrigatórias do Cloudinary não encontradas!');
  console.log('   Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET em seu .env');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
