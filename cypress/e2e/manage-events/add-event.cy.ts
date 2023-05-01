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
      // WARNING: this might become flaky depending on how we filter events on
      // the homepage. If we filter by location, it's possible that the event
      // will be too far away and not be displayed.
      cy.contains("Test Event");
    });
  });
});
