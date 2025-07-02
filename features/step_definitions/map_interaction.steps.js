const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Given("la carte est affichée", function () {
  const mapElement = browser.$('#map'); // Exemple de sélecteur
  expect(mapElement.isDisplayed()).to.be.true;
});

When("l'utilisateur clique sur une dalle", function () {
  const tileElement = browser.$('.tile'); // Exemple de sélecteur
  tileElement.click();
});

Then("la dalle est sélectionnée", function () {
  const selectedTile = browser.$('.tile.selected'); // Exemple de sélecteur
  expect(selectedTile.isDisplayed()).to.be.true;
});

Then("le style de la dalle est mis à jour", function () {
  const selectedTile = browser.$('.tile.selected');
  const style = selectedTile.getCSSProperty('background-color');
  expect(style.value).to.equal('rgba(0, 128, 0, 1)'); // Exemple de couleur
});

Then("la carte est centrée sur la dalle", function () {
  const mapCenter = browser.execute(() => {
    return window.map.getCenter(); // Exemple d'accès à l'objet carte
  });
  expect(mapCenter).to.not.be.null;
});