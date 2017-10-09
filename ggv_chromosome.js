//  ------------------------------------------------------------------------------------------------
//
//  Chromosome
//
//  ------------------------------------------------------------------------------------------------
//  Initialiser: Create the member data and fill the basic data.
function CChromosome(psName,piSNPs,piLength,psGenes) {
  this.sName      = psName;
  this.iSNPs      = piSNPs;
  this.iLength    = piLength;
  this.iSections  = Math.floor(piSNPs / 1000) + 1;
  this.iLoaded    = 0;
  //  Gene data
  var laGenes = psGenes.split(",");
  this.iGenes     = 0;
  this.aGeneName  = new Array();
  this.aGeneStart = new Array();
  this.aGeneEnd   = new Array();
  for (i = 0; i < laGenes.length; i++) {
    if (laGenes[i].length > 0) {
      laData = laGenes[i].split(" ");
      this.aGeneName[i]  = laData[0];
      this.aGeneStart[i] = parseInt(laData[1]);
      this.aGeneEnd[i]   = parseInt(laData[2]);
      this.iGenes        = i + 1;
    }
  }
  //  SNP data
  this.aSNPs         = new Array(this.iSNPs);
  this.aAminoAcids   = new Array(this.iSNPs);
  this.aData         = new Array(this.iSNPs);
  this.sGenes        = "";
  this.sSubtelomeric = "";
  this.sReference    = "";
  this.sUniqueness   = "";
  //  Local canvases.
  this.oCanvasData  = 0;
  this.oCanvasGenes      = 0;
  this.oCanvasReference  = 0;
  this.oCanvasUniqueness = 0;
}

//  ------------------------------------------------------------------------------------------------
//  loadData: Read in the chromosome specific data and store it. Then initialise the data download
//  via loadDataSection.
CChromosome.prototype.loadData = function() {
  //  Is the data already lodaded?
  if (this.iLoaded == 0) {
    //  No, start downloading the data for this chromosome.
    updateTitles("Loading...");
    var loChromosome = this;
    var lhXmlData = new XMLHttpRequest();
    lhXmlData.onprogress = function(event)  {
      updateTitles("Loading...information"); // + event.loaded + " / " + event.total);
    }
    lhXmlData.onreadystatechange = function()  {
      if (this.readyState == 4 && this.status == 200) {
        var laLines = this.responseText.split("\n");
        updateTitles("Processing...information");
        //  Read SNP locations as integers.
        loChromosome.aSNPs         = laLines[0].split(";");
        for (i = 0; i < loChromosome.aSNPs.length; i++) {
          loChromosome.aSNPs[i] = parseInt(loChromosome.aSNPs[i]);
        }
        //  Read amino acid changes as individual strings.
        loChromosome.aAminoAcids   = laLines[1].split(";");
        //  Read reference, genes, subtelomeric/var regions, uniquness as iLength strings.
        loChromosome.sReference    = laLines[2];
        loChromosome.sGenes        = laLines[3];
        loChromosome.sSubtelomeric = laLines[4];
        loChromosome.sUniqueness   = laLines[5];
        //  Start the genome data download.
        loChromosome.loadDataSection(1);
      }
    }
    lhXmlData.open("GET","data/" + this.sName.replace(/\s/g,'') + ".dat",true);
    lhXmlData.send();
  } else {
    //  Yes, display the data for this chromosome.
    drawSNPs();
  }
}

//  ------------------------------------------------------------------------------------------------
//  loadDataSection: Load the data in (under 100) small(ish) sectons to ensure that we can give the
//  user feedback via the onprogress event.  The data is compressed by the server and we hope that
//  the data is cached client side too for fast running.
CChromosome.prototype.loadDataSection = function(piSection) {
  var loChromosome = this;
  var lhXmlData = new XMLHttpRequest();
  //  Provide user feedback.
  lhXmlData.onprogress = function(event)  {
    updateTitles("Loading... " + piSection + " / " + loChromosome.iSections);
  }
  //  Process the section, when fully downloaded.
  lhXmlData.onreadystatechange = function()  {
    if (this.readyState == 4 && this.status == 200) {
      var laLines = this.responseText.split("\n");
      updateTitles("Processing... " + piSection + " / " + loChromosome.iSections);
      //  Read data
      for (j = 0; j < laLines.length; j++) {
        loChromosome.aData[1000*(piSection-1) + j] = laLines[j];
      }
      if (piSection < loChromosome.iSections) {
        loChromosome.loadDataSection(piSection+1);
      } else {
        loChromosome.iLoaded = 1;
        loChromosome.initialiseCanvases();
      }
    }
  }
  //  Assume that there are less than 100 data sections.
  var lsSection = "0" + piSection;
  lsSection = lsSection.substr(-2);
  lhXmlData.open("GET","data/" + this.sName.replace(/\s/g,'') + "." + lsSection + ".dat",true);
  lhXmlData.send();
}

//  ------------------------------------------------------------------------------------------------
//  initialiseCanvases: for the static data (genes, reference, uniqueness, variations) initialise
//  canvases that can be canniblised for presentation to the users.
CChromosome.prototype.initialiseCanvases = function() {
  var liLines = 1;
  var liWidth = this.iSNPs;
  if (liWidth > 32000) {
    liWidth = 32000;
    liLines = Math.ceil(this.iSNPs / 32000);
  }
  //  ----------------------------------
  //  Databars first.
  //  Genes
  this.oCanvasGenes      = document.createElement("canvas");
  loGenes = this.oCanvasGenes.getContext("2d");
  laGenes = loGenes.createImageData(liWidth,10*liLines);
  //  Reference
  this.oCanvasReference  = document.createElement("canvas");
  loReference = this.oCanvasReference.getContext("2d");
  laReference = loReference.createImageData(liWidth,liLines);
  //  Uniquenessness
  this.oCanvasUniqueness = document.createElement("canvas");
  loUniqueness = this.oCanvasUniqueness.getContext("2d");
  laUniqueness = loUniqueness.createImageData(liWidth,10*liLines);
  for (i = 0; i < this.iSNPs; i++) {
    var liCurrentLine = Math.floor(i/32000);
    //  Genes
    for (k = 0; k < 10; k++) {
      liBase = (10*liCurrentLine+k)*liWidth + i;
      if (this.sGenes.charAt(i) == "2") {
        laGenes.data[4*liBase+0] = 127; laGenes.data[4*liBase+1] = 0;   laGenes.data[4*liBase+2] = 0;
      } else if (this.sGenes.charAt(i) == "1") {
        laGenes.data[4*liBase+0] = 0;   laGenes.data[4*liBase+1] = 127; laGenes.data[4*liBase+2] = 127;
      } else {
        laGenes.data[4*liBase+0] = 255; laGenes.data[4*liBase+1] = 255; laGenes.data[4*liBase+2] = 255;
      }
      if (this.sSubtelomeric.charAt(i) == "1" && k >= 5) {
        laGenes.data[4*liBase+0] = 255; laGenes.data[4*liBase+1] = 0;   laGenes.data[4*liBase+2] = 0;
      }
      laGenes.data[4*liBase+3] = 255;
    }
    //  Reference
    liBase = liCurrentLine*liWidth + i;
    lcReference = this.sReference.charAt(i);
    if (lcReference == 'A') {
      laReference.data[4*i+0] = 255; laReference.data[4*i+1] = 191; laReference.data[4*i+2] = 191;
    } else if (lcReference == 'C') {
      laReference.data[4*i+0] = 255; laReference.data[4*i+1] = 255; laReference.data[4*i+2] = 191;
    } else if (lcReference == 'G') {
      laReference.data[4*i+0] = 127; laReference.data[4*i+1] = 191; laReference.data[4*i+2] = 127;
    } else if (lcReference == 'T') {
      laReference.data[4*i+0] = 191; laReference.data[4*i+1] = 191; laReference.data[4*i+2] = 255;
    } else {
      laReference.data[4*i+0] = 0; laReference.data[4*i+1] = 191; laReference.data[4*i+2] = 191;
    }
    laReference.data[4*i+3] = 255;
    //  Uniquenessness
    liUniqueness = parseInt(this.sUniqueness.charAt(i),16);
    for (k = 10 - liUniqueness; k <= 10; k++) {
      liBase = (10*liCurrentLine+k)*liWidth + i;
      laUniqueness.data[4*liBase+0] = 127; laUniqueness.data[4*liBase+1] = 127; laUniqueness.data[4*liBase+2] = 0; laUniqueness.data[4*liBase+3] = 255;
    }
  }
  //  The variations.
  this.oCanvasData  = document.createElement("canvas");
  loData = this.oCanvasData.getContext("2d");
  loData.fillStyle="#FFF";
  loData.fillRect(0,0,liWidth-1,this.iSamples*liLines-1);
  laData = loData.createImageData(liWidth,this.iSamples*liLines);
  for (i = 0; i < this.iSNPs; i++) {
    var liCurrentLine = Math.floor(i/32000);
    var lcReference = this.aReference.charAt(i);
    for (j = 0; j < this.iSamples; j++) {
      liBase = (10*liCurrentLine+j)*liWidth + i;
      lcData = this.aData[i].charAt(j);
      if (lcReference == lcData) { lcData = "0"; }
      switch(lcData) {
//        case '0': laData.data[4*liBase+0] = 255; laData.data[4*liBase+1] = 255; laData.data[4*liBase+2] = 255; break;
        case 'N': laData.data[4*liBase+0] = 191; laData.data[4*liBase+1] = 191; laData.data[4*liBase+2] = 191; break;
        case 'a':
        case 'c':
        case 'g':
        case 't': laData.data[4*liBase+0] = 255; laData.data[4*liBase+1] = 127; laData.data[4*liBase+2] = 127; break;
        case 'A':
        case 'C':
        case 'G':
        case 'T': laData.data[4*liBase+0] = 127; laData.data[4*liBase+1] = 31;  laData.data[4*liBase+2] = 31;  break;
      }
//      laData.data[4*liBase+3] = 255;
    }
  }
}

CChromosome.prototype.drawStaticData = function() {
  var laData, loGenes, loReference, loUniqueness;
  var liWidth = piTo - piFrom + 1;
  var liLine1 = Math.floor(piFrom / 32000);
  var liLine2 = Math.floor(piTo / 32000);
  var liScaleX = Math.ceil((document.body.offsetWidth - goState.iSamplesWidth) / goState.iW);
  var liScaleY = Math.ceil(document.body.offsetHeight / goState.iH);

  copyLine(goCanvases.oGenes,     this.oCanvasGenes     ,10);
  copyLine(goCanvases.oReference, this.oCanvasReference ,1);
  copyLine(goCanvases.oUniqueness,this.oCanvasUniqueness,10);

  goCanvases.oData.width  = liScaleX * goState.iW;
  goCanvases.oData.height = liScaleY * goState.iH;
  loCanvas.putImageData(laData,0,0);
}

CChromosome.prototype.copyLine = function(poCanvasTo,poCanvasFrom,piH) {
  var liWidth = piTo - piFrom + 1;
  var liLine1 = Math.floor(goState.iFirstW / 32000);
  var liLine2 = Math.floor(goState.iLastW / 32000);
  var liScaleX = Math.ceil((document.body.offsetWidth - goState.iSamplesWidth) / goState.iW);

  //  Genes
  poCanvasTo.height = piH;
  poCanvasTo.width  = liScaleX * goState.iW;
  loCanvas = poCanvasTo.getContext("2d");
  loCanvas.webkitImageSmoothingEnabled = false;
  if (liScaleX > 1 | piScaleY > 1) { poCanvasTo.scale(liScaleX,piScaleY); }
  if (liLine1 == liLine2) {
    laData = poCanvasFrom.getImageData(iFirstW-32000*liLine1,liLine1,liWidth,liH*liLine1+liH);
    loCanvas.putImageData(laData,0,0);
  } else {
    laData = poCanvasFrom.getImageData(iFirstW-32000*liLine1,piH*liLine1,32000,piH);
    loCanvas.putImageData(laData,0,0);
    laData = poCanvasFrom.getImageData(0,piH*liLine1+piH,iLastW-32000*liLine1,piH);
    loCanvas.putImageData(laData,iFirstW-32000*liLine1,0);
  }
}

//  
CChromosome.prototype.drawDynamicData = function() {
  var i, j, loData, liX, liY, liBase, lcData, lsSNPs, liScaleX, liScaleY, liScaleText;
  liScaleX = Math.ceil((document.body.offsetWidth - goState.iSamplesWidth) / goState.iW);
  liScaleY = Math.ceil(document.body.offsetHeight / goState.iH);
  liScaleText = liScaleX * goState.iW / (document.body.offsetWidth - goState.iSamplesWidth);
  goCanvases.oMaf.height = goState.iGraphHeight;
  goCanvases.oMaf.width  = liScaleX * goState.iW;
  goCanvases.oFst.height = goState.iGraphHeight;
  goCanvases.oFst.width  = liScaleX * goState.iW;

  loMaf = goCanvases.oMaf.getContext("2d");
  loMaf.webkitImageSmoothingEnabled = false;
  loMaf.fillStyle="#FFF";
  loMaf.fillRect(0,0,liScaleX*goState.iW,goState.iGraphHeight-1);

  loFst = goCanvases.oFst.getContext("2d");
  loFst.webkitImageSmoothingEnabled = false;
  loFst.fillStyle="#FFF";
  loFst.fillRect(0,0,liScaleX*goState.iW,goState.iGraphHeight-1);

  laMaf = loMaf.getImageData(0,0,liScaleX*goState.iW,goState.iGraphHeight);
  laFst = loFst.getImageData(0,0,liScaleX*goState.iW,goState.iGraphHeight);
  liBase1 = 4*liScaleX*goState.iW*goState.iGraphHeight * 0.25;
  liBase2 = 4*liScaleX*goState.iW*goState.iGraphHeight * 0.50;
  liBase3 = 4*liScaleX*goState.iW*goState.iGraphHeight * 0.75;
  for (i = 0; i < liScaleX*goState.iW; i++) {
    laMaf.data[liBase1+4*i] = 223; laMaf.data[liBase1+4*i+1] = 223; laMaf.data[liBase1+4*i+2] = 223;
    laFst.data[liBase1+4*i] = 223; laFst.data[liBase1+4*i+1] = 223; laFst.data[liBase1+4*i+2] = 223;
    laMaf.data[liBase2+4*i] = 223; laMaf.data[liBase2+4*i+1] = 223; laMaf.data[liBase2+4*i+2] = 223;
    laFst.data[liBase2+4*i] = 223; laFst.data[liBase2+4*i+1] = 223; laFst.data[liBase2+4*i+2] = 223;
    laMaf.data[liBase3+4*i] = 223; laMaf.data[liBase3+4*i+1] = 223; laMaf.data[liBase3+4*i+2] = 223;
    laFst.data[liBase3+4*i] = 223; laFst.data[liBase3+4*i+1] = 223; laFst.data[liBase3+4*i+2] = 223;
  }
  loMaf.putImageData(laMaf,0,0);
  loFst.putImageData(laFst,0,0);

  loMaf.font=(0.75*goState.iGraphHeight) + "pt Arial";
  loMaf.fillStyle="#888";
  loMaf.setTransform(liScaleText,0,0,1,0,0);
  liLength1 = liScaleText*loMaf.measureText("AF").width;
  loMaf.fillText("AF",(liScaleX*goState.iW - liLength1)/liScaleText/2,35*goState.iGraphHeight/40);
  loMaf.font=(0.2*goState.iGraphHeight) + "pt Arial";
  loMaf.fillText("75%",2,0.35*goState.iGraphHeight);
  loMaf.fillText("50%",2,0.6*goState.iGraphHeight);
  loMaf.fillText("25%",2,0.85*goState.iGraphHeight);
  liLength2 = liScaleText*loMaf.measureText("25%").width;

  loFst.fillStyle="#888";
  loFst.font=(0.75*goState.iGraphHeight) + "pt Arial";
  loFst.setTransform(liScaleText,0,0,1,0,0);
  loFst.fillText("F",(liScaleX*goState.iW - liScaleText*loFst.measureText("Fs").width)/liScaleText/2,35*goState.iGraphHeight/40);
  loFst.font=(0.5*goState.iGraphHeight) + "pt Arial";
  loFst.fillText(" st",(liScaleX*goState.iW - liScaleText*loMaf.measureText("Fs").width)/liScaleText/2,38*goState.iGraphHeight/40);
  loFst.font=(0.2*goState.iGraphHeight) + "pt Arial";
  loFst.fillText("0.75",2,0.35*goState.iGraphHeight);
  loFst.fillText("0.50",2,0.6*goState.iGraphHeight);
  loFst.fillText("0.25",2,0.85*goState.iGraphHeight);

  laMaf = loMaf.getImageData(0,0,liScaleX*goState.iW,goState.iGraphHeight);
  laFst = loFst.getImageData(0,0,liScaleX*goState.iW,goState.iGraphHeight);

  liX = 0;
  var laP = new Array();
  var laN = new Array();
  var laHs = new Array();
  for (i = 0; i < this.iSNPs; i++) {
    if (goState.aSNPs[i]) {
      lsSNPs = this.aData[i];
      liY = 0;
      for (j = 0; j < 6; j++) { laP[j] = 0; laN[j] = 0; }
      for (j = 0; j < goState.aSamples.length; j++) {
        if (goState.aSamples[j] > 0) {
          var liContinent = gaLocations[goState.aSamples[j] - 1].iContinent;
          if (undefined == lsSNPs) {
            lcData = 'N';
          } else {
            lcData = lsSNPs.charAt(j);
            switch(lcData) {
            case 'A': laN[liContinent] += 2; break;
            case 'B': laN[liContinent] += 2; laP[liContinent] += 1; break;
            case 'C': laN[liContinent] += 2; laP[liContinent] += 2; break;
            }
          }
          liY++;
        }
      }
      var liR = 1*(laN[1] > 0) + 1*(laN[2] > 0) + 1*(laN[3] > 0) + 1*(laN[4] > 0) + 1*(laN[5] > 0);
      var liN = laN[1] + laN[2] + laN[3] + laN[4] + laN[5];
      var liP = laP[1] + laP[2] + laP[3] + laP[4] + laP[5];
      var liMaf = Math.round(goState.iGraphHeight*liP/liN);
      if (liN == 0) { liMaf = 0; }
      for (k = 0; k < liScaleX; k++) {
        for (l = 0; l < goState.iGraphHeight; l++) {
          liBase = l*liScaleX*goState.iW + liScaleX*i + k;
          if (l < goState.iGraphHeight - liMaf & l != goState.iGraphHeight - 1) {
//            laMaf.data[4*liBase+0] = 255; laMaf.data[4*liBase+1] = 255; laMaf.data[4*liBase+2] = 255;
          } else {
            laMaf.data[4*liBase+0] = 127; laMaf.data[4*liBase+1] = 31; laMaf.data[4*liBase+2] = 31;
          }
          laMaf.data[4*liBase+3] = 255;
        }
      }
      if (liR > 1 & liP > 0) {
        lrHs = 0;
        for (k = 1; k < 6; k++) {
          if (laN[k] > 0) {
            liQ = laN[k] - laP[k];
            lrHs += laN[k] - (laP[k] * laP[k] + liQ * liQ) / laN[k];
          }
        }
        lrHt = 1 - (liP * liP + (liN - liP) * (liN - liP)) / liN / liN;
        lrFst = liR / (liR - 1) * (1 - lrHs / liN / lrHt) / 2;
        liFst = Math.round(goState.iGraphHeight*lrFst);
      } else {
        lrFst = 0;
        liFst = 0;
      }
      for (k = 0; k < liScaleX; k++) {
        for (l = 0; l < goState.iGraphHeight; l++) {
          liBase = l*liScaleX*goState.iW + liScaleX*i + k;
          if (l < goState.iGraphHeight - liFst & l != goState.iGraphHeight - 1) {
//            laFst.data[4*liBase+0] = 255; laFst.data[4*liBase+1] = 255; laFst.data[4*liBase+2] = 255;
          } else {
            laFst.data[4*liBase+0] = 31; laFst.data[4*liBase+1] = 31; laFst.data[4*liBase+2] = 127;
          }
          laFst.data[4*liBase+3] = 255;
        }
      }
      goState.aMaf[i] = 100 * liP / liN;
      if (liN == 0) { goState.aMaf[i] = 0; }
      goState.aFst[i] = lrFst;
      liX++;
      if (i > goState.iW) {
        break;
      }
    }
  }
  loMaf.putImageData(laMaf,0,0);
  loFst.putImageData(laFst,0,0);
}

//  ------------------------------------------------------------------------------------------------
CChromosome.prototype.updateGeneMenu = function(piGene) {
  var lhGeneSnp, lhGeneMap;
  lhGeneSnp = document.getElementById("snpGene");
  lhGeneMap = document.getElementById("mapGene");
  lhGeneSnp.style.display = 'none';
  lhGeneMap.style.display = 'none';
  lhGeneSnp.innerHTML = this.sGeneOptions;
  lhGeneMap.innerHTML = this.sGeneOptions;
  lhGeneSnp.selectedIndex = 0;
  lhGeneMap.selectedIndex = 0;
  if (piGene >= 0) {
    lhGeneSnp.selectedIndex = piGene;
    lhGeneMap.selectedIndex = piGene;
  }
  lhGeneSnp.style.display = 'inline';
  lhGeneMap.style.display = 'inline';
}

//  ------------------------------------------------------------------------------------------------
CChromosome.prototype.countSNPs = function(piStart,piEnd) {
  var i, riCount;
  riCount = 0;
  for (i = 0; i < this.iSNPs; i++) {
    riCount += (piStart <= this.aSNPs[i] & this.aSNPs[i] <= piEnd);
  }
  return riCount;
}

//  ------------------------------------------------------------------------------------------------
CChromosome.prototype.getSNPs = function(piStart,piEnd) {
  var i;
  goState.aSNPs = new Array();
  goState.iW = 0;
  goState.iFirstW = this.iSNPs;
  goState.iLastW = 0;
  for (i = 0; i < this.iSNPs; i++) {
    if (piStart <= this.aSNPs[i] & this.aSNPs[i] <= piEnd) {
      goState.aSNPs[i] = 1;
      goState.iW++;
      if (i < goState.iFirstW) { goState.iFirstW = i; }
      if (i > goState.iLastW)  { goState.iLastW = i; }
      if (goState.iW == 32000) { return this.aSNPs[i]; }
    }
  }
  return piEnd;
}


