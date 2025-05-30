// Holds the users current tokens similar to myTokens but on XXXX format
var coinList = {}

// To see if conditions are met before updating prices
var priceUpdateReady = false

// Overscroll far enough to display all coin list?
var showAllCoinsReady = false

// All coins fetched
var allCoins = {}

// List of all tokens fetched
var allTokens = {}

// Control to see if we fetched all tokens this session
var allTokensFetched = false

// Array for users tokens (to be saved?)
var myTokens = ['ETH', 'BTC', 'APPC', 'XVG', 'BCH', 'XMR']

// Preferred Currency
var prefCurrency = 'USD'

// Current timeframe
var currentTimeframe = '24h'

// Container for our tokens
const tokenContainer = document.querySelector('.tokenContainer')

// Container that keeps all the coins available
const allTokensContainer = document.querySelector('.allTokens-container')

// Base image URL as reported from fetch
var baseImageUrl = ""

// Viewport width, for use in other functions
var viewportWidth = window.innerWidth

// Use everywhere viewport height, used to hide the all coins container
var viewportHeight = window.innerHeight

// Settings container
const settings = document.querySelector('.settings')

// Currency in settings
const settingsCurrencies = document.querySelector('.settings-currencies')

// Each currency option in currency settings
const optionCurrency = document.querySelectorAll('.settings-currencies > .option')

// Get all coin data
const initialTokenSetup = () => {
  // Check for saved tokens saved in local storage
  loadUserTokens()
  // Check for saved user settings in local storage
  loadUserSettings()
}

const getAllTokens = () => {
  // Check if we have already fetched all tokens this session
  if (allTokensFetched === true) {
     // We have fetched = return the data fetched earlier
    console.log('already fetched')
    return Promise.resolve(allTokens)
  } else if (allTokensFetched === false) {
    // This is the first time we fetch this sessions
    console.log('not fetched')
      //Getting all coins and saving them in array
  allTokensFetched = true
  console.log('fetching all coinlist from cryptocompare')
  return fetch(`https://min-api.cryptocompare.com/data/all/coinlist`)
    .then(response => {
      return response.json()
    })
    .then(data => {
      baseImageUrl = data.BaseImageUrl
      allTokens = data.Data
    })
  }

}

// Function that updates the users token list in local storage
const saveUserTokens = () => {
  console.log('Saving user tokens to local storage')
  // Put tokens from array in local storage but as a string
  localStorage.setItem('userTokens', JSON.stringify(myTokens))
  // Save the users preferred currency
  localStorage.setItem('userCurrency', prefCurrency)
}

// See if the user has any saved tokens
const loadUserTokens = () => {
  console.log('Checking for saved tokens in local storage')
  var savedTokens = localStorage.getItem('userTokens')
  if (savedTokens) {
    console.log('Found saved tokens in local storage')
    // If we found saved tokens locally we set mytokens to be the saved ones
    myTokens = JSON.parse(savedTokens);
  } else {
    console.log('No saved tokens in local storage, setting up standard list')
    // If we did not find any saved tokens we set up the defaults
    myTokens = ['ETH', 'BTC', 'APPC', 'XVG', 'BCH', 'XMR']
  }
}

// See if the user has a saved preference for currency 
// This might be extended to other settings (like theme) later
const loadUserSettings = () => {
  console.log('Checking for user settings in local storage')
  var savedCurrency = localStorage.userCurrency
  if (savedCurrency) {
    console.log(`Found saved currency (${savedCurrency}) in local storage`)
    prefCurrency = savedCurrency
    optionCurrency.forEach((option) => {
      if (prefCurrency === option.dataset.currency) {
        option.classList.add('active')
      } else {
        option.classList.remove('active')
      }
    })
  }
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

// Function that fetches prices AND MORE for the tokens requested and returns the response data as JSON
const fetchTokenData = tokens => {
  console.log(`fetching data of ${tokens}`)
  return fetch(
    `https://min-api.cryptocompare.com/data/coin/generalinfo?fsyms=${tokens}&tsym=USD`
    //`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${tokens}&tsyms=USD,EUR,BTC`
  )
    .then(response => {
      return response.json()
    })
    .then(data => {
      //console.log(data)
      baseImageUrl = data.BaseImageUrl
      allCoins = data.Data
      // Building a complex array (with data returned) from myTokens
      var i = -1;
      myTokens.forEach(k => {
        //console.log(k)
        ++i
        //console.log(i)
        coinList[k] = {
          coinName: allCoins[i].CoinInfo.FullName,
          coinSymbol: allCoins[i].CoinInfo.Name,
          tokenIcon: `https://www.cryptocompare.com${allCoins[i].CoinInfo.ImageUrl}`
        }
      })
    })
    .catch(error => {
      console.log(error.message)
    })
}

// Handle the JSON data coming from the fetch function and put the prices into object
const updateTokenPrice = () => {
  return fetchTokenPrice(myTokens).then(response => {
    const displayData = response.DISPLAY
    //console.log(displayData)
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
    //console.log(`Creating token item for ${coinList[k].coinName}`)
    // This feels old-school, fix
    index = index + 1

    // Setting up the new token Div
    const newTokenDiv = document.createElement('div')
    // Giving token div a class
    newTokenDiv.className = 'tokenItem'
    newTokenDiv.dataset.token = coinList[k].coinSymbol


    // Setting up a container for data, so we later can have a chart underneath
    const newTokenData = document.createElement('div')
    newTokenData.className = 'tokenItem-data'

    // Setting a animation delay on object according to which order it is
    // This needs to change to only apply for the first animation when the items come in
    const delay = index * 30
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

    // Empty chart container
    const tokenChartContainer = document.createElement('div')
    tokenChartContainer.className = 'tokenChartContainer'
    tokenChartContainer.innerHTML = 'Loading chart'

    // Append content
    tokenNameSymbol.appendChild(tokenName)
    tokenNameSymbol.appendChild(tokenSymbol)

    // Append content spans to correct divs
    tokenDivLeft.appendChild(tokenNameSymbol)
    tokenDivRight.appendChild(tokenChangeIndicator)
    tokenDivRight.appendChild(tokenChange24)


    // Append content divs to the token data div
    newTokenData.appendChild(tokenIcon)
    newTokenData.appendChild(tokenDivLeft)
    newTokenData.appendChild(tokenValue)
    newTokenData.appendChild(tokenDivRight)

    // Append the data div to the token item
    newTokenDiv.appendChild(newTokenData)
    newTokenDiv.appendChild(tokenChartContainer)

    // Insert the new token item into token container
    tokenContainer.appendChild(newTokenDiv)
  })
}

// Create a single token list item
const createTokenListItem = (tokenKey) => {
  const token = allTokens[tokenKey]
  
  // Setting up the container
  const tokenDiv = document.createElement('div')
  // Giving token div a class
  tokenDiv.className = 'allTokenItem'
  // Set the token symbol as a data attribute
  tokenDiv.setAttribute('tokenSymbol', token.Symbol)

  // Setting up token icon
  const tokenIcon = document.createElement('div')
  tokenIcon.className = 'allTokenItem-icon'
  // Use the correct URL format with the CryptoCompare base URL
  const tokenIconURL = `url('https://www.cryptocompare.com${token.ImageUrl}')`
  tokenIcon.style.backgroundImage = tokenIconURL
  // Also save as a data attribute for potential future use
  tokenIcon.setAttribute('tokenIconURL', tokenIconURL)

  // Setting up the name of the token
  const tokenName = document.createElement('span')
  tokenName.className = 'tokenName'
  tokenName.textContent = token.CoinName

  // Setting up the token symbol
  const tokenSymbol = document.createElement('span')
  tokenSymbol.className = 'tokenSymbol'
  tokenSymbol.textContent = token.Symbol
  
  // Check if the token is already saved in my tokens list
  if (myTokens.includes(token.Symbol)) {
    // if in my tokens list, add class savedToken so we can identify tokens already saved to list
    tokenDiv.classList.add('savedToken')
  }

  // Setting up the button to add tokens to watch list
  const buttonAddToken = document.createElement('div')
  buttonAddToken.className = 'button secondary button-addToken'
  buttonAddToken.textContent = 'Add'
  
  // Setting up the button to remove tokens to watch list
  const buttonRemoveToken = document.createElement('div')
  buttonRemoveToken.className = 'button secondary button-removeToken'
  buttonRemoveToken.textContent = 'Remove'

  tokenDiv.appendChild(tokenIcon)
  tokenDiv.appendChild(tokenName)
  tokenDiv.appendChild(tokenSymbol)
  tokenDiv.appendChild(buttonAddToken)
  tokenDiv.appendChild(buttonRemoveToken)

  document.querySelector('.allTokens-list').appendChild(tokenDiv)
  
  return tokenDiv
}

// Populate all tokens list - now only used for initial setup
const populateAllTokens = () => {
  // Clear the list first
  document.querySelector('.allTokens-list').innerHTML = '<div class="search-instruction">Type at least 3 characters to search</div>'
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
    // Check which currency to use
    if (prefCurrency === 'USD' ) {
      //console.log(`Setting ${k} value with USD`)
      var newValue = coinList[k].prices.priceUSD
    } else if (prefCurrency === 'EUR') {
      //console.log(`Setting ${k} value with EUR`)
      var newValue = coinList[k].prices.priceEUR
    } else if (prefCurrency === 'BTC') {
      //console.log(`Setting ${k} value with BTC`)
      var newValue = coinList[k].prices.priceBTC
    }
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
    // Set the change in value
    // Check which currency to use
    if (prefCurrency === 'USD') {
      var oldChange = targetToken.querySelector('.tokenChange').innerHTML
      var newChange = `${coinList[k].prices.changeUSD} %`.replace('$', '').replace('-', '')
      var rawChange = coinList[k].prices.changeUSD
      //console.log(`Value changes are, ${oldChange} - ${newChange}`)
    } else if (prefCurrency === 'EUR') {
      var oldChange = targetToken.querySelector('.tokenChange').innerHTML
      var newChange = `${coinList[k].prices.changeEUR} %`.replace('€', '').replace('-', '')
      var rawChange = coinList[k].prices.changeEUR
      //console.log(`Value changes are, ${oldChange} - ${newChange}`)
    } else if (prefCurrency === 'BTC') {
      var oldChange = targetToken.querySelector('.tokenChange').innerHTML
      var newChange = `${coinList[k].prices.changeBTC} %`.replace('Ƀ', '').replace('-', '')
      var rawChange = coinList[k].prices.changeBTC
      //console.log(`Value changes are, ${oldChange} - ${newChange}`)
    }

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

// Clears out the token container, preparing it for new content
const clearTokenContainer = () => {
  document.querySelector('.tokenContainer').innerHTML = ''
}

// Handle input in the token search field 
// Set up the vars we need
const allTokenInput = document.querySelector('#tokenSearch')
const allTokensList = document.querySelector('.allTokens-list')

// Listen for event and do the filtering
allTokenInput.addEventListener('input', event => {
  const searchTerm = allTokenInput.value.trim().toUpperCase()
  
  // Clear previous results if search term is less than 3 characters
  if (searchTerm.length < 3) {
    allTokensList.innerHTML = '<div class="search-instruction">Type at least 3 characters to search</div>'
    return
  }
  
  // If we have tokens data and search term is valid, filter and display results
  if (allTokens && Object.keys(allTokens).length > 0) {
    // Clear previous results
    allTokensList.innerHTML = ''
    
    // Filter tokens that match the search term (limit to 50 results for performance)
    let matchCount = 0
    const maxResults = 50
    
    Object.keys(allTokens).forEach(k => {
      if (matchCount >= maxResults) return
      
      const tokenName = allTokens[k].CoinName
      const tokenSymbol = allTokens[k].Symbol
      
      // Check if token name or symbol contains the search term
      if (tokenName.toUpperCase().includes(searchTerm) || 
          tokenSymbol.toUpperCase().includes(searchTerm)) {
        
        // Create token item element
        createTokenListItem(k)
        matchCount++
      }
    })
    
    // Show message if no results found
    if (matchCount === 0) {
      allTokensList.innerHTML = '<div class="no-results">No tokens found matching your search</div>'
    } else if (matchCount === maxResults) {
      const message = document.createElement('div')
      message.className = 'results-limit'
      message.textContent = 'Showing top 50 results. Refine your search for more specific tokens.'
      allTokensList.appendChild(message)
    }
    
    // Set up add/remove buttons for the newly created items
    setupAddTokenButton()
  }
})

// Load icons in the all tokens list
const loadTokenIcon = (el) => {
  el.style.backgroundImage = el.getAttribute('tokeniconurl')
}

// Function to enable all tokens picker
const showAllCoins = () => {
  // Instead of having separate containers, 
  // Empty out the container, put a loading spinner, populate container with tokens
  // Maybe not ever show all tokens, only show "trending" and then more if the user searches
  var animateAllCoinList = anime({
    targets: allTokensContainer,
    translateY: 0,
    easing: 'easeOutExpo',
    duration: 800
  })
  document.body.classList.add('addingTokens')
}

const hideAllCoins = () => {
  var hideAllCoinList = anime({
    targets: allTokensContainer,
    translateY: viewportHeight,
    easing: 'easeOutExpo',
    duration: 800
  })
  document.body.classList.remove('addingTokens')
  
  // Rebuild charts for all tokens when returning to the pinned tokens view
  setTimeout(() => {
    buildChartAll()
  }, 850) // Set timeout slightly longer than the animation duration
}

// Here's some code that detects overscroll, it works. But I'm not 100% on everything it does.
// https://developers.google.com/web/updates/2017/11/overscroll-behavior
let _startY
const scrollContainer = tokenContainer
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
settingsCurrencies.addEventListener('click', event => {
  settings.classList.toggle('set-currency')
})

optionCurrency.forEach((option) => {
  option.addEventListener('click', event => {
    if (option.classList.contains('active')) {
      option.classList.remove('active')
    } else {
      option.classList.add('active')
      prefCurrency = option.dataset.currency
      saveUserTokens()
      updateTokenItem(myTokens)
    }
  })
})


// Show all tokens list
const buttonShowAllCoins = document.querySelector('.showAllTokens > span')
// Setting up a variable to save myTokens for later check if change
var oldMyTokens = {}
// Listen for click on the show all coins button
buttonShowAllCoins.addEventListener('click', event => {
  // Copy myTokens so we know if it has changed later
  oldMyTokens = myTokens.slice()
  
  // Show the search interface immediately
  showAllCoins()
  
  // Clear the search input
  allTokenInput.value = ''
  
  // Initialize the list with instructions
  populateAllTokens()
  
  // Fetch token data in the background if not already fetched
  if (!allTokensFetched) {
    // Show loading indicator
    const loadingIndicator = document.createElement('div')
    loadingIndicator.className = 'loading-indicator'
    loadingIndicator.textContent = 'Loading token data...'
    allTokensList.appendChild(loadingIndicator)
    
    // Fetch and handle the list from cryptocompare of all tokens
    getAllTokens().then(() => {
      // Remove loading indicator once data is loaded
      const loadingElement = document.querySelector('.loading-indicator')
      if (loadingElement) {
        loadingElement.remove()
      }
      
      // If user has already typed something, trigger the search
      if (allTokenInput.value.trim().length >= 3) {
        allTokenInput.dispatchEvent(new Event('input'))
      }
    }).catch(error => {
      console.error('Error fetching token data:', error)
      allTokensList.innerHTML = '<div class="error-message">Failed to load token data. Please try again.</div>'
    })
  }
})

// Hide all tokens list
const buttonHideAllCoins = document.querySelector('.hideAllTokens')
buttonHideAllCoins.addEventListener('click', event => {
  if (oldMyTokens === myTokens) {
    console.log("myTokens didn't change")
  } else {
    console.log("myTokens changed!")
    saveUserTokens()
    clearTokenContainer()
    fetchTokenData(myTokens).then(() => {
      updateTokenPrice().then(() => {
        createTokenItem(coinList)
        updateTokenItem(myTokens)
      })
    })
  }
  hideAllCoins()
})

// Add token from all tokens list to MyTokens
// Should be a function when I got it working good
var addRemoveSetupDone = false
const setupAddTokenButton = () => {
  if (addRemoveSetupDone === false) {
    addRemoveSetupDone = true
    const buttonAllToken = document.querySelectorAll('.allTokenItem > .button')
    buttonAllToken.forEach(function(thisButton) {
      thisButton.addEventListener('click', event => {
        var symbolOfToken = thisButton.parentNode.getAttribute('tokensymbol')
        if (myTokens.includes(symbolOfToken)) {
          // Remove a token from my tokens list
          console.log(`Removing ${symbolOfToken} from myTokens`)
          // Remove a token from my token thanks to:
          // https://davidwalsh.name/remove-item-array-javascript
          var i = myTokens.indexOf(symbolOfToken);
          if(i != -1) {
            myTokens.splice(i, 1);
          }
          thisButton.parentNode.classList.remove('savedToken')
        } else {
          // Add a token to my tokens list
          console.log(`Adding ${symbolOfToken} to myTokens`)
          myTokens.push(thisButton.parentNode.getAttribute('tokensymbol'))  
          thisButton.parentNode.classList.add('savedToken')
        }
        
        // Save the updated token list
        saveUserTokens()
      })
    })
  } else if (addRemoveSetupDone === true ) {
    console.log("Button setup already done")
  }
}

// Get hourly OHLCV data for token
const getHourlyOHLCV = (token) => {
  return fetch(
    `https://min-api.cryptocompare.com/data/histohour?fsym=${token}&tsym=${prefCurrency}&limit=23`
  ).then(response => {
    return response.json()
  })
}

// Get daily OHLCV for token
const getDailyOHLCV = (token) => {
  return fetch(
    `https://min-api.cryptocompare.com/data/histoday?fsym=${token}&tsym=${prefCurrency}&limit=7`
  ).then(response => {
    return response.json()
  })
}

// Get monthly OHLCV, by getting the daily for 30 days
const getMonthlyOHLCV = (token) => {
  return fetch(
    `https://min-api.cryptocompare.com/data/histoday?fsym=${token}&tsym=${prefCurrency}&limit=30`
  ).then(response => {
    return response.json()
  })
}

// Get 3 months OHLCV, by getting the daily for 90 days
const get3MonthOHLCV = (token) => {
  return fetch(
    `https://min-api.cryptocompare.com/data/histoday?fsym=${token}&tsym=${prefCurrency}&limit=90`
  ).then(response => {
    return response.json()
  })
}

// Creates and attaches a chart to a token item
Chart.defaults.scale.gridLines.display = false;
const createChart = (token, chartLabels, chartData) => {
  // Find the token that will get chart attached
  var targetToken = document.querySelector(`[data-token='${token}']`)
  // Create chart element
  const targetTokenChart = document.createElement('canvas')
  targetTokenChart.id = `chart-${token}`
  targetTokenChart.className = 'tokenChart'
  targetTokenChart.innerHTML = ''
  // Attach chart element to target token
  targetToken.appendChild(targetTokenChart)

  // Find the lowest value in the data set for the chart
  var lowestDataValue = Math.min(...chartData)
  // Create a smaller value for use as as floor in chart
  var aestheticMin = lowestDataValue*0.98

  var ctx = targetTokenChart.getContext('2d');
  var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',
  
      // The data for our dataset
      data: {
          labels: chartLabels,
          datasets: [{
              label: 'My First dataset',
              backgroundColor: '#0047ff',
              borderColor: '#0047ff',
              pointRadius: 0,
              data: chartData
          }]
      },
  
      // Configuration options go here
      options: {
        layout: {
          padding: {
            top: 40,
          },
        },
        legend: {
          display: false,
        },
        gridLines: {
          display: false,
        },
        scales: {
          xAxes: [{
            display: false
          }],
          yAxes: [{
            display: false,
            ticks: {
              suggestedMin: aestheticMin,
            },
          }],
        },
        plugins: {
          // Change options for ALL labels of THIS CHART
          datalabels: {
            display: false,
            color: 'rgba(0,0,0,0.5)',
            align: 'end',
            textAlign: 'end',
            offset: 20,
            font: {
              weight: 'bold',
            },
            formatter: function(value, context) {
              return chartData[context.dataIndex] + '\n' + chartLabels[context.dataIndex];
            },
          },
        },
      }
  });
}

const createMinChart = (token, chartData) => {
  // Find the token chart container that will get chart attached
  var targetToken = document.querySelector(`[data-token='${token}']`).querySelector('.tokenChartContainer')
  // Clear out the containers "loading"
  targetToken.innerHTML = ''
  // Create chart element
  const targetTokenChart = document.createElement('canvas')
  targetTokenChart.id = `chart-${token}`
  targetTokenChart.className = 'tokenChart'
  targetTokenChart.innerHTML = ''
  // Attach chart element to target token
  targetToken.appendChild(targetTokenChart)

  // Find the lowest value in the data set for the chart
  var lowestDataValue = Math.min(...chartData)
  // Create a smaller value for use as as floor in chart
  var aestheticMin = lowestDataValue*0.98

  var ctx = targetTokenChart.getContext('2d');
  var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',
  
      // The data for our dataset
      data: {
          labels: chartData,
          datasets: [{
              label: 'My First dataset',
              backgroundColor: '#0047ff',
              borderColor: '#0047ff',
              pointRadius: 0,
              data: chartData
          }]
      },
  
      // Configuration options go here
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        gridLines: {
          display: false,
        },
        scales: {
          xAxes: [{
            display: false
          }],
          yAxes: [{
            display: false,
            ticks: {
              suggestedMin: aestheticMin,
            },
          }],
        },
        plugins: {
          // Change options for ALL labels of THIS CHART
          datalabels: {
            display: false,
          },
        },
      }
  });
}

const chartLabels = (token) => {
  Chart.helpers.each(Chart.instances, instance => {
    if (instance.chart.canvas.id === `chart-${token}`) {
      instance.options.plugins.datalabels = {
        color: 'rgba(0,0,0,0.5)',
            align: 'end',
            textAlign: 'end',
            offset: 20,
            font: {
              weight: 'bold',
            },
    };
      instance.update()
      //instance.destroy();
      //return;
    }
  })
  /*
  if (state === "on") {
    console.log(`chart labels for ${token} turned on`)
  } else if (state === "off") {
    console.log(`chart labels for ${token} turned off`)
  }*/
}

// Build a complete chart for a token
const buildChart = (token) => {
  // Get hourly prices depending on current timeframe only supports 24h for now will need changes once timeframes are togglable
  if (currentTimeframe === '24h') {
    getHourlyOHLCV(token).then(response => {
      // Array where our labels will go
      var chartLabels = []
      // Array where the data points will go
      var chartData = []
      // For each key in the object we got back from the fetch
      Object.keys(response.Data).forEach(k => {
        // Push a timestamp into chart labels
        chartLabels.push(response.Data[k].time)
        // Push a closing value into
        chartData.push(response.Data[k].close)
      })
      // Create the chart in a canvas document with the labels and data we requested
      //createChart(token, chartLabels, chartData) - chart with labels
      createMinChart(token, chartData) // Chart without labels
    })
  }
}

// Build charts for all of the users tokens
const buildChartAll = () => {
  myTokens.forEach((token) => {
    buildChart(token)
  })
}

// See if we load big screen things (only small charts for now)
const bigScreenCheck = () => {
  if (viewportWidth > '599') {
    buildChartAll()
  }
}

// This is the initial setup that runs when app starts
toggleStarting(true)
initialTokenSetup()
fetchTokenData(myTokens).then(() => {
  updateTokenPrice().then(() => {
    createTokenItem(coinList)
    updateTokenItem(myTokens)
    //populateAllTokens() Better to only do this when the user wants to add a new token
    //setupAddTokenButton()
    saveUserTokens()
    toggleStarting(false)
    bigScreenCheck()
  })
})


// Check if app looses focus and fetch a price update when focus is regained
const handleVisibilityChange = () => {
  //console.log(document.visibilityState);
}

// Check for visibility change
document.addEventListener("visibilitychange", handleVisibilityChange, false);
