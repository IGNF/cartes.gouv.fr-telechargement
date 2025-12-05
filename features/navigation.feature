Feature: Navigation dans l'application

  Scenario: Accéder à la page de téléchargement
    Given l'utilisateur est sur la page d'accueil
    When il clique sur le lien "Téléchargement"
    Then il est redirigé vers "/telechargement"

  Scenario: Vérifier le thème par défaut
    Given l'utilisateur ouvre l'application
    Then le thème par défaut est "system"