



var gl = document.getElementById('gl').getContext('webgl') ||
         document.getElementById('gl').getContext('experimental-webgl');

var vertices = [];

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


function AddVertex(x, y, z, r, g, b) {
    const index = vertices.length;
    vertices.length += 6;
    vertices[index + 0] = x;
    vertices[index + 1] = y;
    vertices[index + 2] = z;
    vertices[index + 3] = r;
    vertices[index + 4] = g;
    vertices[index + 5] = b;
}

function AddTriangle(
    x1, y1, z1, r1, g1, b1,
    x2, y2, z2, r2, g2, b2,
    x3, y3, z3, r3, g3, b3) {

    AddVertex(x1, y1, z1, r1, g1, b1);
    AddVertex(x2, y2, z2, r2, g2, b2);
    AddVertex(x3, y3, z3, r3, g3, b3);
}

function AddQuad(
    x1, y1, z1, r1, g1, b1,
    x2, y2, z2, r2, g2, b2,
    x3, y3, z3, r3, g3, b3,
    x4, y4, z4, r4, g4, b4) {

    AddTriangle(
        x1, y1, z1, r1, g1, b1,
        x2, y2, z2, r2, g2, b2,
        x3, y3, z3, r3, g3, b3); 
    
    AddTriangle(
        x3, y3, z3, r3, g3, b3,
        x4, y4, z4, r4, g4, b4,
        x1, y1, z1, r1, g1, b1);
}

function CreateTriangle(width, height) {
    vertices.length = 0;
    const w = width * 0.5;
    const h = height * 0.5;
    AddTriangle(
        0.0, h, 0.0, 1.0, 0.0, 0.0,
        -w, -h, 0.0, 0.0, 1.0, 0.0,
        w, -h, 0.0, 0.0, 0.0, 1.0);
}

function CreateQuad(width, height) {
    vertices.length = 0;
    const w = width * 0.5;
    const h = height * 0.5;
    AddQuad(
        -w, h, 0.0, 1.0, 0.0, 0.0,
        -w,-h, 0.0, 0.0, 1.0, 0.0,
        w,-h, 0.0, 0.0, 0.0, 1.0,
        w, h, 0.0, 1.0, 1.0, 0.0);
        
}
    

function CreateGeometryBuffers(program) {
    
    AddQuad(
        -0.5, 0.5, 0.0, 1.0, 0.0, 0.0,
        -0.5,-0.5, 0.0, 0.0, 1.0, 0.0,
        0.5,-0.5, 0.0, 0.0, 0.0, 1.0,
        0.5, 0.5, 0.0, 1.0, 1.0, 0.0);
        
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
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
}







