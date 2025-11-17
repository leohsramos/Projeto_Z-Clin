const express = require('express');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = 8080;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '.next')));

// Rota principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'server', 'app.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor estático rodando em:`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Rede: http://0.0.0.0:${PORT}`);
  console.log(`   Acesse de qualquer dispositivo na mesma rede!`);
});