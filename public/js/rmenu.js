let rmenu_menu = $("<ul>", {
    id: "rmenu",
    css: {
        width: "100px",
        position: "absolute"
    }
})
    .hide()
    .appendTo("body")


$(document).bind("mousedown", (event) => {
    if ( $(event.target).parent()[0].id !== "rmenu" && rmenu_menu.is(":visible")) {
        rmenu_menu.hide()
        rmenu_menu.empty()
    }
});

const rmenu = (items) => {
    return (event) => {
        event.preventDefault()

        for (let item in items) {
            let el = $('<li>', {
                text: item
            })
    
            el.click(() => {
                items[item]()

                rmenu_menu.hide()
                rmenu_menu.empty()
            })
    
            rmenu_menu.append(el)
        }

        rmenu_menu.css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        })

        rmenu_menu.show()       
    }
}