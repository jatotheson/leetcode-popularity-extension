// import * as $ from "jquery"
export {}

const GREEN = 'text-olive dark:text-dark-olive'
const YELLOW = 'text-yellow dark:text-dark-yellow'
const RED = 'text-pink dark:text-dark-pink'

function generatePopularitySpan(row : HTMLElement) {
    // TODO: change to actual value
    let popularity = parseFloat(((row.children)[3] as HTMLElement).innerText)
    let popularityColor = popularity > 50 ? GREEN : popularity < 25 ? RED : YELLOW
    let popularityText = document.createElement('span')
    popularityText.className = popularityColor
    popularityText.innerText = popularity.toFixed(1) + "%, 219"

    return popularityText
}

function addPopularity() {
    // get all rows in page (including header)
    let rows = Array.from(document.querySelectorAll('[role=row]'))

    // update header row
    let headerRow = rows.shift() as HTMLElement
    let headers = headerRow.children
    let freqColHeader = (headers[headers.length - 1]).cloneNode(true) as HTMLElement
    freqColHeader.innerText = "Popularity"
    headerRow.appendChild(freqColHeader)

    // append popularity value to each body row
    for (let i = 0; i < rows.length; i++) {
        let popularityText = generatePopularitySpan(rows[i] as HTMLElement)

        let difficultyCell = (rows[i].children)[4] as HTMLElement
        let popularityCell = difficultyCell.cloneNode(true) as HTMLElement
        const dummyChild = popularityCell.children[0]
        popularityCell.appendChild(popularityText)
        popularityCell.removeChild(dummyChild)
        rows[i].appendChild(popularityCell)
    }

}

// TODO
function updatePopularity() {
    // const WAITOUT_TIME_MS = 10000
    // setTimeout(() => {}, WAITOUT_TIME_MS)
    // console.log('DONE WAITING ' + WAITOUT_TIME_MS / 1000 + ' SECONDS!')

    console.log('UPDATING POPULARITY...')
    let rows = Array.from(document.querySelectorAll('[role=row]'))
    // skip header row
    rows.shift()

    for (let i = 0; i < rows.length; i++) {
        let popularityText = generatePopularitySpan(rows[i] as HTMLElement)

        let popularityCellMissing = rows[i].children.length !== 7
        let popularityCell = popularityCellMissing ?
            rows[i].children[4].cloneNode(true) as HTMLElement :
            rows[i].children[rows[i].children.length - 1] as HTMLElement
        const dummyChild = popularityCell.children[0]
        popularityCell.appendChild(popularityText)
        popularityCell.removeChild(dummyChild)

        if (popularityCellMissing) {
            rows[i].append(popularityCell)
        }
    }

    console.log('UPDATE POPULARITY COMPLETE!')
}

function getPopularityValues () {
    let rows = Array.from(document.querySelectorAll('[role=row]'))
    // skip header
    rows.shift()

    // get URL
    let testRow = rows[0]
    let urlCell = testRow.children[1]
    let anchorClassName = 'h-5 truncate hover:text-primary-s dark:hover:text-dark-primary-s'
    let anchor = urlCell.getElementsByClassName(anchorClassName)[0] as HTMLAnchorElement
    let href = anchor.href

    let ajax = new XMLHttpRequest()
    ajax.open('GET', href)
    // ajax.responseType = 'document'

    ajax.send()
    ajax.onreadystatechange = function () {
        if (ajax.readyState === 4 && ajax.status === 200) {
            console.log('ajax ready at: ' + href)
            // console.log(ajax.responseText)

            let parser = new DOMParser()
            let responseDoc = parser.parseFromString(ajax.responseText, 'text/html')
            let buttons = responseDoc.getElementsByClassName('btn__r7r7 css-1rdgofi')
            if (buttons.length > 0) {
                console.log('numLikes = ' + buttons[0].innerHTML)
            } else {
                console.log('NO BUTTONS DETECTED')
            }

            // let doc = ajax.response as Document
            // let buttons = doc.getElementsByClassName('btn__r7r7 css-1rdgofi')
            // if (buttons.length > 0) {
            //     console.log('numLikes = ' + buttons[0].innerHTML)
            // } else {
            //     console.log('NO BUTTONS DETECTED')
            // }
        }
    }
}

setTimeout(() => {
    addPopularity()
}, 1000)

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // listen for messages sent from background.js
        if (request.message === 'new page detected!') {
            console.log('\n\nREQUEST URL: ' + request.url)
            const popularityLoop = setInterval(() => {
                let rows = Array.from(document.querySelectorAll('[role=row]'))
                // skip header row
                rows.shift()

                function validRowCheck(rows : Array<Element>, index : number) {
                    let children = rows[index].children
                    if (children.length !== 7) {
                        console.log('numChildren for ' + index + 'row: ' + children.length)
                        return false
                    }

                    let c1 = children.item(3) as HTMLElement
                    let c2 = children.item(6) as HTMLElement
                    let t1 = c1.innerText
                    let t2 = c2.innerText.indexOf(',') !== -1 ? c2.innerText.split(',')[0] : c2.innerText
                    if (t1 !== t2) {
                        console.log(t1 + '      |      ' + t2)
                        return false
                    }

                    return true
                }

                if (validRowCheck(rows, 0) && validRowCheck(rows, rows.length - 1)) {
                    clearInterval(popularityLoop)
                    getPopularityValues()
                    console.log('interval cleared!')
                }

                updatePopularity()
            }, 100)
        }
    });

// addPopularity()