// Global variable with the coinlist
var coinList = {}

// To see if conditions are met before updating prices
var priceUpdateReady = false

// All coins fetched
var allCoins = {}

// Array for users tokens
const myTokens = ['ETH', 'BTC', 'APPC', 'XRB']

// Container for our tokens
const tokenContainer = document.querySelector('.tokenContainer')

// Get all coin data
const initialTokenSetup = () => {
  // Toggle it here cause I don't know how return works...
  toggleStarting(true)
  console.log('fetching coinlist')
  return fetch(`https://min-api.cryptocompare.com/data/all/coinlist`)
    .then(response => {
      return response.json()
    })
    .then(data => {
      allCoins = data.Data
      myTokens.forEach(k => {
        coinList[k] = {
          coinName: data.Data[k].CoinName,
          coinSymbol: data.Data[k].Symbol,
          tokenIcon: `https://www.cryptocompare.com${data.Data[k].ImageUrl}`
        }
      })
    })
}

// Function that fetches prices for the tokens requested and returns the response data as JSON
const fetchTokenPrice = tokens => {
  console.log(`fetching value of ${tokens}`)
  return fetch(
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${tokens}&tsyms=USD,EUR,BTC`
  )
    .then(response => {
      return response.json()
    })
    .catch(error => {
      console.log(error.message)
    })
}

// Handle the JSON data coming from the fetch function and put the prices into object
const updateTokenPrice = () => {
  return fetchTokenPrice(myTokens).then(response => {
    const displayData = response.DISPLAY
    Object.keys(displayData).forEach(k => {
      // Add new fresh prices to coinlist
      coinList[k].prices = {
        priceUSD: displayData[k].USD.PRICE,
        changeUSD: displayData[k].USD.CHANGEPCT24HOUR,
        priceEUR: displayData[k].EUR.PRICE,
        changeEUR: displayData[k].EUR.CHANGEPCT24HOUR,
        priceBTC: displayData[k].BTC.PRICE,
        changeBTC: displayData[k].BTC.CHANGEPCT24HOUR
      }
    })
  })
}

const createTokenItem = coinList => {
  // I know there is a better way to do this
  let index = -1
  myTokens.forEach(k => {
    console.log(`Creating token item for ${coinList[k].coinName}`)
    // This feels old-school, fix
    index = index + 1
    console.log(`Fixa oldschool index räknaren`)
    // Setting up the new token Div
    const newTokenDiv = document.createElement('div')
    // Giving token div a class
    newTokenDiv.className = 'tokenItem'
    newTokenDiv.dataset.token = coinList[k].coinSymbol
    // Setting a animation delay on object according to which order it is
    // This needs to change to only apply for the first animation when the items come in
    const delay = index * 100
    newTokenDiv.style.animationDelay = `${delay}ms`

    // Setting up left column of token div
    const tokenDivLeft = document.createElement('div')
    tokenDivLeft.className = 'tokenItem-leftContent'

    // Setting up right column of token div
    const tokenDivRight = document.createElement('div')
    tokenDivRight.className = 'tokenItem-rightContent'

    // Setting up name div that holds both name and symbol of token
    const tokenNameSymbol = document.createElement('div')
    tokenNameSymbol.className = 'tokenNameSymbol'

    // Setting up token icon
    const tokenIcon = document.createElement('div')
    tokenIcon.className = 'tokenItem-icon'
    tokenIcon.style.backgroundImage = `url('${coinList[k].tokenIcon}')`

    // Create a text string containing the token name of the token
    const tokenName = document.createElement('span')
    tokenName.className = 'tokenName'
    tokenName.innerHTML = coinList[k].coinName

    // Create a text string containing the symbol of the token
    const tokenSymbol = document.createElement('span')
    tokenSymbol.className = 'tokenSymbol'
    tokenSymbol.innerHTML = coinList[k].coinSymbol

    // USD value
    const tokenValue = document.createElement('span')
    tokenValue.className = 'tokenValue'
    tokenValue.innerHTML = coinList[k].prices.priceUSD

    // USD change
    const tokenChange24 = document.createElement('span')
    tokenChange24.className = 'tokenChange'
    tokenChange24.innerHTML = `${coinList[k].prices.changeUSD} %`.replace('$', '')

    // Append content
    tokenNameSymbol.appendChild(tokenName)
    tokenNameSymbol.appendChild(tokenSymbol)

    // Append content spans to correct divs
    tokenDivLeft.appendChild(tokenValue)
    tokenDivLeft.appendChild(tokenNameSymbol)
    tokenDivRight.appendChild(tokenChange24)

    // Append content divs to the token item div
    newTokenDiv.appendChild(tokenIcon)
    newTokenDiv.appendChild(tokenDivLeft)
    newTokenDiv.appendChild(tokenDivRight)

    // Insert the new token item into token container
    tokenContainer.appendChild(newTokenDiv)
  })
}

// This finds values in token items and updates those values accordingly
const updateTokenItem = myTokens => {
  console.log('Updating token HTML')
  myTokens.forEach(k => {
    // Set up whick container we are targeting
    const targetToken = document.querySelector(`[data-token='${k}']`)
    // Get the old value
    let oldValue = targetToken.querySelector('.tokenValue').innerHTML
    // Get the new value
    let newValue = coinList[k].prices.priceUSD
    // Compare the values so we can make a nice NEW VALUE animation
    if (oldValue == newValue) {
      // No change
      console.log(`Values same, ${oldValue} - ${newValue}`)
    } else {
      // Change in value
      console.log(`Values different, ${oldValue} - ${newValue}`)
      // A basic animation for when the value has changed
      var valueChange = anime({
        targets: targetToken.querySelector('.tokenValue'),
        translateY: 0,
        translateZ: 0,
        scale: [1.1, 1],
        opacity: [0.8, 1],
        easing: 'easeOutExpo',
        duration: 1400
      })
    }
    oldValue = newValue
    targetToken.querySelector('.tokenValue').innerHTML = newValue
    targetToken.querySelector('.tokenChange').innerHTML = `${
      coinList[k].prices.changeUSD
    } %`.replace('$', '')
  })
}

const addToken = alltokens => {
  
}

const toggleLoading = state => {
  // If state is true we do or not do
  // dont need == true or anything like that cause the default for boolean is true
  if (state) {
    document.body.classList.add('loading')
    console.log('Loading')
  } else {
    document.body.classList.remove('loading')
    console.log('Loaded')
  }
}

const toggleStarting = state => {
  // If state is true we do or not do
  // dont need == true or anything like that cause the default for boolean is true
  if (state) {
    document.body.classList.add('starting')
    console.log('Starting')
  } else {
    document.body.classList.remove('starting')
    document.body.classList.add('started')
    console.log('Started')
  }
}

// This is the initial setup that runs when app starts
initialTokenSetup().then(() => {
  updateTokenPrice().then(() => {
    createTokenItem(coinList)
    toggleStarting(false)
  })
})

// Click update button (for now) and we update
const updateButton = document.querySelector('.buttonUpdatePrices')
updateButton.addEventListener('click', event => {
  event.preventDefault()
  toggleLoading(true)
  // Get attribute from the link
  console.log('Updating prices via button click')
  updateTokenPrice().then(() => {
    updateTokenItem(myTokens)
    setTimeout(toggleLoading, 500)
  })
})

// Click to show add more tokens list 
const allTokensButton = document.querySelector('.buttonAllTokens')
allTokensButton.addEventListener('click', event => {
  event.preventDefault()
  console.log('Showing all tokens list')
  document.body.classList.add('addingTokens')
})

// Temporary close allTokens 
document.querySelector('.allTokens-close').addEventListener('click', event => {
  event.preventDefault()
  document.body.classList.remove('addingTokens')
})

// Handle input in the token search field 
const allTokenInput = document.querySelector('#tokenSearch')
allTokenInput.addEventListener('input', event => {
  let input = (allTokenInput.value)
  // console.log(allCoins.includes(input)) nooope
  // return (allCoins.filter(obj => Object.keys(obj).some(key => obj[key].includes(input))))
  let arr = allCoins
  let searchKey = input
  function filterIt(arr, searchKey) {
    return arr.filter(function(obj) {
      return Object.keys(obj).some(function(key) {
        return obj[key].includes(searchKey);
      })
    });
  }
})

// Here's some code that detects overscroll, it works. But I'm not 100% on everything it does.
// https://developers.google.com/web/updates/2017/11/overscroll-behavior
let _startY
const scrollContainer = document.querySelector('body')


scrollContainer.addEventListener(
  'touchstart',
  e => {
    _startY = e.touches[0].pageY
  },
  {passive: true}
)

scrollContainer.addEventListener(
  'touchmove',
  e => {
    const y = e.touches[0].pageY
    const overscrollDistance = y - _startY
    console.log(overscrollDistance)
    // Activate custom pull-to-refresh effects when at the top of the container
    // and user is scrolling up.
    if (
      document.scrollingElement.scrollTop === 0 &&
      y > _startY &&
      !document.body.classList.contains('loading') &&
      overscrollDistance > 200
    ) {
      console.log(overscrollDistance)
      toggleLoading(true)
      priceUpdateReady = true
    }
  },
  {passive: true}
)


scrollContainer.addEventListener('touchend', e => {
  if (priceUpdateReady == true ) {
    updateTokenPrice().then(() => {
      updateTokenItem(myTokens)
      setTimeout(toggleLoading, 500)
      priceUpdateReady = false
    })
  }
}, {passive: true}
)

