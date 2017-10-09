function rightClickData() {
  if (document.getElementById("cbMouseRight").checked) {
    getSNPTable("zoomout");
  }
  return false;
}

function clickData(poEvent) {
  if (0 == poEvent.button && document.getElementById("cbMouseLeft").checked) {
    goState.iClicks++;
    setTimeout(function() {
      if (goState.iClicks == 1) {
        getSNPTable("zoomin");
        goState.iClicks = 0;
      }
    }, 200);
  }
  if (1 == poEvent.button && document.getElementById("cbMouseMiddle").checked) {
    var liX, liY, liWidth, liHeight, liPosition, liOffset, lsHTML, lhTooltip, lhSNPViewer, laGeneName, laLocatio;
    if (!poEvent) var poEvent = window.event;
    liSNP = Math.floor(goState.iW * (poEvent.clientX - goState.iSamplesWidth - 1) / goCanvases.oData.clientWidth);
    if (liSNP < 0) { liSNP = 0; }
    liSNPOffset = -1;
    for (i = 0; i < goState.aSNPs.length; i++) {
      if (goState.aSNPs[i]) { liSNPOffset++; }
      if (liSNPOffset == liSNP) { liSNP = i; break; }
    }
    goState.iLocus = liSNP;
    getSNPTable("center");
  }
}

function moveData(poEvent) {
  if (document.getElementById("cbMouseScroll").checked) {
    if (0 < poEvent.wheelDelta) { getSNPTable("left"); }
    if (0 > poEvent.wheelDelta) { getSNPTable("right"); }
  }
}

function toMap(poEvent) {
  if ("undefined" !== typeof(google)) {
    if (goState.iClicks == 2) {
      var liX, liY, liWidth, liHeight, liPosition, liOffset, lsHTML, lhTooltip, lhSNPViewer, laGeneName, laLocation;
      if (!poEvent) var poEvent = window.event;
      liSNP = Math.floor(goState.iW * (poEvent.clientX - goState.iSamplesWidth - 1) / goCanvases.oData.clientWidth);
      if (liSNP < 0) { liSNP = 0; }
      liSNPOffset = -1;
      for (i = 0; i < goState.aSNPs.length; i++) {
        if (goState.aSNPs[i]) { liSNPOffset++; }
        if (liSNPOffset == liSNP) { liSNP = i; break; }
      }
      goState.iLocus = liSNP;
      view("map");
    }
  } else {
    alert("Google Maps not available at this time");
  }
  goState.iClicks = 0;
}

//  ------------------------------------------------------------------------------------------------
//
//  Tooltip
//
function hideTooltip (psType) {
  document.getElementById('tt').style.display = 'none';
}

function hideTooltipMouse (poEvent,psType) {
  document.getElementById('ttMouse').style.display = 'none';
}

function moveTooltip (poEvent,psType) {
  var i, liX, liY, liWidth, liHeight, liPosition, liOffset, liSNPOffset, liSampleOffset, lsHTML, lhTooltip, lhSNPViewer, laGeneName, laLocation, lsAmino, lsSNP;
  if (!poEvent) var poEvent = window.event;
  liSNP = Math.floor(goState.iW * (poEvent.clientX - goState.iSamplesWidth - 1) / goCanvases.oData.clientWidth);
  liSample = Math.floor(goState.iH * (poEvent.clientY - goState.iTop - 1) / goCanvases.oData.clientHeight);
  if (liSNP >= 0) {
    document.getElementById('tt').style.display = 'block';
    liSNPOffset = -1;
    for (i = 0; i < goState.aSNPs.length; i++) {
      if (goState.aSNPs[i]) { liSNPOffset++; }
      if (liSNPOffset == liSNP) { liSNP = i; break; }
    }
    liSampleOffset = -1;
    for (i = 0; i < goState.aSamples.length; i++) {
      if (goState.aSamples[i] > 0) { liSampleOffset++; }
      if (liSampleOffset == liSample) { liSample = i; break; }
    }
    loChromosome = gaChromosomes[goState.iChromosome];
    liLocus      = parseInt(loChromosome.aSNPs[liSNP]);
    document.getElementById('tt').style.display = 'block';
    document.getElementById('ttPosition').innerHTML = loChromosome.sName + ":" + liLocus;
    document.getElementById('ttGene').innerHTML = "-";
    lsGene = "-"
    if (loChromosome.sGenes.charAt(liSNP) != ".") {
      for (i = 0; i < loChromosome.iGenes; i++) {
        if (loChromosome.aGeneStart[i] <= liLocus & liLocus <= loChromosome.aGeneEnd[i]) {
          lsGene = loChromosome.aGeneName[i];
          break;
        }
      }
    }
    document.getElementById('ttGene').innerHTML = lsGene;
    lsSNP = "";
    if (undefined == loChromosome.aData[liSNP]) {
      lcSNP = "N";
    } else {
      lcSNP = loChromosome.aData[liSNP].charAt(liSample);
    }
    if (lcSNP == "A") { lsSNP = "Wildtype"; }
    if (lcSNP == "B") { lsSNP = "Mixed"; }
    if (lcSNP == "C") { lsSNP = "Alternative"; }
    if (lcSNP == "N") { lsSNP = "Missing"; }
    lsAmino = loChromosome.aAminoAcids[liSNP];
    document.getElementById('ttData').innerHTML = loChromosome.sReference.charAt(liSNP) + " : " + lsSNP + " : " + lsAmino;
    document.getElementById('ttStats').innerHTML = goState.aMaf[liSNPOffset].toFixed(0) + "%/" + goState.aFst[liSNPOffset].toFixed(2);
  } else {
    document.getElementById('ttPosition').innerHTML = "";
    document.getElementById('ttGene').innerHTML = "";
    document.getElementById('ttData').innerHTML = "";
    document.getElementById('ttStats').innerHTML = "";
  }
  if (liSample >= 0) {
    liSampleOffset = -1;
    for (i = 0; i < goState.aSamples.length; i++) {
      if (goState.aSamples[i] > 0) { liSampleOffset++; }
      if (liSampleOffset == liSample) {
        liSample = i;
        break;
      }
    }
    for (j = 0; j < gaLocations.length; j++) {
      if (gaLocations[j].iStart <= liSample & liSample < gaLocations[j].iEnd) {
        liLocation = j;
        break;
      }
    }
    loLocation   = gaLocations[liLocation];
    document.getElementById('tt').style.display = 'block';
    document.getElementById('ttSample').innerHTML   = loLocation.sName + ":" + (liSample - loLocation.iStart + 1);
  } else {
    document.getElementById('ttSample').innerHTML = "";
  }
  if (liSample == 0 & liSNP == 0) {
    document.getElementById('tt').style.display = 'none';
  }
  switch (psType) {
    case("snp"):       {
      lsTT = "Mouse controls:<br/>";
      if (document.getElementById("cbMouseDouble").checked) { lsTT += "Map view: double click<br/>"; }
      if (document.getElementById("cbMouseLeft").checked)   { lsTT += "Zoom in: left click<br/>"; }
      if (document.getElementById("cbMouseMiddle").checked) { lsTT += "Center: middle click<br/>"; }
      if (document.getElementById("cbMouseRight").checked)  { lsTT += "Zoom out: right click<br/>"; }
      if (document.getElementById("cbMouseScroll").checked) { lsTT += "Left/right: scroll wheel<br/>"; }
      getTooltip(poEvent,lsTT);
      break;
    }
    case("samples"):   { getTooltip(poEvent,loLocation.sName + ":" + (liSample - loLocation.iStart + 1)); break; }
    case("databarsR"): { getTooltip(poEvent,"Reference " + loChromosome.sReference.charAt(liSNP)); break; }
    case("databarsG"): { getTooltip(poEvent,"Gene " + lsGene); break; }
    case("databarsU"): { getTooltip(poEvent,"Uniqueness"); break; }
    case("databarsM"): { getTooltip(poEvent,"AF " + goState.aMaf[liSNPOffset].toFixed(0) + "%"); break; }
    case("databarsF"): { getTooltip(poEvent,"Fst " + goState.aFst[liSNPOffset].toFixed(2)); break; }
  }
}

function getTooltip(poEvent,psText) {
  var loTooltip = document.getElementById('ttMouse');
  loTooltip.style.position = 'absolute';
  if (goCanvases.oData.offsetTop + goCanvases.oData.clientHeight - poEvent.clientY > 120) {
    loTooltip.style.top = (poEvent.clientY + 10) + 'px';
    loTooltip.style.bottom = 'auto';
  } else {
    loTooltip.style.bottom = (goCanvases.oData.offsetTop + goCanvases.oData.clientHeight - poEvent.clientY + 0) + 'px';
    loTooltip.style.top = 'auto';
  }
  if (goCanvases.oData.clientWidth - poEvent.clientX > 160) {
    loTooltip.style.left = (poEvent.clientX + 10) + 'px';
    loTooltip.style.right = 'auto';
  } else {
    loTooltip.style.right = (goCanvases.oData.clientWidth - poEvent.clientX + 20) + 'px';
    loTooltip.style.left = 'auto';
  }
  loTooltip.innerHTML = psText;
  loTooltip.style.display = 'block';
  return loTooltip;
}

/
