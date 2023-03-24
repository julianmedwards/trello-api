const errors = require('restify-errors')

const Board = require('../models/board')
const Lane = require('../models/lane')

function addLane(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body

    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
        } else {
            data.sequence = board.lanes.length
            let lane = new Lane(data)
            board.lanes.push(lane)

            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.send(201, {laneId: lane._id})
                next()
            })
        }
    })
}

function getLanes(req, res, next) {
    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
        } else {
            Board.sequenceLanes(board)

            res.send(board.lanes)
            next()
        }
    })
}

function updateLane(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body

    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
        } else {
            const updatedLane = board.lanes.id(req.params.laneId)

            if (data.laneName) {
                updatedLane.laneName = data.laneName
            }

            if (data.sequenceShift) {
                Lane.shiftSequence(board, updatedLane, data.sequenceShift)
            }

            board.markModified('lanes')
            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.send(204)
                next()
            })
        }
    })
}

function deleteLane(req, res, next) {
    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
        } else {
            board.lanes.id(req.params.laneId).remove()
            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.send(204)
                next()
            })
        }
    })
}

module.exports = (server) => {
    server.post('/boards/:boardId/lanes', addLane)
    server.get('/boards/:boardId/lanes', getLanes)
    server.patch('/boards/:boardId/lanes/:laneId', updateLane)
    server.del('/boards/:boardId/lanes/:laneId', deleteLane)
}
