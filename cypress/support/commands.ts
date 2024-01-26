/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login;
      visitAtCoords: typeof visitAtCoords;
    }
  }
}

function login(email: string) {
  // We do not need cy.session, here, because there's nothing to be persisted.
  // The cookie is set to match the email, so that
  cy.setCookie("next-auth.session-token", email);
}

function visitAtCoords(
  page: string,
  coords: { latitude: number; longitude: number }
) {
  cy.visit(page, {
    onBeforeLoad: ({ navigator }) => {
      cy.stub(navigator.geolocation, "getCurrentPosition").callsArgWith(0, {
        coords,
      });
    },
  });
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("visitAtCoords", visitAtCoords);

// HACK: nothing is imported, yet, so we need to export to keep TS happy.
export {};
