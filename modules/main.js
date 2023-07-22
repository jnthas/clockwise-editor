import Global from "./global.js"
import Display from "./display.js"
import Utils from "./utils.js"
import Widgets from "./widgets.js"

const methods = ['setup', 'loop']


function refresh(ev, source_ref) {
    if (!source_ref)
        source_ref = Global.Source;

    document.getElementById("elements-title").textContent = "Project [" + Global.Source.name + "]"

    Display.clearScreen(Utils.convert16To24Bits(Global.Source.bgColor))

    methods.forEach((m) => {
        source_ref[m].forEach(e => {
            Widgets.All.forEach(w => {
                if (w.is(e.type)) {
                    w.add(e, m)
                    w.render(e)
                }
            })
        })
    })

    document.getElementById("source").value = JSON.stringify(source_ref, null, 2)
    document.querySelector('#project-properties input[type="radio"]').click()
}


function updateProperties(widget, id) {

    const allProperties = document.querySelectorAll("#properties tr")

    allProperties.forEach(p => {
        if (Object.keys(widget.properties).includes(p.id)) {
            p.style.display = 'table-row'

            let input = document.querySelectorAll("#properties #" + p.id + " input")[0]

            input.value = widget.getValue(id, p.id)
        } else {
            p.style.display = 'none'
        }
    })
}

function setSelected(event, a) {
    //console.log("current selected: ", widget.title, obj.id, input.parentElement.parentElement.id)

    Global.SelectedWidget = {
        widget: event.widget,
        object: event.object,
        method: Utils.getMethod(event.input.parentElement.parentElement.id),
        input: event.input
    }

    updateProperties(event.widget, event.object.id)
}

function refreshDisplay(ev, source_ref) {
    if (!source_ref)
        source_ref = Global.Source;

    Display.clearScreen(Utils.convert16To24Bits(Global.Source.bgColor))

    methods.forEach(m => {
        source_ref[m].forEach(e => {
            Widgets.All.forEach(w => {
                if (w.is(e.type)) {
                    requestAnimationFrame(() => {
                        // fires before next repaint
            
                        requestAnimationFrame(() => {
                            // fires before the _next_ next repaint
                            // ...which is effectively _after_ the next repaint
            
                            w.render(e)        
                        });
                    });

                    
                }
            })
        })
    })

    document.getElementById("source").value = JSON.stringify(source_ref, null, 2)
}

function reset() {
    Global.Source = {}
    Global.SelectedWidget = {}

    const dontRemove = ['project-properties', 'base-widget-setup', 'base-widget-loop']

    document.querySelectorAll('#project-widgets li').forEach(li => {
        if (!dontRemove.includes(li.id)) {
            li.remove()
        }
    })
    
    document.getElementById("source").value = JSON.stringify(Global.Source, null, 2)
}

function newTheme() {
    
    reset()

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

function loadJSON(e) {

    if (e.target.files.length > 0) {
        const file = e.target.files[0]
        const reader = new FileReader();

        reader.onload = (f) => {
            if (f.target.result) {
                reset()                            
                Global.Source = JSON.parse(f.target.result)
                refresh(Global.Source)
                document.querySelector('#project-properties input[type="radio"]').click()
            }
        };

        reader.readAsText(file);
    }

}

function downloadSource() {

    if (!Global.Source) {
        Display.showModal('Error', 'Source is empty')
        return
    }

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Global.Source, null, 2));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", Utils.slugify(Global.Source.name) + ".json");
    dlAnchorElem.click();
}


function accordionHandler(id) {
    var x = document.getElementById(id);
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    //<!-- Source JSON -->
    document.querySelector('#source-new').addEventListener('click', newTheme);
    document.querySelector('#source-load').addEventListener('change', loadJSON);
    document.querySelector('#source-update').addEventListener('click', refreshDisplay);
    document.querySelector('#source-download').addEventListener('click', downloadSource);

    //<!-- Display -->
    document.querySelector('#roundedPixels').addEventListener('click', Display.setRoundedPixels);
    //<!-- Toolbox -->
    document.querySelector('#btn-datetime').addEventListener('click', Widgets.DateTimeWidget.create.bind(Widgets.DateTimeWidget));
    document.querySelector('#btn-sprite').addEventListener('click', Widgets.SpriteWidget.create.bind(Widgets.SpriteWidget));
    document.querySelector('#btn-line').addEventListener('click', Widgets.LineWidget.create.bind(Widgets.LineWidget));
    document.querySelector('#btn-image').addEventListener('click', Widgets.ImageWidget.create.bind(Widgets.ImageWidget));
    document.querySelector('#btn-text').addEventListener('click', Widgets.TextWidget.create.bind(Widgets.TextWidget));

    //<!-- Accordion -->
    document.querySelector('#btn-acc-project').addEventListener('click', () => accordionHandler('project-accordion'));
    document.querySelector('#btn-acc-setup').addEventListener('click', () => accordionHandler('setup-accordion'));
    document.querySelector('#btn-acc-loop').addEventListener('click', () => accordionHandler('loop-accordion'));


    const projProperties = document.querySelector('#radio-project')
    projProperties.addEventListener('click', () => { setSelected({ widget: Widgets.ProjectWidget, object: { index: 0 }, input: projProperties }) });

    //<!-- Properties -->
    const allProperties = document.querySelectorAll("#properties tr")
    allProperties.forEach(p => {
        let input = document.querySelectorAll("#properties #" + p.id + " input")[0]
        input.addEventListener('change', () => Global.SelectedWidget.widget.onChange(input), false)
    })

    //<!-- Upload Button -->
    document.getElementById("img-upload").addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0]
            const reader = new FileReader();

            reader.onload = (f) => {
                if (f.target.result) {
                    document.getElementById("image-b64").value = f.target.result.substring('data:image/png;base64,'.length);
                    document.getElementById("image-b64").dispatchEvent(new Event('change'));
                }
            };

            reader.readAsDataURL(file);
        }
    }, false);
});

document.getElementById('app').addEventListener('refresh-display', refreshDisplay)
document.getElementById('app').addEventListener('widget-selected', e => setSelected(e.detail))



Display.createDisplay()