//  ------------------------------------------------------------------------------------------------
//
//  Location
//
function CLocation(psLine, piOffset) {
  var laLine = psLine.split(";");
  this.sName      = laLine[0];
  this.iContinent = 0;
  if (this.sName.match(/SAM/)) { this.iContinent = 1; }
  if (this.sName.match(/WAF/)) { this.iContinent = 2; }
  if (this.sName.match(/EAF/)) { this.iContinent = 3; }
  if (this.sName.match(/SEA/)) { this.iContinent = 4; }
  if (this.sName.match(/OCE/)) { this.iContinent = 5; }
  this.rLongitude = parseFloat(laLine[1]);
  this.rLatitude  = parseFloat(laLine[2]);
  this.iStart     = piOffset
  this.iLength    = parseInt(laLine[3]);
  this.iEnd       = this.iStart + this.iLength;
  var lhOption  = document.createElement("option");
  lhOption.text = this.sName;
  document.getElementById("location").add(lhOption,null);
  if ('undefined' !== typeof(google)) {
    this.oMarker  = new google.maps.Marker({
      position: new google.maps.LatLng(this.rLongitude,this.rLatitude),
      title: this.sName,
      shape: { coord: [1, 1, 1, 128, 20, 128, 20 , 1], type: 'poly' }
    });
  }
}

CLocation.prototype.setIcon = function(psSNPs) {
  var lsLocation = psSNPs.substr(this.iStart,this.iLength);
  var liA = lsLocation.match(/A/) ? lsLocation.match(/A/g).length : 0;
  var liB = lsLocation.match(/B/) ? lsLocation.match(/B/g).length : 0;
  var liC = lsLocation.match(/C/) ? lsLocation.match(/C/g).length : 0;
  var liN = lsLocation.match(/N/) ? lsLocation.match(/N/g).length : 0;
  var liTotal   = liA + liB + liC +liN;
  var liHeight  = Math.round(100.0 * Math.sqrt(1.0 * liTotal) / goState.rLogMaxLength) + 25;
  var lrMajor   = 100.0 * liA / liTotal;
  var lrHetero  = 100.0 * liB / liTotal;
  var lrMinor   = 100.0 * liC / liTotal;
  var lrMissing = 100.0 * liN / liTotal;
  var liWidth   = 20;
  if ('undefined' !== typeof(google)) {
    this.oMarker.setMap(goMap);
    this.oMarker.setIcon(new google.maps.MarkerImage('http://chart.apis.google.com/chart?cht=bvs&chxl=0:|' + liTotal + '|&chd=t:' + lrMajor + '|' + lrHetero + '|' + lrMinor + '|' + lrMissing + '&chbh=' + liWidth + ',0,0&chco=FFFFFF,FF7F7F,7F1F1F,BFBFBF&chs=' + liWidth + 'x' + liHeight + '&chf=bg,s,FFFFFF&chxs=0,000000,15,0,_&chxt=x',new google.maps.Size(liWidth,liHeight)));
  }
}


