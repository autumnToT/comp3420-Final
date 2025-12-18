  'use strict';

  function gotKey (event) {
      
      var key = event.key;
      
      // Do something based on key press
      if (key === 'ArrowLeft') {
          rotationAngle -= 2.0; // Rotate left
      } else if (key === 'ArrowRight') {
          rotationAngle += 2.0; // Rotate right
      }
      // create a new shape and do a redo a draw
      // draw();
  }
  
