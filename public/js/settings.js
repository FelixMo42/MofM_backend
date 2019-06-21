const settings = {}

/// base settings

settings.number = (key) => {
    let element = $('<input>', {
        type: "number",
        key: key,
        val: get(key) || 0,
    })

    element.change((evt) => {
        evt.stopPropagation()
        update(key, parseInt(element.val()))
    })

    return element
}

settings.string = (key) => {
    let element = $('<input>', {
        type: "text",
        key: key,
        val: get(key)
    })

    element.change((evt) => {
        evt.stopPropagation()
        update(key, element.val())
    })

    return element
}

settings.text = (key) => {
    let element = $('<textarea>', {
        key: key,
        val: get(key)
    })

    element.change((evt) => {
        evt.stopPropagation()
        update(key, element.val())
    })

    return element
}

settings.bool = (key) => {
    let element = $('<input>', {
        type: "checkbox",
        key: key,
        val: get(key)
    })

    element.change((evt) => {
        evt.stopPropagation()
        update(key, element.is(":checked"))
    })

    return element
}

// structors

settings.array = (key, type) => {
    let element = $("<div>", {
        class: "settingsArray"
    })

    for (let i = 0; i < get(key).length; i++) {
        element.append( addSetting(key + "." + i, type[0]) )
    }

    element.append($("<input>", {
        type: "button",

        value: `add ${type[0]}`,
        click: () => {
            let arr = get(key)

            let n = addSetting(
                key + "." + arr.length,
                type[0]
            )
            
            n.change()

            n.insertBefore(element.children().last())
        }
    }))

    element.change((evt) => {
        evt.stopPropagation()
        update(key, [])
    })

    return element
}

settings.object = (key, types, def={}) => {
    let element = $("<div>", {
        class: "settingsArray",
    })

    for (var type in types) {
        element.append( `<p>${type.wordize()}</p>` )
        element.append( addSetting(key + "." + type, types[type]) )
    }

    element.change((evt) => {
        evt.stopPropagation()
        update(key, def)
    })

    return element
}

// game classes

settings.player = 
settings.map =
settings.action =
settings.tile =
settings.structor =
settings.item =
    (key, type) => {
        let element = $("<select>", {
            key: key,
            change: (evt) => {
                evt.stopPropagation()
                let data = JSON.parse($(`[key="${key}"]`).val())
                update(key, data)
            }
        })
    
        element.append($(`<option>`, {
            html: "None",
            value: JSON.stringify(null)
        }))
    
        let value = get(key)
    
        Object.keys(list[type]).forEach(id => element.append($(`<option>`, {
            html: list[type][id],
            selected: value !== null && value.id === id,
            val: JSON.stringify({["@class"]: type, id: id})
        })))
    
        return element
    }

// enums

const enums = {
    style: ["ball", "self"],
    effectType: ["damage", "knockback"]
}

settings.effectType =
settings.style =
    (key, type) => {
        let element = $("<select>", {
            key: key,
            change: (evt) => {
                evt.stopPropagation()
                let data = $(`[key="${key}"]`).val()
                update(key, data)
            }
        })

        let value = get(key)

        for (var i in enums[type]) {
            let style = enums[type][i]
            element.append($(`<option>`, {
                html: style,
                value: style,
                selected: value === style,
                default: i === 0
            }))
        }

        return element
    }

// objects

const objects = {
    effect: {
        "style": "style",
        "type": "effectType"
    }
}

const defaults = {
    effect: {
        "style": "ball",
        "type": "damage"
    }
}

settings.effect = 
    (key, type) => {
        return settings.object(key, objects[type], defaults[type])
    }