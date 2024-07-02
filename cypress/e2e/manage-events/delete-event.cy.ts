import { latitude, longitude } from "../../fixtures/default-location.json";

// Until the user is signed in, the delete button will not be rendered, so we
// wait.
const waitForSignIn = () => {
  cy.get("[data-cy='sign-out-btn']").should("be.visible");
};

const getEventCards = () => cy.get("[data-cy='event-card']").as("eventCards");

describe("Delete Event", () => {
  beforeEach(() => {
    cy.resetEvents();
  });

  describe("ui", () => {
    it("should allow users with @freecodecamp.org emails to delete events", () => {
      cy.login("hypo.thetical@freecodecamp.org");
      cy.visitAtCoords("/", { latitude, longitude });
      waitForSignIn();
      getEventCards().should("have.length", 10);

      cy.get("@eventCards")
        .first()
        .find("[data-cy='alert-dialog-open']")
        .click();
      cy.get("[data-cy='alert-dialog-agree']").click();

      cy.get("@eventCards").should("have.length", 9);
    });

    it("should should not show delete buttons to other users", () => {
      cy.login("test@email.address");
      cy.visitAtCoords("/", { latitude, longitude });
      waitForSignIn();

      getEventCards().find("[data-cy='alert-dialog-open']").should("not.exist");
    });
  });

  describe("api", () => {
    it("should allow users with @freecodecamp.org emails to delete events", () => {
      cy.login("hypo.thetical@freecodecamp.org");
      cy.request("DELETE", "/api/events/1").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("id", "1");
      });
    });

    it("should not allow users without @freecodecamp.org emails to delete events", () => {
      cy.login("test@email.address");
      cy.request({
        method: "DELETE",
        url: "/api/events/1",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.deep.equal({ message: "Forbidden" });
      });
    });

    it("should not allow unauthenticated users to delete events", () => {
      cy.request({
        method: "DELETE",
        url: "/api/events/1",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.deep.equal({ message: "No session" });
      });
    });

    it("should not allow users to delete events that don't exist", () => {
      cy.login("hypo.thetical@freecodecamp.org");
      cy.request({
        method: "DELETE",
        url: "/api/events/999",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.equal({
          message: "Event does not exist",
        });
      });
    });
  });
});
