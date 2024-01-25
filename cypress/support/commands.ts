/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login;
    }
  }
}

function login(email: string) {
  // We do not need cy.session, here, because there's nothing to be persisted.
  // The cookie is set to match the email, so that
  cy.setCookie("next-auth.session-token", email);
}

Cypress.Commands.add("login", login);

// HACK: nothing is imported, yet, so we need to export to keep TS happy.
export {};
