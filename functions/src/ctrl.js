var moment = require("moment-timezone");

var dateFormat = "YYYY-MM-DD HH:mm";
var timezone = "Europe/Vienna";

module.exports = {
    sendMenu: sendMenu,
    sendItems: sendItems,
    sendMenu: sendMenu,
    sendAfterparty: sendAfterparty,
    sendVenue: sendVenue
}

function sendMenu(db, sendResponse, label) {
    var start = getDate(db.program.start);
    var end = getDate(db.program.end)
    var now = getNow();
;
    var elements = [];
    if (now.isBefore(start)) {
        var registration = {
            title: "Registration and Coffee",
            subtitle: "9:00, TU Wien, Gusshausstrasse 25-27, 1040 Vienna",
            image_url: db.text.images.event,
            buttons: [{
                title: "Map",
                type: "web_url",
                url: db.text.maps.event,
                webview_height_ratio: "compact"
            }]
        };
        elements.push(registration);
    }
    var programItems = {
        title: "Program",
        subtitle: "Check our program",
        image_url: db.text.images.wtm,
        buttons: [{
            title: "Presentations",
            type: "postback",
            payload: "presentations"
        }, {
            title: "Workshops",
            type: "postback",
            payload: "workshops"
        }]
    };
    elements.push(programItems);
    var schedule = {
        title: "Schedule",
        subtitle: "Full schedule on WTM site",
        image_url: db.text.images.clock,
        buttons: [{
            title: "Schedule",
            type: "web_url",
            url: db.text.links.schedule,
            webview_height_ratio: "compact"
        }]
    };
    elements.push(schedule);
    var team = {
        title: "Team",
        subtitle: "Meet our team",
        image_url: db.text.images.memo1,
        buttons: [{
            title: "Organizers",
            type: "web_url",
            url: db.text.links.organizers,
            webview_height_ratio: "compact"
        }, {
            title: "Speakers",
            type: "web_url",
            url: db.text.links.speakers,
            webview_height_ratio: "compact"
        }]
    };
    elements.push(team);
    if (now.isAfter(start) && now.isBefore(end)) {
        var venue = {
            title: "Venue",
            subtitle: "TU Wien, Gusshausstrasse 25-27, 1040 Vienna",
            image_url: db.text.images.event,
            buttons: [{
                title: "Map",
                type: "web_url",
                url: db.text.maps.event,
                webview_height_ratio: "compact"
            }]
        };
        elements.push(venue);
    }
    //if (!now.startOf('day').isAfter(start.startOf('day'))) {
        var afterparty = {
            title: "Awesome Afterparty!",
            subtitle: "18:15, Lanea, Rilkeplatz 3, 1040 Vienna",
            image_url: db.text.images.afterparty,
            buttons: [{
                type: "web_url",
                url: db.text.maps.afterparty,
                title: "Map",
                webview_height_ratio: "compact"
            }]
        };
        elements.push(afterparty);
    //}
    var card = {
        facebook: {
            attachment: {
                type: "template",
                image_aspect_ratio: "square",
                payload: {
                    template_type: "generic",
                    elements: elements
                }
            }
        }
    };
    sendResponse(label);
}

function sendVenue(db, sendResponse, label) {
    var element = {
        title: "TU Vienna, New Electrotechnical Institute building",
        subtitle: "Gusshausstrasse 25-27, 1040 Vienna",
        image_url: db.text.images.event,
        buttons: [{
            title: "Map",
            type: "web_url",
            url: db.text.maps.event,
            webview_height_ratio: "compact"
        }]
    };
    var card = {
        facebook: {
            attachment: {
                type: "template",
                image_aspect_ratio: "square",
                payload: {
                    template_type: "generic",
                    elements: [element]
                }
            }
        }
    };
    sendResponse(label);
}

function sendAfterparty(db, sendResponse, label) {
    var element = {
        title: "Lanea",
        subtitle: "18:15, Rilkeplatz 3, 1040 Vienna",
        image_url: db.text.images.afterparty,
        buttons: [{
            type: "web_url",
            url: db.text.maps.afterparty,
            title: "Map",
            webview_height_ratio: "compact"
        }]
    };
    var card = {
        facebook: {
            attachment: {
                type: "template",
                image_aspect_ratio: "square",
                payload: {
                    template_type: "generic",
                    elements: [element]
                }
            }
        }
    };
    sendResponse(label);
}

function sendItems(db, sendResponse, type, running, label) {
    var elements = [];
    var start = getDate(db.program.start);
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
    } else if (running === false) {
        items = getNextItems(db);
    }
    var info = null;
    if (items.length > 0) {
        for (var i = 0; i < items.length; i++) {
            var element = getElement(items[i], i);
            elements.push(element);
        }
        var card = {
            facebook: {
                attachment: {
                    type: "template",
                    image_aspect_ratio: "square",
                    payload: {
                        template_type: "generic",
                        elements: elements
                    }
                }
            }
        };
        sendResponse(label);
    } else {
        if (running === false) {
            info = db.text.info.eventEnded;
        } else if (running === true) {
            info = db.text.info.noRunning;
        }
        sendResponse(info);
    }
}

function getElement(db, item, i) {
    var time = getTime(item.start);
    var subtitle = "";
    if (item.subtitle !== undefined) {
        subtitle = ", " + item.subtitle;
    }
    if (item.speakers !== undefined) {
        var items = item.speakers.map(function (x) {
            return x.name;
        });
        subtitle = ", " + items.join(" & ");
    }
    var buttons = null;
    if (item.map_url !== undefined) {
        buttons = [{
            type: "web_url",
            url: item.map_url,
            title: "Map",
            webview_height_ratio: "compact"
        }];
    }    
    var element = {
        title: item.title,
        subtitle: time + subtitle,
        image_url: item.image_url,
        buttons: buttons
    };
    return element;
}

function getNextItems(db) {
    var now = getNow();
    var type = "";
    var nextItems = [];
    var nextBreak;
    var nextStart = getDate(db.program.end);
    for (var i = 0; i < db.program.items.length; i++) {
        var item = db.program.items[i];
        var itemStart = getDate(item.start);
        if (item.type !== type && itemStart > now) {
            if (itemStart.isBefore(nextStart)) {
                nextStart = itemStart;
            }
            type = item.type;
            if (type === "break") {
                nextBreak = item;
            } else {
                nextItems.push(item);
            }            
        }
    }
    if (nextBreak !== undefined) {
        var sessions = [];
        var breakEnd = getDate(nextBreak.end);
        for (var i = 0; i < nextItems.length; i++) {
            var item = nextItems[i];
            var itemStart = getDate(item.start);
            if (itemStart < breakEnd) {
                sessions.push(item);
            }
        }
        sessions.push(nextBreak);
        return sessions;
    } else {        
        return nextItems;
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
