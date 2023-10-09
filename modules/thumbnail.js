import Display from "./display.js"
import Widgets from "./widgets.js"

const methods = ['setup', 'loop']

function refreshDisplay(source) {
    Display.clearScreen(Utils.convert16To24Bits(source.bgColor))

    methods.forEach(m => {
        source[m].forEach(e => {
            Widgets.All.forEach(w => {
                if (w.is(e.type)) {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            w.render(e)        
                        });
                    });                    
                }
            })
        })
    })
}

Display.createDisplay()