const mongoose = require('mongoose')
const mongooseStringQuery = require('mongoose-string-query')

const CardSchema = new mongoose.Schema(
    {
        cardName: {
            type: String,
            required: true,
            trim: false,
        },
        cardDescr: {
            type: String,
            required: true,
            trim: false,
        },
    },
    {minimize: false}
)

CardSchema.plugin(mongooseStringQuery)

const Card = mongoose.model('Card', CardSchema)
module.exports = Card
