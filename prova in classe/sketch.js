let data;
let minLat, minLon, maxLat, maxLon;


function preload() {
  data = loadTable("data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowWeight);

  // definisco min e max latitudine
  let allLat = data.getColumn("latitude");
  minLat = min(allLat);
  maxLat = max(allLat);

  let allLon = data.getColumn("longitude");
  minLon = min(allLon);
  maxLon = max(allLon);
 
  console.log(allLat);
}

function draw() {
  background(220);

  for(let rowNumber =0; rowNumber < data.getRowCount(); rowNumber ++){
    console.log(rowNumber);
    // leggo i dati della singola riga
    let lon = data.getNum(rowNumber, "longitude");
    let lat = data.getNum(rowNumber, "latitude");

    // converto le coordinate geografiche in coordinate pixel
    let x = map(lon, minLon, maxLon, 0, width);
    let y = map(lat, minLat, maxLat, height, 0);
    let radius = 20;

    // calcola la distanza
    let d = dist(x, y, mouseX, mouseY);

    if(d<radius){ // questo codice in mezzo alle graffe verrà eseguit solo se è la condizione del raggio
      fill("red")
    }

    if(d>radius){
      fill("yellow");
    }

    ellipse(x, y, radius*2)

    if (d<radius){
      fill("white");
      Text(name, x, y);
    }
  }
}
