import { z } from 'zod';

// static unchanging flags
// good for hiding beta features, can be moved to exposed options schema if we want clients to be able to control it
type ConfigFlags = {
  maxPlayers: number;
  recPlayers: number;
  minPlayers: number;
  promptSkipping: boolean;
};

// config options that are client configurable
const settableOptionsSchema = z.object({
  promptTimer: z.number().int().min(15).max(60),
  numRounds: z.number().int().min(1).max(20),
  autoNumRounds: z.boolean(),
  sikeDispute: z.boolean(),
  sikeRetries: z.number().int().min(0).max(2),
  packs: z.record(z.string().min(3).max(20), z.boolean()),
  customPrompts: z.array(z.string().min(1).max(200)).max(400)
});

// be a little more permissive with options so unit tests can run
const settableOptionsSchemaDev = settableOptionsSchema.omit({ promptTimer: true }).extend({
  promptTimer: z.number().int().min(0).max(60),
  minPlayers: z.number().int()
});

// config options that are visible to client
// (customPrompts can be set, but shouldn't be propagated to clients)
export type SettableOptions = z.infer<typeof settableOptionsSchemaDev>;

// both exposed config options and static config options
export type Options = SettableOptions & ConfigFlags;

type SettableOptionsSchema = typeof settableOptionsSchemaDev | typeof settableOptionsSchema;

export function getSettableOptionsSchema(): SettableOptionsSchema {
  if (process.env.NODE_ENV !== 'production') {
    return settableOptionsSchemaDev;
  } else {
    return settableOptionsSchema;
  }
}

const visibleOptionsSchema = settableOptionsSchema.omit({ customPrompts: true });
const visibleOptionsSchemaDev = settableOptionsSchemaDev.omit({ customPrompts: true });

export type VisibleOptions = z.infer<typeof visibleOptionsSchema>;

type VisibleOptionsSchema = typeof visibleOptionsSchemaDev | typeof visibleOptionsSchema;

export function getVisibleOptionsSchema(): VisibleOptionsSchema {
  if (process.env.NODE_ENV !== 'production') {
    return visibleOptionsSchemaDev;
  } else {
    return visibleOptionsSchema;
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
  recPlayers: 5,
  maxPlayers: 12,
  packs: {},
  customPrompts: []
};
