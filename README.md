# @Koboldie

NodeJS and telegraf based telegram bot. You can test it [here](https://t.me/Koboldie_bot)

## Features

- Easy add command system with dynamic /help and popup suggestions list
- Easy to create any button menu
- Cached access to the database, which speeds up the process several times.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`TOKEN` Telegram bot token. You can get your own in [@BotFather](https://t.me/BotFather)

`DB_TOKEN` Read more [here](https://www.npmjs.org/package/leafy-db)

`ownerID` Your telegram id

`logID` Id of chat where you wanna see logs ("user used a command", etc) and error messages

`whereImRunning` Optional. Will shown when users uses /version command

## Run Locally

Clone the project

```bash
  git clone https://github.com/xiller228/telegram-bot
```

Go to the project directory

```bash
  cd telegram-bot
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node .
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
