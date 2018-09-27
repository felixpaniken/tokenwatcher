// Global variable with the coinlist
var coinList = {}

// To see if conditions are met before updating prices
var priceUpdateReady = false

// Overscroll far enough to display all coin list?
var showAllCoinsReady = false

// All coins fetched
var allCoins = {}

// Array for users tokens
const myTokens = ['ETH', 'BTC', 'APPC', 'XVG', 'BCH', 'XMR']

// Container for our tokens
const tokenContainer = document.querySelector('.tokenContainer')

// Container that keeps all the coins available
const allTokensContainer = document.querySelector('.allTokens-container')

// Base image URL as reported from fetch
var baseImageUrl = ""

// Use everywhere viewport height, used to hide the all coins container
var viewportHeight = window.innerHeight

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
      //console.log(data)
      baseImageUrl = data.BaseImageUrl
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
    console.log(displayData)
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

    // Setting up token change indicator, can be positive or negative :) I hope positive for all of you!
    const tokenChangeIndicator = document.createElement('div')
    tokenChangeIndicator.className = 'changeIndicator'

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
    tokenChange24.innerHTML = `${coinList[k].prices.changeUSD} %`.replace('$', '').replace('-', '')

    // Append content
    tokenNameSymbol.appendChild(tokenName)
    tokenNameSymbol.appendChild(tokenSymbol)

    // Append content spans to correct divs
    tokenDivLeft.appendChild(tokenNameSymbol)
    tokenDivRight.appendChild(tokenChangeIndicator)
    tokenDivRight.appendChild(tokenChange24)


    // Append content divs to the token item div
    newTokenDiv.appendChild(tokenIcon)
    newTokenDiv.appendChild(tokenDivLeft)
    newTokenDiv.appendChild(tokenValue)
    newTokenDiv.appendChild(tokenDivRight)

    // Insert the new token item into token container
    tokenContainer.appendChild(newTokenDiv)
  })
}

// Populate all tokens list
const populateAllTokens = () => {
  // Apparently this is bad performing
  // https://jsperf.com/objdir
  // Might try to optimise
  Object.keys(allCoins).forEach(k => {
    // Setting up the container
    const tokenDiv = document.createElement('div')
    // Giving token div a class
    tokenDiv.className = 'allTokenItem'

    // Setting up token icon
    const tokenIcon = document.createElement('div')
    tokenIcon.className = 'allTokenItem-icon'
    // save this away to add as a data attribute on the div, for use later
    const tokenIconURL = `url('${baseImageUrl}${allCoins[k].ImageUrl}')`
    tokenIcon.setAttribute(`tokenIconURL`, `${tokenIconURL}`)

    // Setting up the name of the token
    const tokenName = document.createElement('span')
    tokenName.className = 'tokenName'
    tokenName.innerHTML = allCoins[k].CoinName

    // Setting up the token symbol
    const tokenSymbol = document.createElement('span')
    tokenSymbol.className = 'tokenSymbol'
    tokenSymbol.innerHTML = allCoins[k].Symbol

    // Setting up the button to add tokens to watch list
    const buttonAddToken = document.createElement('div')
    buttonAddToken.className = 'button secondary button-addToken'
    buttonAddToken.innerHTML = 'Add'

    tokenDiv.appendChild(tokenIcon)
    tokenDiv.appendChild(tokenName)
    tokenDiv.appendChild(tokenSymbol)
    tokenDiv.appendChild(buttonAddToken)

    document.querySelector('.allTokens-list').appendChild(tokenDiv)
    
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
      //console.log(`Values same, ${oldValue} - ${newValue}`)
    } else {
      // Change in value
      //console.log(`Values different, ${oldValue} - ${newValue}`)
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
    let oldChange = targetToken.querySelector('.tokenChange').innerHTML
    let newChange = `${coinList[k].prices.changeUSD} %`.replace('$', '').replace('-', '')
    let rawChange = coinList[k].prices.changeUSD
    console.log(`Value changes are, ${oldChange} - ${newChange}`)
    if (rawChange > 0) {
      targetToken.classList.remove('negativeChange')
      targetToken.classList.add('positiveChange')
      //targetToken.querySelector('.changeIndicator').innerHTML = '👍'
    } else if (rawChange < 0) {
      targetToken.classList.add('negativeChange')
      targetToken.classList.remove('positiveCHange')
      //targetToken.querySelector('.changeIndicator').innerHTML = '👎'
    }
    targetToken.querySelector('.tokenChange').innerHTML = newChange
    oldChange = newChange
  })
}

// This puts app into loading state
const toggleLoading = state => {
  const tokenChangeIndicator = document.querySelectorAll('.changeIndicator')
  // If state is true we do or not do
  // dont need == true or anything like that cause the default for boolean is true
  if (state) {
    var animateChange = anime({
      targets: tokenChangeIndicator,
      scale: 0,
      opacity: 0,
      rotate: '1turn',
      easing: 'easeOutExpo',
      duration: 1400
    })
    document.body.classList.add('loading')
    console.log('Loading')
  } else {
    var animateChange = anime({
      targets: tokenChangeIndicator,
      scale: 1,
      opacity: 1,
      rotate: '-1turn',
      easing: 'easeOutElastic',
      duration: 1400
    })
    document.body.classList.remove('loading')
    console.log('Loaded')
  }
}

// This puts app into starting state
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

// Handle input in the token search field 
// Big up: https://www.w3schools.com/howto/howto_js_filter_lists.asp
// Set up the vars we need
const allTokenInput = document.querySelector('#tokenSearch')
// Listen for event and do the filtering
allTokenInput.addEventListener('input', event => {
  let input, filter, ul, li, a, i;
  input = allTokenInput
  filter = input.value.toUpperCase();
  ul = document.querySelector('.allTokens-list');
  li = ul.querySelectorAll('.allTokenItem');
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("span")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
    } else {
        li[i].style.display = "none";
    }
  }

  /*
  if (filter.length > 1) {
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("span")[0];
      if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
      } else {
          li[i].style.display = "none";
      }
    }
  } else {
    console.log(filter)
    // li.style.display = ""; y no work?
    const ynowork = document.querySelectorAll('.allTokenItem')
    ynowork.style.display = "";
  } */
})

// Load icons in the all tokens list
const loadTokenIcon = (el) => {
  el.style.backgroundImage = el.getAttribute('tokeniconurl')
}

// Function to enable all tokens picker
const showAllCoins = () => {
  
  var animateAllCoinList = anime({
    targets: allTokensContainer,
    translateY: 0,
    easing: 'easeOutExpo',
    duration: 800
  })
  document.body.classList.add('addingTokens')
  document.body.classList.add('loading')
}

const hideAllCoins = () => {
  var hideAllCoinList = anime({
    targets: allTokensContainer,
    translateY: viewportHeight,
    easing: 'easeOutExpo',
    duration: 800
  })
  document.body.classList.remove('addingTokens')
  document.body.classList.remove('loading')
}

// Here's some code that detects overscroll, it works. But I'm not 100% on everything it does.
// https://developers.google.com/web/updates/2017/11/overscroll-behavior
let _startY
const scrollContainer = document.querySelector('body')
var bottomScroll = 0

scrollContainer.addEventListener(
  'touchstart',
  e => {
    _startY = e.touches[0].pageY
    bottomScroll = scrollContainer.scrollHeight - window.innerHeight
  },
  {passive: true}
)

scrollContainer.addEventListener(
  'touchmove',
  e => {
    const y = e.touches[0].pageY
    const overscrollDistance = y - _startY
    // Activate custom pull-to-refresh effects when at the top of the container
    // and user is scrolling up.
    if (
      document.scrollingElement.scrollTop === 0 &&
      y > _startY &&
      !document.body.classList.contains('loading') &&
      !document.body.classList.contains('addingTokens')
    ) {
      console.log(overscrollDistance)
      //document.querySelector('body').classList.add('addingTokens')
      if (overscrollDistance > 200) {
        toggleLoading(true)
        priceUpdateReady = true
      }
    }
  },
  {passive: true}
)

scrollContainer.addEventListener('touchend', e => {
  if (priceUpdateReady === true && !document.body.classList.contains('addingTokens')) {
    updateTokenPrice().then(() => {
      updateTokenItem(myTokens)
      // Update is too fast added a delay so I can do a loading animation
      setTimeout(toggleLoading, 500)
      priceUpdateReady = false
    })
  }
}, {passive: true}
)


// Change settings like currency and time
const settings = document.querySelector('.settings')
const settingsTime = document.querySelector('.settings-time')
const settingsCurrencies = document.querySelector('.settings-currencies')
settingsTime.addEventListener('click', event => {
  settings.classList.toggle('set-time')
})
settingsCurrencies.addEventListener('click', event => {
  settings.classList.toggle('set-currency')
})

const buttonShowAllCoins = document.querySelector('.showAllTokens > span')
buttonShowAllCoins.addEventListener('click', event => {
  showAllCoins()
})

const buttonHideAllCoins = document.querySelector('.hideAllTokens')
buttonHideAllCoins.addEventListener('click', event => {
  hideAllCoins()
})

// This is the initial setup that runs when app starts
initialTokenSetup().then(() => {
  updateTokenPrice().then(() => {
    createTokenItem(coinList)
    updateTokenItem(myTokens)
    toggleStarting(false)
    populateAllTokens()
  })
})


