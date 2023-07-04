

const size = 64
const container = document.querySelector('.led-matrix')
const color = document.querySelector('.color')
const buttons = document.getElementsByClassName('btn')

const FONTS = {
    "square": [5,7,2],
    "picopixel": [3,4,1]
}

//let draw = false

let pixels = null

function populate(size) {
  container.style.setProperty('--size', size)
  for (let i = 0; i < size * size; i++) {
    const div = document.createElement('div')
    div.classList.add('pixel')

    // div.addEventListener('mouseover', function(){
    //     if(!draw) return
    //     div.style.backgroundColor = color.value
    // })
    // div.addEventListener('mousedown', function(){
    //     div.style.backgroundColor = color.value
    // })

    container.appendChild(div)
  }

  pixels = document.getElementsByClassName('pixel')
}

// window.addEventListener("mousedown", function(){
//     draw = true
// })
// window.addEventListener("mouseup", function(){
//     draw = false
// })

function reset(){
    container.innerHTML = ''
    populate(size)
}

function test(){
    // drawRect(5, 5, 5, 5, "#ff0000")
    // drawRect(10, 10, 5, 5, "#00ff00")
    // drawRect(15, 15, 5, 5, "#0000ff")

    // drawText(10, 55, "Hello, World", "#0000ff", [3,4,1])

    drawImage(0, 0, 'dk.png')
}

function drawPixel(x, y, color ) {
    let pos = (64 * y) + x;
    if (color == "#000000") color = "#3d3d3d";

    pixels[pos].style.backgroundColor = color
}

function drawHLine(x, y, width, color ) {
    for (let i = 0; i < width; i++) {
        drawPixel(x++, y, color);
    }
}

function drawVLine(x, y, height, color ) {
    for (let i = 0; i < height; i++) {
        drawPixel(x, y++, color);
    }
}

function drawFillRect(x, y, width, height, color ) {
    for (let i = 0; i < height; i++) {
        drawHLine(x, y++, width, color);
    }
}

function drawRect(x, y, width, height, color ) {
    drawHLine(x, y, width, color);
    drawHLine(x, y+height-1, width, color);
    drawVLine(x, y, width, color);
    drawVLine(x+width-1, y, width, color);
}

function drawText(x, y, text, color, char_size) {
    // char_size = [width, height, space]

    for (let i = 0; i < text.length; i++) {
        //if (text.charAt(i).match(/^[A-Za-z]+$/)) {
        if (text.charAt(i) != ' ') {
            drawRect(x, y, char_size[0], char_size[1], color );
        }
        x += char_size[0] + char_size[2];
    }
}


function drawImage(x, y, image) {
    let x_temp = x;
    let y_temp = y;

    png.fromURL( image )
        .then( pngData => {
            //console.log( 'png', pngData );
            let img = pngData.decodePixels()
            //console.log( 'decoded', img );

            for (let i = 0; i<img.length; i+=pngData.pixelBitlength/8) {
                // little endian
                let r = img[i];
                let g = img[i+1];
                let b = img[i+2];
                let color = "#" + 
                        r.toString(16).padStart(2, '0') + 
                        g.toString(16).padStart(2, '0') + 
                        b.toString(16).padStart(2, '0');
                
                drawPixel(x_temp++, y_temp, color);
                if (x_temp >= pngData.width + x) {
                    x_temp = x
                    y_temp++
                }
            }
        });
}



function rgb565To888(color565) {

    const redMask   = 0b1111100000000000;
    const greenMask = 0b0000011111100000;
    const blueMask  = 0b0000000000011111;

    //String color565 = "0xFFE0";
    //int colorAsInteger = Integer.parseInt(color.substring(2,color.length()), 16); // convert the Hex value to int

    const R = ((((color565 >> 11) & 0x1F) * 527) + 23) >> 6;
    const G = ((((color565 >> 5) & 0x3F) * 259) + 33) >> 6;
    const B = (((color565 & 0x1F) * 527) + 23) >> 6;

    const color = "#" + R.toString(16).padStart(2, '0') + G.toString(16).padStart(2, '0') + B.toString(16).padStart(2, '0')
    return color;
}

function loadJSON(str_source) {

    //#AFD42B
    //0xAEA5

    let source = JSON.parse(str_source)

    document.getElementById("elements-title").textContent = "Project [" + source.name + "]"

    source.setup.forEach(e => {
        if (e.type === 'line') {
            drawHLine(e.x, e.y, e.x1 - e.x, rgb565To888(e.color))
        } else if (e.type === 'datetime') {
            drawText(e.x, e.y, e.content.replace('H', '12').replace('i', '00'), rgb565To888(e.fgColor), FONTS.square )
        }

    })
}


//buttons[0].addEventListener('click', reset)
//buttons[1].addEventListener('click', test)

// sizeEl.addEventListener('keyup', function(){
//     size = sizeEl.value
//     reset()
// })

populate(size)