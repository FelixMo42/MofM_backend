String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

String.prototype.wordize = function() {
    return this.split(/(?=[A-Z])/).join(" ").capitalize()
}

const url = new URL(window.location.href)
const id = url.searchParams.get("id")
const type = url.searchParams.get("type")

let data = {}
let list = {}

function goTo(type, id) {
    window.location.href = `?type=${type}&&id=${id}`
}

function goToSettings() {
    $("#settings").show()
    $("#objects").hide()

    $("#objects_button").toggleClass("selected")
    $("#settings_button").toggleClass("selected")
}

function goToObjects() {
    $("#settings").hide()
    $("#objects").show()

    $("#objects_button").toggleClass("selected")
    $("#settings_button").toggleClass("selected")
}

function newObject(type) {
    $.post(`/api/${type}`).done(id => {
        goTo(type,id)
    })
}

function update(key, value) {
    let keys = key.split(".")
    let name = keys.pop()
    let path = keys.join(".")

    $.ajax({
        url: `/api/${type}/${id}/${path}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({[name]: value})
    }).done(data => {
        console.log(`${key} = ${value}`," ; ",data)
    })

    location.reload()
}

function get(keys) {
    let object = data

    for (let key of keys.split(".")) {
        object = object[key]
    }

    return object
}

// load data

async function loadObjects() {
    $("#objects").append(`
        <p style="font: 14px helvetica; margin-bottom: 0px;">
            Settings
        </p>
        <div class="object_block">
            <input
                type="button"
                value="Game"
                onclick="goTo('settings','game')"
            />
        </div>
    `)

    let types = ["map","tile","structor","player","skill","action","item"]
    for (let type of types) {
        let response = await fetch(`/api/${type}`)
        let objects = await response.json()

        list[type] = {}

        
        $("#objects").append(`
            <p style="font: 14px helvetica; margin-bottom: 0px;">
                ${type.capitalize()}
            </p>
            <div class="object_block">
                ${ Object.keys(objects).map(object => {
                    if (object == "default") { return "" }

                    list[type][parseInt(object)] = objects[object]

                    return `
                        <input
                            type="button"
                            value="${objects[object]}"
                            onclick="goTo('${type}','${object}')"
                        />
                    `
                }) }
            </div>
            <div class="object_block">
                <input
                    type='button'
                    value="default"
                    onclick="goTo('${type}','default')"
                />
                <input
                    type='button'
                    value="add new"
                    onclick="newObject('${type}')"
                />
            </div>
        `)
    }
}

function addChooser(key, type) {
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
        selected: value !== null && value.id == id,
        val: JSON.stringify({["@class"]: type, id: id})
    })))

    return element
}

function addSetting(key, type) {
    if (Array.isArray(type)) {
        return settings.array(key, type)
    }

    if (typeof type === 'object') {
        return settings.object(key, type)
    }
    
    try {
        return settings[type](key, type)
    } catch (error) {
        console.log(type)
        console.log(error)
    }
}

function loadSettings() {
    for (var key in config) {
        $("#settings").append([
            `<p>${key.wordize()}</p>`,
            addSetting(key, config[key])
        ])
    }
}

async function loadall() {
    await Promise.all([
        loadObjects(),
        fetch(`/data/${type}/${id}.json`).then(async response => {
            data = await response.json()
        })
    ])
        
    jQuery.ajax({
        url: `/editors/${type}.js`,
        dataType: 'script',
        success: () => {
            loadSettings()
        },
        async: true
    })
}

loadall()