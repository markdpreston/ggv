//  ------------------------------------------------------------------------------------------------
//
//  Map
//
function getMap(psNewMap) {
  var liChromosome, liGene;
  liChromosome = document.getElementById("mapChromosome").selectedIndex;
  liGene = document.getElementById("mapGene").selectedIndex;
  switch (psNewMap) {
    case "chromosome":
      if (-1 == liChromosome) {
        document.getElementById("mapChromosome").selectedIndex = goState.iChromosome;
      } else {
        goState.iChromosome = liChromosome;
        goState.iLocus = 0;
        gaChromosomes[liChromosome].loadData();
      }
      return;
    case "gene":
      if (-1 == liGene) { return; }
      goState.iLocus = getNearest(gaChromosomes[liChromosome].aGenesStart[goState.iGene], true);
      break;
    case "prev": goState.iLocus--; break;
    case "next": goState.iLocus++; break;
    case "near": goState.iLocus = getNearest(parseInt(document.getElementById("mapSnp").value), false); break;
  }
  drawMap();
}

function getNearest(piSNP, pbAbove) {
  var i, liMin, liMinBest, laSNPs, riSNP;
  laSNPs = gaChromosomes[goState.iChromosome].aSNPs;
  riSNP = laSNPs.indexOf(piSNP);
  if (-1 == riSNP) {
    riSNP = laSNPs.length - 1;
    liMinBest = Math.abs(piSNP - laSNPs[0]);
    for (i = 1; i < laSNPs.length; i++) {
      if (pbAbove && laSNPs[i] < piSNP) { continue; }
      liMin = Math.abs(piSNP - laSNPs[i]);
      if (liMin < liMinBest) { liMinBest = liMin; } else { riSNP = i - 1; break; }
    }
  }
  return riSNP;
}

function drawMap() {
  var i, lsSubtitle, liSNP, laSNPs;
  if (! goMap & "undefined" !== typeof(google)) {
    var politicalStyles = [
      { featureType: "administrative.land_parcel",  elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "administrative.locality",     elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "administrative.neighborhood", elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "administrative.province",     elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "landscape",                   elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "landscape.man_made",          elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "landscape.natural",           elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "poi",                         elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "poi.attraction",              elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "poi.business",                elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "poi.government",              elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "poi.medical",                 elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "poi.park",                    elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "poi.place_of_worship",        elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "poi.school",                  elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "poi.sports_complex",          elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "road",                        elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "road.arterial",               elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "road.highway",                elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "road.local",                  elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "transit",                     elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "transit.line",                elementType: "all", stylers: [ { visibility: "off" } ] },
      { featureType: "transit.station",             elementType: "all", stylers: [ { visibility: "off" } ] }
    ];
    var politicalMapOptions = { name: "Political" };
    var politicalMapType = new google.maps.StyledMapType(politicalStyles, politicalMapOptions);
    var options = {
      zoom: 3,
      center: new google.maps.LatLng(20,40),
      mapTypeControlOptions: { mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'Political'] },
      mapTypeId: 'Political'
    };
    goMap = new google.maps.Map(document.getElementById("mapgoogle"), options);
    goMap.mapTypes.set('Political', politicalMapType);
    goMap.setMapTypeId('Political');
    goState.iMenuHeight = document.getElementById("mapheader").clientHeight;
    document.getElementById("mapgoogle").style.top = goState.iMenuHeight + "px";
    document.getElementById("mapgoogle").style.top = "70px";
  }
  laSNPs = gaChromosomes[goState.iChromosome].aSNPs;
  document.getElementById("mapChromosome").selectedIndex = goState.iChromosome;
  document.getElementById("mapSnp").value = laSNPs[goState.iLocus];
  document.getElementById("mapSnpPrev").disabled = (goState.iLocus == 0);
  document.getElementById("mapSnpNext").disabled = (goState.iLocus == laSNPs.length-1);
  lsSubtitle  = "Chromosome: " + gaChromosomes[goState.iChromosome] + ", ";
  liSNP = laSNPs[goState.iLocus];
  updateTitles(getInformationString());
  saveState();
  if (goState.bSave) {
    window.history.pushState(goState,getInformationString(),getUrlString());
  } else {
    window.history.replaceState(goState,getInformationString(),getUrlString())
  }
  goState.bSave = true;
  document.getElementById("mapSnp").value = laSNPs[goState.iLocus];
  var lsSNPs = gaChromosomes[goState.iChromosome].aData[goState.iLocus];
  for (i = 0; i < gaLocations.length; i++) {
    gaLocations[i].setIcon(lsSNPs);
  }
}


