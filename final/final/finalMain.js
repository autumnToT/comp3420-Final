'use strict';

  // Global variables that are set and used
  // across the application
  let gl;

  // GLSL programs
  let phongProgram;
  let textureProgram;
  // VAOs for the objects
  let floor, ball, lampBase, lampArm1, lampArm2, lampShade;
   // --- NEW --- variable for new model
  let magBowlModel; // credit to https://www.cgtrader.com/free-3d-models/furniture/appliance/bowls-and-magazine created by winzmuc
  // textures
  let woodTexture;
  // rotation
  let rotationAngle = 0;
 
//
// create shapes and VAOs for objects.
// Note that you will need to bindVAO separately for each object / program based
// upon the vertex attributes found in each program
//
function createShapes() {
  floor = new Cube(1);
  ball = new Sphere(20, 20);
  lampBase = new Cube(1);
  lampArm1 = new Cube(1);
  lampArm2 = new Cube(1);
  lampShade = new Cone(20, 1);
  // --- NEW --- placeholder object for the model that will be loaded.
  magBowlModel = new cgIShape();
}


//
// Here you set up your camera position, orientation, and projection
// Remember that your projection and view matrices are sent to the vertex shader
// as uniforms, using whatever name you supply in the shaders
//
function setUpCamera(program) {
    
    gl.useProgram (program);
    
    // set up your projection
    const projMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projMatrix, radians(50), gl.canvas.width / gl.canvas.height, 0.1, 100.0);
    gl.uniformMatrix4fv(program.uProjT, false, projMatrix);
    // set up your view
    const viewMatrix = glMatrix.mat4.create();

    // making it orbit the scene.
    const radius = 6.5; 
    const camX = Math.sin(radians(rotationAngle)) * radius;
    const camZ = Math.cos(radians(rotationAngle)) * radius;
    
    glMatrix.mat4.lookAt(viewMatrix, [camX, 4, camZ], [0, 1, 1], [0, 1, 0]);
  
    gl.uniformMatrix4fv(program.uViewT, false, viewMatrix);

}


//
// load up the textures you will use in the shader(s)
// The setup for the globe texture is done for you
// Any additional images that you include will need to
// set up as well.
//
function setUpTextures(){
    
    // flip Y for WebGL
    gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
    
    // get some texture space from the gpu
    woodTexture = gl.createTexture();
    // load the actual image
    var worldImage = document.getElementById ('wood-texture');
    //worldImage.crossOrigin = "";
        
    // bind the texture so we can perform operations on it
    gl.bindTexture(gl.TEXTURE_2D, woodTexture);
        
    // load the texture data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, worldImage);
        
    // set texturing parameters
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}

//
//  This function draws all of the shapes required for your scene
// 
    function drawShapes() {
      // --- UPDATED --- Increment the rotation angle for animation
      rotationAngle += 0.5;

      const lightPosition = [0, 0.9, 0];

      // to match the moving camera.
      const radius = 6.5;
      const camX = Math.sin(radians(rotationAngle)) * radius;
      const camZ = Math.cos(radians(rotationAngle)) * radius;
      const cameraPosition = [camX, 3, camZ];

      // --- 1. Draw the Floor (Texture Program) ---
      gl.useProgram(textureProgram);
      setUpCamera(textureProgram);
      gl.uniform3fv(textureProgram.uLightPos, lightPosition);
        
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, woodTexture);
      gl.uniform1i(textureProgram.uTexture, 0);

      let modelMatrix = glMatrix.mat4.create();
      glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, -1.0, 0]);
      glMatrix.mat4.scale(modelMatrix, modelMatrix, [10, 0.1, 10]);
      gl.uniformMatrix4fv(textureProgram.uModelT, false, modelMatrix);

      gl.bindVertexArray(floor.VAO);
      gl.drawElements(gl.TRIANGLES, floor.indices.length, gl.UNSIGNED_SHORT, 0);

      // --- 2. Draw the Ball and Lamp (Phong Program) ---
      gl.useProgram(phongProgram);
      setUpCamera(phongProgram);
      gl.uniform3fv(phongProgram.uLightPos, lightPosition);
      gl.uniform3fv(phongProgram.uCameraPos, cameraPosition);

      // --- Draw Ball ---
      setMaterial([0.05, 0.1, 0.15], [0.3, 0.5, 0.9], [1.0, 1.0, 1.0], 50.0);
      modelMatrix = glMatrix.mat4.create();
      glMatrix.mat4.translate(modelMatrix, modelMatrix, [1.5, -0.6, 0.0]);
      glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.8, 0.8, 0.8]);
      gl.uniformMatrix4fv(phongProgram.uModelT, false, modelMatrix);
      gl.bindVertexArray(ball.VAO);
      gl.drawElements(gl.TRIANGLES, ball.indices.length, gl.UNSIGNED_SHORT, 0);

      // --- Draw Lamp ---
      setMaterial([0.1, 0.1, 0.1], [0.7, 0.7, 0.7], [0.5, 0.5, 0.5], 20.0);
      
      // Base
      let baseMatrix = glMatrix.mat4.create();
      glMatrix.mat4.translate(baseMatrix, baseMatrix, [0, -0.9, 0]);
      let baseEnd = glMatrix.mat4.clone(baseMatrix); 
      glMatrix.mat4.scale(baseMatrix, baseMatrix, [1, 0.2, 1]);
      gl.uniformMatrix4fv(phongProgram.uModelT, false, baseMatrix);
      gl.bindVertexArray(lampBase.VAO);
      gl.drawElements(gl.TRIANGLES, lampBase.indices.length, gl.UNSIGNED_SHORT, 0);

      // Lower Arm 
      let lowerArmMatrix = glMatrix.mat4.clone(baseEnd); 
      glMatrix.mat4.translate(lowerArmMatrix, lowerArmMatrix, [0, 0.1, 0]); 
      glMatrix.mat4.rotateZ(lowerArmMatrix, lowerArmMatrix, radians(45));  
      let lowerArmEnd = glMatrix.mat4.clone(lowerArmMatrix); 
      glMatrix.mat4.translate(lowerArmMatrix, lowerArmMatrix, [0, 0.6, 0]); 
      glMatrix.mat4.scale(lowerArmMatrix, lowerArmMatrix, [0.15, 1.2, 0.15]); 
      gl.uniformMatrix4fv(phongProgram.uModelT, false, lowerArmMatrix);
      gl.bindVertexArray(lampArm1.VAO);
      gl.drawElements(gl.TRIANGLES, lampArm1.indices.length, gl.UNSIGNED_SHORT, 0);
        
      // Upper Arm
      let upperArmMatrix = glMatrix.mat4.clone(lowerArmEnd); 
      glMatrix.mat4.translate(upperArmMatrix, upperArmMatrix, [0, 1.2, 0]);
      glMatrix.mat4.rotateZ(upperArmMatrix, upperArmMatrix, radians(-90)); 
      let upperArmEnd = glMatrix.mat4.clone(upperArmMatrix); 
      glMatrix.mat4.translate(upperArmMatrix, upperArmMatrix, [0, 0.6, 0]); 
      glMatrix.mat4.scale(upperArmMatrix, upperArmMatrix, [0.15, 1.2, 0.15]); 
      gl.uniformMatrix4fv(phongProgram.uModelT, false, upperArmMatrix);
      gl.bindVertexArray(lampArm2.VAO);
      gl.drawElements(gl.TRIANGLES, lampArm2.indices.length, gl.UNSIGNED_SHORT, 0);

      // Lamp Shade
      let headMatrix = glMatrix.mat4.clone(upperArmEnd);
      glMatrix.mat4.translate(headMatrix, headMatrix, [0, 1.2, 0]);
      glMatrix.mat4.rotateZ(headMatrix, headMatrix, radians(-80)); 
      glMatrix.mat4.rotateY(headMatrix, headMatrix, radians(45));  
      glMatrix.mat4.rotateX(headMatrix, headMatrix, radians(180)); 
      glMatrix.mat4.scale(headMatrix, headMatrix, [0.8, 1.0, 0.8]);
      gl.uniformMatrix4fv(phongProgram.uModelT, false, headMatrix);
      gl.bindVertexArray(lampShade.VAO);
      gl.drawElements(gl.TRIANGLES, lampShade.indices.length, gl.UNSIGNED_SHORT, 0);

       // --- NEW --- Draw the External Model
      if(magBowlModel && magBowlModel.VAO){
        setMaterial([0.05, 0.05, 0.05], [0.1, 0.1, 0.1], [1.0, 1.0, 1.0], 100.0); 
          modelMatrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(modelMatrix, modelMatrix, [-1.2, -0.9, 0]);
        glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]); // Scale to fit the scene
        gl.uniformMatrix4fv(phongProgram.uModelT, false, modelMatrix);
        gl.bindVertexArray(magBowlModel.VAO);
        gl.drawElements(gl.TRIANGLES, magBowlModel.indices.length, gl.UNSIGNED_INT, 0);
      }
    }


  //
  // Use this function to create all the programs that you need
  // You can make use of the auxillary function initProgram
  // which takes the name of a vertex shader and fragment shader
  //
  // Note that after successfully obtaining a program using the initProgram
  // function, you will beed to assign locations of attribute and unifirm variable
  // based on the in variables to the shaders.   This will vary from program
  // to program.
  //
  function initPrograms() {
    // Create and link the Phong shader program
    phongProgram = initProgram('phong-V', 'phong-F');
    phongProgram.uModelT = gl.getUniformLocation(phongProgram, 'uModelT');
    phongProgram.uViewT = gl.getUniformLocation(phongProgram, 'uViewT');
    phongProgram.uProjT = gl.getUniformLocation(phongProgram, 'uProjT');
    phongProgram.uLightPos = gl.getUniformLocation(phongProgram, 'uLightPos');
    phongProgram.uCameraPos = gl.getUniformLocation(phongProgram, 'uCameraPos');
    phongProgram.uAmbientColor = gl.getUniformLocation(phongProgram, 'uAmbientColor');
    phongProgram.uDiffuseColor = gl.getUniformLocation(phongProgram, 'uDiffuseColor');
    phongProgram.uSpecularColor = gl.getUniformLocation(phongProgram, 'uSpecularColor');
    phongProgram.uShininess = gl.getUniformLocation(phongProgram, 'uShininess');

    // Create and link the Texture shader program
    textureProgram = initProgram('texture-V', 'texture-F');
    textureProgram.uModelT = gl.getUniformLocation(textureProgram, 'uModelT');
    textureProgram.uViewT = gl.getUniformLocation(textureProgram, 'uViewT');
    textureProgram.uProjT = gl.getUniformLocation(textureProgram, 'uProjT');
    textureProgram.uLightPos = gl.getUniformLocation(textureProgram, 'uLightPos');
    textureProgram.uTexture = gl.getUniformLocation(textureProgram, 'uTexture');
  }


  // creates a VAO and returns its ID
  function bindVAO (shape, program) {
      //create and bind VAO
      let theVAO = gl.createVertexArray();
      gl.bindVertexArray(theVAO);
      
      // create and bind vertex buffer
      let myVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, myVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.points), gl.STATIC_DRAW);
      let aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
      gl.enableVertexAttribArray(aVertexPosition);
      gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
      
      // add code for any additional vertex attribute
      
      // Normals
      let normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.normals), gl.STATIC_DRAW);
      let aNormal = gl.getAttribLocation(program, 'aNormal');
      gl.enableVertexAttribArray(aNormal);
      gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

      // UVs (only for the texture program)
      let aUV = gl.getAttribLocation(program, 'aUV');
      if (aUV !== -1) {
        let uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.uv), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(aUV);
        gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
      }
      
      // Setting up the IBO
      let myIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
      let indexArray = shape.indices.length > 65535 ? new Uint32Array(shape.indices) : new Uint16Array(shape.indices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

      // Clean
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      
      return theVAO;
  }


/////////////////////////////////////////////////////////////////////////////
//
//  You shouldn't have to edit anything below this line...but you can
//  if you find the need
//
/////////////////////////////////////////////////////////////////////////////

function setMaterial(ambient, diffuse, specular, shininess) {
    gl.uniform3fv(phongProgram.uAmbientColor, ambient);
    gl.uniform3fv(phongProgram.uDiffuseColor, diffuse);
    gl.uniform3fv(phongProgram.uSpecularColor, specular);
    gl.uniform1f(phongProgram.uShininess, shininess);
}

// Given an id, extract the content's of a shader script
// from the DOM and return the compiled shader
function getShader(id) {
  const script = document.getElementById(id);
  const shaderString = script.text.trim();

  // Assign shader depending on the type of shader
  let shader;
  if (script.type === 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else if (script.type === 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else {
    return null;
  }

  // Compile the shader using the supplied shader code
  gl.shaderSource(shader, shaderString);
  gl.compileShader(shader);

  // Ensure the shader is valid
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


  //
  // compiles, loads, links and returns a program (vertex/fragment shader pair)
  //
  // takes in the id of the vertex and fragment shaders (as given in the HTML file)
  // and returns a program object.
  //
  // will return null if something went wrong
  //
  function initProgram(vertex_id, fragment_id) {
    const vertexShader = getShader(vertex_id);
    const fragmentShader = getShader(fragment_id);

    // Create a program
    let program = gl.createProgram();
      
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Could not initialize shaders');
      return null;
    }
      
    return program;
  }


  //
  // We call draw to render to our canvas
  //
  function draw() {
    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      
    // draw your shapes
    drawShapes();

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    requestAnimationFrame(draw);
  }

  // Entry point to our application
  async function init() {
      
    // Retrieve the canvas
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) {
      console.error(`There is no canvas with id ${'webgl-canvas'} on this page.`);
      return null;
    }

    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);

    // Retrieve a WebGL context
    gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error(`There is no WebGL 2.0 context`);
        return null;
      }
      
    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);
      
    // Set the clear color to be black
    gl.clearColor(0, 0, 0, 1);
      
    // some GL initialization
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    // gl.clearColor(0.0,0.0,0.0,1.0)
    gl.depthFunc(gl.LEQUAL)
    gl.clearDepth(1.0)

    // Read, compile, and link your shaders
    initPrograms();
    
    // create and bind your current object
    createShapes();

    await fetch('magBowl.obj')
        .then(response => response.text())
        .then(text => { Object.assign(magBowlModel, parseOBJ(text)); });

    setUpTextures();

    // We must create the VAOs after the programs and shapes are ready.
    floor.VAO = bindVAO(floor, textureProgram);
    ball.VAO = bindVAO(ball, phongProgram);
    lampBase.VAO = bindVAO(lampBase, phongProgram);
    lampArm1.VAO = bindVAO(lampArm1, phongProgram);
    lampArm2.VAO = bindVAO(lampArm2, phongProgram);
    lampShade.VAO = bindVAO(lampShade, phongProgram);

    if (magBowlModel.points.length > 0) {
        magBowlModel.VAO = bindVAO(magBowlModel, phongProgram);
        gl.getExtension('OES_element_index_uint');
    }
    
    // do a draw
    draw();
  }