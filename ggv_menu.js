//  ------------------------------------------------------------------------------------------------
//
//  Menu
//
function getGenes() {
  if (goState.sView == "snp") {
    gaChromosomes[document.getElementById("snpChromosome").selectedIndex].updateGeneMenu(0);
    if (document.getElementById("actionChromosome").checked) { getChromosomeRange(); }
    if (document.getElementById("actionGene").checked) { getGeneRange(); }
  } else {
    gaChromosomes[document.getElementById("mapChromosome").selectedIndex].updateGeneMenu(0);
  }
}

function getChromosomeRange() {
  var lhChromosome, liChromosome;
  lhChromosome = document.getElementById("snpChromosome");
  liChromosome = lhChromosome.selectedIndex;
  document.getElementById("from").value = lhChromosome.options[liChromosome].attributes["data-from"].value;
  document.getElementById("to").value   = lhChromosome.options[liChromosome].attributes["data-to"].value;
}

function getGeneRange() {
  var lhGene, liGene;
  lhGene = document.getElementById("snpGene");
  liGene = lhGene.selectedIndex;
  document.getElementById("from").value = lhGene.options[liGene].attributes["data-from"].value;
  document.getElementById("to").value   = lhGene.options[liGene].attributes["data-to"].value;
}

function focusChromosome () {
  document.getElementById("actionChromosome").checked = true;
}

function focusGene () {
  document.getElementById("actionGene").checked = true;
}

function focusRange () {
  document.getElementById("actionRange").checked = true;
}

/  ------------------------------------------------------------------------------------------------
//
//  Popup views
//
function toggle(psId) {
  var lhElement = document.getElementById(psId);
  if (lhElement.style.display == 'none') {
    lhElement.style.display = 'block';
  } else {
    lhElement.style.display = 'none';
  }
}

function windowPosition(popUpDivVar) {
  if (typeof window.innerWidth != 'undefined') {
    viewportheight = window.innerHeight;
  } else {
    viewportheight = document.documentElement.clientHeight;
  }
  if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
    blanket_height = viewportheight;
  } else {
    if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
      blanket_height = document.body.parentNode.clientHeight;
    } else {
      blanket_height = document.body.parentNode.scrollHeight;
    }
  }
  var blanket = document.getElementById('blanket');
  blanket.style.height = blanket_height + 'px';
  var popUpDiv = document.getElementById(popUpDivVar);
  popUpDiv.style.top = '50px';
  popUpDiv.style.left = '50px';
}

function popup(psId) {
  windowPosition(psId);
  toggle('blanket');
  toggle(psId);
}
