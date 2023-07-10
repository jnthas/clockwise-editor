

const size = 64
const container = document.querySelector('.led-matrix')
const color = document.querySelector('.color')
const buttons = document.getElementsByClassName('btn')

const FONTS = {
    "square": [7,11,1],
    "picopixel": [3,4,1],
    "": [5,7,1],
    "default": [5,7,1],
    "medium": [5,10,1]
}

//let draw = false

let pixels = null
let source = null

function populate(size) {
  container.style.setProperty('--size', size)
  for (let i = 0; i < size * size; i++) {
    const div = document.createElement('div')
    div.classList.add('pixel')

    container.appendChild(div)
  }

  pixels = document.getElementsByClassName('pixel')
}

function reset() {
    container.innerHTML = ''
    populate(size)
}

function drawPixel(x, y, color) {
    let pos = (64 * y) + x;

    if (pos >= 4096 || pos < 0) return;

    //if (color == "#000000") color = "#3d3d3d";
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
    drawVLine(x, y, height, color);
    drawVLine(x+width-1, y, height, color);
}

function drawText(x, y, text, color, char_size) {
    // char_size = [width, height, space]

    if (!char_size) char_size = FONTS["default"]

    for (let i = 0; i < text.length; i++) {
        //if (text.charAt(i).match(/^[A-Za-z]+$/)) {
        if (text.charAt(i) != ' ') {
            drawRect(x, y-char_size[1], char_size[0], char_size[1], color );
        }
        x += char_size[0] + char_size[2];
    }
}


function drawImage(x, y, image) {
    let x_temp = x;
    let y_temp = y;

    const bin = atob(image)
    let uint8Image = new Uint8Array(bin.length);
    for (var i = 0, strLen = bin.length; i < strLen; i++) {
        uint8Image[i] = bin.charCodeAt(i);
    }
    
    png.fromImageData( uint8Image )
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

function clearScreen(color) {
    const pixels = document.querySelectorAll('.pixel')
    pixels.forEach(p => {
        p.style.backgroundColor = color
    })
}


function convert16To24Bits(color565) {

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


function convert24To16Bits(rgbColor) {

    let RGB888 = parseInt(rgbColor.replace(/^#/, ''), 16);
    let r = (RGB888 & 0xFF0000) >> 16;
    let g = (RGB888 & 0xFF00) >> 8;
    let b = RGB888 & 0xFF;
    
    r = (r * 249 + 1014) >> 11;
    g = (g * 253 + 505) >> 10;
    b = (b * 249 + 1014) >> 11;
    let RGB565 = 0;
    RGB565 = RGB565 | (r << 11);
    RGB565 = RGB565 | (g << 5);
    RGB565 = RGB565 | b;
    
    return RGB565;
}


function formatDateTime(content) {
    const oneChar = /(N|w|B)/g;
    const twoChars = /(d|j|S|m|n|t|y|a|A|g|G|h|H|i|s|W)/g;
    const threeChars = /(D|M|v|z)/g;

    //l 7 chars
    //F 8
    //Y 4
    //T
    //e
    //O 5
    //P 6

    let result = content.replace(oneChar, '1')
    result = result.replace(twoChars, '12')
    result = result.replace(threeChars, 'Tue')
    return result 
}

function reset() {
    let widgets = document.querySelectorAll('#setup-elements li')

    widgets.forEach(w => {
        if (w.id !== 'base-widget-setup') {
            w.parentNode.removeChild(w);
        }
    })


    const allProperties = document.querySelectorAll("#properties tr")

    allProperties.forEach(p => {
        let input = document.querySelectorAll("#properties #" + p.id + " input")[0]
        input.outerHTML = input.outerHTML;  //remove all event listeners
    })

}


function refresh(source_ref) {
    if (!source_ref) 
        return;

    document.getElementById("elements-title").textContent = "Project [" + source.name + "]"
    
    clearScreen(convert16To24Bits(source.bgColor))

    reset();

    let index = 0;

    source_ref.setup.forEach(e => {
        Widgets.forEach(w => {
            if (w.is(e.type)) {
                e.index = index++;
                w.handle(e)
            }
        })
    })

    index = 0;

    source_ref.loop.forEach(e => {
        Widgets.forEach(w => {
            if (w.is(e.type)) {
                e.index = index++;
                w.handle(e)
            }
        })
    })

    

    document.getElementById("source").value = JSON.stringify(source_ref, null, 2)

}


function refreshDisplay(source_ref) {
    if (!source_ref) 
        return;
    
    clearScreen(convert16To24Bits(source.bgColor))

    source_ref.setup.forEach(e => {
        Widgets.forEach(w => {
            if (w.is(e.type)) {
                w.handle(e)
            }
        })
    })

    source_ref.loop.forEach(e => {
        Widgets.forEach(w => {
            if (w.is(e.type)) {
                w.handle(e)
            }
        })
    })

    document.getElementById("source").value = JSON.stringify(source_ref, null, 2)
}

function loadJSON(str_source) {
    if (!str_source) 
        return;

    source = JSON.parse(str_source)
    refresh(source)

    document.querySelectorAll('#setup-elements input[type="radio"]')[0].click()
}


function newTheme() {

    source = {
        "name": "New",
        "version": 1,
        "author": "",
        "bgColor": 0, 
        "delay": 250,
        "setup": [],
        "sprites": [],
        "loop": []
    }
    refresh(source)
}

function addSetupElement(obj, widget) {
    
    const found = document.querySelector('#' + obj.type + obj.index)

    if (!found) {

        const base = document.querySelector('#base-widget-setup')
        let clone = base.cloneNode(true)
        clone.id = obj.type + obj.index;
        clone.classList.remove('w3-hide')
        clone.classList.add('w3-bar')
    
        // Title
        clone.getElementsByTagName('span')[1].innerHTML = `<i class='w3-small fa ${widget.icon}'></i> ${widget.title}`
        // Radio
        clone.getElementsByTagName('input')[0].addEventListener('click', function(){updateProperties(widget, obj.index, 'setup')})
    
        base.before(clone)

    }
}

function addLoopElement(obj, widget) {
    
    if (widget.is('sprite')) {

        const widgetIndex = obj.index
        
        let count = 0;

        source.sprites[obj.sprite].forEach(s => {

            const base = document.querySelector('#base-widget-loop')
            let clone = base.cloneNode(true)
            const imageIndex = count
            clone.id = obj.type + widgetIndex.toString() + imageIndex.toString();
            clone.classList.remove('w3-hide')
            clone.classList.add('w3-bar')        

            // Title
            clone.getElementsByTagName('span')[1].innerHTML = `<i class='w3-small fa ${widget.icon}'></i> ${widget.title}[${widgetIndex}] ${imageIndex}`
            // Radio
            clone.getElementsByTagName('input')[0].addEventListener('click', function(){updateProperties(widget, [widgetIndex, imageIndex], 'loop')})
            base.before(clone)
            count++
        })
    }
}


function updateProperties(widget, index, method) {
    
    const allProperties = document.querySelectorAll("#properties tr")

    allProperties.forEach(p => {
        if (widget.properties.includes(p.id)) {
            p.style.display = 'table-row'

            let input = document.querySelectorAll("#properties #" + p.id + " input")[0]

            input.value = widget.getValue(index, p.id)

            /***
             * widget: one of DateTimeWidget, LineWidget, TextWidget, ImageWidget, SpriteWidget, etc...
             * index: object index in the array of setup or loop
             * p.id: one of the tr.id like 'x', 'y', 'image', 'content', 'font', 'fgColor', 'bgColor', etc
             * method: 'setup' or 'loop'
             */

            const handler = function() {widget.onChange(method, index, p.id, input)}
            ///input.outerHTML = input.outerHTML;
            input.addEventListener('change', handler, false)
            
        } else {
            p.style.display = 'none'
        }

    })
}

function removeWidget(elem) {
    elem.parentElement.classList.add('w3-hide')
    elem.parentElement.classList.remove('w3-bar')
}


function setRoundedPixels(elem) {
    const pixels = document.querySelectorAll('.pixel')
    pixels.forEach(p => {
        p.style.borderRadius = (elem.checked ? '4px' : '0')
    })
}

function getInputValue(input) {
    if (input.type === 'number') {
        return parseInt(input.value)
    } else if (input.type === 'color') {
        return convert24To16Bits(input.value)
    } else {
        return input.value
    }

}

const SpriteWidget = {
    title: 'Sprite',
    icon: 'fa-film',
    properties: ['x', 'y', 'sprite', 'image'],
    is: function(type) {
        return 'sprite' === type
    },    
    handle: function(obj) {
        addLoopElement(obj, this)
        // Draws the first frame
        drawImage(obj.x, obj.y, source.sprites[obj.sprite][0].image)
    },
    getValue: function(indexes, propertyName) {

        const widgetIndex = indexes[0]
        const imageIndex = indexes[1]

        if (propertyName === 'image') {
            const spriteIndex = source.loop[widgetIndex].sprite
            // Update the current frame
            drawImage(source.loop[widgetIndex].x, source.loop[widgetIndex].y, source.sprites[spriteIndex][imageIndex].image)
            return source.sprites[spriteIndex][imageIndex].image
        }

        return source.loop[widgetIndex][propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        source[method][index][propertyName] = input.value
        refresh(source)
    }
};

const DateTimeWidget = {
    title: 'Date/Time',
    icon: 'fa-calendar',
    properties: ['x', 'y', 'content', 'font', 'fgColor', 'bgColor'],
    is: function(type) {
        return 'datetime' === type
    },    
    handle: function(obj) {
        drawText(obj.x, obj.y, formatDateTime(obj.content), convert16To24Bits(obj.fgColor), FONTS[obj.font])
        addSetupElement(obj, this)
    },
    getValue: function(widgetIndex, propertyName) {
        if (propertyName.toLowerCase().indexOf('color') >= 0) {
            return convert16To24Bits(source.setup[widgetIndex][propertyName])
        }

        return source.setup[widgetIndex][propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        source[method][index][propertyName] = getInputValue(input)
        refreshDisplay(source)
    },
    add: function() {
        let obj = {type: 'datetime', x: 0, y: 0, content: '', font: '', fgColor: 0, bgColor: 0 }
        source.setup.push(obj)
        refresh(source)
    },
    remove: function(elem) {

    }
};

const LineWidget = {
    title: 'Line',
    icon: 'fa-minus',
    properties: ['x', 'y', 'x1', 'y1', 'color'],
    is: function(type) {
        return 'line' === type
    },
    handle: function(obj) {
        drawHLine(obj.x, obj.y, obj.x1 - obj.x, convert16To24Bits(obj.color))
        addSetupElement(obj, this)
    },
    getValue: function(widgetIndex, propertyName) {
        if (propertyName.toLowerCase().indexOf('color') >= 0) {
            return convert16To24Bits(source.setup[widgetIndex][propertyName])
        }

        return source.setup[widgetIndex][propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        source[method][index][propertyName] = getInputValue(input)
        refresh(source)
    }
};


const TextWidget = {
    title: 'Text',
    icon: 'fa-font',
    properties: ['x', 'y', 'content', 'font', 'fgColor', 'bgColor'],
    is: function(type) {
        return 'text' === type
    },
    handle: function(obj) {
        drawText(obj.x, obj.y, obj.content, convert16To24Bits(obj.fgColor), FONTS[obj.font])
        addSetupElement(obj, this)
    },
    getValue: function(widgetIndex, propertyName) {
        if (propertyName.toLowerCase().indexOf('color') >= 0) {
            return convert16To24Bits(source.setup[widgetIndex][propertyName])
        }

        return source.setup[widgetIndex][propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        source[method][index][propertyName] = getInputValue(input)
        refresh(source)
    }
};


const ImageWidget = {
    title: 'Image',
    icon: 'fa-picture-o',
    properties: ['x', 'y', 'image'],
    is: function(type) {
        return 'image' === type
    },
    handle: function(obj) {
        drawImage(obj.x, obj.y, obj.image)
        addSetupElement(obj, this)
    },
    getValue: function(widgetIndex, propertyName) {
        return source.setup[widgetIndex][propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        source[method][index][propertyName] = getInputValue(input)
        refresh(source)
    }
};

const ProjectWidget = {
    title: 'Project',
    icon: 'fa-sticky-note-o',
    properties: ['name', 'version', 'author', 'bgColor', 'delay'],
    is: function(type) {
        return false
    },
    handle: function(obj) {
    },
    getValue: function(widgetIndex, propertyName) {
        if (propertyName.toLowerCase().indexOf('color') >= 0) {
            return convert16To24Bits(source[propertyName])
        }

        return source[propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        source[propertyName] = getInputValue(input)
        refresh(source)
    }
};

const Widgets = [
    DateTimeWidget,
    LineWidget,
    TextWidget,
    ImageWidget,
    SpriteWidget
]


populate(size)