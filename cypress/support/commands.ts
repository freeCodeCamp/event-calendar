/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login;
      visitAtCoords: typeof visitAtCoords;
      logout: typeof logout;
      resetEvents: typeof resetEvents;
    }
  }
}

function login(email: string) {
  // We do not need cy.session, here, because there's nothing to be persisted.
  // The cookie is set to match the email, so that
  return cy.setCookie("next-auth.session-token", email);
}

function logout() {
  return cy.clearCookie("next-auth.session-token");
}

function resetEvents() {
  cy.task("resetEvents");
  cy.login("hypo.thetical@freecodecamp.org");
  cy.request("GET", "/api/revalidate").then((response) => {
    expect(response.status).to.eq(200);
  });
  cy.logout();
}

function visitAtCoords(
  page: string,
  coords: { latitude: number; longitude: number }
) {
  return cy.visit(page, {
    onBeforeLoad: ({ navigator }) => {
      cy.stub(navigator.geolocation, "getCurrentPosition").callsArgWith(0, {
        coords,
      });
    },
  });
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("visitAtCoords", visitAtCoords);
Cypress.Commands.add("logout", logout);
Cypress.Commands.add("resetEvents", resetEvents);

// HACK: nothing is imported, yet, so we need to export to keep TS happy.
export {};
