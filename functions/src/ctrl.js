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

exports.sendProgram =function(app, msg, items) {
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

function getDate(time) {
    return moment.tz(time, timezone);
}

function getTime(time) {
    return moment.tz(time, timezone).format("H:mm");
}

function getNow() {
    return moment().tz(timezone);
}
