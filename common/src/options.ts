import { z } from 'zod';

const options = z.object({
  promptTimer: z.number().int().min(15).max(60),
  numRounds: z.number().int().min(1).max(20),
  autoNumRounds: z.boolean(),
  promptSkipping: z.boolean(),
  minPlayers: z.number().int().min(3).max(12),
  maxPlayers: z.number().int().min(3).max(12),
  sikeDispute: z.boolean(),
  sikeRetries: z.number().int().min(0).max(2),
  packs: z.record(z.string().min(3).max(20), z.boolean()),
  customPrompts: z.array(z.string().min(1).max(200)).max(400)
});

/*** handler validation schemas ***/

const configurableOptionsSchema = options
  .omit({
    minPlayers: true,
    maxPlayers: true,
    promptSkipping: true
  })
  .partial();

// be a little more permissive with options so unit tests can run
const configurableOptionsSchemaDev = options
  .omit({ promptTimer: true })
  .extend({
    promptTimer: z.number().int().min(0).max(60),
    minPlayers: z.number().int()
  })
  .partial();

export type Options = z.infer<typeof options>;

export type ConfigurableOptions =
  | z.infer<typeof configurableOptionsSchema>
  | z.infer<typeof configurableOptionsSchemaDev>;

type ConfigurableOptionsSchema = typeof configurableOptionsSchema | typeof configurableOptionsSchemaDev;

export function getConfigurableOptionsSchema(): ConfigurableOptionsSchema {
  if (process.env.NODE_ENV !== 'production') {
    return configurableOptionsSchemaDev;
  } else {
    return configurableOptionsSchema;
  }
}

export const defaultOptions: Options = {
  promptTimer: 35,
  autoNumRounds: true, // set numRounds to num players when game starts
  numRounds: 3,
  sikeDispute: true,
  sikeRetries: 0,
  promptSkipping: true,
  minPlayers: 3,
  maxPlayers: 12,
  packs: {},
  customPrompts: []
};
