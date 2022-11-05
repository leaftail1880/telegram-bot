# @Koboldie

NodeJS and telegraf based telegram bot. You can test it [here](https://t.me/Koboldiebot)


## Features

- Easy add command system with dynamic /help list
- Easy to create any button menu
- Organized (cached) access to the database, which speeds up the process several times. 



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`TOKEN` Telegram bot token. You can get your own in [@BotFather](https://t.me/BotFather)

`REDIS_URL` Redis database url. You can create your own [here](https://dashboard.render.com)

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



