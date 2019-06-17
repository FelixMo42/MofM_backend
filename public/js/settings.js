const settings = {}

/// base settings

settings.number = (key) => {
    return $('<input>', {
        type: "number",
        key: key,
        val: get(key),
        change: () => {
            update(key, $(`[key="${key}"]`).val())
        }
    })
}

settings.string = (key) => {
    return $('<input>', {
        type: "text",
        key: key,
        val: get(key),
        change: () => {
            update(key, $(`[key="${key}"]`).val())
        }
    })
}

settings.text = (key) => {
    return $('<textarea>', {
        key: key,
        val: get(key),
        change: () => {
            update(key, $(`[key="${key}"]`).val())
        }
    })
}

settings.bool = (key) => {
    return $('<input>', {
        type: "checkbox",
        key: key,
        val: get(key),
        change: () => {
            update(key, $(`[key="${key}"]`).is(":checked"))
        }
    })
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
            arr.push({
                id: -1
            })
            update(key, arr)
        }
    }))

    return element
}

settings.object = (key, types) => {
    let element = $("<div>", {
        class: "settingsArray"
    })

    for (var type in types) {
        element.append( `<p>${type.wordize()}</p>` )
        element.append( addSetting(key + "." + type, types[type]) )
    }

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
            change: () => {
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
    style: ["ball", "self"]
}

settings.style =
    (key, type) => {
        let element = $("<select>", {
            key: key,
            change: () => {
                let data = $(`[key="${key}"]`).val()
                update(key, data)
            }
        })

        let value = get(key)

        for (var style of enums[type]) {
            element.append($(`<option>`, {
                html: style,
                value: style,
                selected: value === style
            }))
        }

        return element
    }