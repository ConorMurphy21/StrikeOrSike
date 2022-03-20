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

    /*** OPTIONS STRINGS ***/
    timerDurationLabel: 'Timer:',
    numRoundsLabel: 'Rounds:',
    sikeDisputeLabel: 'Dispute Sike:',
    sikeRetriesLabel: 'Retries:',

    /*** GAME MESSAGES ***/
    selection: {
        message: '{player} is picking a word to...',
        selfMessage: '{self} are picking a word to...',
        self: 'You'
    },

    /*** END ROUND STRINGS ***/
    startNextRound: 'Next Round',

    /*** END GAME STRINGS ***/
    playerScores: 'Player Scores',
    toLobby: 'Back to Lobby',
    activeMatchingMessage: '{player} selected {response} to {type}, do you have a match?',
    passiveDisputeMessage: 'Your friends are deciding if {response} fits the category',
    activeDisputeMessage: 'Does {response} fit the category?',
    skipPrompt: 'Vote Skip',
    scoreMessage: '{player}\'s Score: {score}',
    selfScoreMessage: 'Your Score: {score}',

    /*** HOW TO PLAY ***/
    howToPlayLink: 'How To Play',
    howToPlay: [
        {
            key: 'overview',
            header: 'Overview',
            body: 'Strike or Sike is a fun simple party game suitable for players and groups of all sizes ages. Players are rewarded for being creative and thinking outside the box... and inside the box... and knowing what\'s in and out of the box.',
            children: []
        },
        // {
        //     header: 'Setup',
        //     body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.',
        //     children: [
        //         {
        //             header: 'Create game',
        //             body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.'
        //         },
        //         {
        //             header: 'Join game',
        //             body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.'
        //         }
        //     ]
        // },
        {
            key: 'prompt',
            header: 'Prompt',
            body: 'At the start of each round, each player is given the same prompt. For the duration of the timer, players can respond to the with whatever they feel is fits the category. Clever answers are allowed as long as they fit the prompt. Try to respond with an equal number of uncommon and common answers. In this example round, the prompt is "Ice cream flavours". Some possible responses are Vanilla, Chocolate, and Garlic.',
            alt: 'Example of responding to prompts',
            children: [],
        },
        {
            key: 'selection',
            header: 'Selection',
            body: 'After the timer runs out, each player will get a chance to select! The overlord computer will role a dice and pick whether either strike, sike or choice.',
            children: [
                {
                    key: 'strike',
                    header: 'Strike',
                    body: 'The selector will pick a response from their list that they think all other players also wrote down. A good choice for "Ice cream flavours" might be vanilla, because it is a very common flavour. The somethingers score for this round is the number of players who also had vanilla on their list.\n',
                    alt: 'Example of selecting a Strike',
                },
                {
                    key: 'sike',
                    header: 'Sike',
                    body: 'The selector will pick a response from their list that they think no other players wrote down. A good choice for "Ice cream flavours" might be garlic, because it is an ice cream flavour that exists, but not a top flavour. The somethingers score for this round is the number of players who did not have garlic on their list.'
                },
                {
                    key: 'choice',
                    header: 'Choice',
                    body: 'The selector gets to choose whether they would like to Strike or Sike. After choosing, the player picks a response as if they had rolled Strike or Sike.'
                }
            ]
        },
        {
            key: 'matching',
            header: 'Matching',
            body: 'Most of the time matching is done automatically, but sometimes synonyms exist, and it is up to the players to decide whether or not 2 responses are the same. For example, airplane and plane are probably the same. When prompted, either match the selected word to a corresponding synonym in your list, or hit the Sike button because you don\'t have one.',
            children: []
        },
        {
            header: 'Options',
            body: '',
            children: [
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
                    header: 'Sike Dispute',
                    body: 'By default, players can vote that a selected Sike does not adequately fit the prompt. If you trust your friends and don\'t want to cause fighting this can be disabled.',
                    children: []
                },
                {
                    key: 'retries',
                    header: 'Retries',
                    body: 'By default, after a selectors Sike has successfully been disputed, the selector\'s turn is over and they get 0 points. If you believe this punishment is too harsh, you can let them retry, and select a Sike that actually fits the category. I\'m sure it was just a misunderstanding.',
                    children: ''
                }
            ]
        }
    ],

    /*** ABOUT ***/
    aboutLink: 'About',
}