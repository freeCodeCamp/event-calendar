describe("Add Event", () => {
  it("should allow users to post events", () => {
    cy.login();
    // TODO: rewrite this as a UI test, rather than simply calling the API.
    cy.request("POST", "/api/event", {
      name: "Test Event",
      date: "2021-01-01",
      link: "https://test.event",
      latitude: 0,
      longitude: 0,
    }).then(() => {
      cy.visit("/");
      cy.contains("Test Event");
    });
  });
});
