const url = new URL(window.location.href)
const id = url.searchParams.get("id")
const type = url.searchParams.get("type")

let data = {}


fetch(`http://localhost:3001/data/${type}/${id}.json`)
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

function newObject(type) {
    $.post(`http://localhost:3001/api/${type}`).done(id => {
        window.location.href = `?type=${type}&&id=${id}`
    })
}

async function loadObjects() {
    for (var type of ["map","player","skill","action","tile","structor"]) {
        let response = await fetch(`http://localhost:3001/api/${type}`)
        let objects = await response.json()

        $("#objects").append(`
            <p style="font: 14px helvetica; margin-bottom: 0px;">${type}</p>
        `)

        for (let object in objects) {
            $("#objects").append(`
                <input
                    type='button'
                    style="width: 202px; display: block;"
                    value='${objects[object]}'
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

loadObjects()

function update(key) {
    let keys = key.split(".")
    let value = keys.pop()
    let path = keys.join(".")

    $.ajax({
        url: `http://localhost:3001/api/${type}/${id}/${path}`,
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

    $("#settings").append(`
        <label for=${key}>${name}</label>
        <input
            type="${type}"
            name="${key}"
            value="${data[key]}"
            onchange="update('${key}')"
        />
    `)
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