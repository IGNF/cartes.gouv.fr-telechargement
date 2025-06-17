# Intégration dans les métadonnées de produit

## URL de téléchargement à la carte

Pour les produits disposant d’un tableau d’assemblage (flux TMS), ajoutez le lien suivant dans les métadonnées :

```xml
<mrd:transferOptions>
  <mrd:MD_DigitalTransferOptions>
    <mrd:onLine>
      <cit:CI_OnlineResource>
        <cit:linkage>
          <gco:CharacterString>https://cartes.gouv.fr/telechargement/{nom-produit}</gco:CharacterString>
        </cit:linkage>
        <cit:description>
          <gco:CharacterString>Interface de téléchargement à la carte des données disponibles</gco:CharacterString>
        </cit:description>
      </cit:CI_OnlineResource>
    </mrd:onLine>
  </mrd:MD_DigitalTransferOptions>
</mrd:transferOptions>
```

### Remplacement des variables

- `{nom-produit}` : Remplacez par l’identifiant du produit  (exemple : `IGNF_MNH-LIDAR-HD`, `ORTHOHR`, etc.).
- `<cit:description>` : Peut être personnalisé pour indiquer qu’il s’agit d’un téléchargement à la carte ou par dalle.

### Condition d’ajout

Ce lien ne doit être ajouté que pour les produits disposant d’un tableau d’assemblage, c’est-à-dire pour lesquels un flux TMS permet de visualiser la couverture disponible.

### Référence

Les modalités de mise en œuvre du téléchargement à la carte via cette interface sont décrites dans le fichier de spécification TMS download. Référez-vous à ce fichier pour vous assurer que :
- Le nom du produit est correctement orthographié.
- Le lien est bien actif.