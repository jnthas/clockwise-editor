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

export function addElement(obj, widget, method) {

    let commonAdd = function(secLevelElem, secLevelArray) {

        let elemId = obj.type + '-' + obj.id 
        let imgIndex = ''
        
        if (secLevelElem) {
            elemId = elemId + '-' + secLevelElem.id
            imgIndex = ' - ' + Utils.getIndexById(secLevelArray, secLevelElem.id)
        }

        const found = document.querySelector('#' + elemId)

        if (!found) {
            const base = document.querySelector('#base-widget-' + method)
            let clone = base.cloneNode(true)
            
            clone.id = elemId

            clone.classList.remove('w3-hide')
            clone.classList.add('w3-bar')

            // Remove Widget Button
            clone.getElementsByTagName('span')[0].addEventListener('click', () => widget.remove(clone, obj))
            // Title
            clone.getElementsByTagName('span')[1].innerHTML = `<i class='w3-small fa ${widget.icon}'></i> ${widget.title} [${obj.id}]${imgIndex}`
            // Radio
            clone.getElementsByTagName('input')[0].addEventListener('click', e => app.dispatchEvent(new CustomEvent('widget-selected', {detail:{widget:widget, object:obj, input:e.target}})))
            base.before(clone)
        }
    }

    if (widget.is('sprite')) {
        Global.Source.sprites[obj.sprite].forEach(img => {
            commonAdd(img, Global.Source.sprites[obj.sprite])
        })
    } else {
        commonAdd()
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
    getValue: function(id, propertyName) {

        const method = Global.SelectedWidget.method
        const index = Utils.getIndexById(Global.Source[method], id)

        if (propertyName === 'image') {
            const spriteIndex = Global.Source[method][index].sprite
            const imageId = Global.SelectedWidget.input.parentElement.id.split('-')[2]
            const imgIndex = Utils.getIndexById(Global.Source.sprites[spriteIndex], imageId)
            // Update the current frame
            Display.drawImage(Global.Source[method][index].x, Global.Source[method][index].y, Global.Source.sprites[spriteIndex][imgIndex].image)
            return Global.Source.sprites[spriteIndex][imgIndex].image
        }

        return Global.Source[method][index][propertyName]
    },
    onChange: function(input) {
        const method = Global.SelectedWidget.method
        const propertyName = input.parentElement.parentElement.id
        const obj = Global.SelectedWidget.object
        const index = Utils.getIndexById(Global.Source[method], obj.id)

        Global.Source[method][index][propertyName] = Utils.getInputValue(input)

        app.dispatchEvent(new Event('refresh-display'));
    },
    add: function(obj, method) {
        if (!obj.hasOwnProperty('id')) {
            obj.id = Utils.generateUID()
        }

        Global.Source.sprites[obj.sprite].forEach(s => {
            if (!s.hasOwnProperty('id')) {
                s.id = Utils.generateUID()
            }
        })

        addElement(obj, this, method)
        app.dispatchEvent(new Event('refresh-display'));
    },
    create: function() {
        let obj = { ...this.properties }
        Global.Source[method].push(obj)
        this.add(obj)
    },
    remove: function(elem, object) {
        // if there are more than one frame, removes just the sprite otherwise remove the element in the loop
        
        //removes the image frame
        const imageId = elem.id.split('-')[2]
        const imageIndex = Utils.getIndexById(Global.Source.sprites[object.sprite], imageId)
        Global.Source.sprites[object.sprite].splice(imageIndex, 1)

        const allSpritesRefImage = Global.Source.loop.filter(s => (s.sprite === object.sprite))

        allSpritesRefImage.forEach(s => {

            if (Global.Source.sprites[s.sprite].length === 0) {
                //removes the object in the loop array
                const index = Utils.getIndexById(Global.Source.loop, s.id)
                Global.Source.loop.splice(index, 1)
            }

            const elemId = s.type + '-' + s.id + '-' + imageId
            const docElem = document.getElementById(elemId)
            removeWidget(docElem)
        })
        
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
    add: function(obj, method) {

        if (!obj.hasOwnProperty('id')) {
            obj.id = Utils.generateUID()
        }

        addElement(obj, this, method)
        app.dispatchEvent(new Event('refresh-display'));
    },
    create: function() {
        let obj = { ...this.properties }
        Global.Source[method].push(obj)
        this.add(obj)
    },
    remove: function(elem, object) {
        const method = Utils.getMethod(elem.parentElement.id)
        const index = Utils.getIndexById(Global.Source[method], object.id)
        Global.Source[method].splice(index, 1)

        removeWidget(elem)
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
        //addSetupElement(obj, this)
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
        //addSetupElement(obj, this)
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
        //addSetupElement(obj, this)
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


function removeWidget(elem) {
    const method = Utils.getMethod(elem.parentElement.id)
    
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
    removeWidget: removeWidget
};

export default Widgets; 
