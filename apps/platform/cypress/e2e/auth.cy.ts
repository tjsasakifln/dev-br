describe('Authentication Flow', () => {
  it('should display the login page correctly', () => {
    // Visita a página de login
    cy.visit('/login');

    // Procura por um título H1 contendo o texto "Welcome" ou "Login"
    // Esta é uma asserção simples para verificar se a página renderizou
    cy.contains('h1', /Welcome|Login/i).should('be.visible');

    // Verifica se o botão de login com o Google existe
    cy.contains('button', /Google/i).should('be.visible');
  });
});