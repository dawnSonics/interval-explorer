// let sliderTileOne;
let sliderTiles = [];
let myVehicle;

let midiOutput;

// Hard coded collision detection variables
// let isNoteOn = false;
// let isOverTile0 = false;
// let isOverTile1 = false; 

let collisionCheckers = []

const noteNumber = 60; // MIDI note number (e.g., 60 is middle C)

function setup() {
  createCanvas(windowWidth, windowHeight);
  // sliderTileOne = new sliderTile(300, 75, 'F3');
  // sliderTileOne.createUnits();
  // sliderTileOne.setHandle();

  myVehicle = new Vehicle(width / 2 - 500, height / 2); // Create a vehicle

  for (let i = 0; i < 5; i++) {
    sliderTiles.push(new sliderTile(((74 + 20) * 5) + i * 100, 75, 'F3', 1))
    sliderTiles[i].createUnits();
    sliderTiles[i].setHandle()
    collisionCheckers.push(false)
  }

  // Accessing MIDI with webmidi.js
  WebMidi
  .enable()
  .then(onMidiEnabled)
  .catch(err => alert(err));

  // Accessing MIDI without webmidi.js
  // navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

  // console.log(sliderTileOne.units[1].id);
  // sliderTileOne.units[6].active = true;

  console.log(collisionCheckers)
}

function draw() {
  background(0);

  for (const sliderTile in sliderTiles) {
    // sliderTiles[sliderTile].checkCollision(myVehicle);
    sliderTiles[sliderTile].moveHandle();
    sliderTiles[sliderTile].display()
    // sliderTiles[sliderTile].checkCollision(myVehicle)
    // myVehicle.sendNote();

    if(collideRectCircle(sliderTiles[sliderTile].x, sliderTiles[sliderTile].y, sliderTiles[sliderTile].width, sliderTiles[sliderTile].height, myVehicle.pos.x, myVehicle.pos.y, 20)) {
      if(collisionCheckers[sliderTile] == false) {
        sendNoteOn();
        collisionCheckers[sliderTile] = true;
      }
    } else {
      if(collisionCheckers[sliderTile] == true) {
        sendNoteOff();
        collisionCheckers[sliderTile] = false;
      }
    }
  }

  // myVehicle.checkCollision(sliderTiles[sliderTile])

  // Hard coded implementation of collision detection

  // if (
  //   myVehicle.pos.x >= sliderTiles[0].x &&
  //   myVehicle.pos.x <= sliderTiles[0].x + sliderTiles[0].width &&
  //   myVehicle.pos.y >= sliderTiles[0].y &&
  //   myVehicle.pos.y <= sliderTiles[0].y + sliderTiles[0].height
  // ) {
  //   if (!isOverTile0) {
  //     // sendMIDINoteOn()
  //     myVehicle.sendNoteOn();
  //     isOverTile0 = true;
  //     // console.log('On')
  //   }
  // } else {
  //   if (isOverTile0) {
  //     // sendMIDINoteOff();
  //     myVehicle.sendNoteOff();
  //     isOverTile0 = false;
  //     // console.log('Off')
  //   }
  // }

  // if (
  //   myVehicle.pos.x >= sliderTiles[1].x &&
  //   myVehicle.pos.x <= sliderTiles[1].x + sliderTiles[1].width &&
  //   myVehicle.pos.y >= sliderTiles[1].y &&
  //   myVehicle.pos.y <= sliderTiles[1].y + sliderTiles[1].height
  // ) {
  //   if (!isOverTile1) {
  //     // sendMIDINoteOn()
  //     myVehicle.sendNoteOn();
  //     isOverTile1 = true;
  //     // console.log('On')
  //   }
  // } else {
  //   if (isOverTile1) {
  //     // sendMIDINoteOff();
  //     myVehicle.sendNoteOff();
  //     isOverTile1 = false;
  //     // console.log('Off')
  //   }
  // }


  myVehicle.move();
  myVehicle.display();

  // sliderTileOne.moveHandle();
  // sliderTileOne.display();
  // midiOut.channels[1].sendNoteOn(getMIDINoteFromSPN('C3'));
}

// Get scale from note
function getMinorScaleSPN(note) {
  let returnedNotes = []

  const scaleIntervals = [0, 2, 3, 5, 7, 8, 10]; // Minor scale intervals
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; // Note names
  
  // Parse input note
  const noteRegex = /^([A-G])(#|b)?(\d+)$/i;
  const [, rootNote, accidental, octave] = note.match(noteRegex);
  const rootNoteIndex = noteNames.findIndex(n => n.toUpperCase() === rootNote.toUpperCase());
  const noteOffset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  
  // Calculate the ascending and descending minor scale notes
  const scaleNotesAscending = scaleIntervals.map(interval => {
    const noteIndex = (rootNoteIndex + interval + noteOffset) % 12;
    const octaveNumber = parseInt(octave, 10);
    const noteName = noteNames[noteIndex];
    return `${noteName}${octaveNumber}`;
  });
  
  const scaleNotesDescending = scaleIntervals.map(interval => {
    const noteIndex = (rootNoteIndex - interval + noteOffset + 12) % 12;
    const octaveNumber = parseInt(octave, 10) - 1;
    const noteName = noteNames[noteIndex];
    return `${noteName}${octaveNumber}`;
  });

  // console.log(scaleNotesAscending)
  
  // return scaleNotesAscending.concat(scaleNotesDescending.reverse());
  return scaleNotesDescending.concat(scaleNotesAscending).reverse();
}

// Get MIDI value from note
// TODO: Check if value actually correspoonds to the note
function getMIDINoteFromSPN(noteName) {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = parseInt(noteName.charAt(noteName.length - 1));
  const noteIndex = noteNames.indexOf(noteName.slice(0, -1));

  if (noteIndex !== -1 && !isNaN(octave)) {
    // Calculate MIDI value
    const midiValue = octave * 12 + noteIndex;

    return midiValue;
  }

  // If the note name is not valid, return null or throw an error
  return null;
}

// console.log(getMIDINoteFromSPN('F3'))

function isMouseOverObject(x, y, width, height) {
  // Check if mouse is within the object's boundaries
  if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
    return true; // Mouse is over the object
  } else {
    return false; // Mouse is not over the object
  }
}

// Example usage of note creation function:
// const note = 'A4';
// const minorScale = getMinorScaleSPN(note);
// console.log(minorScale);

// Slider tile
class sliderTile {
  constructor(x, y, rootNote, channel) {
    this.x = x;
    this.y = y;

    this.width = 74;
    this.height = 648;

    // Make these more dynamic; they're still kinda hardcoded
    this.innerShellX = this.x + this.width/2 - 6;
    this.innerShellY = this.y + 46;
    this.innerShellHeight = this.height-98;
    this.innerShellWidth = 12;

    this.unitWidth = 12;
    this.unitHeight = (this.height-98)/14;
    this.units = [];

    this.handleSize = this.unitHeight;
    this.handleX = this.innerShellX - (this.handleSize/2 - this.innerShellWidth/2)
    this.handleY = 0;

    this.rootNote = rootNote;
    this.scale = getMinorScaleSPN(rootNote);
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
    for (let i = 0; i < this.scale.length; i++) {
      let unit = {
        id: i,
        note: this.scale[i],
        x: this.innerShellX,
        y: i * (this.height-98)/14 + this.innerShellY,
        width: this.innerShellWidth,
        height: this.unitHeight,
        midpoint: this.innerShellY + i * this.unitHeight,
        // active: false
      }

      this.units.push(unit)
    }
  }

  setHandle() {
    this.handleY = this.units[6].midpoint;
  }

  moveHandle() {

    // console.log('Running')
    for (let i = 0; i < this.units.length; i++) {
      let mouseOverUnit = isMouseOverObject(this.units[i].x, this.units[i].y, this.units[i].width, this.units[i].height)
      // console.log(this.units[i])
      if (mouseOverUnit && mouseIsPressed) {
        // console.log(this.units[i]);
        this.handleY = this.units[i].midpoint;
        this.activeNote = this.units[i].note;
        // console.log(this.units[i].midpoint);
        // console.log(this.activeNote);
      }
    }

  }

  // Library-based collision detection implementation

  checkCollision(vehicle) {
    let hit = collideRectCircle(this.x, this.y, this.width, this.height, vehicle.pos.x, vehicle.pos.y, 20);
    if (hit) {
      this.fillVal = 255
    } else {
      this.fillVal = 0
    }
    // console.log(hit)
  }

  // Raw collision detection implementation

  // checkCollision(vehicle) {
  //   // Check if the vehicle is hovering over the tile
  //   if (
  //     vehicle.pos.x > this.x &&
  //     vehicle.pos.x < this.x + this.width &&
  //     vehicle.pos.y > this.y &&
  //     vehicle.pos.y < this.y + this.height
  //   ) {
  //     this.isHovered = true;
  //   } else {
  //     this.isHovered = false;
  //   }

  //   // Update the color gradually when hover changes
  //   if (this.isHovered) {
  //     // this.currentColor = lerpColor(this.currentColor, this.hoverColor, this.fadeSpeed);
  //     // this.currentColor = this.hoverColor
  //     // if (midiOutput) {
  //     //     // midiOut.channels[this.channel].playNote(this.activeNote);
  //     //     // midiOut.channels[1].sendNoteOn(getMIDINoteFromSPN(this.activeNote), {duration: 1000});
  //     //     sendMIDINoteOn();
  //     //     console.log(this.activeNote)
  //     // }
  //     console.log('Yo')
  //   } else {
  //     // this.currentColor = lerpColor(this.currentColor, this.defaultColor, this.fadeSpeed);
  //     this.currentColor = 0;
  //     // midiOut.channels[1].sendNoteOff(getMIDINoteFromSPN(this.activeNote));
  //     // sendMIDINoteOff();
  //   }
  // }

  display() {

    // console.log(this.scale);

    // Outer shell
    // fill(this.currentColor);
    fill(this.fillVal)
    stroke(255);
    rect(this.x, this.y, this.width, this.height)

    // Inner shell
    rect(this.innerShellX, this.innerShellY, 12, this.innerShellHeight)
  
    // Units
    for (let i = 0; i < this.units.length; i++) {
   
      // TODO: Gradient

      // Gradient attempt 1
      // let white = color(255);
      // let black = color(0);
      // let whiteToBlack = lerpColor(white, black, i/14);
      // let blackToWhite = lerpColor(black, white, i/14);
      // let gradient = lerpColor(whiteToBlack, blackToWhite, i/7)
      // gradient.setAlpha(0)
      // fill(whiteToBlack)
      // fill(blackToWhite)
      // fill(255)
      // let unitY = i * (this.height-98)/14 + this.innerShellY;

      rect(this.units[i].x, this.units[i].y, this.units[i].width, this.units[i].height);
  
    }

    // Handle
    fill(255)
    stroke(255)
    // noFill()
    // let activeIndex = this.units.findIndex(obj => obj.active === true);
    // console.log(activeIndex)
    
    // TODO: Smooth motion
    rect(this.handleX, this.handleY, this.handleSize, this.handleSize)
  }

}

class Vehicle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.target = createVector(width/2 + 500, height/2);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.force = createVector(1, 0)
    this.damping = 0.5;
    this.stiffness = 0.5;
    this.isOverTile = false;
    this.noteActive = false;
  }

  move() {
    // this.x += random(-10, 10);
    // this.y += random(-10, 10);
    // this.pos.x = this.pos.x + 5;

    // if (this.pos.x > this.target.x) {
    //     this.pos.x = width/2 - 200;
    // }

    // this.vel.x = this.vel.x + this.acc.x;
    // this.pos.x = this.pos.x + this.vel.x;
    // this.vel.limit(5)

    this.force.mult(this.stiffness)
    this.acc.add(this.force)
    // console   .log(this.acc)
    this.vel.add(this.acc)
    this.vel.mult(this.damping)
    // this.vel.limit(10)
    this.pos.add(this.vel)

    if (this.pos.x > this.target.x) {
        this.pos.x = width/2 - 500
    }
  }

  // checkCollision(tile) {
  //   let hit = collideRectCircle(tile.x, tile.y, tile.width, tile.height, this.pos.x, this.pos.y, 20);
  //   // console.log(tile.x)

  //   if(hit == true) {
  //     this.noteActive = true;
  //   } else {
  //     this.noteActive = false;
  //   }

  //   console.log(this.noteActive)
  // }

  // sendNote() {
  //   if (this.noteActive == true) {
  //     // console.log('Start Note')
  //     midiOut.channels[1].sendNoteOn(getMIDINoteFromSPN('C3'));
      
  //   } else {
  //     midiOut.channels[1].sendNoteOff(getMIDINoteFromSPN('C3'));
  //   }
  // }

  // Write a collision detection function here
  // Get the note from the tile and display it

  display() {
    fill(255);
    stroke(255);
    ellipse(this.pos.x, this.pos.y, 20, 20);
  }
}

function sendNoteOn() {
  midiOut.channels[1].sendNoteOn(getMIDINoteFromSPN('C3'));
  // isOverTile = true;
}

function sendNoteOff() {
  midiOut.channels[1].sendNoteOff(getMIDINoteFromSPN('C3'));
  // isOverTile = false;
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

// function onMIDISuccess(midiAccess) {
//   // Get the first available MIDI output
//   const outputs = midiAccess.outputs.values();
//   for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
//     midiOutput = output.value;
//     break;
//   }

//   if (!midiOutput) {
//     console.log('No MIDI output found');
//   }
// }

// function onMIDIFailure() {
//   console.log('Failed to access MIDI devices');
// }


// function sendMIDINoteOn() {
//   if (midiOutput && !isNoteOn) {
//     // Send MIDI note-on message
//     const noteOnMessage = [0x90, noteNumber, 0x7f]; // MIDI note-on status byte: 0x90, velocity: 0x7f
//     midiOutput.send(noteOnMessage);
//     isNoteOn = true;
//   }
// }

// function sendMIDINoteOff() {
//   if (midiOutput && isNoteOn) {
//     // Send MIDI note-off message
//     const noteOffMessage = [0x80, noteNumber, 0x00]; // MIDI note-off status byte: 0x80, velocity: 0x00
//     midiOutput.send(noteOffMessage);
//     isNoteOn = false;
//   }
// }

// function onMidiEnabled() {
// 	console.log("WebMidi enabled!")

// 	// Inputs
// 	console.log("Inputs:")
// 	WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name));

// 	// Outputs
// 	console.log("Outputs:")
// 	WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name));

//     let midiOutSelect = document.getElementById('midiout-select');
//     for (let output of WebMidi.outputs) {
//         let opt = document.createElement('option');
//         opt.value = output.name;
//         opt.innerHTML = output.name;
//         midiOutSelect.appendChild(opt);
//     }
// }


// class SliderTile {
//   constructor(x, y, minValue, maxValue) {
//     this.x = x;
//     this.y = y;
//     this.width = 50;
//     this.height = 600;
//     this.slider = createSlider(minValue, maxValue, 0);
//     this.slider.position(this.x - 239, this.y + 280);
//     this.slider.style('transform: rotate(-90deg)');
//     this.slider.style('width: 525px')
//   }

//   getValue() {
//     return this.slider.value();
//   }

//   display() {
//     fill(220);
//     rect(this.x, this.y, this.width, this.height);
//     textAlign(CENTER);
//     textSize(20);
//     fill(0);
//     text(this.slider.value(), this.x + this.width / 2, this.y + this.height - 20);
//   }
// }