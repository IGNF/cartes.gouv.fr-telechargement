Feature: Interactions avec la carte

  Scenario: Sélectionner une dalle sur la carte
    Given la carte est affichée
    When l'utilisateur clique sur une dalle
    Then la dalle est sélectionnée
    And le style de la dalle est mis à jour

  Scenario: Zoom sur une dalle
    Given la carte est affichée
    When l'utilisateur clique sur une dalle
    Then la carte est centrée sur la dalle