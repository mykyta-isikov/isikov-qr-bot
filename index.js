const TelegramBot = require('node-telegram-bot-api')
require('dotenv').config()

const PORT = process.env.PORT || 4000
const TOKEN = process.env.TOKEN
console.log(TOKEN)
const URL = 'https://isikov-qr-bot.herokuapp.com/bot'
const ISOstring = ' !"#$%&\'()*+,-.0123456789:;<=>?ABCDEFGHIJKLMNOPQRSTUVWXYZ[]\\^_`abcdefghijklmnopqrstuvwxyz{}|~@/'

/// Bot creation
let bot = undefined
if(process.env.NODE_ENV == 'production') {
  bot = new TelegramBot(TOKEN, {
    webHook: {
      port: PORT
    }
  })
  bot.setWebHook(`${URL}/bot${TOKEN}`)

  console.log('Bot is running in production mode...')
} else {
  bot = new TelegramBot(TOKEN, {polling: true})
  bot.on('polling_error', console.log)

  console.log('Bot is running  in develop mode...')
}

/// Functions
function checkInput(input, patternString) {
  let flag = true
  Array.from(input).forEach(char => {
    let sw = false
    Array.from(patternString).forEach(element => {
      if(char == element) {
        sw = true
      }
    })
    if(sw == false) {
      flag = false
      return
    } 
  })
  return flag  
}

function sendQRCode(id, input) {
  const validInput = encodeURIComponent(input)
  const png_url = `http://api.qrserver.com/v1/create-qr-code/?data=${validInput}`

  bot.sendPhoto(id, png_url)
  .then()
  .catch((error) => {
    bot.sendMessage(id, "❌Oops... Something went wrong during conversion")
    console.log(error)
  })
}

/// Bot instructions
bot.onText(/\/start/, (msg) => {
  const id = msg.chat.id
  const text = `<b>Welcome to QR-code generator!</b>\n\nBegin your work with command: /make [text to convert].\nFor example, "/make test conversion" or '/make https://foo.bar/' will return you fully operational QR-codes.\n\nAlso you can check allowed characters using command /info.`

  bot.sendMessage(id, text, {parse_mode: 'HTML'})
})

bot.onText(/\/info/, (msg) => {
  const id = msg.chat.id
  const text = `Character restrictions\n\nWhen using /make command, input string should not contain characters other than these:\n📌${ISOstring}.\n\nOtherwise, an error will be thrown and bot will not generate a QR-code.`

  bot.sendMessage(id, text)
})

bot.onText(/\/make/, (msg) => {
  const id = msg.chat.id

  if(msg.text.trim() == '/make') {
    bot.sendMessage(id, "Please, provide data for encryption")
  }
})

bot.onText(/\/make (.+)/, (msg, [raw, text]) => {
  const id = msg.chat.id

  if(checkInput(text, ISOstring)) {
    sendQRCode(id, text)
  } else {
    bot.sendMessage(id, 
      "❌Your message contains unacceptable characters.\n" +
      "Please, check out /info for more details")
  }
})
