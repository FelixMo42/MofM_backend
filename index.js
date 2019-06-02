const fs = require("fs")
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const app = express()

app.use(express.static('public'))
app.use("/data", express.static('data'))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

// json managment

function loadJSON(path) {
    return JSON.parse(fs.readFileSync(path))
}

function saveJSON(path, object) {
    return fs.writeFileSync(path, JSON.stringify(object))
}

// config managment

function loadConfig(type) {
    console.log(`loaded ${type} config`)

    config[type] = loadJSON(`./data/${type}/config.json`)
}

function saveConfig(type) {
    return saveJSON(`./data/${type}/config.json`, config[type])
}

function newId(type) {
    config[type].id += 1
    let id = config[type].id
    saveConfig(type)
    return id
}

// object managment

function loadObject(type, id) {
    console.log(`loaded ${type} ${id}`)

    return loadJSON(`./data/${type}/${id}.json`)
}

function getObject({type, id, key=""}) {
    if (!(type in data)) {
        data[type] = {}
    }
    if (!(id in data[type])) {
        data[type][id] = loadObject(type, id)
    }

    let object = data[type][id]

    if (key != "") {
        for (var key of key.split(".")) {
            object = object[key]
        }
    }

    return object
}

function createObject({type}) {
    let id = newId(type)
    
    fs.writeFileSync(
        `./data/${type}/${id}.json`,
        fs.readFileSync(`./data/${type}/default.json`)
    )

    return id
}

function saveObject({type, id}) {
    let object = getObject({type, id})

    let content = JSON.stringify(object)
    fs.writeFileSync(`./data/${type}/${id}.json`, content)
}

// load data

const data = {
    map : {}
}

const config = {
    map : {}
}

loadConfig("item")
loadConfig("map")
loadConfig("player")
loadConfig("skill")
loadConfig("action")
loadConfig("structor")
loadConfig("tile")

// api

app.get(["/api/:type"], (request, response) => {
    fs.readdir(`./data/${request.params.type}`, (err, files) => {
        var objects = {}

        for (let index in files) {
            let file = files[index]
            if (file == "config.json") { continue }
            let id = file.replace(".json","")
            objects[file.replace(".json","")] = getObject({
                type: request.params.type,
                id: id,
                key: "name"
            })
        }

        response.status(200).send(objects)
    })
})

app.get(["/api/:type/:id", "/api/:type/:id/:key"], (request, response) => {
    response.status(200).send(getObject(request.params))
})

app.put(["/api/:type/:id", "/api/:type/:id/:key"], (request, response) => {
    var object = getObject(request.params)

    for (var key in request.body) {
        object[key] = request.body[key]
    }

    saveObject(request.params)
    response.status(200).sendStatus(200)
})

app.post(["/api/:type"], (request, response) => {
    response.status(200).send(createObject(request.params))
})

// setup

app.listen(3001, () => {
    console.log("\n> app deployed\n")
})