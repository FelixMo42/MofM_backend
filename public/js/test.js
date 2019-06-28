const url = new URL(window.location.href)
const id = url.searchParams.get("id")
const type = url.searchParams.get("type")

let data;

/// ///

function get(keys) {
    console.log(keys)
    let object = data

    for (let key of keys.split(".")) {
        if (!(key in object)) {
            return null
        }
        object = object[key]
    }

    return object
}

/// ///

const SettingsList = (settings) =>
    (key) => $("<div>", {key: key})
        .addClass("settingsList")
        .append( Object.keys(settings).map(name =>
            $("<div>").append([
                $("<p>").html(name),
                settings[name](key + "." + name)
            ])
        ))

const SettingsArray = (type) =>
    (key) => $("<div>", {key: key})
        .addClass("settingsList")
        .append( get(key).map((el, i) => type(key + "." + i)) )
        .append( $("<input>", {type: "button", val: "add new item"}) )

const Selector = (modes) =>
    (key) => $("<div>", {key: key})
        .addClass("settingsList")
        .append([
            Enum( Object.keys(modes) )(key + "." + "type")
                .change(function() {
                    $(this).siblings("[mode]").hide(400)
                    $(this).siblings(`[mode="${$(this).val()}"]`).show(400)
                })
        ])
        .append( Object.keys(modes).map(mode => $("<div>")
            .append(
                Object.keys(modes[mode]).map(
                    name => $("<div>").append([
                        $("<p>").html(name),
                        modes[mode][name](key + "." + name)
                    ])
                )
            )
            .attr("mode", mode)
            .toggle(mode == "circle")
        ) )

const Enum = (options) =>
    (key) => $("<select>")
            .append(options.map(option =>
                $("<option>", {selected: option === get(key)})
                    .val(option)
                    .html(option)
            ))

/// ///

let string = (key) => $("<input>", {val: get(key)})

let number = (key) => $("<input>", {type: "number", val: get(key)})

let boolean = (key) => $("<input>", {type: "checkbox", checked: get(key)})

let text = (key) => $("<textarea>", {val: get(key)})

/// ///

let area = Selector({
    circle: {
        diameter: number
    },
    square: {
        length: number
    }
})

let styleBase = {
    targetPlayer: boolean,
    targetItem: boolean,
    targetTile: boolean,
    targetStructor: boolean
}

let style = Selector({
    ball: {
        radius: number,
        ...styleBase
    },
    beam: {
        width: number,
        ...styleBase
    },
    self: {
        ...styleBase
    },
    custom: {
        ...styleBase
    }
})

let effect = Selector({
    damage: {
        value: number
    },
    push: {
        value: string
    },
    none: {},
    inherit: {}
})

let action = {
    name: string,
    description: text,

    area: area,
    defaultStyle: style,

    effects: SettingsArray(effect)
}

/// ///

function add(root, settings, key="") {
    for (let name in settings) {
        root.append([
            $("<p>").html(name),
            settings[name](name)
        ])
    }
}

(async function () {
    await fetch(`/data/${type}/${id}.json`).then(async response => {
        data = await response.json()
    })

    add($("#settings"), action)
})()