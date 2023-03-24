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
            default: '',
            trim: false,
        },
        sequence: Number,
    },
    {minimize: false}
)

CardSchema.plugin(mongooseStringQuery)

CardSchema.statics.shiftSequence = async function (
    lane,
    movedCard,
    sequenceShift
) {
    const cards = lane.cards
    const newSequence = movedCard.sequence + sequenceShift

    if (cards.length < 2) {
        throw new errors.InternalError(
            'Called Card.shiftSequence without multiple cards.'
        )
    }

    const otherCard = lane.cards.find((card) => {
        return card.sequence === newSequence
    })

    otherCard.sequence = movedCard.sequence
    movedCard.sequence = newSequence
}

const Card = mongoose.model('Card', CardSchema)
module.exports = Card
