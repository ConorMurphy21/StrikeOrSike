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
    howToPlay: [
        {
            header: 'Overview',
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.',
            children: []
        },
        {
            header: 'Setup',
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.',
            children: [
                {
                    header: 'Create game',
                    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.'
                },
                {
                    header: 'Join game',
                    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.'
                }
            ]
        },
        {
            header: 'Listing words',
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.',
            children: []
        },
        {
            header: 'Selecting',
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.',
            children: [
                {
                    header: 'Strike',
                    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.'
                },
                {
                    header: 'Sike',
                    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.'
                },
                {
                    header: 'Choice',
                    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.'
                }
            ]
        },
        {
            header: 'Matching',
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.',
            children: []
        },
        {
            header: 'Options',
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Sit amet cursus sit amet. Egestas purus viverra accumsan in nisl nisi scelerisque eu. Dolor magna eget est lorem ipsum dolor sit amet.',
            children: []
        }
    ]
}