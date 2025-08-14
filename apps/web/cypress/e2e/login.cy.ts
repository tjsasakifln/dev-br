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
      // Simula uma resposta de autenticação bem-sucedida
      cy.intercept('POST', '/api/auth/signin/google', {
        statusCode: 200,
        body: { url: '/dashboard' }
      }).as('googleLogin')

      cy.intercept('GET', '/api/auth/session', {
        user: {
          id: '1',
          email: 'usuario@exemplo.com',
          name: 'Usuário Teste',
          image: 'https://exemplo.com/avatar.jpg'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }).as('getSessionAfterLogin')

      // Visita a página de login
      cy.visit('/login')

      // Clica no botão "Entrar com Google"
      cy.get('button')
        .contains('Entrar com Google')
        .click()

      // Verifica se a URL mudou para /dashboard
      cy.url().should('include', '/dashboard')
    })

    it('deve redirecionar para o dashboard após login com GitHub bem-sucedido', () => {
      // Simula uma resposta de autenticação bem-sucedida
      cy.intercept('POST', '/api/auth/signin/github', {
        statusCode: 200,
        body: { url: '/dashboard' }
      }).as('githubLogin')

      cy.intercept('GET', '/api/auth/session', {
        user: {
          id: '1',
          email: 'usuario@exemplo.com',
          name: 'Usuário Teste',
          image: 'https://exemplo.com/avatar.jpg'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }).as('getSessionAfterLogin')

      // Visita a página de login
      cy.visit('/login')

      // Clica no botão "Entrar com GitHub"
      cy.get('button')
        .contains('Entrar com GitHub')
        .click()

      // Verifica se a URL mudou para /dashboard
      cy.url().should('include', '/dashboard')
    })
  })

  describe('Cenários de Erro', () => {
    it('deve exibir mensagem de erro quando a autenticação falha', () => {
      // Visita a página de login
      cy.visit('/login')

      // Simula um erro de autenticação usando o botão de teste
      cy.get('[data-testid="simulate-error-button"]').click({ force: true })

      // Verifica se uma mensagem de erro é exibida
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Erro na autenticação')
    })
  })
})