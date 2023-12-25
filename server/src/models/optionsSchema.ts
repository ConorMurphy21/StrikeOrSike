import Joi from 'joi';

/*** handler validation schemas ***/
let setOptionsSchema = Joi.object({
  promptTimer: Joi.number().integer().min(15).max(60),
  numRounds: Joi.number().integer().min(1).max(20),
  autoNumRounds: Joi.boolean(),
  promptSkipping: Joi.boolean(),
  sikeDispute: Joi.boolean(),
  sikeRetries: Joi.number().integer().min(0).max(2),
  packs: Joi.object().pattern(Joi.string().min(3).max(20), Joi.boolean()).max(10),
  customPrompts: Joi.array().items(Joi.string().min(1).max(200)).max(400)
}).required();

// be a little more permissive with options so unit tests can run
if (process.env.NODE_ENV !== 'production') {
  setOptionsSchema = Joi.object({
    promptTimer: Joi.number().integer().min(0).max(60),
    numRounds: Joi.number().integer().min(1).max(20),
    autoNumRounds: Joi.boolean(),
    minPlayers: Joi.number().integer(),
    promptSkipping: Joi.boolean(),
    sikeDispute: Joi.boolean(),
    sikeRetries: Joi.number().integer().min(0).max(2),
    packs: Joi.object().pattern(Joi.string().min(3).max(20), Joi.boolean()).max(10),
    customPrompts: Joi.array().items(Joi.string().min(1).max(200)).max(400)
  }).required();
}

export = setOptionsSchema;
