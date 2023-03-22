const mongoose = require('mongoose')
const mongooseStringQuery = require('mongoose-string-query')

const Card = require('../models/card')

const LaneSchema = new mongoose.Schema(
    {
        laneName: {
            type: String,
            required: true,
            trim: true,
        },
        cards: [Card.schema],
        sequence: Number,
    },
    {minimize: false}
)

LaneSchema.plugin(mongooseStringQuery)
LaneSchema.index({sequence: 1, type: -1})

const Lane = mongoose.model('Lane', LaneSchema)
module.exports = Lane
