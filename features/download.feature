Feature: Téléchargement de données

  Scenario: Télécharger un produit
    Given l'utilisateur est sur la page de téléchargement
    When il sélectionne un produit
    And il clique sur le bouton "Télécharger"
    Then le produit est téléchargé avec l'URL correcte

  Scenario: Erreur lors du téléchargement
    Given l'utilisateur est sur la page de téléchargement
    When il tente de télécharger un produit sans le sélectionner
    Then un message d'erreur "Produit non sélectionné" est affiché