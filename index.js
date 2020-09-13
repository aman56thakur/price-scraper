const puppeteer = require('puppeteer')
const $ = require('cheerio')
const CronJob = require('cron').CronJob
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const url =
  'https://www.amazon.in/Acer-ED322QR-31-5-inch-Monitor-Speakers/dp/B07XYD79KR'

async function configureBrowser() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)
  return page
}

async function checkPrice(page) {
  await page.reload()
  const html = await page.evaluate(() => document.body.innerHTML)
  $('#priceblock_ourprice', html).each(function () {
    const rupeePrice = $(this).text()
    const price = Number(rupeePrice.replace(/[^0-9.-]+/g, ''))
    if (price <= 150000) sendWelcomeEmail(rupeePrice)
  })
}

function sendWelcomeEmail(price) {
  sgMail.send({
    to: 'aman56thakur@gmail.com',
    from: 'amant9656@gmail.com',
    subject: `Price Dropped to ${price}`,
    html:
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Price Dropped!!</title></head><body style="font-family:Century Gothic"><div><h1>Price Dropped!!</h1><h2>Buy the Acer Monitor now.</h2><br><a href="https://www.amazon.in/Acer-ED322QR-31-5-inch-Monitor-Speakers/dp/B07XYD79KR" style="text-decoration:none;background-color:#2f4f4f;color:#fff;padding:8px 12px 8px 12px;border-radius:5px;font-size:large">Product Link</a></div></body></html>',
  })
}

async function monitor() {
  const page = await configureBrowser()
  let job = new CronJob(
    '* * */6 * * *',
    function () {
      checkPrice(page)
    },
    null,
    true,
    null,
    null,
    true
  )
  job.start()
}

monitor()
