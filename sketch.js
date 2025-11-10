let data; 
let minLat, minLon, maxLat, maxLon;
let minElev, maxElev; // Nuove variabili per l'altitudine
let margin = 70;
let chartW, chartH;

function preload() {
  data = loadTable("data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Futura");

  let allLat = [];
  let allLon = [];
  let allElev = []; // Array per l'altitudine

  for (let i = 0; i < data.getRowCount(); i++) {
    let lat = parseFloat(data.getString(i, "Latitude"));
    let lon = parseFloat(data.getString(i, "Longitude"));
    let elev = parseFloat(data.getString(i, "Elevation (m)")); // Prendi anche l'altitudine

    if (!isNaN(lat) && !isNaN(lon)) {
      allLat.push(lat);
      allLon.push(lon);
      if (!isNaN(elev)) {
          allElev.push(elev);
      }
    }
  }

  // Valori minimi e massimi per Latitudine, Longitudine e Altitudine
  minLat = min(allLat);
  maxLat = max(allLat);
  minLon = min(allLon);
  maxLon = max(allLon);
  minElev = min(allElev); // Altitudine minima
  maxElev = max(allElev); // Altitudine massima

  chartW = width * 0.8;
  chartH = height * 0.9;
}

function draw() {
  background(10); // Sfondo scuro

  let titleY = margin; //nuova posizione y per il titolo

  fill(255, 190, 11);
  textSize(38);
  textStyle(BOLD);
  textAlign(LEFT);
  text("VOLCANOES OF THE WORLD: Status and Elevation", margin, titleY); 
  textStyle(NORMAL);


  let mapYOffset = titleY + 60; // Spazio aggiuntivo di 60 pixel dopo il titolo

  noStroke(); // no contorno dei quadrati

  let closestDist = Infinity;
  let closestRow = null;
  let closestX, closestY;
  let closestSize; // La dimensione del vulcano più vicino

  // Colori per lo Status
  let activeColor = color(58, 134, 255, 200);   // 200 - Arancione/Rosso (Attivo/Historical/D1/D2/D3)
  let dormantColor = color(255, 0, 110, 200); // 150 - Blu (Holocene/U)
  let otherColor = color(200, 200, 200, 200);  // 150 - Grigio (Sconosciuto/Altro)

  // Ciclo per disegnare ogni vulcano
  for (let i = 0; i < data.getRowCount(); i++) {
    let lat = parseFloat(data.getString(i, "Latitude"));
    let lon = parseFloat(data.getString(i, "Longitude"));
    let elev = parseFloat(data.getString(i, "Elevation (m)"));
    let status = data.getString(i, "Status");

    if (isNaN(lat) || isNaN(lon)) continue;

    // Mappa Lat/Lon a coordinate X/Y
    let x = map(lon, minLon, maxLon, margin, chartW - margin);
    let y = map(lat, minLat, maxLat, chartH - margin, mapYOffset);
    
    // 1. Mappa Altitudine alla Dimensione del Quadrato
    let size = map(elev, minElev, maxElev, 4, 20); 
    
    // 2. Determina il Colore in base allo Status
    let vulcColor;
    if (status.includes("Historical") || status.startsWith("D")) {
        vulcColor = activeColor;
    } else if (status.includes("Holocene") || status === "U") {
        vulcColor = dormantColor;
    } else {
        vulcColor = otherColor;
    }
    
    // Distanza dal mouse al centro del quadrato
    let d = dist(x, y, mouseX, mouseY);

    // Gestione dell'hover: il vulcano più vicino
    if (d < size * 0.7) { // Controlla all'interno della dimensione del quadrato
        if (d < closestDist) { 
            closestDist = d; 
            closestRow = i;
            closestX = x;
            closestY = y;
            closestSize = size;
        }
    }

    // Disegna il quadrato del vulcano
    fill(vulcColor);
    rectMode(CENTER); // Disegna il quadrato dal centro
    rect(x, y, size, size);
  }

  

  // Hover Vulcano: evidenzia il quadrato e mostra le informazioni
  if (closestRow !== null) {
    // Evidenziazione: bordo giallo attorno al quadrato
    stroke(255, 190, 11); //255, 255, 0
    strokeWeight(3);
    noFill();
    rect(closestX, closestY, closestSize + 5, closestSize + 5); 
    
    noStroke();
    
    // Chiama la funzione per visualizzare la legenda informativa
    drawVolcanoInfo(closestRow);
  }

  drawLegend(activeColor, dormantColor, minElev, maxElev);
}

// Funzione per mostrare le informazioni dettagliate
// INFO SINGOLO VULCANO
function drawVolcanoInfo(row) {
    let infoX = chartW + 20;
    let infoY = margin + 130;

    // Info vulcano
    let name = data.getString(row, "Volcano Name");
    let country = data.getString(row, "Country");
    let type = data.getString(row, "Type");
    let status = data.getString(row, "Status");
    let erup = data.getString(row, "Last Known Eruption");
    let elev = data.getString(row, "Elevation (m)");
    let lat = data.getString(row, "Latitude");
    let lon = data.getString(row, "Longitude");

    // Testo vulcano
    fill(255, 190, 11);
    textSize(16);
    textStyle(BOLD);
    text(name, infoX, infoY + 200);
    textStyle(NORMAL);
    textSize(12);
    text("Country: " + country, infoX, infoY + 230);
    text("Status: " + status, infoX, infoY + 250);
    text("Type: " + type, infoX, infoY + 270);
    text("Elevation: " + elev + " m", infoX, infoY + 290);
    text("Lat/Lon: " + lat + " / " + lon, infoX, infoY + 310);
    text("Last Eruption: " + erup, infoX, infoY + 330);
}

// LEGENDA
function drawLegend(activeCol, dormantCol, minE, maxE) {
  let legendX = chartW + 20;
  let legendY = margin + 100;

  rectMode(CORNER);

  fill(255, 190, 11);
  textSize(18);
  textStyle(BOLD);
  text("MAP LEGEND", legendX, legendY);
  textStyle(NORMAL);
  textSize(14);
  
  // 1. Legenda Colore (Status)
  text("COLOR (Status)", legendX, legendY + 30);
  
  // ATTIVO
  fill(activeCol);
  rect(legendX, legendY + 45, 15, 15);
  fill(255, 190, 11);
  text("Active / Historical", legendX + 25, legendY + 57);
  
  // DORMIENTE
  fill(dormantCol);
  rect(legendX, legendY + 70, 15, 15);
  fill(255, 190, 11);
  text("Dormant / Holocene", legendX + 25, legendY + 82);

  
  // 2. Legenda Dimensione (Elevation)
  text("SIZE (Elevation in meters)", legendX, legendY + 120);
  
  fill(150);
  rect(legendX + 5, legendY + 140, 5, 5); // Piccolo
  fill(255, 190, 11);
  text(nf(minE, 0, 0) + " m (Min)", legendX + 25, legendY + 145);
  
  fill(150);
  rect(legendX - 5, legendY + 175, 20, 20); // Grande
  fill(255, 190, 11);
  text(nf(maxE, 0, 0) + " m (Max)", legendX + 25, legendY + 187);
}