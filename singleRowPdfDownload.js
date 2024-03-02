const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const https = require('https');
const path = require('path');

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("--disable-notifications"); 

let driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

(async function() {
    try {
        await driver.get('https://parivahan.gov.in/parivahan//en/content/driving-licence-0');

        await driver.wait(until.elementLocated(By.tagName('table')), 10000);

        let tableRows = await driver.findElements(By.xpath('//table//tr'));

        for (let i = 0; i < 2; i++) {
            let tr = tableRows[i];

            try {
                let pdfLinkElement = await tr.findElement(By.xpath('.//a'));

                let pdfUrl = await pdfLinkElement.getAttribute('href');

                let pdfFileName = pdfUrl.split('/').pop();

                await pdfLinkElement.click();

                let tabs = await driver.getAllWindowHandles();
                await driver.switchTo().window(tabs[1]); 

                let downloadPath = path.join(__dirname, pdfFileName); 

                let dest = fs.createWriteStream(downloadPath);

                const request = https.get(pdfUrl, response => {
                    response.pipe(dest);
                });

                request.on('error', error => {
                    console.error('Error:', error);
                });

                await driver.close();
                await driver.switchTo().window(tabs[0]);

            } catch (err) {
                console.error('Error could not find pdf in row:', err);
                continue; 
            }
        }
    } catch (error) {
        console.error('Error :', error);
    } finally {
        await driver.quit();
    }
})();
