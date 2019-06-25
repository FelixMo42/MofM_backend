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
        checked: get(key)
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

    let arr = get(key)

    let menu = rmenu({
        "delete": ({target}) => {
            arr.splice(parseInt(target.getAttribute("index")), 1)
            update(key, arr)
            location.reload()
        }
    })

    for (let i = 0; i < arr.length; i++) {
        addSetting(key + "." + i, type[0])
            .attr("index", i)
            .contextmenu( menu )
            .appendTo( element )
    }

    element.append($("<input>", {
        type: "button",
        class: "add",
        value: `add ${type[0]}`,
        click: () => {
            addSetting(key + "." + arr.length, type[0])
                .change()
                .contextmenu( menu )
                .attr("index", arr.length)
                .insertBefore(element.children().last())
        }
    }))

    element.change((evt) => {
        evt.stopPropagation()
        update(key, [])
    })

    return element
}

settings.special = (key, types) => {
    if ("@type" in types) {
        return addSetting(key, types["@type"])
    }
    
    if ("@if" in types) {
        let value = get( derive(types["@if"].key, key) )
        if (value in types["@if"].values) {
            return addSetting(key, types["@if"].values[value])
        } else {
            return false
        }
    }
}

settings.object = (key, types, def={}) => {
    if ("@" in types) {
        return settings.special(key, types)
    }

    let element = $("<div>", {
        class: "settingsArray",
    })

    for (var type in types) {
        if ( addSetting(key + "." + type, types[type]) ) {
            let el = addSetting(key + "." + type, types[type])
            if ( el ) {
                element.append( `<p>${type.wordize()}</p>` )
                element.append( el )
            }
        }
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
    
        console.log( key.splice(".") )
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

        "targetPlayer": "bool",
        "targetTile": "bool",
        "targetStructor": "bool",
        "targetItem": "bool",

        "type": "effectType",
        "value": {
            "@": true,
            "@if": {
                "key": "~~.type",
                "values": {
                    "damage": "number",
                    //"knockback": "number"
                }
            }
        }
    }
}

const defaults = {
    effect: {
        "style": "ball",
        "targetPlayer": true,
        "targetTile": true,
        "targetStructor": true,
        "targetItem": true,
        "type": "damage"
    }
}

settings.effect = 
    (key, type) => {
        return settings.object(key, objects[type], defaults[type])
    }