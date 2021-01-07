
// const puppeteer = require('puppeteer')

import * as puppeteer from 'puppeteer'

run().then(() => console.log('PUPPETEER RUNNING')).catch(console.error)

function handleStuff () {

  const myClickHandler = e => {
    console.log(e)
    const t = String(e.timeStamp)
    const x = String(e.pageX)
    const y = String(e.pageY)
    const p = e.path.map(x => {
      let data = ''
      x.tagName && (data += x.tagName)
      x.id && (data += `#${x.id}`)
      x.className && (data += `.${x.className.trim().replaceAll(' ', '.')}`)
      return data
    }).filter(Boolean).reverse().join(' > ')
    return window.InvertPuppeteerHelper({t, x, y, p})
  }

  if (!window.InvertPuppeteerFlagSet) {
    document.addEventListener('click', myClickHandler, true)
  }

  window['InvertPuppeteerFlagSet'] = true
}


async function run () {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: null,
    args: [
      '--start-fullscreen'
    ],
    ignoreDefaultArgs: true
  })

  browser.on('targetcreated', async t => {
    if (t.type() !== 'page') return

    console.log('TARGET CREATED', t._targetInfo.targetId, '@', t.url())

    const p = await t.page()

    await p.exposeFunction('InvertPuppeteerHelper', async e => {
      console.log('InvertPuppeteerHelper', e)
    })

    await p.evaluate(handleStuff)

    await p.evaluateOnNewDocument(handleStuff)
  })

  // notify of change to the active target
  browser.on('targetchanged', async t => {
    if (t.type() !== 'page') return

    console.log('TARGET CHANGED', t._targetInfo.targetId, '@', t.url())
  })

  // Notify of target destroyed
  browser.on('targetdestroyed', t => {
    if (t.type() !== 'page') return

    console.log('TARGET DESTROYED', t._targetInfo.targetId, '@', t.url())
  })


  // await browser.close()
}
