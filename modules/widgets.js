import Global from "./global.js"
import Display from "./display.js"
import Utils from "./utils.js"

const FONTS = {
    "square": [7,11,1],
    "picopixel": [3,4,1],
    "": [5,7,1],
    "default": [5,7,1],
    "medium": [5,10,1]
}

const app = document.getElementById('app')

export function addSetupElement(obj, widget) {
    
    const found = document.querySelector('#' + obj.type + obj.id)

    if (!found) {

        const base = document.querySelector('#base-widget-setup')
        let clone = base.cloneNode(true)
        clone.id = obj.type + obj.id;
        clone.classList.remove('w3-hide')
        clone.classList.add('w3-bar')
        
        // Remove Widget Button
        clone.getElementsByTagName('span')[0].addEventListener('click', () => widget.remove(clone, obj))
        // Title
        clone.getElementsByTagName('span')[1].innerHTML = `<i class='w3-small fa ${widget.icon}'></i> ${widget.title}`
        // Radio
        clone.getElementsByTagName('input')[0].addEventListener('click', e => app.dispatchEvent(new CustomEvent('widget-selected', {detail:{widget:widget, object:obj, input:e.target}})))
    
        base.before(clone)
    }
}

export function addLoopElement(obj, widget) {
    
    if (widget.is('sprite')) {

        const widgetIndex = obj.id
        
        let count = 0;

        Global.Source.sprites[obj.sprite].forEach(s => {

            const base = document.querySelector('#base-widget-loop')
            let clone = base.cloneNode(true)
            const imageIndex = count
            clone.id = obj.type + widgetIndex.toString() + imageIndex.toString();
            clone.classList.remove('w3-hide')
            clone.classList.add('w3-bar')        

            // Remove Widget Button
            clone.getElementsByTagName('span')[0].addEventListener('click', removeWidget)
            // Title
            clone.getElementsByTagName('span')[1].innerHTML = `<i class='w3-small fa ${widget.icon}'></i> ${widget.title}[${widgetIndex}] ${imageIndex}`
            // Radio
            clone.getElementsByTagName('input')[0].addEventListener('click', function(){updateProperties(widget, [widgetIndex, imageIndex], 'loop')})
            base.before(clone)
            count++
        })
    }
}


export const SpriteWidget = {
    title: 'Sprite',
    icon: 'fa-film',
    properties: {
        type: 'sprite',
        x: 0,
        y: 0,
        sprite: 0,
        image: ''
    },
    is: function(type) {
        return this.properties.type === type
    },    
    render: function(obj) {
        // Draws the first frame
        Display.drawImage(obj.x, obj.y, Global.Source.sprites[obj.sprite][0].image)
    },
    getValue: function(indexes, propertyName) {

        const widgetIndex = indexes[0]
        const imageIndex = indexes[1]

        if (propertyName === 'image') {
            const spriteIndex = Global.Source.loop[widgetIndex].sprite
            // Update the current frame
            Display.drawImage(Global.Source.loop[widgetIndex].x, Global.Source.loop[widgetIndex].y, Global.Source.sprites[spriteIndex][imageIndex].image)
            return Global.Source.sprites[spriteIndex][imageIndex].image
        }

        return Global.Source.loop[widgetIndex][propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        Global.Source[method][index][propertyName] = input.value
        //refresh(Global.Source)
    },
    add: function(obj) {
        if (!obj) {
            obj = {}
        }
        
        Global.Source.setup.push(obj)
        addSetupElement(obj, this)
    }
};

export const DateTimeWidget = {
    title: 'Date/Time',
    icon: 'fa-calendar',
    properties: {
        type: 'datetime',
        x: 0,
        y: 0,
        content: '',
        font: '',
        fgColor: 0, 
        bgColor: 0
    },
    is: function(type) {
        return this.properties.type === type
    },    
    render: function(obj) {
        Display.drawText(obj.x, obj.y, Utils.formatDateTime(obj.content), Utils.convert16To24Bits(obj.fgColor), FONTS[obj.font])
    },
    getValue: function(id, propertyName) {
        const method = Global.SelectedWidget.method
        const index = Utils.getIndexById(Global.Source[method], id)

        if (propertyName.toLowerCase().indexOf('color') >= 0) {
            return Utils.convert16To24Bits(Global.Source.setup[index][propertyName])
        }

        return Global.Source.setup[index][propertyName]
    },
    onChange: function(input) {
        const method = Global.SelectedWidget.method
        const propertyName = input.parentElement.parentElement.id
        const obj = Global.SelectedWidget.object
        const index = Utils.getIndexById(Global.Source[method], obj.id)

        Global.Source[method][index][propertyName] = Utils.getInputValue(input)

        app.dispatchEvent(new Event('refresh-display'));
    },
    add: function(obj) {
        Global.Source.setup.push(obj)
        addSetupElement(obj, this)
        app.dispatchEvent(new Event('refresh-display'));
    },
    create: function() {
        let obj = { ...this.properties }
        obj.id = Utils.generateUID()
        this.add(obj)
    },
    remove: function(elem, object) {
        removeWidget(elem, object)
    }
};

export const LineWidget = {
    title: 'Line',
    icon: 'fa-minus',
    properties: {
        type: 'line',
        x: 0,
        y: 0,
        x1: 0,
        y1: 0,
        color: 0
    },
    is: function(type) {
        return this.properties.type === type
    },
    render: function(obj) {
        Display.drawHLine(obj.x, obj.y, obj.x1 - obj.x, Utils.convert16To24Bits(obj.color))
    },
    getValue: function(widgetIndex, propertyName) {
        if (propertyName.toLowerCase().indexOf('color') >= 0) {
            return Utils.convert16To24Bits(Global.Source.setup[widgetIndex][propertyName])
        }

        return Global.Source.setup[widgetIndex][propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        Global.Source[method][index][propertyName] = Utils.getInputValue(input)
        //refresh(Global.Source)
    },
    add: function(obj) {
        Global.Source.setup.push(obj)
        addSetupElement(obj, this)
    }
};


export const TextWidget = {
    title: 'Text',
    icon: 'fa-font',
    properties: {
        type: 'text',
        x: 0,
        y: 0,
        content: '',
        font: '',
        fgColor: 0, 
        bgColor: 0
    },
    is: function(type) {
        return this.properties.type === type
    },
    render: function(obj) {
        Display.drawText(obj.x, obj.y, obj.content, Utils.convert16To24Bits(obj.fgColor), FONTS[obj.font])
    },
    getValue: function(widgetIndex, propertyName) {
        if (propertyName.toLowerCase().indexOf('color') >= 0) {
            return Utils.convert16To24Bits(Global.Source.setup[widgetIndex][propertyName])
        }

        return Global.Source.setup[widgetIndex][propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        Global.Source[method][index][propertyName] = Utils.getInputValue(input)
        //refresh(Global.Source)
    },
    add: function(obj) {
        Global.Source.setup.push(obj)
        addSetupElement(obj, this)
    }
};


export const ImageWidget = {
    title: 'Image',
    icon: 'fa-picture-o',
    properties: ['x', 'y', 'image'],
    properties: {
        type: 'image',
        x: 0,
        y: 0,
        image: ''
    },
    is: function(type) {
        return this.properties.type === type
    },
    render: function(obj) {
        Display.drawImage(obj.x, obj.y, obj.image)
    },
    getValue: function(widgetIndex, propertyName) {
        return Global.Source.setup[widgetIndex][propertyName]
    },
    onChange: function(method, index, propertyName, input) {
        Global.Source[method][index][propertyName] = Utils.getInputValue(input)
        //refresh(Global.Source)
    },
    add: function(obj) {
        Global.Source.setup.push(obj)
        addSetupElement(obj, this)
    }
};

export const ProjectWidget = {
    title: 'Project',
    icon: 'fa-sticky-note-o',
    properties: {
        type: 'project',
        name: 'New',
        version: 1,
        author: '', 
        bgColor: 0,
        delay: 250
    },
    is: function(type) {
        return false
    },
    render: function(obj) {
    },
    getValue: function(widgetIndex, propertyName) {
        if (propertyName.toLowerCase().indexOf('color') >= 0) {
            return Utils.convert16To24Bits(Global.Source[propertyName])
        }

        return Global.Source[propertyName]
    },
    onChange: function(input) {
        const propertyName = input.parentElement.parentElement.id
        Global.Source[propertyName] = Utils.getInputValue(input)
        app.dispatchEvent(new Event('refresh-display'));
    },
    add: function(obj) {
    }
};


function removeWidget(elem, object) {
    const method = Utils.getMethod(elem.parentElement.id)
    const index = Utils.getIndexById(Global.Source[method], object.id)

    Global.Source[method].splice(index, 1)

    elem.remove()
    
    if (Global.Source[method].length > 0)
        document.querySelectorAll('#setup-elements input[type="radio"]')[0].click()
    else 
        document.querySelectorAll('#project-elements input[type="radio"]')[0].click()
    
    app.dispatchEvent(new Event('refresh-display'))
}

export const All = [
    DateTimeWidget,
    LineWidget,
    TextWidget,
    ImageWidget,
    SpriteWidget
]

const Widgets = {
    All: All,
    ProjectWidget: ProjectWidget,
    ImageWidget: ImageWidget,
    TextWidget: TextWidget,
    LineWidget: LineWidget,
    DateTimeWidget: DateTimeWidget,
    SpriteWidget: SpriteWidget,
    addSetupElement: addSetupElement,
    addLoopElement: addLoopElement,
    removeWidget: removeWidget
};

export default Widgets; 
