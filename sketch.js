let table;
let entries = []; // one AppEntry object per row of the csv

let canvas;

// the three language choices that appear in the csv
let choices = ["english", "spanish", "both"];


async function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");

  table = await loadTable("data.csv", ",", "header");

  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, "apps");
    let language = table.getString(i, "language");
    let minutes = table.getNum(i, "minutes spent");
    let logo = await loadImage("logos/" + name.toLowerCase().replace(" ", "") + ".jpg");

    // create a new AppEntry object (see the class object below) and injects the information 
    // for each CSV entry into each one and stores (pushes) each new object in the "entries" array
    entries.push(new AppEntry(name, language, minutes, logo, i));
  }


  placeEntries();
}

// spread every entry evenly across the page
function placeEntries() {
  for (let i = 0; i < entries.length; i++) {
    entries[i].updatePosition(entries.length);
  }
}

// re-space everything if the browser window changes size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  placeEntries();
}

function draw() {
  background(245);
  textAlign(CENTER);
  textSize(14);

  for (let i = 0; i < entries.length; i++) {
    entries[i].display();
  }

  // running score
  let correct = 0;
  let answered = 0;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].answer !== "") {
      answered++;
      if (entries[i].answer === entries[i].language) correct++;
    }
  }
  fill(0);
  textAlign(LEFT);
  text("score: " + correct + " / " + answered + " answered (" + entries.length + " apps)", 20, 300);
}



// ---------------------------------------------
// AppEntry: one app from the csv
// holds its name, logo, language, minutes,
// its three buttons, and the player's answer
// ---------------------------------------------
// this is a more complex object type, the class AppEntry has it's own functions
// that can be called in draw. 
class AppEntry {
  constructor(name, language, minutes, logo, index) {
    this.name = name;
    this.language = language.trim().toLowerCase(); // csv has stray spaces ("both ")
    this.minutes = minutes;
    this.logo = logo;

    this.index = index;     // position in the row (0, 1, 2, ...)
    this.x = 0;             // center x, set by updatePosition()

    this.answer = "";       // what the player picked
    this.feedback = "";     // "correct!" or "nope"
    this.buttons = [];

    this.makeButtons();
  }

  // function that created the button
  makeButtons() {
    for (let j = 0; j < choices.length; j++) { //how many choices are there from the choices array above
      let choice = choices[j];
      let b = createButton(choice);
      b.size(70, 24);
      // arrow function keeps "this" pointing at this AppEntry
      b.mousePressed(() => this.check(choice));
      this.buttons.push(b);
    }
  }

  // split the page width into equal slots, one per entry,
  // and put this entry in the middle of its slot
  updatePosition(total) {
    let slotWidth = width / total;
    this.x = slotWidth * this.index + slotWidth / 2;

    for (let j = 0; j < this.buttons.length; j++) {
      this.buttons[j].position(this.x - 35, 150 + j * 28);
    }
  }


 //check to see what choice was made
  check(choice) {
    this.answer = choice;
    if (choice === this.language) {
      this.feedback = "correct!";
    } else {
      this.feedback = "nope, it's " + this.language;
    }
  }

  //display the entries in draw
  display() {
    image(this.logo, this.x - 30, 50, 60, 60);

    fill(0);
    text(this.name, this.x, 132);

    // show the result under the buttons
    if (this.feedback !== "") {
      if (this.answer === this.language) {
        fill(0, 150, 0);
      } else {
        fill(200, 0, 0);
      }
      text(this.feedback, this.x, 250);
    }
  }
}

