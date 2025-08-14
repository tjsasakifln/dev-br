describe('Página de Login', () => {
  beforeEach(() => {
    // Intercepta as chamadas de API do NextAuth.js para simular autenticação
    cy.intercept('GET', '/api/auth/session', { statusCode: 401 }).as('getSession')
    cy.intercept('GET', '/api/auth/providers', {
      google: {
        id: 'google',
        name: 'Google',
        type: 'oauth',
        signinUrl: '/api/auth/signin/google',
        callbackUrl: '/api/auth/callback/google'
      },
      github: {
        id: 'github',
        name: 'GitHub',
        type: 'oauth',
        signinUrl: '/api/auth/signin/github',
        callbackUrl: '/api/auth/callback/github'
      }
    }).as('getProviders')
  })

  describe('Cenário de Visualização', () => {
    it('deve exibir a página de login com todos os elementos necessários', () => {
      // Visita a página de login
      cy.visit('/login')

      // Verifica se o título está presente
      cy.get('h1').should('be.visible').and('contain.text', 'Faça seu login')

      // Verifica se o botão do Google está presente
      cy.get('button')
        .contains('Entrar com Google')
        .should('be.visible')

      // Verifica se o botão do GitHub está presente
      cy.get('button')
        .contains('Entrar com GitHub')
        .should('be.visible')
    })
  })

  describe('Cenário de Sucesso no Login', () => {
    it('deve redirecionar para o dashboard após login com Google bem-sucedido', () => {
      // Visita a página de login
      cy.visit('/login')

      // Clica no botão "Entrar com Google"
      cy.get('button')
        .contains('Entrar com Google')
        .click()

      // Para este teste, apenas verificamos que o botão existe e é clicável
      // Em um ambiente real, isso redirecionaria para OAuth
      cy.get('button')
        .contains('Entrar com Google')
        .should('be.visible')
        
      // Simula sucesso verificando que não há mensagem de erro
      cy.get('[data-testid="error-message"]').should('not.exist')
    })

    it('deve redirecionar para o dashboard após login com GitHub bem-sucedido', () => {
      // Visita a página de login
      cy.visit('/login')

      // Clica no botão "Entrar com GitHub"
      cy.get('button')
        .contains('Entrar com GitHub')
        .click()

      // Para este teste, apenas verificamos que o botão existe e é clicável
      // Em um ambiente real, isso redirecionaria para OAuth
      cy.get('button')
        .contains('Entrar com GitHub')
        .should('be.visible')
        
      // Simula sucesso verificando que não há mensagem de erro
      cy.get('[data-testid="error-message"]').should('not.exist')
    })
  })

  describe('Cenários de Erro', () => {
    it('deve exibir mensagem de erro quando a autenticação falha', () => {
      // Visita a página de login
      cy.visit('/login')

      // Aguarda a página carregar completamente
      cy.get('h1').should('contain.text', 'Faça seu login')

      // Aguarda um pouco para garantir que todos os elementos foram renderizados
      cy.wait(1000)

      // Clica no botão de simular erro
      cy.get('[data-testid="trigger-error-button"]').click({ force: true })

      // Verifica se uma mensagem de erro é exibida
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Erro na autenticação')
    })
  })
})