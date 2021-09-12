"use strict";
exports.__esModule = true;
exports.render = void 0;
var ejs = require("ejs");
function render(content, data) {
    return ejs.render(content, data);
}
exports.render = render;
