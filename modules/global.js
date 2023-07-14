
let currentWidget = {
    widget: null,
    object: null,
    method: ''
}

let source = null



/**
 *  Global.SelectedWidget = {
 *    widget = SpriteWidget, DateTimeWidget etc
 *    object = Source[].object
 *    method: setup / loop
 *  }
 *  
 */


const Global = {
    Source: source,
    SelectedWidget: currentWidget
};

export default Global; 
