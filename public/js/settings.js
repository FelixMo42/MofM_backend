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
    if (arr === null) {
        console.log(key)
    }

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
            .contextmenu(menu)
            .appendTo(element)
    }

    element.append($("<input>", {
        type: "button",
        class: "add",
        value: `add ${type[0]}`,
        click: () => {
            addSetting(key + "." + arr.length, type[0])
                .change()
                .contextmenu(menu)
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

settings.special = (key, types, def) => {
    if (types["@"] === "if") {
        let value = get( derive(types.key, key) )

        if (value in types.values) {
            return addSetting(key, types.values[value], def)
        } else {
            return false
        }
    }
    if (types["@"] === "select") {
        let type = get(key + "." + "type")

        return settings.object(
            key,
            {
                "type": {
                    "@": "enum",
                    "values": Object.keys(types["type"])
                },
                ...types["type"][type],
                ...types["base"],
            },
            def
        )
    }
    if (types["@"] === "enum") {
        return settings.enum(key, types["values"])
    }
}

// game classes

settings.player = 
settings.map =
settings.action =
settings.skill =
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
    effectType: ["damage", "knockback", "pull", "pick up"]
}

settings.enum = 
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

        for (var i in type) {
            let style = type[i]
            element.append($(`<option>`, {
                html: style,
                value: style,
                selected: value === style,
                default: i === 0
            }))
        }

        return element
    }

settings.effectType =
settings.style =
    (key, type) => {
        return settings.enum(key, enums[type])
    }

// objects

const objects = {
    effect: {
        "@": "select",
        "type": {
            "damage" : {
                "value": "number"
            },
            "push" : {
                "value": "string"
            },
            "none": {},
            "inherit": {}
        },
        "base": {
            "roll": "number",
            "subEffects": ["effect"]
        }
    },
    style: {
        "@": "select",
        type: {
            ball : {
                radius: "number"
            },
            beam : {
                width: "string"
            },
            self: {},
            custom: {},
            inherit: {}
        },
        base: {}
    }
}

const defaults = {
    effect: {
        "subEffect": []
    }
}

settings.style = 
settings.effect = 
    (key, type) => {
        return settings.object(key, objects[type], defaults[type])
    }