window.onpopstate = reloadState;

var goMap;
var gaLocations   = new Array();
var gaChromosomes = new Array();
var goState       = new Array();
var goCanvases    = new Array();

if (!Array.indexOf) {
  Array.prototype.indexOf = function (obj, start) {
    for (var i = (start || 0); i < this.length; i++) {
      if (this[i] == obj) {
        return i;
      }
    }
    return -1;
  }
}

//  ------------------------------------------------------------------------------------------------
//
//  Initialise
//
function snpInitialise(psView, psAction, psLocations, piChromosome, piGene, piFrom, piTo, piLocus) {
  if (psView == "start") {
    return;
  } else {
    document.getElementById("start").style.display = "none";
    document.getElementById("snpheader").style.display = "block";
  }
  goState.bSave = false;
  goState.iGraphHeight = 40;
  goState.iSamplesWidth = 20;
  goState.sView  = psView;
  goState.iLocus = parseInt(piLocus);
  goState.iClicks = 0;
  goCanvases.oData       = document.getElementById("cData");
  goCanvases.oSamples    = document.getElementById("cSamples");
  goCanvases.oReference  = document.getElementById("cReference");
  goCanvases.oGenes      = document.getElementById("cGenes");
  goCanvases.oUniqueness = document.getElementById("cUniqueness");
  goCanvases.oMaf        = document.getElementById("cMaf");
  goCanvases.oFst        = document.getElementById("cFst");

  var i, lhXmlInformation, laLines, liLocations, liChromosomes, liLength;
  lhXmlInformation = new XMLHttpRequest();
  lhXmlInformation.onreadystatechange = function()  {
    var i, laLines, laOptions, lhSelect, lhOption;
    if (this.readyState == 4 && this.status == 200) {
      //  Read header
      laLines = this.responseText.split("\n");
      liLocations   = parseInt(laLines[0].split(";")[0]);
      liChromosomes = parseInt(laLines[0].split(";")[1]);
      //  Locations
      liOffset = 1;
      liSamples = 0;
      goState.rLogMaxLength = 0;
      for (i = 0; i < liLocations; i++) {
        gaLocations[i] = new CLocation(laLines[liOffset + i],liSamples);
        liSamples += gaLocations[i].iLength;
        if (gaLocations[i].iLength > goState.rLogMaxLength) { goState.rLogMaxLength = gaLocations[i].iLength; }
      }
      goState.rLogMaxLength = Math.log(1.0 * goState.rLogMaxLength);
      goState.iSamples = liSamples;
      //  Chromosomes
      liOffset = 1 + liLocations;
      for (i = 0; i < liChromosomes; i++) {
        laLine = laLines[liOffset + i].split(";");
        gaChromosomes[i] = new CChromosome(laLine[0],parseInt(laLine[1]),parseInt(laLine[2]),laLine[3],parseInt(piGene));
      }
      //  IE Fix: prepare the chromosome/gene select/options otherwise it will take FOREVER.
      liOffset = 2 + liLocations + liChromosomes;
      for (i = 0; i < liChromosomes; i++) {
        gaChromosomes[i].sGeneOptions = laLines[liOffset + i];
      }
      //  Set up menu
      loChromosome = gaChromosomes[piChromosome];
      if (loChromosome) {
        lhChrSnp = document.getElementById("snpChromosome");
        lhChrMap = document.getElementById("mapChromosome");
        liOffset = 1 + liLocations + liChromosomes;
        lhChrSnp.innerHTML = laLines[liOffset];
        lhChrMap.innerHTML = laLines[liOffset];
        lhChrSnp.selectedIndex = piChromosome;
        lhChrMap.selectedIndex = piChromosome;
        loChromosome.updateGeneMenu(parseInt(piGene));
        if (psAction == "range") {
          document.getElementById("actionRange").checked = true;
          document.getElementById("from").value = parseInt(piFrom);
          document.getElementById("to").value   = parseInt(piTo);
        } else if (psAction == "gene") {
          document.getElementById("actionGene").checked = true;
          document.getElementById("snpGene").selectedIndex = parseInt(piGene);
          document.getElementById("from").value = loChromosome.aGeneStart[piGene];
          document.getElementById("to").value = loChromosome.aGeneEnd[piGene];
          getGeneRange();
        } else {
          document.getElementById("actionChromosome").checked = true;
          getChromosomeRange();
        }
        lhLocation = document.getElementById("location");
        if (psLocations == "all") {
          for (i = 0; i < gaLocations.length; i++) {
            lhLocation[i].selected = true;
          }
        } else {
          for (i = 0; i < psLocations.length; i++) {
            lhLocation[i].selected = (psLocations.charAt(i) != "0");
          }
        }
        getSNPTable('normal');
      }
    }
  }
  lhXmlInformation.open("GET","data/information.dat",true);
  lhXmlInformation.send();
}

//  ------------------------------------------------------------------------------------------------
//
//  Utility
//
function view(psView) {
  if (psView == "snp") {
    goState.sView = "snp";
    document.getElementById("snpheader").style.display = "block";
    document.getElementById("snpcanvas").style.display = "block";
    document.getElementById("mapheader").style.display = "none";
    document.getElementById("mapgoogle").style.display = "none";
    drawSNPs();
  } else {
    goState.sView = "map";
    document.getElementById("snpheader").style.display = "none";
    document.getElementById("snpcanvas").style.display = "none";
    document.getElementById("tt").style.display = "none";
    document.getElementById("ttMouse").style.display = "none";
    document.getElementById("mapheader").style.display = "block";
    document.getElementById("mapgoogle").style.display = "block";
    drawMap();
  }
}

function findChromosome(psChromosome) {
  var i;
  for (i = 0; i < gaChromosomes.length; i++) {
    if (gaChromosomes[i].sName == psChromosome) {
      return gaChromosomes[i];
    }
  }
  return gaChromosomes[0];
}

function updateTitles(psTitle) {
  window.document.title = "PlasmoView: " + psTitle;
  var loSnp = document.getElementById('snpTitlePosition')
  loSnp.innerHTML = psTitle;
  loSnp.style.display = 'none';
  loSnp.style.display = 'block';
  var loMap = document.getElementById('mapTitlePosition')
  loMap.innerHTML = psTitle;
  loMap.style.display = 'none';
  loMap.style.display = 'block';
}

