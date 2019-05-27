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
        });
    })

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