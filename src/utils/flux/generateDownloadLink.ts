export const generateDownloadLinkMNX = ({produit,bbox,produit_name,EPSG}:{produit:string,bbox:ArrayIterator<number>,produit_name:string; EPSG:string}) => {
  
  return `https://data.geopf.fr/wms-r?SERVICE=WMS&VERSION=1.3.0&EXCEPTIONS=text/xml&REQUEST=GetMap&LAYERS=IGNF_LIDAR-HD_${produit}_ELEVATION.ELEVATIONGRIDCOVERAGE.LAMB93&FORMAT=image/geotiff&STYLES=&CRS=EPSG:${EPSG}&BBOX=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&WIDTH=2000&HEIGHT=2000&FILENAME=${produit_name}`;
};

export const generateDownloadLinkPPK = ({chantier,produit_name}:{chantier:string,produit_name:string})=>{
  return `https://storage.sbg.cloud.ovh.net/v1/AUTH_63234f509d6048bca3c9fd7928720ca1/ppk-lidar/${chantier}/${produit_name}`
}
