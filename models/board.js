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
    {minimize: false}
)

BoardSchema.plugin(mongooseStringQuery)

BoardSchema.statics.getSequencedLanes = function (id, callback) {
    const pipeline = [
        {
            $match: {
                _id: mongoose.Types.ObjectId(id),
            },
        },
        {
            $unwind: '$lanes',
        },
        {
            $sort: {
                'lanes.sequence': 1,
            },
        },
        {
            $group: {
                _id: '$_id',
                lanes: {
                    $push: '$lanes',
                },
            },
        },
    ]

    return this.aggregate(pipeline, callback)
}

BoardSchema.statics.getSequencedBoard = function (id, callback) {
    // https://mongoplayground.net/p/DpsHT1Wekb2
    const pipeline = [
        {
            $match: {
                _id: mongoose.Types.ObjectId(id),
            },
        },
        {
            $unwind: '$lanes',
        },
        {
            $sort: {
                'lanes.sequence': 1,
            },
        },
        {
            $group: {
                _id: '$_id',
                lanes: {
                    $push: '$lanes',
                },
                fields: {
                    $addToSet: {
                        boardName: '$boardName',
                        __v: '$__v',
                    },
                },
            },
        },
        {
            $unwind: '$fields',
        },
        {
            $project: {
                _id: '$_id',
                lanes: '$lanes',
                boardName: '$fields.boardName',
                __v: '$fields.__v',
            },
        },
    ]

    return this.aggregate(pipeline, callback)
}

const Board = mongoose.model('Board', BoardSchema)
module.exports = Board
