const TelegramBot = require('node-telegram-bot-api')

const TOKEN = '1759647109:AAFuRJPze16vsCTVfg7b-DBb9Bmf2_-VY4g'
const ISOstring = ' !"#$%&\'()*+,-.0123456789:;<=>?ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~@/'

function checkInput(input) {
  let flag = true
  Array.from(input).forEach(char => {
    let sw = false
    Array.from(ISOstring).forEach(element => {
      if(char == element) {
        sw = true
      }
    })
    if(sw == false) {
      flag = false
    } 
  })
  return flag  
}

function sendQRCode(id, input) {
  const validInput = encodeURIComponent(input)
  const png_url = `http://api.qrserver.com/v1/create-qr-code/?data=${validInput}`

  bot.sendPhoto(id, png_url, {
    caption: "✅Your message successfully encoded!"
  })
  .then(() => {})
  .catch((error) => {
    bot.sendMessage(id, "❌Oops... Something went wrong during conversion")
    console.log(error)
  })
}

const bot = new TelegramBot(TOKEN, {polling: true})

console.log('Bot is running...')

bot.on('polling_error', console.log);

bot.onText(/\/start/, (msg) => {
  const id = msg.chat.id
  const text = `<b>Welcome to QR-code generator!</b>\n\nBegin your work with command: /make [text to convert].\nFor example, "/make test conversion" or '/make https://foo.bar/' will return you fully operational QR-codes.\n\nAlso you can check allowed characters using command /info.`

  bot.sendMessage(id, text, {parse_mode: 'HTML'})
})

bot.onText(/\/info/, (msg) => {
  const id = msg.chat.id
  const text = `🛑Character restrictions🛑\nWhen using /make command, input string should not contain characters other than these:\n\n📌${ISOstring}📌.\n\nOtherwise, an error will be thrown and bot will not generate a QR-code.`

  bot.sendMessage(id, text)
})

bot.onText(/\/make (.+)/, (msg, [raw, text]) => {
  const id = msg.chat.id
  
  if(checkInput(text)) {
    sendQRCode(id, text)
  } else {
    bot.sendMessage(id, 
      "❌Your message contains unacceptable characters.\n" +
      "Please, check out /info for more details")
  }
})
