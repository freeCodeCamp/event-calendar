describe("Homepage", () => {
  context("when the user is logged in", () => {
    it("should display the user's email", () => {
      cy.login();
      cy.visit("/");
      cy.contains("test@email.address");
    });
  });

  context("when the user is not logged in", () => {
    it("should display a sign in button", () => {
      cy.visit("/");
      cy.contains("Sign in");
    });
  });
});
