describe('Dashboard Page', () => {
  beforeEach(() => {
    // Mock the API base URL
    cy.intercept('GET', '/api/health', { statusCode: 200, body: { status: 'ok' } });
  });

  describe('Cenário 1: Usuário Autenticado com Projetos', () => {
    it('deve exibir lista de projetos do usuário', () => {
      // Simular usuário autenticado com cookie de sessão NextAuth
      cy.setCookie('next-auth.session-token', 'mock-session-token');

      // Mock da API de projetos retornando lista com projetos
      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: [
          {
            id: 'uuid-1',
            name: 'Meu Primeiro App',
            status: 'Concluído',
            created_at: '2024-01-15T10:00:00Z',
            description: 'Uma aplicação de teste'
          },
          {
            id: 'uuid-2', 
            name: 'App de E-commerce',
            status: 'Em Desenvolvimento',
            created_at: '2024-01-16T15:30:00Z',
            description: 'Loja online completa'
          }
        ]
      }).as('getProjects');

      // Visitar a página de dashboard
      cy.visit('/dashboard');

      // Verificar se a estrutura básica da página está presente
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Gerencie seus projetos de aplicações full-stack').should('be.visible');

      // Verificar se os projetos mockados estão sendo exibidos
      cy.contains('Meu Primeiro App').should('be.visible');
      cy.contains('Concluído').should('be.visible');
      cy.contains('App de E-commerce').should('be.visible');
      cy.contains('Em Desenvolvimento').should('be.visible');

      // Verificar se o botão de criar nova aplicação está visível
      cy.contains('Criar Nova Aplicação').should('be.visible');
    });
  });

  describe('Cenário 2: Usuário Autenticado sem Projetos (Estado Vazio)', () => {
    it('deve exibir mensagem de estado vazio quando não há projetos', () => {
      // Simular usuário autenticado com cookie de sessão NextAuth
      cy.setCookie('next-auth.session-token', 'mock-session-token');

      // Mock da API de projetos retornando array vazio
      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: []
      }).as('getEmptyProjects');

      // Visitar a página de dashboard
      cy.visit('/dashboard');

      // Verificar se a estrutura básica da página está presente
      cy.contains('Dashboard').should('be.visible');

      // Verificar se a mensagem de estado vazio está sendo exibida
      cy.contains('Você ainda não criou nenhum projeto').should('be.visible');

      // Verificar se o botão de criar nova aplicação ainda está visível
      cy.contains('Criar Nova Aplicação').should('be.visible');
    });
  });

  describe('Cenário 3: Usuário Não Autenticado', () => {
    it('deve redirecionar para a página de login quando usuário não está autenticado', () => {
      // Garantir que não há usuário no localStorage
      cy.window().then((win) => {
        win.localStorage.removeItem('user');
      });

      // Tentar visitar a página de dashboard
      cy.visit('/dashboard');

      // Verificar se foi redirecionado para a página de login
      cy.url().should('include', '/login');
    });
  });
});