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

async function loadObjects() {
    for (var type of ["map","player","skill","action","tile","structor","item"]) {
        let response = await fetch(`/api/${type}`)
        let objects = await response.json()

        $("#objects").append(`
            <p style="font: 14px helvetica; margin-bottom: 0px;">${type}</p>
        `)

        list[type] = {}

        for (let object in objects) {
            list[type][object] = objects[object]

            $("#objects").append(`
                <input
                    type="button"
                    style="width: 202px; display: block;"
                    value="${objects[object]}"
                    onclick="goTo('${type}','${object}')"
                />
            `)
        }
        
        $("#objects").append(`
            <input
                type='button'
                style="width: 202px; display: block;"
                value="add new"
                onclick="newObject('${type}')"
            />
        `)
    }
}

function update(key) {
    let keys = key.split(".")
    let value = keys.pop()
    let path = keys.join(".")

    $.ajax({
        url: `/api/${type}/${id}/${path}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
            [value]: $(`[name=${key}]`).val()
        })
    }).done(data => {
        console.log(data)
    })
}

function addSetting(key, type) {
    let name = key.split(".").pop()

    if (type == "text" || type == "number") {
        return $("#settings").append(`
            <label for=${key}>${name}</label>
            <input
                type="${type}"
                name="${key}"
                value="${data[key]}"
                onchange="update('${key}')"
            />
        `)
    }

    return $("#settings").append(`
        <label for=${key}>${name}</label>
        <select
            name="${key}"
            onchange="update('${key}')"
            
        >
            <option value="">None</option>
            ${Object.keys(list[type]).map(id => `
                <option
                    value="${id}"
                    ${data[key] == id ? "selected" : ""}
                >
                    ${list[type][id]}
                </option>
            `).join("")}
        </select>
    `)    
}

// load data

async function loadall() {
    await loadObjects()
    fetch(`/data/${type}/${id}.json`)
        .then(response => response.json())
        .then(object => {
            data = object
            jQuery.ajax({
                url: `/editors/${type}.js`,
                dataType: 'script',
                success: () => {},
                async: true
            })
        })
}

loadall()