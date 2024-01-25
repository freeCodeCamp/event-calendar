describe("Delete Event", () => {
  beforeEach(() => {
    cy.task("resetEvents");
  });

  it("should allow users with @freecodecamp.org emails to delete events", () => {
    cy.login("hypo.thetical@freecodecamp.org");
    cy.visit("/");

    cy.get("[data-cy='event-card']").should("have.length", 10);
    // TODO: use a confirm modal instead of a button
    cy.get("[data-cy='delete-event']").first().click();
    cy.get("[data-cy='event-card']").should("have.length", 9);
  });

  it("should should not show the delete button to other users", () => {
    cy.login("test@email.address");
    cy.visit("/");

    cy.get("[data-cy='delete-event']").should("not.exist");
  });
});
