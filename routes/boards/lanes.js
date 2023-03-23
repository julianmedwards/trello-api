const errors = require('restify-errors')
const mongoose = require('mongoose')

const Board = require('../../models/board')
const Lane = require('../../models/lane')

function addLane(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body
    console.log(typeof data)

    let getBoard = new Promise((resolve, reject) => {
        Board.findById(req.params.boardId, (err, docs) => {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })

    getBoard.then(
        (board) => {
            data.sequence = board.lanes.length
            let lane = new Lane(data)
            board.lanes.push(lane)

            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.setHeader('Access-Control-Allow-Origin', '*')
                res.send(201, {laneId: lane._id})
                next()
            })
        },
        (err) => {
            console.error(err)
            next(new errors.InternalError(err.message))
        }
    )
}

function getLanes(req, res, next) {
    Board.getSequencedLanes(req.params.boardId, (err, docs) => {
        if (err) {
            console.error(err)
            next(new errors.InternalError(err.message))
        } else {
            res.send(docs[0])
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

    let getBoard = new Promise((resolve, reject) => {
        Board.findById(req.params.boardId, (err, docs) => {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })

    getBoard.then(
        (board) => {
            const updatedLane = board.lanes.id(req.params.laneId)

            const nameUpdate = new Promise((resolve, reject) => {
                if (data.laneName) {
                    updatedLane.laneName = data.laneName
                }
                resolve()
            })

            const sequenceUpdate = new Promise((resolve, reject) => {
                if (data.sequenceShift) {
                    console.log('to start shiftCompletion.')
                    const shiftCompletion = Lane.shiftSequence(
                        Board,
                        board,
                        updatedLane,
                        data.sequenceShift
                    )

                    shiftCompletion.then(
                        () => {
                            console.log('shiftCompletion done.')
                            resolve()
                        },
                        (err) => {
                            reject(err)
                        }
                    )
                } else resolve()
            })

            Promise.all([nameUpdate, sequenceUpdate]).then(
                () => {
                    board.markModified('lanes')
                    board.save(function (err) {
                        if (err) {
                            console.error(err)
                            return next(new errors.InternalError(err.message))
                        }

                        res.setHeader('Access-Control-Allow-Origin', '*')
                        res.send(204)
                        next()
                    })
                },
                (err) => {
                    console.error(err)
                    next(new errors.InternalError(err.message))
                }
            )
        },
        (err) => {
            console.error(err)
            next(new errors.InternalError(err.message))
        }
    )
}

function deleteLane(req, res, next) {
    let getBoard = new Promise((resolve, reject) => {
        Board.findById(req.params.boardId, (err, docs) => {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })

    getBoard.then(
        (board) => {
            board.lanes.id(req.params.laneId).remove()
            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.setHeader('Access-Control-Allow-Origin', '*')
                res.send(204)
                next()
            })
        },
        (err) => {
            console.error(err)
            next(new errors.InternalError(err.message))
        }
    )
}

module.exports = (server) => {
    server.post('/boards/:boardId/lanes', addLane)
    server.get('/boards/:boardId/lanes', getLanes)
    server.patch('/boards/:boardId/lanes/:laneId', updateLane)
    server.del('/boards/:boardId/lanes/:laneId', deleteLane)
}
