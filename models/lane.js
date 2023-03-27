const mongoose = require('mongoose')
const errors = require('restify-errors')
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

LaneSchema.statics.shiftSequence = async function (
    board,
    movedLane,
    sequenceShift
) {
    const lanes = board.lanes
    const newSequence = movedLane.sequence + sequenceShift

    if (lanes.length < 2) {
        throw new errors.InternalError(
            'Called Lane.shiftSequence without multiple lanes.'
        )
    }

    const otherLane = board.lanes.find((lane) => {
        return lane.sequence === newSequence
    })

    otherLane.sequence = movedLane.sequence
    movedLane.sequence = newSequence
}

LaneSchema.statics.sequenceCards = function (lane) {
    lane.cards.sort((a, b) => {
        if (a.sequence < b.sequence) {
            return -1
        }
        if (a.sequence > b.sequence) {
            return 1
        }
    })
}

LaneSchema.statics.resequence = function (lanes, startSequence) {
    for (let i = startSequence; i < lanes.length; i++) {
        lanes[i].sequence = i
    }
}

const Lane = mongoose.model('Lane', LaneSchema)
module.exports = Lane
