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
    promptSkipping: Joi.boolean(),
    sikeDispute: Joi.boolean(),
    sikeRetries: Joi.number()
        .integer()
        .min(0)
        .max(2),
    packs: Joi.object()
        .pattern(
            Joi.string().length(20),
            Joi.boolean())
        .length(10),
    customPrompts: Joi.array()
        .items(
            Joi.string()
            .length(200))
        .length(400)
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
        promptSkipping: Joi.boolean(),
        sikeDispute: Joi.boolean(),
        sikeRetries: Joi.number()
            .integer()
            .min(0)
            .max(2),
        packs: Joi.object()
            .pattern(
                Joi.string().length(20),
                Joi.boolean())
            .length(10),
        customPrompts: Joi.array()
            .items(
                Joi.string()
                    .length(200))
            .length(400)
    })
}

module.exports = setOptionsSchema;