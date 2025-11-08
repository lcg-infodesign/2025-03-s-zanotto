let data; 
let categoryCounts = {}; // Oggetto per memorizzare i conteggi di ciascuna TypeCategory
let categories = []; // Array per le etichette delle categorie
let maxCount = 0; // Il conteggio massimo per scalare le barre
let chartW, chartH;
let margin = 70;

function preload() {
  data = loadTable("data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Helvetica");
  
  chartW = width * 0.8;
  chartH = height * 0.8;
  
  // 1. Contare le occorrenze di ciascuna TypeCategory
  for (let i = 0; i < data.getRowCount(); i++) {
    let category = data.getString(i, "TypeCategory");
    if (category) {
      if (category in categoryCounts) {
        categoryCounts[category]++;
      } else {
        categoryCounts[category] = 1;
      }
    }
  }
  
  // 2. Ottenere le categorie e il conteggio massimo
  categories = Object.keys(categoryCounts);
  for (let cat of categories) {
    if (categoryCounts[cat] > maxCount) {
      maxCount = categoryCounts[cat];
    }
  }
}

function draw() {
  background(10);
  
  let chartX = margin;
  let chartY = height - margin;
  
  // Titolo
  fill("white");
  textSize(24);
  textAlign(LEFT);
  text("Distribution of Volcanoes by Type Category", margin, margin - 15);

  // Linee degli assi
  stroke(100);
  line(chartX, chartY, chartX + chartW, chartY); // Asse X
  line(chartX, chartY, chartX, chartY - chartH); // Asse Y
  noStroke();

  let numCategories = categories.length;
  let barWidth = (chartW - margin * 2) / numCategories;
  
  // Disegna le barre
  for (let i = 0; i < numCategories; i++) {
    let cat = categories[i];
    let count = categoryCounts[cat];
    
    // Mappa il conteggio all'altezza del grafico (chartH)
    let barHeight = map(count, 0, maxCount, 0, chartH - margin);
    let x = chartX + i * barWidth + barWidth / 2;
    let y = chartY - barHeight;
    
    let isHovering = mouseX > x - barWidth / 2 && mouseX < x + barWidth / 2 && mouseY > chartY - barHeight && mouseY < chartY;
    
    // Colore barra
    let barColor = color(100, 150, 255); // Colore di base blu
    if (isHovering) {
      barColor = color(255, 100, 100); // Rosso all'hover
    }
    fill(barColor);
    rect(x - barWidth / 2, y, barWidth, barHeight);
    
    // Etichette Asse X (Nomi Categoria)
    push();
    fill("white");
    textSize(10);
    textAlign(RIGHT);
    translate(x - barWidth/2 + 5, chartY + 10);
    rotate(PI/4); // Ruota l'etichetta per risparmiare spazio
    text(cat, 0, 0);
    pop();
    
    // Etichette Conteggio sopra la barra
    if (isHovering) {
        fill(255);
        textAlign(CENTER);
        textSize(12);
        text(count, x, y - 5);
    }
  }
  
  // Disegna le tacche sull'Asse Y e i valori
  drawYAxisLabels();
  
  // Informazioni hover (mostriamo tutti i vulcani di quella categoria)
  if (mouseX > chartX && mouseX < chartX + chartW && mouseY > chartY - chartH && mouseY < chartY) {
    let hoverIndex = floor((mouseX - chartX) / barWidth);
    if (hoverIndex >= 0 && hoverIndex < numCategories) {
      let hoveredCategory = categories[hoverIndex];
      displayHoverInfo(hoveredCategory);
    }
  }
}

function drawYAxisLabels() {
  let chartX = margin;
  let chartY = height - margin;
  
  // Numero di tacche (es. 5)
  let numTicks = 5;
  for (let i = 0; i <= numTicks; i++) {
    let value = round(map(i, 0, numTicks, 0, maxCount));
    let y = map(i, 0, numTicks, chartY, chartY - (chartH - margin));
    
    // Linea tacca
    stroke(100);
    line(chartX - 5, y, chartX + 5, y);
    
    // Testo valore
    noStroke();
    fill(100);
    textAlign(RIGHT);
    textSize(10);
    text(value, chartX - 10, y + 4);
  }
  
  // Etichetta Asse Y
  fill("white");
  textAlign(CENTER);
  textSize(12);
  text("Count", chartX, chartY - chartH + 10);
}

function displayHoverInfo(category) {
  let infoX = width - 200;
  let infoY = margin + 30;
  
  fill(0, 0, 0, 180);
  rect(infoX - 10, infoY - 20, 210, 300); // Sfondo nero semitrasparente

  fill(255);
  textSize(14);
  textAlign(LEFT);
  text("Category: " + category, infoX, infoY);
  
  textSize(12);
  let count = 0;
  let yOffset = 0;
  let displayLimit = 15; // Limita i nomi per non sovraccaricare
  
  // Titoli
  text("First " + displayLimit + " Volcanoes:", infoX, infoY + 20);
  
  // Filtra e mostra i nomi dei vulcani di quella categoria
  for (let i = 0; i < data.getRowCount() && count < displayLimit; i++) {
    let rowCategory = data.getString(i, "TypeCategory");
    if (rowCategory === category) {
      let name = data.getString(i, "Volcano Name");
      text("• " + name, infoX, infoY + 40 + yOffset);
      yOffset += 15;
      count++;
    }
  }
  
  if (categoryCounts[category] > displayLimit) {
      text("...and " + (categoryCounts[category] - displayLimit) + " more.", infoX, infoY + 40 + yOffset);
  }
}