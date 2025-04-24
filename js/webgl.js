
var gl = document.getElementById('gl').getContext('webgl') ||
         document.getElementById('gl').getContext('experimental-webgl');

var vertices = [];

var mouseX = 0, mouseY = 0;
var angle = [ 0.0, 0.0, 0.0, 1.0 ];
var angleGL = 0;
var textureGL = 0;
var display = [0.0, 0.0, 0.0, 0.0];
var displayGL = 0;

document.getElementById('gl').addEventListener(
    'mousemove', function(e) {
    if (e.buttons == 1) {
        // Left mouse button pressed
        angle[0] -= (mouseY - e.y) * 0.02;
        angle[1] += (mouseX - e.x) * 0.02;
        gl.uniform4fv(angleGL, new Float32Array(angle));
        Render();
    }
    mouseX = e.x;
    mouseY = e.y;
});

function CreateTexture(prog, url) {
    const texture = LoadTexture(url);
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    textureGL = gl.getUniformLocation(prog, 'Texture');
    displayGL = gl.getUniformLocation(prog, 'Display');
}

function LoadTexture(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    
    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
        SetTextureFilters(image);
    };

    image.src = url;
    return texture;
}

function SetTextreFilters(image) {
    if(IsPow2(image.width) && IsPow2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    else {
        // ST = UV
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}

function IsPow2(value) {
    return (value & (value - 1)) === 0;
}

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

function AddVertex(x, y, z, r, g, b, u, v) {
    const index = vertices.length;
    vertices.length += 8;
    vertices[index + 0] = x;
    vertices[index + 1] = y;
    vertices[index + 2] = z;
    vertices[index + 3] = r;
    vertices[index + 4] = g;
    vertices[index + 5] = b;
    vertices[index + 6] = u;
    vertices[index + 7] = v;
}

function AddTriangle(
    x1, y1, z1, r1, g1, b1, u1, v1,
    x2, y2, z2, r2, g2, b2, u2, v2,
    x3, y3, z3, r3, g3, b3, u3, v3) {

    AddVertex(x1, y1, z1, r1, g1, b1, u1, v1);
    AddVertex(x2, y2, z2, r2, g2, b2, u2, v2);
    AddVertex(x3, y3, z3, r3, g3, b3, u3, v3);
}

function AddQuad(
    x1, y1, z1, r1, g1, b1, u1, v1,
    x2, y2, z2, r2, g2, b2, u2, v2,
    x3, y3, z3, r3, g3, b3, u3, v3,
    x4, y4, z4, r4, g4, b4, u4, v4) {

    AddTriangle(
        x1, y1, z1, r1, g1, b1, u1, v1,
        x2, y2, z2, r2, g2, b2, u2, v2,
        x3, y3, z3, r3, g3, b3, u3, v3); 
    
    AddTriangle(
        x3, y3, z3, r3, g3, b3, u3, v3,
        x4, y4, z4, r4, g4, b4, u4, v4,
        x1, y1, z1, r1, g1, b1, u1, v1);
}


function CreateTriangle(width, height) {
    vertices.length = 0;
    const w = width * 0.5;
    const h = height * 0.5;
    AddTriangle(
        0.0, h, 0.0, 1.0, 0.0, 0.0, 0.5, 1.0,
        -w, -h, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
        w, -h, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0);
}

function CreateQuad(width, height) {
    vertices.length = 0;
    const w = width * 0.5;
    const h = height * 0.5;
    AddQuad(
        -w, h, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 
        -w,-h, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
        w,-h, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0,
        w, h, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0);      
}
    
function CreateBox(width, height, length) {
    vertices.length = 0;
    const w = width * 0.5;
    const h = height * 0.5;
    const l = length * 0.5;

    AddQuad(
        -w, h, -l, 1.0, 0.0, 0.0, 0.0, 1.0,
        -w,-h, -l, 1.0, 0.0, 0.0, 0.0, 0.0,
        w, -h, -l, 1.0, 0.0, 0.0, 1.0, 0.0,
        w, h, -l, 1.0, 0.0, 0.0, 1.0, 1.0);

    AddQuad(
        w, h, l, 0.0, 0.0, 1.0, 0.0, 1.0,
        w,-h, l, 0.0, 0.0, 1.0, 0.0, 0.0,
        -w,-h, l, 0.0, 0.0, 1.0, 1.0, 0.0,
        -w, h, l, 0.0, 0.0, 1.0, 1.0, 1.0);  

    AddQuad(
        -w, h, l, 0.0, 1.0, 1.0, 0.0, 1.0,
        -w, -h, l, 0.0, 1.0, 1.0, 0.0, 0.0,
        -w, -h, -l, 0.0, 1.0, 1.0, 1.0, 0.0,
        -w, h, -l, 0.0, 1.0, 1.0 , 1.0, 1.0);

    AddQuad(
        w, -h, l, 0.0, 1.0, 0.0, 0.0, 1.0,
        w, h, l, 0.0, 1.0, 0.0, 0.0, 0.0,
        w, h, -l, 0.0, 1.0, 0.0, 1.0, 0.0,
        w, -h, -l, 0.0, 1.0, 0.0, 1.0, 1.0);

    AddQuad(
        -w, h, l, 1.0, 1.0, 0.0,  0.0, 1.0,
        -w, h, -l, 1.0, 1.0, 0.0, 0.0, 0.0,
        w, h, -l, 1.0, 1.0, 0.0, 1.0, 0.0,
        w, h, l, 1.0, 1.0, 0.0,  1.0, 1.0);
    
    AddQuad(
        -w, -h, l, 1.0, 0.0, 1.0, 0.0, 1.0,
        w, -h, l, 1.0, 0.0, 1.0, 0.0, 0.0,
        w, -h, -l, 1.0, 0.0, 1.0, 1.0, 0.0,
        -w, -h, -l, 1.0, 0.0, 1.0, 1.0, 1.0);
}

function CreateSubdividedBox(width, height, length, divX, divY, divZ) {
    vertices.length = 0;
    const w = width * 0.5;
    const h = height * 0.5;
    const l = length * 0.5;
    const subw = width / divX;
    const subh = height / divY;
    const subl = length / divZ;
    
    for (let j = 0; j < divY; j++) {
        for (let i = 0; i < divX; i++) {
            const posY = j * subh;
            const posX = i * subw;
            const offsetX = (i + 1) * subw;
            const offsetY = (j + 1) * subh;
            const bw = (i + j) % 2 === 0 ? 1.0 : 0.0;

            AddQuad(
                -w + posX , -h + offsetY, -l, bw, bw, bw, 0.0, 1.0,
                -w + posX, -h + posY, -l, bw, bw, bw, 0.0, 0.0,
                -w + offsetX, -h + posY, -l, bw, bw, bw, 1.0, 0.0,
                -w + offsetX, -h + offsetY, -l, bw, bw, bw, 1.0, 1.0);     
            
            AddQuad(
                w - posX, h - posY, l, bw, bw, bw, 0.0, 1.0,
                w - posX, h - offsetY, l, bw, bw, bw, 0.0, 0.0,
                w - offsetX, h - offsetY, l, bw, bw, bw, 1.0, 0.0,
                w - offsetX, h - posY, l, bw, bw, bw, 1.0, 1.0); 
        }       
    }
    
    for (let j = 0; j < divZ; j++) {
        for (let i = 0; i < divY; i++) {
            const posZ = j * subl;
            const posY = i * subh;
            const offsetY = (i + 1) * subh;
            const offsetZ = (j + 1) * subl;
            const bw = (i + j) % 2 === 1 ? 1.0 : 0.0;

            AddQuad(
                -w, -h + posY, -l + offsetZ, bw, bw, bw, 0.0, 1.0,
                -w, -h + posY, -l + posZ, bw, bw, bw, 0.0, 0.0, 
                -w, -h + offsetY, -l + posZ, bw, bw, bw, 1.0, 0.0, 
                -w, -h + offsetY, -l + offsetZ, bw, bw, bw, 1.0, 1.0);     
            AddQuad(
                w, -h + posY, -l + posZ, bw, bw, bw, 0.0, 1.0,
                w, -h + posY, -l + offsetZ, bw, bw, bw, 0.0, 0.0,
                w, -h + offsetY, -l + offsetZ, bw, bw, bw, 1.0, 0.0,
                w, -h + offsetY, -l + posZ, bw, bw, bw, 1.0, 1.0);
        }       
    }
    
    for (let j = 0; j < divZ; j++) {
        for (let i = 0; i < divX; i++) {
            const posZ = j * subl;
            const posX = i * subw;
            const offsetX = (i + 1) * subw;
            const offsetZ = (j + 1) * subl;
            const bw = (i + j) % 2 === 0 ? 1.0 : 0.0;

            AddQuad(
                w - posX, -h, -l + offsetZ, bw, bw, bw,     0.0, 1.0, 
                w - posX, -h, -l + posZ, bw, bw, bw,       0.0, 0.0,
                w - offsetX, -h, -l + posZ, bw, bw, bw,    1.0, 0.0,
                w - offsetX, -h, -l + offsetZ, bw, bw, bw, 1.0, 1.0);    
            AddQuad(
                w - posX, h, -l + posZ, bw, bw, bw,          0.0, 1.0,
                w - posX, h, -l + offsetZ, bw, bw, bw, 0.0, 0.0,
                w - offsetX, h, -l + offsetZ, bw, bw, bw,1.0, 0.0,
                w - offsetX, h, -l + posZ, bw, bw, bw, 1.0, 1.0);
        }       
    }
}

function CreateGeometryBuffers(program) {
    CreateGeometryUI();

    CreateVBO(program, new Float32Array(vertices));

    angleGL = gl.getUniformLocation(program, 'Angle');
    CreateTexture(program, 'img/1812.jpg');

    gl.useProgram(program);
    gl.uniform4fv(displayGL, new Float32Array(display));
    Render();
}

function CreateVBO(program, vert) {
    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER,vert,gl.STATIC_DRAW);
    
    const s = 8 * Float32Array.BYTES_PER_ELEMENT;
    let p = gl.getAttribLocation(program,'Pos');
    gl.vertexAttribPointer(p, 3, gl.FLOAT, gl.FALSE, s, 0); 
    gl.enableVertexAttribArray(p);

    const o = 3 * Float32Array.BYTES_PER_ELEMENT;
    let c = gl.getAttribLocation(program, 'Color');
    gl.vertexAttribPointer(c, 3, gl.FLOAT, gl.FALSE, s, o);
    gl.enableVertexAttribArray(c);
    
    const o2 = o * 2;
    let u = gl.getAttribLocation(program, 'UV');
    gl.vertexAttribPointer(c, 2, gl.FLOAT, gl.FALSE, s, o2);
    gl.enableVertexAttribArray(u);
}

function Render(){
    gl.clearColor(0.0, 0.4, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
}

function CreateGeometryUI() {
    const ew = document.getElementById('w');
    const eh = document.getElementById('h');
    const el = document.getElementById('l');
    const ex = document.getElementById('div-x');
    const ey = document.getElementById('div-y');
    const ez = document.getElementById('div-z');

    const w = ew ? ew.value : 0.5;
    const h = eh ? eh.value : 0.5;
    const l = el ? el.value : 0.5;
    const divX = ex ? ex.value : 4;
    const divY = ey ? ey.value : 4;
    const divZ = ez ? ez.value : 4;

    document.getElementById('ui').innerHTML =
        'Width: <input type="number" id="w" value="' + w +
        '" onchange="InitShaders();"<br>' + 
        'Height: <input type="number" id="h" value="' + h +
        '" onchange="InitShaders();"><br>' +
        'Length: <input type="number" id="l" value="' + l +
        '" onchange="InitShaders();">' + 
        'Div X: <input type="number" id="div-x" value="' + divX +
        '" onchange="InitShaders();">' +
        'Div Y: <input type="number" id="div-y" value="' + divY +
        '" onchange="InitShaders();">' +
        'Div Z: <input type="number" id="div-z" value="' + divZ +
        '" onchange="InitShaders();">';

    let e = document.getElementById('shape');
    switch (e.selectedIndex) {
        case 0: CreateTriangle(w, h); break;
        case 1: CreateQuad(w, h); break;
        case 2: CreateBox(w, h, l); break;
        case 3: CreateSubdividedBox(w, h, l, divX, divY, divZ); break;
    }
}

function Update() {
    // Show texture (boolean) last element
    const t = document.getElementById('texture');
    display[3] = t.checked ? 1.0 : 0.0;
    // Update array to graphics card and render
    gl.uniform4fv(displayGL, new Float32Array(display));
    Render();
}





