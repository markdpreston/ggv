function reloadState(poEvent) {
  if (poEvent.state) {
    goState = poEvent.state;
    goState.bSave = false;
    resetState();
    view(goState.sView);
  }
}

function saveState() {
  var laLocations = document.getElementById("location").options;
  goState.sLocations = "";
  for (i = 0; i < laLocations.length; i++) {
    if (laLocations[i].selected) {
      goState.sLocations += "1";
    } else {
      goState.sLocations += "0";
    }
  }
  goState.iFocus = 0;
  if (document.getElementById("actionGene").checked) {
    goState.iFocus = 1;
  } else if (document.getElementById("actionRange").checked) {
    goState.iFocus = 2;
  }
  if (goState.sView == "snp") {
    goState.iChromosome = document.getElementById("snpChromosome").selectedIndex;
    goState.iGene       = document.getElementById("snpGene").selectedIndex;
  } else {
    goState.iChromosome = document.getElementById("mapChromosome").selectedIndex;
    goState.iGene       = document.getElementById("mapGene").selectedIndex;
  }
  goState.iFrom = parseInt(document.getElementById("from").value);
  goState.iTo   = parseInt(document.getElementById("to").value);
}

function resetState() {
  var lhLocation = document.getElementById("location");
  if (goState.sLocations == "all") {
    for (i = 0; i < gaLocations.length; i++) {
      lhLocation[i].selected = true;
    }
  } else {
    for (i = 0; i < goState.sLocations.length; i++) {
      lhLocation[i].selected = (goState.sLocations.charAt(i) != "0");
    }
  }
  document.getElementById("snpChromosome").selectedIndex = goState.iChromosome;
  document.getElementById("mapChromosome").selectedIndex = goState.iChromosome;
  gaChromosomes[goState.iChromosome].updateGeneMenu(0);
  if (goState.iFocus == 0) {
    document.getElementById("actionChromosome").checked = true;
  } else if (goState.iFocus == 1) {
    document.getElementById("actionGene").checked = true;
  } else if (goState.iFocus == 2) {
    document.getElementById("actionRange").checked = true;
  }
  document.getElementById("snpGene").selectedIndex = goState.iGene;
  document.getElementById("mapGene").selectedIndex = goState.iGene;
  document.getElementById("from").value = goState.iFrom;
  document.getElementById("to").value   = goState.iTo;
}

function getInformationString() {
  var rsInformation = "";
  rsInformation = "Chromosome " + gaChromosomes[goState.iChromosome].sName;
  rsInformation += " (SNPs " + gaChromosomes[goState.iChromosome].iSNPs + ", Length " + gaChromosomes[goState.iChromosome].iLength + "): ";
  if (goState.sView == "snp") {
    if (goState.iFocus == 1) {
      rsInformation += "Gene " + gaChromosomes[goState.iChromosome].aGeneName[goState.iGene] + "; ";
    }
    rsInformation += "Range " + goState.iFrom + " to " + goState.iTo;
    rsInformation += " (SNPs " + goState.iW + ", Length " + (goState.iTo - goState.iFrom + 1) + ")";
  } else {
    rsInformation += "Locus " + gaChromosomes[goState.iChromosome].aSNPs[goState.iLocus]
  }
  return rsInformation;
}

function getUrlString () {
  saveState();
  var lsAction = "all";
  switch(goState.iFocus) {
    case 1: lsAction = "gene"; break;
    case 2: lsAction = "range"; break;
  }
  return "?view=" + goState.sView + "&action=" + lsAction + "&locations=" + goState.sLocations + "&chromosome=" + goState.iChromosome + "&gene=" + goState.iGene + "&from=" + goState.iFrom + "&to=" + goState.iTo + "&locus=" + goState.iLocus;
}

function getSamples() {
  var i;
  goState.aSamples = new Array();
  goState.aMaf = new Array()
  goState.aFst = new Array()
  goState.iH = 0;
  laSelected  = document.getElementById("location");
  for (i = 0; i < gaLocations.length; i++) {
    lbSelected = laSelected.options[i].selected;
    for (j = gaLocations[i].iStart; j < gaLocations[i].iEnd; j++) {
      goState.aSamples[j] = lbSelected * (i+1);
    }
    goState.iH += lbSelected * gaLocations[i].iLength;
  }
}

function changeView() {
  if (getSNPTable('menu') == 1) {
    popup('menu');
  }
}

function getSNPTable(psStyle) {
  lbChange = 0;
  liRange = goState.iTo - goState.iFrom + 1;
  if ('menu' == psStyle) {
    liLocations = 0;
    laLocations = document.getElementById("location");
    for (i = 0; i < laLocations.length; i++) {
      liLocations += laSelected.options[i].selected;
    }
    liChromosome = document.getElementById("snpChromosome").selectedIndex;
    liSNPs = gaChromosomes[liChromosome].countSNPs(parseInt(document.getElementById("from").value),
                                                   parseInt(document.getElementById("to").value));
    lsMessage = "No data to show:\n";
    if (liLocations == 0) { lsMessage += "\nNo locations selected."; }
    if (liSNPs == 0) { lsMessage += "\nNo SNPs visible."; }
    psStyle = "normal";
    lbChange = 1;
  }
  saveState();
  if ('normal' == psStyle) {
    lbChange = 1;
  }
  if ('left' == psStyle && goState.iFrom > 1) {
    focusRange();
    document.getElementById("from").value = (goState.iFrom > liRange ? goState.iFrom - liRange : 1);
    document.getElementById("to").value = (goState.iFrom > liRange ? goState.iTo - liRange : liRange);
    lbChange = 1;
  }
  if ('right' == psStyle && goState.iTo < loChromosome.iLength) {
    focusRange();
    document.getElementById("from").value = (goState.iTo <= loChromosome.iLength - liRange ? goState.iFrom + liRange : loChromosome.iLength - liRange + 1);
    document.getElementById("to").value = (goState.iTo <= loChromosome.iLength - liRange ? goState.iTo + liRange : loChromosome.iLength);
    lbChange = 1;
  }
  if ('zoomin' == psStyle && goState.iW > 1) {
    focusRange();
    document.getElementById("from").value = Math.floor(goState.iFrom + liRange / 3);
    document.getElementById("to").value = Math.floor(goState.iTo - liRange / 3);
    lbChange = 1;
  }
  if ('zoomout' == psStyle && goState.iW < 32000) {
    focusRange();
    document.getElementById("from").value = (goState.iFrom > liRange ? goState.iFrom - liRange : 1);
    document.getElementById("to").value = (goState.iTo <= loChromosome.iLength - liRange ? goState.iTo + liRange : loChromosome.iLength);
    lbChange = 1;
  }
  if ('center' == psStyle && goState.iW > 1) {
    focusRange();
    var liPosition = gaChromosomes[goState.iChromosome].aSNPs[goState.iLocus];
    document.getElementById("from").value = (liPosition > liRange / 2 ? liPosition - liRange / 2 : 1);
    document.getElementById("to").value = (liPosition <= loChromosome.iLength - liRange / 2 ? liPosition + liRange / 2 : loChromosome.iLength);
    lbChange = 1;
  }
  liSNPs = gaChromosomes[goState.iChromosome].countSNPs(parseInt(document.getElementById("from").value), 
                                                        parseInt(document.getElementById("to").value));
  if ('normal' == psStyle || (lbChange == 1 && liSNPs > 0)) {
    goCanvases.oData.style.display = 'none';
    goCanvases.oMaf.style.display = 'none';
    goCanvases.oFst.style.display = 'none';
    goCanvases.oSamples.style.display = 'none';
    goCanvases.oReference.style.display = 'none';
    goCanvases.oGenes.style.display = 'none';
    goCanvases.oUniqueness.style.display = 'none';
    saveState();
    gaChromosomes[goState.iChromosome].loadData();
  }
  return 1;
}

function drawSNPs(psStyle) {
  var loChromosome, laSNPs, laSamples;
  loChromosome = gaChromosomes[goState.iChromosome];
  saveState();
  if (goState.bSave) {
    window.history.pushState(goState,getInformationString(),getUrlString())
  } else {
    window.history.replaceState(goState,getInformationString(),getUrlString())
  }
  goState.bSave = true;
  if (loChromosome.iSNPs > 0) {
    updateTitles("Rendering...");
    goState.iTo = loChromosome.getSNPs(goState.iFrom,goState.iTo);
    document.getElementById("to").value = goState.iTo;
    getSamples();
    if (goState.iH > 0 & goState.iW > 0) {
      loChromosome.drawSNPs();
      loChromosome.drawDatabars();
      drawSamples();
      resizeCanvases();
      updateTitles(getInformationString());
    } else {
      updateTitles("No SNP data to show. Try selecting different locations, a new genetic range or zooming out.");
      alert("No SNP data to show. Try selecting different locations, a new genetic range or zooming out.");
    }
  }
}

function drawSamples() {
  var loSamples, laSamples, i, j, liY, laCount, lrScaleY, liScaleY;
  lrScaleY = document.body.offsetHeight / goState.iH;
  liScaleY = Math.ceil(lrScaleY);
  goCanvases.oSamples.width  = goState.iSamplesWidth;
  goCanvases.oSamples.height = liScaleY * goState.iH;
  loSamples = goCanvases.oSamples.getContext("2d");
  laSamples = loSamples.createImageData(goState.iSamplesWidth,liScaleY*goState.iH);
  liY = 0;
  laCount = new Array(7);
  for (i = 0; i < 7; i++) {
    laCount[i] = 0;
  }

  for (i = 0; i < goState.aSamples.length; i++) {
    if (goState.aSamples[i] > 0) {
      laCount[gaLocations[goState.aSamples[i] - 1].iContinent] += liScaleY;
//      laCount[gaLocations[goState.aSamples[i] - 1].iContinent]++;
      for (j = 0; j < goState.iSamplesWidth * liScaleY; j++) {
        switch (gaLocations[goState.aSamples[i] - 1].iContinent) {
          case 0: laSamples.data[liY+0] = 0;   laSamples.data[liY+1] = 0;   laSamples.data[liY+2] = 0;   break;
          case 1: laSamples.data[liY+0] = 255; laSamples.data[liY+1] = 0;   laSamples.data[liY+2] = 0;   break;
          case 2: laSamples.data[liY+0] = 223; laSamples.data[liY+1] = 223; laSamples.data[liY+2] = 0;   break;
          case 3: laSamples.data[liY+0] = 0;   laSamples.data[liY+1] = 255; laSamples.data[liY+2] = 0;   break;
          case 4: laSamples.data[liY+0] = 0;   laSamples.data[liY+1] = 0;   laSamples.data[liY+2] = 255; break;
          case 5: laSamples.data[liY+0] = 127; laSamples.data[liY+1] = 0;   laSamples.data[liY+2] = 255; break;
        }
        laSamples.data[liY+3] = 255;
        liY += 4;
      }
    }
  }
  loSamples.putImageData(laSamples,0,0);  
//  loSamples.setTransform(1,0,0,1/liScaleY,0,0);
  loSamples.font = "15pt Arial";
  loSamples.fillStyle = "#000";
  loSamples.rotate(-0.5*Math.PI);
  loSamples.translate(-laCount[0]/2-15,18);
  for (i = 0; i < 6; i++) {
    if (laCount[i] > 0) {
      switch(i) {
        case 2: loSamples.fillText("WAF",0,0); break;
        case 3: loSamples.fillText("EAF",0,0); break;
        case 4: loSamples.fillText("SEA",0,0); break;
        case 5: loSamples.fillText("OCE",0,0); break;
      }
    }
    loSamples.translate(-laCount[i]/2-laCount[i+1]/2,0);
  }
}

function resizeCanvases() {
  goState.iTop = document.getElementById("snpheader").offsetHeight;
  goState.iGraphHeight = Math.max(40,Math.ceil(0.1 * (document.body.offsetHeight - goState.iTop)));
  //  Reference
  if (document.getElementById("cbReference").checked) {
    goCanvases.oReference.style.width   = (document.body.offsetWidth - goState.iSamplesWidth) + 'px';
    goCanvases.oReference.style.left    = goState.iSamplesWidth + 'px';
    goCanvases.oReference.style.height  = '10px';
    goCanvases.oReference.style.top     = goState.iTop + 'px';
    goCanvases.oReference.style.display = 'block';
    goState.iTop += 10;
  } else {
    goCanvases.oReference.style.display = 'none';
  }
  //  Genes
  if (document.getElementById("cbGenes").checked) {
    goCanvases.oGenes.style.width   = (document.body.offsetWidth - goState.iSamplesWidth) + 'px';
    goCanvases.oGenes.style.left    = goState.iSamplesWidth + 'px';
    goCanvases.oGenes.style.height  = '10px';
    goCanvases.oGenes.style.top     = goState.iTop + 'px';
    goCanvases.oGenes.style.display = 'block';
    goState.iTop += 10;
  } else {
    goCanvases.oGenes.style.display = 'none';
  }
  //  Uniqueness
  if (document.getElementById("cbUniqueness").checked) {
    goCanvases.oUniqueness.style.width   = (document.body.offsetWidth - goState.iSamplesWidth) + 'px';
    goCanvases.oUniqueness.style.left    = goState.iSamplesWidth + 'px';
    goCanvases.oUniqueness.style.height  = '10px';
    goCanvases.oUniqueness.style.top     = goState.iTop + 'px';
    goCanvases.oUniqueness.style.display = 'block';
    goState.iTop += 10;
  } else {
    goCanvases.oUniqueness.style.display = 'none';
  }
  //  MAF
  if (document.getElementById("cbMaf").checked) {
    goCanvases.oMaf.style.width   = (document.body.offsetWidth - goState.iSamplesWidth) + 'px';
    goCanvases.oMaf.style.left    = goState.iSamplesWidth + 'px';
    goCanvases.oMaf.style.height  = goState.iGraphHeight + 'px';
    goCanvases.oMaf.style.top     = goState.iTop + 'px';
    goCanvases.oMaf.style.display = 'block';
    goState.iTop += goState.iGraphHeight;
  } else {
    goCanvases.oMaf.style.display = 'none';
  }
  //  Fst
  if (document.getElementById("cbFst").checked) {
    goCanvases.oFst.style.width   = (document.body.offsetWidth - goState.iSamplesWidth) + 'px';
    goCanvases.oFst.style.left    = goState.iSamplesWidth + 'px';
    goCanvases.oFst.style.height  = goState.iGraphHeight + 'px';
    goCanvases.oFst.style.top     = goState.iTop + 'px';
    goCanvases.oFst.style.display = 'block';
    goState.iTop += goState.iGraphHeight;
  } else {
    goCanvases.oFst.style.display = 'none';
  }
  goCanvases.oData.style.width   = (document.body.offsetWidth - goState.iSamplesWidth) + 'px';
  goCanvases.oData.style.left    = goState.iSamplesWidth + 'px';
  goCanvases.oData.style.height  = (document.body.offsetHeight - goState.iTop - 1) + 'px';
  goCanvases.oData.style.top     = goState.iTop + 'px';
  goCanvases.oData.style.display = 'block';
  goCanvases.oSamples.style.width   = goState.iSamplesWidth + 'px';
  goCanvases.oSamples.style.left    = '0px';
  goCanvases.oSamples.style.height  = (document.body.offsetHeight - goState.iTop - 1) + 'px';
  goCanvases.oSamples.style.top     = goState.iTop + 'px';
  goCanvases.oSamples.style.display = 'block';
}


