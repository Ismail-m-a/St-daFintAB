describe('Boka Component Tests', () => {
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:3000/boka', req => {
      if (req.body.email && req.body.email.includes('fail')) {
        req.reply({
          statusCode: 500,
          body: { message: 'Internal server error' }
        });
      } else {
        req.reply({
          statusCode: 200,
          body: { message: `Booking confirmed, thank ${req.body.name}! Your message was "${req.body.message}"` }
        });
      }
    }).as('postBoka');
   
    cy.visit('/#boka');
  });


  it('successfully submits the booking form', () => {
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="email"]').type('john@example.com');
    cy.get('input[name="address"]').type('1234 Main Street');
    cy.get('select[name="service"]').select('Hemstädning');
    cy.get('select[name="housingType"]').select('Lägenhet');
    cy.get('input[name="date"]').type('2023-10-01');
    cy.get('input[name="time"]').type('10:00');
    cy.get('textarea[name="message"]').type('Please ensure extra care is taken in the kitchen.');
    cy.get('button[type="submit"]').click();
   
    cy.wait('@postBoka').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.get('.toast-success', { timeout: 15000 }).should('be.visible').and('contain', 'Booking confirmed, thank John Doe!');
    });
  });


  it('displays error message on server failure', () => {
    cy.get('input[name="name"]').type('Jane Fail');
    cy.get('input[name="email"]').type('fail@example.com');
    cy.get('input[name="address"]').type('1234 Main Street');
    cy.get('select[name="service"]').select('Kontorstädning');
    cy.get('select[name="housingType"]').select('Hus');
    cy.get('input[name="date"]').type('2023-10-02');
    cy.get('input[name="time"]').type('12:00');
    cy.get('textarea[name="message"]').type('Urgent cleaning required.');
    cy.get('button[type="submit"]').click();


    cy.wait('@postBoka').then((interception) => {
      expect(interception.response.statusCode).to.eq(500);
      cy.get('.toast-error', { timeout: 15000 }).should('be.visible').and('contain', 'Booking failed, please try again: Internal server error');
    });
  });
});
