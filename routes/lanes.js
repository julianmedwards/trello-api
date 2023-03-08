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

    let getBoard = new Promise((resolve, reject) => {
        Board.findById(data.boardId, (err, docs) => {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })

    getBoard.then(
        (board) => {
            let lane = new Lane(data.laneData)
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
    Lane.apiQuery(req.params, function (err, docs) {
        if (err) {
            console.error(err)
            return next(new errors.InvalidContentError(err.errors.name.message))
        }

        console.log(docs)
        res.send(docs)
        next()
    })
}

function deleteLane(req, res, next) {
    let getBoard = new Promise((resolve, reject) => {
        Board.findOne({'lanes._id': req.params.id}, (err, docs) => {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })

    getBoard.then(
        (board) => {
            board.lanes.id(req.params.id).remove()
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

    //     getBoard.then(
    //         (board) => {
    //             console.log(board)
    //             board.lanes.push(lane)

    //             board.lanes.remove({_id: req.params.id}, function (err) {
    //                 if (err) {
    //                     console.error(err)
    //                     return next(
    //                         new errors.InvalidContentError(err.errors.name.message)
    //                     )
    //                 }

    //                 res.send(204)
    //                 next()
    //             })
    //         },
    //         (err) => {
    //             console.error(err)
    //             next(new errors.InternalError(err.message))
    //         }
    //     )
}

module.exports = (server) => {
    server.post('/lanes', addLane)
    server.get('/lanes', getLanes)
    server.del('/lanes/:id', deleteLane)
}
