describe("Add Event", () => {
  before(() => {
    cy.task("resetEvents");
  });
  it("should allow users to post events", () => {
    cy.login();

    cy.visit("/add-event");

    cy.get("[data-cy='input-name'").type("Test Event");
    cy.get("[data-cy='input-date']").type("2023-05-02T11:17");
    cy.get("[data-cy='input-link']").type("https://test.event");
    cy.get("[data-cy='input-latitude'").type("0");
    cy.get("[data-cy='input-longitude'").type("0");
    cy.get("[data-cy='submit-add-event'").click();

    cy.location("pathname").should("eq", "/");

    // Set the location to a known value
    cy.get("[data-cy='latitude-input']").clear().type("0");
    cy.get("[data-cy='longitude-input']").clear().type("0");
    cy.get("[data-cy='submit-location']").click();

    // All the seeded events are far away, so we narrow the focus
    cy.get("[data-cy='radius-select'").select("100");

    // We should only see the event we just created
    cy.get("[data-cy='event-card']").should("have.length", 1);
    cy.contains("Test Event");
  });
});
