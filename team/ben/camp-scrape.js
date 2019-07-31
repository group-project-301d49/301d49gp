'use strict'

const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.reserveamerica.com/campgroundDetails.do?contractCode=CO&parkId=50032&xml=true', { waitUntil: 'networkidle2' });

        let resultObj = [];

        const attrHandles = await page.$$('.html-attribute');
        // console.log(attrHandles)
        for (const attrHandle of attrHandles) {
            const attr = await attrHandle.$eval('.html-attribute-name', e => e.textContent);
            const value = await attrHandle.$eval('.html-attribute-value', e => e.textContent);

            resultObj.push({ attr, value });
        }


        await browser.close();

        console.log(resultObj)

    } catch (e) {
        console.log('PUPPETEER', e, 'PUPPETEER END');
    }
})();