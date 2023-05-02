describe("Add Event", () => {
  it("should allow users to post events", () => {
    cy.login();

    cy.visit("/add-event");

    cy.get("[data-cy='input-name'").type("Test Event");
    cy.get("[data-cy='input-date']").type("2023-05-02T11:17");
    cy.get("[data-cy='input-url']").type("https://test.event");
    cy.get("[data-cy='input-latitude'").type("0");
    cy.get("[data-cy='input-longitude'").type("0");
    cy.get("[data-cy='submit-add-event'").click();

    cy.location("pathname").should("eq", "/");
    cy.contains("Test Event");
  });
});
