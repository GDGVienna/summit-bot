var moment = require("moment-timezone");
var google = require('actions-on-google');

var dateFormat = "YYYY-MM-DD HH:mm";
var timezone = "Europe/Vienna";

function getSimpleResponse(msg) {
    return {
        speech: getText_WithoutEmojis(msg),
        displayText: getText(msg)
    };
}

exports.sendProgram = function(app, msg, items) {
    var simpleResponse = getSimpleResponse(msg);
    var carousel = new google.Responses.Carousel();
    var optionItems = [];
    var i = 0;
    for (let item of items) {
        const optionItem = new google.Responses.OptionItem();
        optionItem.title = item.title;
        optionItem.description = item.description;
        optionItem.image = {
            url: item.ImageURL,
            accessibilityText: item.description,
            width: 300,
            height: 300
        };  
        optionItem.optionInfo = {
            key: "option" + i,
            synonyms: ["test" + i]
        };
        optionItems.push(optionItem);
        i++;
    }
    carousel.addItems(optionItems);
    app.askWithCarousel(simpleResponse, carousel);
}

exports.sendItems = function(app, db, sendResponse, type, running, label) {
    var elements = [];
    var now = getNow();
    var items = [];
    if (type !== null) {
        for (var i = 0; i < db.program.items.length; i++) {
            var item = db.program.items[i];
            if (db.program.items[i].type.indexOf(type) !== -1) {
                items.push(item);
            }
        }
    } else if (running === true) {
        for (var i = 0; i < db.program.items.length; i++) {
            var item = db.program.items[i];
            var itemStart = getDate(item.start);
            var itemEnd = getDate(item.end);
            if (now > itemStart && now < itemEnd) {
                items.push(item);
            }
        }
    } 
    var info = null;
    if (items.length > 0) {
        // for (var i = 0; i < items.length; i++) {
        //     var element = getElement(items[i], i);
        //     elements.push(element);
        // }
        // var card = {
        //     facebook: {
        //         attachment: {
        //             type: "template",
        //             image_aspect_ratio: "square",
        //             payload: {
        //                 template_type: "generic",
        //                 elements: elements
        //             }
        //         }
        //     }
        // };
        // sendResponse(label);
        var item = items[0];
        var response = new google.Responses.RichResponse()
            .addSimpleResponse(db.text.labels.now);
        //for (let item of items) {
            const card = new google.Responses.BasicCard()
                .setTitle(item.title)
                // .setSubtitle(item.description)
                .setBodyText(item.description)
                .setImage(item.image_url, item.title);
                //.addButton(textHelper.get_Button_Tickets(), item.URL);
            response.addBasicCard(card);
        //}
        app.ask(response);
    } else {
        if (running === false) {
            info = db.text.info.eventEnded;
        } else if (running === true) {
            info = db.text.info.noRunning;
        }
    }
}

function getDate(time) {
    return moment.tz(time, timezone);
}

function getTime(time) {
    return moment.tz(time, timezone).format("H:mm");
}

function getNow() {
    return moment().tz(timezone);
}
