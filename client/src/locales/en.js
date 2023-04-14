export default {
    strikeOrSike: 'Strike or Sike',
    strike: 'Strike',
    sike: 'Sike',
    choice: 'Choice',
    cont: 'Continue',
    pending: 'Pending',
    confirm: 'Confirm',
    cancel: 'Cancel',

    /*** HOME STRINGS ***/
    usernameLabel: 'Name',
    usernamePlaceholder: 'your name',
    roomNameLabel: 'Room Name',
    roomNamePlaceholder: 'room name',
    joinGame: 'Join Game',
    createGame: 'Create Game',
    coffeeLink: 'Buy me a tea',
    coffeeAlt: 'Buy me a coffee',

    /*** HOME ERRORS ***/
    roomTaken: 'Room name is taken',
    noRoomName: 'Room name is required',
    noName: 'Name is required',
    shortName: 'Name is too short',
    longName: 'Name is too long',
    shortRoomName: 'Room name is too short',
    longRoomName: 'Room name is too long',
    noSpace: 'Room is full',
    noRoom: 'Room does not exist',
    nameTaken: 'Name is taken',
    roomCannotStartWithNum: 'Room name cannot start with a number',
    invalidCharacter: 'Unrecognized character in room name',
    inactiveRoom: 'Room closed due to inactivity',

    /*** LOBBY STRINGS ***/
    players: 'Players',
    startGame: 'Start',
    coffeeBannerLink: 'I\'d love a tea',

    /*** OPTIONS STRINGS ***/
    timerDurationLabel: 'Timer',
    numRoundsLabel: 'Rounds',
    sikeDisputeLabel: 'Dispute Sike',
    sikeRetriesLabel: 'Retries',
    promptPacksLabel: 'Packs',
    customPromptsLabel: 'Custom Prompts',
    customPromptsPlaceholder: 'Separate prompts with new lines...',

    packLabels: {
        standard: 'Basic',
        canadian: 'Canadian',
        whimsical: 'Whimsical',
        personal: 'Personal',
        videogames: 'Video Games',
        custom: 'Custom'
    },

    /*** GAME MESSAGES ***/
    selection: {
        message: '{player} is picking a word to...',
        selfMessage: '{self} are picking a word to...',
        self: 'You'
    },

    /*** END ROUND STRINGS ***/
    startNextRound: 'Next Round',
    viewResults: 'Final Scores',

    /*** END GAME STRINGS ***/
    playerScores: 'Player Scores',
    toLobby: 'Back to Lobby',
    activeMatchingMessage: '{player} is trying to {type} with {response} Do you have a match?',
    passiveDisputeMessage: 'Your friends are deciding if {response} fits the category',
    activeDisputeMessage: 'Does {response} fit the category?',
    skipPrompt: 'Vote Skip',
    scoreMessage: '{player}\'s Score: {score}',
    selfScoreMessage: 'Your Score: {score}',

    /*** TOOL TIPS ***/
    tooltip: {
        options: {
            timer: 'Duration given to respond to the prompt',
            rounds: 'The number of rounds the game will last for',
            dispute: 'Allow players to dispute a sike if it doesn\'t fit the prompt',
            retries: 'Allow a player with a failed sike to retry',
        },
        startDisabled: '3 players are needed to start a game',
        strike: 'Something you think everyone thought of',
        sike: 'Something you think no one thought of',
        choice: '', // exists to toggle off selectionType tooltip
        noMatch: 'Nothing matches: {response}',
        voteSkip: 'Vote to skip current prompt',
        dispute: 'Vote to dispute {response}'
    },

    /*** HOW TO PLAY ***/
    howToPlayLink: 'How To Play',
    howToPlay: [
        {
            key: 'overview',
            header: 'Overview',
            body: 'Strike or Sike is a fun simple party game suitable for groups of all sizes and players of all ages. Players earn points by being creative and thinking outside the box... and inside the box... and knowing what\'s in and out of the box!',
            children: []
        },
        {
            key: 'prompt',
            header: 'Prompt',
            body: 'At the start of each round, every player is given the same prompt. For the duration of the timer, players can respond to the prompt with whatever they feel fits the category. Clever answers are allowed and encouraged! Try to respond with an equal number of uncommon and common answers. In this example round, the prompt is "Languages". Some possible responses are English, French, and Javascript (a programming language).',
            alt: 'Example of responding to prompts',
            children: [],
        },
        {
            key: 'selection',
            header: 'Selection',
            body: 'After the timer runs out, every player will get a chance to select. The overlord computer will roll a die and pick whether the Selector will Strike, Sike or get their Choice. The Selector will then choose a response based on what was rolled.',
            children: [
                {
                    key: 'strike',
                    header: 'Strike',
                    body: 'The Selector will pick a response from their list that they think all other players also wrote down. A good choice for "Languages" might be English, because it is the language you are currently using. The Selector’s score for this round is the number of players who also had English on their list.',
                    alt: 'Example of selecting a Strike',
                },
                {
                    key: 'sike',
                    header: 'Sike',
                    body: 'The Selector will pick a response from their list that they think no other players wrote down. A good choice for "Languages" might be Javascript, because it is a programming language, not a natural language. The Selector’s score for this round is the number of players who did not have Javascript on their list.'
                },
                {
                    key: 'choice',
                    header: 'Choice',
                    body: 'The Selector gets to choose whether they would like to Strike or Sike! After choosing, the Selector proceeds to pick a response as if they had rolled Strike or Sike.'
                }
            ]
        },
        {
            key: 'matching',
            header: 'Matching',
            body: 'Most of the time matching is done automatically, but sometimes synonyms exist (or the word was misspelled). It is up to the players to decide whether or not 2 responses are the same. For example, Airplane and Plane would likely be considered the same response most of the time. When prompted, either match the selected word to a corresponding synonym in your list, or hit the Sike button if you don\'t have one.',
            children: []
        },
        {
            key: 'options',
            header: 'Options',
            body: '',
            children: [
                {
                    key: 'packs',
                    header: 'Prompt Packs',
                    body: 'Pick which themes and varieties you want your prompts to come in. Feel free to mix and match packs and select custom if you want to create your own prompts.',
                    children: []
                },
                {
                    key: 'custom',
                    header: 'Custom Prompts',
                    body: 'Write out all of the prompts that make you and your friends click. Paste your custom prompts in the text area as a newline separated list. Use !n to randomly insert a players name into your prompt and make it personal e.g. "!n\'s hobbies". If you have a list of prompts that you think other players might like feel free to share it with me!',
                    children: []
                },
                {
                    key: 'timer',
                    header: 'Timer',
                    body: 'Changes how long players are given to respond to prompts. By default it is set to 35 seconds but it can be set as low as 15 seconds and as high as 60.',
                    children: []
                },
                {
                    key: 'rounds',
                    header: 'Rounds',
                    body: 'The number of rounds the game will last for. By default this is equal to the number of players because selecting first in a round is advantageous, and this allows every player to select first once.',
                    children: []
                },
                {
                    key: 'dispute',
                    header: 'Dispute Sike',
                    body: 'Gives players the option to dispute whether a selected Sike fits the prompt. By default, players can vote that a selected Sike does not adequately fit the prompt. If you trust your friends and don\'t want to cause fighting, this can be disabled.',
                    children: []
                },
                {
                    key: 'retries',
                    header: 'Retries',
                    body: 'By default, after a Selector’s Sike has successfully been disputed, the Selector\'s turn is over and they get 0 points. If you believe this punishment is too harsh, you can let them retry, and select a Sike that actually fits the category. I\'m sure it was just a misunderstanding…',
                    children: ''
                }
            ]
        }
    ],

    /*** ABOUT PAGE STRINGS ***/

    about: {
        link: 'About',
        header: 'About',
        project: 'Strike or Sike has been a passion project of mine. Throughout the pandemic, game room sites, like this one, kept my friends and family entertained. Since I couldn\'t find one of my favourite games "Hit or Miss" anywhere, I decided to make it myself.',
        openSource: 'This project is completely open source and can be found on {github}. If you want to contribute –  add a new feature, fix a bug, support a new language, or add more prompt packs –  feel free to submit a pull request. If you see a bug or want a feature (but aren’t as technically inclined) you can submit an {issues} or email us at {gmail}.',
        me: 'This project was designed by Conor Murphy. You can learn more about me and my projects {profile}. A big thank you to Jen Gu, who designed all of the art assets and helped with UI/UX design. If you have enjoyed playing this game and want to support the website, you can buy us a {coffee}.',
        github: 'GitHub',
        issues: 'issue',
        profile: 'here',
        coffee: 'tea',
    }
}