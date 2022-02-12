const Joi = require('joi');
/*** handler validation schemas ***/
const setOptionsSchema = Joi.object({
    promptTimer: Joi.number()
        .integer()
        .min(15)
        .max(60),
    numRounds: Joi.number()
        .integer()
        .min(1)
        .max(20),
    autoNumRounds: Joi.boolean()
})

module.exports = setOptionsSchema;