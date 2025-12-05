const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Given("l'utilisateur est sur la page de téléchargement", function () {
  browser.url('/telechargement');
});

When("il sélectionne un produit", function () {
  const productElement = browser.$('.product-item'); // Exemple de sélecteur
  productElement.click();
});

When("il clique sur le bouton \"Télécharger\"", function () {
  const downloadButton = browser.$('#download-button'); // Exemple de sélecteur
  downloadButton.click();
});

Then("le produit est téléchargé avec l'URL correcte", function () {
  const downloadUrl = browser.getUrl();
  expect(downloadUrl).to.include('/telechargement?product=selected');
});

When("il tente de télécharger un produit sans le sélectionner", function () {
  const downloadButton = browser.$('#download-button');
  downloadButton.click();
});

Then("un message d'erreur \"Produit non sélectionné\" est affiché", function () {
  const errorMessage = browser.$('.error-message').getText();
  expect(errorMessage).to.equal('Produit non sélectionné');
});