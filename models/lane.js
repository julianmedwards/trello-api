const mongoose = require('mongoose')
const mongooseStringQuery = require('mongoose-string-query')

const LaneSchema = new mongoose.Schema(
    {
        laneName: {
            type: String,
            required: true,
            trim: true,
        },
        // https://stackoverflow.com/questions/18001478/referencing-another-schema-in-mongoose
        cards: {
            type: Object,
            required: true,
        },
    },
    {minimize: false}
)

LaneSchema.plugin(mongooseStringQuery)

const Lane = mongoose.model('Lane', LaneSchema)
module.exports = Lane
