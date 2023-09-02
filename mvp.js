// let sliderTileOne;
let sliderTiles = [];
let myVehicle;

let midiOutput;

let collisionCheckers = []

const noteNumber = 60; // MIDI note number (e.g., 60 is middle C)

function setup() {
  createCanvas(windowWidth, windowHeight);

  myVehicle = new Vehicle(width / 2 - 500, height / 2); // Create a vehicle

  for (let i = 0; i < 8; i++) {
    sliderTiles.push(new sliderTile(i * 100 + (width/2 - (529 + 252)/2), 75, 53, 1))
    sliderTiles[i].createUnits();
    sliderTiles[i].setHandle()
    collisionCheckers.push(false)
  }

  // Accessing MIDI with webmidi.js
  WebMidi
  .enable()
  .then(onMidiEnabled)
  .catch(err => alert(err));

}

function draw() {
  background(0);

  for (const sliderTile in sliderTiles) {

    sliderTiles[sliderTile].moveHandle();
    sliderTiles[sliderTile].display()

    if(collideRectCircle(sliderTiles[sliderTile].x, sliderTiles[sliderTile].y, sliderTiles[sliderTile].width, sliderTiles[sliderTile].height, myVehicle.pos.x, myVehicle.pos.y, 20)) {
      if(collisionCheckers[sliderTile] == false) {
        sliderTiles[sliderTile].noteOn();
        collisionCheckers[sliderTile] = true;
      }
    } else {
      if(collisionCheckers[sliderTile] == true) {
        sliderTiles[sliderTile].noteOff()
        collisionCheckers[sliderTile] = false;
      }
    }
  }

  myVehicle.move();
  myVehicle.display();

}

// Get scale from note
function getMinorScale(root) {
  const intervals = [2, 1, 2, 2, 1, 2, 2];

  const descendingScale = cumulativeSubtractionLoop(root, intervals, 7).reverse()
  const ascendingScale = cumulativeAdditionLoop(root, intervals, 7)
  const combinedScale = [...new Set(descendingScale.concat(ascendingScale))];

  return combinedScale.reverse();
}

function cumulativeAddition(number, arr) {
  let resultArray = [number];
  let cumulativeSum = number;

  for (let i = 0; i < arr.length; i++) {
    cumulativeSum += arr[i];
    resultArray.push(cumulativeSum);
  }

  return resultArray;
}

function cumulativeAdditionLoop(number, arr, iterations) {
  let resultArray = [number];
  let cumulativeSum = number;

  for (let i = 0; i < iterations; i++) {
    cumulativeSum += arr[i % arr.length];
    resultArray.push(cumulativeSum);
  }

  return resultArray;
}

function cumulativeSubtraction(number, arr) {
  let resultArray = [number];
  let cumulativeDifference = number;

  for (let i = 0; i < arr.length; i++) {
    cumulativeDifference -= arr[i];
    resultArray.push(cumulativeDifference);
  }

  return resultArray;
}

function cumulativeSubtractionLoop(number, arr, iterations) {
  let resultArray = [number];
  let cumulativeDifference = number;

  for (let i = 0; i < iterations; i++) {
    cumulativeDifference -= arr[i % arr.length];
    resultArray.push(cumulativeDifference);
  }

  return resultArray;
}

function isMouseOverObject(x, y, width, height) {
  // Check if mouse is within the object's boundaries
  if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
    return true; // Mouse is over the object
  } else {
    return false; // Mouse is not over the object
  }
}

// Slider tile
class sliderTile {
  constructor(x, y, rootNote, channel) {
    this.x = x;
    this.y = y;

    this.width = 74;
    this.height = 648;

    // Make these more dynamic; they're still kinda hardcoded
    this.innerShellX = this.x + this.width/2 - 8;
    this.innerShellY = this.y + 46;
    this.innerShellHeight = this.height-98;
    this.innerShellWidth = 16;

    this.unitWidth = 12;
    this.unitHeight = (this.height-98)/14;
    this.units = [];

    this.handleSize = this.unitHeight;
    this.handleX = this.innerShellX - (this.handleSize/2 - this.innerShellWidth/2)
    this.handleY = 0;

    this.rootNote = rootNote;
    this.scale = getMinorScale(rootNote);
    this.activeNote = rootNote;

    // this.defaultColor = 0;
    // this.hoverColor = 100;
    // this.currentColor = 0;
    this.fillVal = 0
    // this.isHovered = false;
    this.fadeSpeed = 0.2; // Adjust the fade speed as needed

    this.channel = channel
  }

  createUnits() {
    for (let i = 0; i < 15; i++) {
      let unit = {
        id: i,
        note: this.scale[i],
        x: this.innerShellX,
        y: i * (this.height-98)/15 + this.innerShellY,
        width: this.innerShellWidth,
        height: this.unitHeight,
        // active: false
      }

      this.units.push(unit)
    }

    console.log(this.scale)
  }

  setHandle() {
    this.handleY = this.units[7].y;
  }

  moveHandle() {

    for (let i = 0; i < this.units.length; i++) {
      let mouseOverUnit = isMouseOverObject(this.units[i].x, this.units[i].y, this.units[i].width, this.units[i].height)
      
      if (mouseOverUnit && mouseIsPressed) {

        this.handleY = this.units[i].y;
        this.activeNote = this.units[i].note;
      }
    }

    console.log(this.activeNote)

  }

  noteOn() {
    midiOut.channels[1].sendNoteOn(this.activeNote);
    // console.log(getMIDINoteFromSPN(this.activeNote))
    // console.log(midiOut.channels[1])
  }

  noteOff() {
    midiOut.channels[1].sendNoteOff(this.activeNote);
  }


  display() {

    // Outer shell
    fill(this.fillVal)
    stroke(255);
    rect(this.x, this.y, this.width, this.height)

    // Inner shell
    rect(this.innerShellX, this.innerShellY, 12, this.innerShellHeight)
  
    // Units
    for (let i = 0; i < this.units.length; i++) {
      rect(this.units[i].x, this.units[i].y, this.units[i].width, this.units[i].height);
    }

    // Handle
    fill(255)
    stroke(255)

    // TODO: Smooth motion
    rect(this.handleX, this.handleY, this.handleSize, this.handleSize)
  }

}

class Vehicle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.target = createVector(width/2 + 500, height/2);
    this.vel = createVector(0, 0);
    this.acc = createVector(2, 0);
    this.isOverTile = false;
    this.noteActive = false;
  }

  move() {

    this.acc.add(this.force)
    this.vel.add(this.acc)
    this.pos.add(this.vel)
    if (this.pos.x > this.target.x) {
        this.pos.x = width/2 - 500
        this.vel.x = 0
    }
  }

  display() {
    fill(255);
    stroke(255);
    ellipse(this.pos.x, this.pos.y, 20, 20);
  }
}


function onMidiEnabled() {
  console.log("WebMidi enabled!") 

  // Inputs
  console.log("Inputs:") 
  WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name));
  
  // Outputs
  console.log("Outputs:") 
  WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name));

  midiOut = WebMidi.getOutputByName("IAC Driver Bus 1");
}