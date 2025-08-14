describe('Project Progress Page', () => {
  beforeEach(() => {
    // Clear any existing intercepts to avoid conflicts
    cy.intercept('GET', '/api/v1/jobs/**').as('clearIntercepts')
    
    // Mock login state
    cy.window().then((win) => {
      win.localStorage.setItem('auth-token', 'mock-token')
    })
  })

  afterEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear()
    })
  })

  it('should display initial processing state with progress bar and log', () => {
    // Intercept the job status endpoint
    cy.intercept('GET', '/api/v1/jobs/some-uuid/status', {
      statusCode: 200,
      body: {
        status: 'processing',
        progress: 10,
        log: 'Motor de IA a inicializar...'
      }
    }).as('getJobStatus')

    // Visit the project progress page
    cy.visit('/project/some-uuid')

    // Wait for the status call
    cy.wait('@getJobStatus')

    // Assert that the page displays the correct initial state
    cy.contains('Status: Em Processamento').should('be.visible')
    cy.get('[data-testid="progress-bar"]').should('be.visible')
    cy.get('[data-testid="progress-bar"]').should('have.attr', 'aria-valuenow', '10')
    cy.contains('Motor de IA a inicializar...').should('be.visible')
  })

  it('should update in real-time from processing to completed with PR link', () => {
    // Start with processing, then switch to completed after timeout
    cy.intercept('GET', '/api/v1/jobs/some-uuid/status', {
      statusCode: 200,
      body: {
        status: 'processing',
        progress: 50,
        log: 'Gerando código do backend...'
      }
    }).as('getJobStatusProcessing')

    // Visit the project progress page
    cy.visit('/project/some-uuid')

    // Wait for the initial processing state
    cy.contains('Status: Em Processamento').should('be.visible')
    cy.contains('Gerando código do backend...').should('be.visible')

    // Switch to completed status for next poll
    cy.intercept('GET', '/api/v1/jobs/some-uuid/status', {
      statusCode: 200,
      body: {
        status: 'completed',
        progress: 100,
        log: 'Geração concluída com sucesso!',
        pr_url: 'http://github.com/pull/1'
      }
    }).as('getJobStatusCompleted')

    // Wait for polling to trigger and check for completed state
    cy.wait(3000)
    cy.contains('Status: Concluído').should('be.visible')
    cy.get('[data-testid="pr-link"]').should('be.visible')
    cy.get('[data-testid="pr-link"]').should('have.attr', 'href', 'http://github.com/pull/1')
    cy.contains('Geração concluída com sucesso!').should('be.visible')
  })

  it('should display failed state with error message', () => {
    // Intercept the job status endpoint with failed state
    cy.intercept('GET', '/api/v1/jobs/some-uuid/status', {
      statusCode: 200,
      body: {
        status: 'failed',
        progress: 0,
        error_message: 'Timeout na geração de código.'
      }
    }).as('getJobStatusFailed')

    // Visit the project progress page
    cy.visit('/project/some-uuid')

    // Wait for the status call
    cy.wait('@getJobStatusFailed')

    // Assert that the page displays the failed state
    cy.contains('Status: Falhou').should('be.visible')
    cy.contains('Timeout na geração de código.').should('be.visible')
    cy.get('[data-testid="error-message"]').should('be.visible')
  })

  it('should display not found error for non-existent project', () => {
    // Intercept the job status endpoint with 404 error
    cy.intercept('GET', '/api/v1/jobs/fake-id/status', {
      statusCode: 404,
      body: {
        detail: 'Job not found'
      }
    }).as('getJobStatusNotFound')

    // Visit the project progress page with fake ID
    cy.visit('/project/fake-id')

    // Wait for the status call
    cy.wait('@getJobStatusNotFound')

    // Assert that the page displays the not found error
    cy.contains('Projeto não encontrado').should('be.visible')
    cy.get('[data-testid="not-found-error"]').should('be.visible')
  })

  it('should handle network errors gracefully', () => {
    // Intercept the job status endpoint with network error
    cy.intercept('GET', '/api/v1/jobs/some-uuid/status', {
      forceNetworkError: true
    }).as('getJobStatusError')

    // Visit the project progress page
    cy.visit('/project/some-uuid')

    // Wait for the status call
    cy.wait('@getJobStatusError')

    // Assert that the page displays a network error message
    cy.contains('Erro ao carregar o status do projeto').should('be.visible')
    cy.get('[data-testid="network-error"]').should('be.visible')
  })

  it('should poll for status updates at regular intervals', () => {
    const jobId = 'some-uuid'
    
    // Controlar o tempo para garantir polling determinístico
    cy.clock()
    
    // Primeira chamada: estado inicial (primeira visita da página)
    cy.intercept('GET', `/api/v1/jobs/${jobId}/status`, {
      statusCode: 200,
      body: {
        status: 'processing',
        progress: 25,
        log: 'Analisando requisitos...'
      }
    }).as('getStatusUpdate1')
    
    // Visit the project progress page
    cy.visit(`/project/${jobId}`)
    
    // Aguardar e verificar o estado inicial
    cy.wait('@getStatusUpdate1')
    cy.contains('Analisando requisitos...').should('be.visible')
    cy.contains('Status: Em Processamento').should('be.visible')
    
    // Segunda chamada: estado intermediário (após 3 segundos de polling)
    cy.intercept('GET', `/api/v1/jobs/${jobId}/status`, {
      statusCode: 200,
      body: {
        status: 'processing',
        progress: 75,
        log: 'Gerando frontend...'
      }
    }).as('getStatusUpdate2')
    
    // Avançar o tempo para acionar o próximo poll (3 segundos)
    cy.tick(3000)
    cy.wait('@getStatusUpdate2')
    cy.contains('Gerando frontend...').should('be.visible')
    
    // Terceira chamada: estado final
    cy.intercept('GET', `/api/v1/jobs/${jobId}/status`, {
      statusCode: 200,
      body: {
        status: 'completed',
        progress: 100,
        log: 'Projeto criado com sucesso!',
        pr_url: 'http://github.com/pull/1'
      }
    }).as('getStatusUpdate3')
    
    // Avançar o tempo novamente para acionar o poll final
    cy.tick(3000)
    cy.wait('@getStatusUpdate3')
    cy.contains('Status: Concluído').should('be.visible')
    cy.contains('Projeto criado com sucesso!').should('be.visible')
    cy.get('[data-testid="pr-link"]').should('be.visible')
    cy.get('[data-testid="pr-link"]').should('have.attr', 'href', 'http://github.com/pull/1')
  })
})