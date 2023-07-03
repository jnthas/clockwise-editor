

const container = document.querySelector('.led-matrix')
//const sizeEl = document.querySelector('.size')
let size = 64
const color = document.querySelector('.color')
const buttons = document.getElementsByClassName('btn')

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


//buttons[0].addEventListener('click', reset)
//buttons[1].addEventListener('click', test)

// sizeEl.addEventListener('keyup', function(){
//     size = sizeEl.value
//     reset()
// })

populate(size)