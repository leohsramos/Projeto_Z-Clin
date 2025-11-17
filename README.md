# 🏥 Clínica Médica - Sistema Completo de Gestão

Um sistema completo de gestão para clínicas médicas desenvolvido com Next.js 15, TypeScript e Tailwind CSS.

## 🚀 Como Baixar e Usar

### 1. Clonar o Projeto
```bash
git clone [URL-DO-REPOSITÓRIO]
cd nome-do-projeto
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em: **http://localhost:3000**

## 📋 Funcionalidades

### 👤 Multi-usuário
- **Dra. Josiane Canali** - Acesso completo a todas as funcionalidades
- **Financeiro** - Gestão financeira e relatórios
- **Secretaria** - Agendamento e cadastro de pacientes
- **Desenvolvedor** - Acesso técnico para manutenção

### 🏠 Dashboard
- KPIs em tempo real (Pacientes, Consultas, Faturamento)
- Cards informativos com gradientes modernos
- Interface responsiva e intuitiva

### 👥 Gestão de Pacientes
- Cadastro completo com todos os dados pessoais
- Edição e exclusão de pacientes
- Busca inteligente por nome ou email
- Cards responsivos com informações detalhadas

### 💆 Procedimentos
- Cadastro de procedimentos com valores e duração
- Descrição detalhada e materiais necessários
- Edição de valores e informações
- Interface organizada em cards

### 📅 Agendamento de Consultas
- Sistema completo de agendamento
- Status das consultas (Agendado, Confirmado, Realizado, Faltou, Cancelado)
- Integração com pacientes e procedimentos
- Observações e informações adicionais

### 💰 Gestão Financeira
- Dashboard financeiro completo
- Total recebido e a receber
- Ticket médio por consulta
- Resumo detalhado de todas as consultas

## 🎨 Interface

### Design Moderno
- **Cores**: Tema roxo/lilás com gradientes suaves
- **Componentes**: shadcn/ui para interface profissional
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animado**: Transições suaves e feedback visual

### Experiência do Usuário
- Toast notifications para feedback de ações
- Diálogos modais para formulários
- Badges coloridos para status
- Ícones intuitivos do Lucide React

## 🛠️ Tecnologias

- **Framework**: Next.js 15 com App Router
- **Linguagem**: TypeScript 5
- **Estilos**: Tailwind CSS 4
- **Componentes**: shadcn/ui
- **Ícones**: Lucide React
- **Notificações**: Sonner
- **Estado**: React Hooks (useState, useEffect)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx          # Página principal do sistema
│   ├── layout.tsx         # Layout da aplicação
│   └── globals.css       # Estilos globais
├── components/
│   └── ui/               # Componentes shadcn/ui
├── hooks/
│   └── use-toast.ts      # Hook para notificações
└── lib/
    └── db.ts             # Configuração do banco de dados
```

## 🔧 Configuração

### Variáveis de Ambiente
O sistema está configurado para funcionar com dados mock (simulados) para demonstração.

### Banco de Dados
O projeto está configurado com Prisma ORM e SQLite, mas atualmente usa dados mock para facilitar o desenvolvimento e demonstração.

## 📱 Como Usar

1. **Acesso ao Sistema**
   - Abra http://localhost:3000
   - Selecione o tipo de usuário desejado
   - Clique no botão correspondente

2. **Navegação**
   - Use as abas superiores para alternar entre seções
   - Dashboard: Visão geral da clínica
   - Pacientes: Gestão de pacientes
   - Procedimentos: Cadastro de procedimentos
   - Consultas: Agendamento e gestão
   - Financeiro: Relatórios financeiros

3. **Operações CRUD**
   - **Criar**: Clique nos botões "Novo..." para adicionar itens
   - **Ler**: Visualize informações nos cards e listas
   - **Atualizar**: Clique no ícone de editar (✏️)
   - **Deletar**: Clique no ícone de lixeira (🗑️)

4. **Busca**
   - Use o campo de busca em cada seção para filtrar resultados
   - A busca é instantânea e funciona por nome ou email

## 🎯 Destaques

- ✅ **Interface Profissional**: Design moderno e corporativo
- ✅ **Totalmente Funcional**: Todas as operações CRUD funcionando
- ✅ **Responsivo**: Funciona em qualquer dispositivo
- ✅ **Dados Mock**: Sistema pronto para demonstração
- ✅ **Código Limpo**: TypeScript e boas práticas
- ✅ **Performance**: Otimizado com Next.js 15

## 🚀 Próximos Passos

Para usar em produção:
1. Configurar banco de dados real
2. Implementar autenticação verdadeira
3. Adicionar mais validações
4. Implementar backup de dados
5. Adicionar relatórios avançados

## 📞 Suporte

Este é um projeto de demonstração. Para dúvidas ou personalizações, entre em contato.

---

**Desenvolvido com ❤️ para gestão de clínicas médicas**