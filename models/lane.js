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

LaneSchema.statics.shiftSequence = async function (
    Board,
    board,
    movedLaneId,
    sequenceShift
) {
    return new Promise(async (resolve, reject) => {
        console.log('starting shift promise sequence')
        const lanes = board.lanes
        const movedLane = board.lanes.id(movedLaneId)
        const newSequence = movedLane.sequence + sequenceShift

        if (lanes.length < 2) {
            reject(
                new errors.InternalError(
                    'Called Lane.shiftSequence without multiple lanes.'
                )
            )
        }

        // https://mongoplayground.net/p/W92qeExpfVu
        const pipeline = [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(board.id),
                },
            },
            {
                $project: {
                    lanes: {
                        $filter: {
                            input: '$lanes',
                            cond: {
                                $eq: ['$$this.sequence', newSequence],
                            },
                        },
                    },
                },
            },
        ]
        Board.aggregate(pipeline, (err, doc) => {
            if (err) {
                reject(new errors.InternalError(err.message))
            }
            const otherLane = board.lanes.id(doc[0].lanes[0]._id)
            otherLane.sequence = movedLane.sequence
            movedLane.sequence = newSequence

            console.log('resolving')
            resolve()
        })
    })
}

const Lane = mongoose.model('Lane', LaneSchema)
module.exports = Lane
