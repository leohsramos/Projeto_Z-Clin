const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static(path.join(__dirname, '.next')));
app.use(express.json());

// Simular banco de dados em memória
const users = [
  { 
    email: 'drajosiane@clinica.com', 
    password: 'Dra.Josi@2024!', 
    name: 'Dra. Josiane Canali', 
    userType: 'DRA_JOSIANE' 
  },
  { 
    email: 'financeiro@clinica.com', 
    password: 'Fin@nc2024#', 
    name: 'Setor Financeiro', 
    userType: 'FINANCEIRO' 
  },
  { 
    email: 'secretaria@clinica.com', 
    password: 'Sec@2024$', 
    name: 'Secretária', 
    userType: 'SECRETARIA' 
  },
  { 
    email: 'dev@clinica.com', 
    password: 'Dev@2024&', 
    name: 'Desenvolvedor', 
    userType: 'DESENVOLVEDOR' 
  }
];

// Dados mock
const appointments = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    status: 'AGENDADO',
    patient: { name: 'Maria Silva', phone: '(11) 98765-4321' },
    procedure: { name: 'Consulta de rotina', value: 150 }
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    status: 'CONFIRMADO',
    patient: { name: 'João Santos', phone: '(11) 91234-5678' },
    procedure: { name: 'Retorno', value: 120 }
  }
];

const patients = [
  { id: '1', name: 'Maria Silva', email: 'maria.silva@email.com', phone: '(11) 98765-4321' },
  { id: '2', name: 'João Santos', email: 'joao.santos@email.com', phone: '(11) 91234-5678' },
  { id: '3', name: 'Ana Oliveira', email: 'ana.oliveira@email.com', phone: '(11) 92345-6789' }
];

const procedures = [
  { id: '1', name: 'Consulta de rotina', value: 150, duration: 30 },
  { id: '2', name: 'Retorno', value: 120, duration: 20 },
  { id: '3', name: 'Exame físico', value: 200, duration: 45 }
];

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password, userType } = req.body;
  
  const user = users.find(u => 
    u.email === email && 
    u.password === password && 
    u.userType === userType
  );
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, message: 'Login realizado com sucesso' });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

app.get('/api/patients', (req, res) => {
  res.json(patients);
});

app.get('/api/procedures', (req, res) => {
  res.json(procedures);
});

// Rota principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Sistema Médico Online!');
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 Rede: http://0.0.0.0:${PORT}`);
  console.log(`🔐 Login: drajosiane@clinica.com / Dra.Josi@2024!`);
  console.log(`📱 Acesse de qualquer dispositivo na mesma rede!`);
});