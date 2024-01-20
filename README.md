# StrikeOrSike &middot; [![GitHub license](https://img.shields.io/badge/license-gpl-blue.svg)](https://github.com/ConorMurphy21/StrikeOrSike/blob/master/LICENSE) [![Node.js CI](https://github.com/ConorMurphy21/StrikeOrSike/actions/workflows/automated_git_config.yml/badge.svg)](https://github.com/ConorMurphy21/StrikeOrSike/actions/workflows/automated_git_config.yml) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

Strike or Sike is a game room website inspired by the discontinued board game "hit or miss".

Visit here at [strikeorsike.io](https://strikeorsike.io)

### Developed with

- [Node](https://nodejs.org/en)
- [Vue](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Mocha](https://mochajs.org/)

## Prerequisites

- [Visual Studio Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools)
  > Select the "Desktop development with C++" workload

## Installation

1. Install Node modules in the top directory

```
cd StrikeOrSike
npm install
```

2. Install Node modules in the client directory

```
cd client
npm install
```

3. Install Node modules in the server directory

```
cd ../server
npm install
```

## Running the client/sever

1. Start the server

```
npm run dev
```

2. Start the client
   > Note: you will have to run this command in a second shell

```
cd StrikeOrSike/client
npm run dev
```

3. Navigate to the client homepage `http://localhost:8080/`
