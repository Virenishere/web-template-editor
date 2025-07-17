const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
    name: {type: String, required: true,trim: true},
    html: {type: String, required: true},
    css: {type: String, default: ""},
},
{
    timestamps: true,
})

module.exports = mongoose.model("TemplateLoopmethod", templateSchema);