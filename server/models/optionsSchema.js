const Joi = require('joi');
/*** handler validation schemas ***/
let setOptionsSchema = Joi.object({
    promptTimer: Joi.number()
        .integer()
        .min(15)
        .max(60),
    numRounds: Joi.number()
        .integer()
        .min(1)
        .max(20),
    autoNumRounds: Joi.boolean(),
    promptSkipping: Joi.boolean()
})

// be a little more permissive with options so unit tests can run
if (process.env.NODE_ENV !== 'production') {
    setOptionsSchema = Joi.object({
        promptTimer: Joi.number()
            .integer()
            .min(0)
            .max(60),
        numRounds: Joi.number()
            .integer()
            .min(1)
            .max(20),
        autoNumRounds: Joi.boolean(),
        minPlayers: Joi.number().integer(),
        promptSkipping: Joi.boolean()
    })
}

module.exports = setOptionsSchema;