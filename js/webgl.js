



var gl = document.getElementById('gl').getContext('webgl') ||
         document.getElementById('gl').getContext('experimental-webgl');
         

function InitWebGL() {

    if(!gl) {
        alert('webgl not supported');
        return;
    }

    let canvas = document.getElementById('gl');
    if(canvas.width != canvas.clientWidth ||
       canvas.height != canvas.clientHeight) {

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    InitViewport();
}

function InitViewport() {

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.4, 0.6, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    InitShaders();
}

function InitShaders() {

    const vertex = InitVertexShader();
    const fragment = InitFragmentShader();

    let program = InitShaderProgram(vertex, fragment);

    if(!ValidateShaderProgram(program)) return false;

    return CreateGeometryBuffers(program);
}

function InitVertexShader() {
    let e = document.getElementById('vs');
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, e.value);
    gl.compileShader(vs);

    if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        let e = gl.getSHaderInfoLog(vs);
        console.error('failed vertex ', e);
        return;
    }

    return vs;
}

function InitFragmentShader() {
    let e = document.getElementById('fs');
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, e.value);
    gl.compileShader(fs);

    if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        let e = gl.getSHaderInfoLog(fs);
        console.error('failed vertex ', e);
        return;
    }

    return fs;
}

function InitShaderProgram(vs, fs) {
    let p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        // Write error to console
        console.error(gl.getProgramInfoLog(p));
        alert('Failed linking program');
        return;
    }

    return p;
}

function ValidateShaderProgram(p) {
    gl.validateProgram(p);
    
    if(!gl.getProgramParameter(p, gl.VALIDATE_STATUS)) {
        console.error(gl.getProgramInfoLog(p));
        alert('Errors found validating shader program');
        return false;
    }

    return true;
}


function CreateGeometryBuffers(program) {
    
    const vertices = 
        [0.0, 0.5, 0.0, 1.0, 0.0, 0.0,
        -0.5,-0.5, 0.0, 0.0, 1.0, 0.0, 
        0.5,-0.5, 0.0, 0.0, 0.0, 1.0];

    CreateVBO(program, new Float32Array(vertices));
    
    gl.useProgram(program);

    Render();
}

function CreateVBO(program, vert) {
    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER,vert,gl.STATIC_DRAW);
    
    const s = 6 * Float32Array.BYTES_PER_ELEMENT;
    let p = gl.getAttribLocation(program,'Pos');
    gl.vertexAttribPointer(p, 3, gl.FLOAT, gl.FALSE, s, 0); 
    gl.enableVertexAttribArray(p);

    const o = 3 * Float32Array.BYTES_PER_ELEMENT;
    let c = gl.getAttribLocation(program, 'Color');
    gl.vertexAttribPointer(c, 3, gl.FLOAT, gl.FALSE, s, o);
    gl.enableVertexAttribArray(c);
}

function Render(){
    gl.clearColor(0.0, 0.4, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}







