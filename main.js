import Global from "./modules/global.js"
import Display from "./modules/display.js"
import Utils from "./modules/utils.js"
import Widgets from "./modules/widgets.js"

function refresh(ev, source_ref) {
    if (!source_ref)
        source_ref = Global.Source;

    document.getElementById("elements-title").textContent = "Project [" + Global.Source.name + "]"
    
    Display.clearScreen(Utils.convert16To24Bits(Global.Source.bgColor))

    let index = 0;

    source_ref.setup.forEach(e => {
        Widgets.All.forEach(w => {
            if (w.is(e.type)) {
                e.index = index++;
                w.add(e)
                w.render(e)
            }
        })
    })

    index = 0;

    source_ref.loop.forEach(e => {
        Widgets.All.forEach(w => {
            if (w.is(e.type)) {
                e.index = index++;
                w.add(e)
                w.render(e)
            }
        })
    })

    document.getElementById("source").value = JSON.stringify(source_ref, null, 2)
}

function refreshDisplay(ev, source_ref) {
    if (!source_ref)
        source_ref = Global.Source;
    
    Display.clearScreen(Utils.convert16To24Bits(Global.Source.bgColor))

    source_ref.setup.forEach(e => {
        Widgets.All.forEach(w => {
            if (w.is(e.type)) {
                w.render(e)
            }
        })
    })

    source_ref.loop.forEach(e => {
        Widgets.All.forEach(w => {
            if (w.is(e.type)) {
                w.render(e)
            }
        })
    })

    document.getElementById("source").value = JSON.stringify(source_ref, null, 2)
}

function loadJSON(str_source) {
    if (!str_source) 
        return;

    Global.Source = JSON.parse(str_source)
    refresh(Global.Source)

    document.querySelectorAll('#setup-elements input[type="radio"]')[0].click()
}

function onChange() {

    console.log("on change input")
    console.log("property: ", this.parentElement.parentElement.id)
    console.log("value: ", this.value)
    
    //function(method, index, propertyName, input) {
    
    Global.SelectedWidget.widget.onChange(this)
}


function newTheme() {

    Global.Source = {
        "name": "New",
        "version": 1,
        "author": "",
        "bgColor": 0, 
        "delay": 250,
        "setup": [],
        "sprites": [],
        "loop": []
    }
    refresh(Global.Source)
}

document.addEventListener("DOMContentLoaded", function(event) { 
    //<!-- Source JSON -->
    document.querySelector('#source-new').addEventListener('click', newTheme);
    document.querySelector('#source-load').addEventListener('click', ()=>{loadJSON(document.getElementsByName('source')[0].value)});
    document.querySelector('#source-update').addEventListener('click', refreshDisplay);
    //<!-- Display -->
    document.querySelector('#roundedPixels').addEventListener('click', Display.setRoundedPixels);
    //<!-- Toolbox -->
    document.querySelector('#btn-datetime').addEventListener('click', Widgets.DateTimeWidget.create.bind(Widgets.DateTimeWidget));


    const projProperties = document.querySelector('#radio-project')
    projProperties.addEventListener('click', ()=>{Widgets.updateProperties(Widgets.ProjectWidget, 0)});
    projProperties.addEventListener('click', ()=>{Widgets.setSelected(Widgets.ProjectWidget, {index:0}, projProperties)});


    //<!-- Properties -->
    const allProperties = document.querySelectorAll("#properties tr")
    allProperties.forEach(p => {
        let input = document.querySelectorAll("#properties #" + p.id + " input")[0]
        /**
         * widget: one of DateTimeWidget, LineWidget, TextWidget, ImageWidget, SpriteWidget, etc...
         * index: object index in the array of setup or loop
         * p.id: one of the tr.id like 'x', 'y', 'image', 'content', 'font', 'fgColor', 'bgColor', etc
         * method: 'setup' or 'loop'
         */
        input.addEventListener('change', onChange, false)
    })
});

document.getElementById('app').addEventListener('refresh-display', refreshDisplay)

Display.createDisplay()