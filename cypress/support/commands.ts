/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(): typeof login;
    }
  }
}

function login() {
  // We do not need cy.session, here, because there's nothing to be persisted.
  cy.setCookie("next-auth.session-token", "cypress-session-token");
}

Cypress.Commands.add("login", login);

// HACK: nothing is imported, yet, so we need to export to keep TS happy.
export {};
