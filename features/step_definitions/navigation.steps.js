const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Given("l'utilisateur est sur la page d'accueil", function () {
  browser.url('/');
});

When("il clique sur le lien \"Téléchargement\"", function () {
  const link = browser.$('a[href="/telechargement"]');
  link.click();
});

Then("il est redirigé vers \"/telechargement\"", function () {
  const currentUrl = browser.getUrl();
  expect(currentUrl).to.equal('/telechargement');
});

Given("l'utilisateur ouvre l'application", function () {
  browser.url('/');
});

Then("le thème par défaut est \"system\"", function () {
  const theme = browser.execute(() => {
    return window.getComputedStyle(document.body).getPropertyValue('--theme');
  });
  expect(theme).to.equal('system');
});