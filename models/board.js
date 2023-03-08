const mongoose = require('mongoose')
const mongooseStringQuery = require('mongoose-string-query')

const Lane = require('../models/lane')

const BoardSchema = new mongoose.Schema(
    {
        boardName: {
            type: String,
            required: true,
            trim: true,
        },
        // https://stackoverflow.com/questions/18001478/referencing-another-schema-in-mongoose
        lanes: {
            type: [Lane.schema],
        },
    },
    {minimize: false}
)

BoardSchema.plugin(mongooseStringQuery)

const Board = mongoose.model('Board', BoardSchema)
module.exports = Board
