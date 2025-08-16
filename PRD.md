# PRD: Plataforma de Geração de Aplicações Full-Stack

## 1. Visão Geral e Estratégia

* **Objetivos de Negócio**: Nosso objetivo é capacitar fundadores de startups, gerentes de produto e desenvolvedores a criar e prototipar aplicações full-stack funcionais em minutos, não meses, reduzindo drasticamente o tempo e o custo para validar uma ideia de negócio.

* **Enquadramento Estratégico**: Este projeto posiciona nossa empresa como líder em desenvolvimento de software autônomo, oferecendo uma ferramenta que transforma conceitos de produto em código-fonte de nível de produção com uma única instrução.

* **Métricas de Sucesso (KPIs)**:
    * Atingir 2.000 usuários registrados no primeiro trimestre após o lançamento.
    * Alcançar uma taxa de 75% de "gerações bem-sucedidas" (definida como uma aplicação que pode ser iniciada localmente via `docker-compose up` sem erros).
    * Obter uma pontuação de satisfação do usuário (CSAT) de 8/10 ou superior nas pesquisas pós-geração.

## 2. Definição do Utilizador e do Problema

* **Persona de Utilizador Primária**: 'Sofia, a Fundadora'. 30 anos, fundadora de uma startup em estágio inicial, não técnica.
    * **Objetivos**: Validar sua ideia de produto com um protótipo funcional para apresentar a investidores e primeiros usuários.
    * **Pontos de Dor**: Achar o processo de contratação de freelancers caro e demorado; falta de conhecimento técnico para construir um MVP (Minimum Viable Product); frustração com a lentidão para transformar sua visão em um produto tangível.

* **Histórias de Utilizador**:
    * Como 'Sofia, a Fundadora', eu quero descrever minha ideia de "um aplicativo de lista de tarefas com login de usuário e categorias" em uma única frase em uma interface web, para que eu receba um link para um repositório no GitHub com uma aplicação full-stack completa e possa mostrá-la a um investidor na mesma semana.
    * Como um 'Engenheiro de Produto', eu quero gerar o boilerplate para uma nova microsserviço especificando a sua API em linguagem natural, para que eu possa acelerar o início de novos projetos sem escrever código repetitivo.

## 3. Escopo da Solução

* **Funcionalidades (O que está dentro)**:
    1.  Interface web com autenticação de usuário (Google OAuth) para gerenciar projetos.
    2.  Uma página principal com um campo de texto para o usuário inserir o prompt da aplicação.
    3.  Um processo de geração assíncrono que mostra o progresso para o usuário.
    4.  O agente de IA irá gerar:
        * Um backend FastAPI (Python) com endpoints de API.
        * Um frontend React (TypeScript) com componentes básicos e chamadas de API.
        * Um arquivo `docker-compose.yml` para rodar toda a aplicação localmente.
        * Um `README.md` com instruções de instalação.
    5.  O código gerado poderá ser baixado para posteriormente ser enviado para um repositório privado no GitHub do usuário.
    6.  O usuário poderá tanto fazer upload de arquivo .zip de códigos de sistemas que deseja aprimorar como também subir arquivos avulsos.

* **Não-Objetivos (O que está fora)**:
    * NÃO haverá deploy automático para provedores de nuvem (Vercel, AWS, etc.) na v1. O resultado é o código-fonte a ser baixado pelo usuário.
    * NÃO haverá interrupção para refinar a aplicação após a geração inicial. É um processo de uma só vez. Eventuais ajustes poderão ser solicitados pelo usuário apenas após o fim do ciclo solicitado.
    * NÃO suportaremos a customização da stack tecnológica na v1. A stack (FastAPI + React) é fixa.

* **Design e Fluxo de Utilizador**:
    * Usuário se inscreve/loga na plataforma web.
    * Clica em "Criar Nova Aplicação".
    * Insere o prompt, ex: "Uma galeria de imagens onde usuários podem fazer upload e votar nas fotos".
    * Acompanha uma tela de progresso.
    * Recebe um email e uma notificação na tela com o link para o repositório GitHub quando a geração estiver completa.

## 4. Requisitos Específicos da IA

* **Requisitos de Dados**: A principal fonte de dados de entrada é o prompt em linguagem natural do usuário. O sistema não deve armazenar o código-fonte gerado após a entrega bem-sucedida ao GitHub do usuário.

* **Métricas de Desempenho do Modelo**: O agente deve gerar código que passe em verificações de linter (black/prettier) e não contenha vulnerabilidades de segurança críticas (OWASP Top 10) detectáveis por análise estática.

* **Considerações Éticas e de Conformidade**: O código gerado deve ser original e não uma cópia direta de repositórios existentes para evitar problemas de licenciamento. Dados de identificação pessoal (como chaves de API do GitHub do usuário) devem ser armazenados de forma criptografada e manuseados com segurança.

## 5. Contexto Adicional

* **Pressupostos**:
    * Os usuários possuem uma conta no GitHub para que a plataforma possa criar repositórios.
    * Os usuários possuem Docker instalado em seu ambiente local para rodar a aplicação gerada.
    * Os usuários pagarão uma assinatura mensal obtendo um saldo a ser consumido via API do GPT-5 ou Claude Opus 4.1, a critério.

* **Questões Abertas**:
    * Qual a melhor estratégia para lidar com processos de geração de código muito longos (superiores a 10 minutos)? WebSockets, webhooks ou notificação por email?
    * Como garantir que a API gerada pelo backend e as chamadas de API no frontend sejam consistentes e compatíveis?

---

## 6. Especificações Técnicas

### 6.1 Arquitetura do Sistema

* **Stack Tecnológica**:
    * **Frontend**: Next.js 14+ com TypeScript e Tailwind CSS
    * **Backend**: Node.js com Express ou Fastify
    * **IA**: Integração com OpenAI GPT-4/5 e Anthropic Claude
    * **Banco de Dados**: PostgreSQL para dados do usuário, Redis para cache
    * **Autenticação**: NextAuth.js com Google OAuth
    * **Infraestrutura**: Docker, WebContainers para execução no navegador

* **Componentes Principais**:
    1. **Generator Engine**: Orquestra os agentes LangGraph para geração de código
    2. **Template System**: Biblioteca de templates para diferentes tipos de aplicação
    3. **Code Validator**: Verifica qualidade e segurança do código gerado
    4. **Progress Tracker**: Monitora e reporta progresso da geração em tempo real
    5. **GitHub Integration**: Cria repositórios e faz push do código gerado

### 6.2 Fluxos de Trabalho

* **Fluxo de Geração de Aplicação**:
    1. Usuário submete prompt e arquivos opcionais
    2. Sistema analisa requisitos e seleciona template apropriado
    3. Agente Planner cria especificação detalhada da aplicação
    4. Agente Generator produz código fonte completo
    5. Code Validator executa verificações de qualidade
    6. Sistema cria repositório GitHub e faz deploy do código
    7. Usuário recebe notificação com link do repositório

* **Fluxo de Aprimoramento**:
    1. Usuário faz upload de código existente (.zip)
    2. Sistema analisa estrutura e identifica tecnologias
    3. Usuário especifica melhorias desejadas
    4. Agente Modifier aplica mudanças preservando estrutura existente
    5. Sistema valida compatibilidade e funcionalidade
    6. Código atualizado é disponibilizado para download

### 6.3 Integração com WebContainers

* **Execução no Navegador**:
    * Integração com StackBlitz WebContainers para preview em tempo real
    * Suporte a Node.js, npm/yarn, e ferramentas de desenvolvimento
    * Hot reload automático durante geração de código
    * Terminal integrado para debugging e comandos

* **Templates Suportados**:
    * **Frontend**: React, Vue.js, Svelte, vanilla JavaScript
    * **Backend**: Express.js, Fastify, NestJS
    * **Full-Stack**: Next.js, Nuxt.js, SvelteKit
    * **Database**: SQLite, PostgreSQL (via containers)

## 7. Requisitos de Interface

### 7.1 Interface Principal

* **Dashboard**:
    * Lista de projetos criados com status (Em andamento, Concluído, Erro)
    * Botão "Criar Nova Aplicação" proeminente
    * Métricas de uso (créditos restantes, projetos este mês)
    * Acesso rápido a projetos recentes

* **Página de Criação**:
    * Campo de texto principal para descrição da aplicação
    * Área de upload para arquivos/código existente
    * Seletor de template (opcional, com detecção automática)
    * Configurações avançadas (collapse): stack preferida, features específicas

* **Página de Progresso**:
    * Barra de progresso com etapas nomeadas
    * Log em tempo real das ações do agente
    * Preview da aplicação conforme é gerada (iframe)
    * Botão de cancelamento com confirmação

### 7.2 Experiência do Usuário

* **Onboarding**:
    * Tutorial interativo na primeira visita
    * Exemplo de prompt bem-sucedido
    * Conectar conta GitHub durante configuração inicial

* **Feedback e Iteração**:
    * Sistema de rating pós-geração (1-5 estrelas)
    * Campo de comentários para melhorias
    * Opção de "Regenerar com ajustes" baseado em feedback

## 8. Considerações de Segurança

### 8.1 Proteção de Dados

* **Criptografia**:
    * Tokens GitHub criptografados com AES-256
    * Comunicação via HTTPS obrigatório
    * Dados temporários em Redis com TTL automático

* **Controle de Acesso**:
    * Rate limiting por usuário (5 gerações/dia tier gratuito)
    * Validação de input para prevenir injection attacks
    * Sandboxing de código gerado antes da execução

### 8.2 Compliance

* **LGPD/GDPR**:
    * Consentimento explícito para armazenamento de dados
    * Direito ao esquecimento implementado
    * Auditoria de acesso a dados pessoais

* **Licenciamento**:
    * Verificação automática contra bancos de código open source
    * Disclaimer sobre propriedade intelectual do código gerado
    * Opção de licença MIT automática para projetos gerados

## 9. Plano de Implementação

### 9.1 Fases de Desenvolvimento

**Fase 1 - MVP (2-3 meses)**:
- Interface básica de chat para criação de aplicações
- Templates React + Express.js
- Integração GitHub básica
- Sistema de autenticação

**Fase 2 - Aprimoramento (1-2 meses)**:
- Upload de código existente
- WebContainers para preview
- Templates adicionais (Vue, FastAPI)
- Sistema de créditos

**Fase 3 - Escalabilidade (2-3 meses)**:
- Deploy automático opcional
- Colaboração em projetos
- API pública para integrações
- Analytics avançado

### 9.2 Critérios de Aceitação

* **Funcional**:
    - 90% das aplicações geradas devem iniciar sem erros
    - Tempo médio de geração inferior a 5 minutos
    - Preview em tempo real funcional

* **Técnico**:
    - Uptime de 99.5%
    - Tempo de resposta da API inferior a 200ms
    - Suporte a 100 usuários simultâneos

* **Negócio**:
    - Taxa de conversão gratuito→pago de 20%
    - NPS superior a 50
    - Churn mensal inferior a 5%

---

*Este PRD serve como fonte única da verdade para o desenvolvimento da plataforma de geração de aplicações full-stack, estabelecendo claramente o escopo, requisitos e expectativas para todas as partes interessadas.*