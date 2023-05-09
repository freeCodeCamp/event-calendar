describe("Homepage", () => {
  before(() => {
    cy.task("resetEvents");
  });
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

    it("should allow users to submit a new location", () => {
      // Initialize the location to a known value
      const latitude = 10;
      const longitude = 20;
      cy.visit("/", {
        onBeforeLoad: ({ navigator }) => {
          cy.stub(navigator.geolocation, "getCurrentPosition").callsArgWith(0, {
            coords: { latitude, longitude },
          });
        },
      });
      cy.get("[data-cy='latitude-input']").should("have.value", latitude);
      cy.get("[data-cy='longitude-input']").should("have.value", longitude);
      cy.get("[data-cy='submit-location']").click();

      // Now that the location is set, we can what's nearby (nothing is within
      // 25km)
      cy.get("[data-cy='radius-select'").select("25");
      cy.get("[data-cy='event-card']").should("not.exist");

      // But all 10 events are within 50km
      cy.get("[data-cy='radius-select'").select("50");
      cy.get("[data-cy='event-card']")
        .should("exist")
        .should("have.length", 10);

      // Finally we can change the location to confirm that no events are
      // available
      cy.get("[data-cy='latitude-input']")
        .should("have.value", latitude)
        .clear()
        .type("1");
      cy.get("[data-cy='longitude-input']")
        .should("have.value", longitude)
        .clear()
        .type("1");
      cy.get("[data-cy='submit-location']").click();
      cy.get("[data-cy='radius-select'").select("100");

      cy.get("[data-cy='events-card']").should("have.length", 0);
    });
  });
});
