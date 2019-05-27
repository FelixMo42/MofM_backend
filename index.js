const fs = require("fs")
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const data = {}

app.use(express.static('public'))
app.use("/data", express.static('data'))

app.use(bodyParser.json())

// object managment

function loadObject(type, id) {
    let contents = fs.readFileSync(`./data/${type}/${id}.json`)
    return JSON.parse(contents)
}

function getObject({type, id, key=""}) {
    if (!(type in data)) {
        data[type] = {}
    }
    if (!(id in data[type])) {
        data[type][id] = loadObject(type, id)

        console.log(`loaded ${type} ${id}`)
    }

    let object = data[type][id]

    if (key != "") {
        for (var key of key.split(".")) {
            object = object[key]
        }
    }

    return object
}

async function saveObject({type, id}) {
    let object = getObject({type, id})

    let content = JSON.stringify(object)
    await fs.writeFileSync(`./data/${type}/${id}.json`, content)
}

// api

app.get(["/api/:type/:id", "/api/:type/:id/:key"], (request, response) => {
    response.send(getObject(request.params))
})

app.put(["/api/:type/:id", "/api/:type/:id/:key"], (request, response) => {
    var object = getObject(request.params)

    for (var key in request.body) {
        object[key] = request.body[key]
    }

    saveObject(request.params).then( () => response.sendStatus(200) )
})

// setup

app.listen(3001, () => {
    console.log("app deployed\n")
})