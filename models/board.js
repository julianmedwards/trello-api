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
        lanes: [Lane.schema],
    },
    {minimize: false, toJSON: {virtuals: true}}
)

BoardSchema.plugin(mongooseStringQuery)

BoardSchema.statics.sequenceLanes = function (board) {
    board.lanes.sort((a, b) => {
        if (a.sequence < b.sequence) {
            return -1
        }
        if (a.sequence > b.sequence) {
            return 1
        }
    })

    board.lanes.forEach((lane) => {
        lane.cards.sort((a, b) => {
            if (a.sequence < b.sequence) {
                return -1
            }
            if (a.sequence > b.sequence) {
                return 1
            }
        })
    })
}

const Board = mongoose.model('Board', BoardSchema)
module.exports = Board
