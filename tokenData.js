// Holds the users current tokens similar to myTokens but on XXXX format
var coinList = {}

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

// Base image URL as reported from fetch
var baseImageUrl = ""

// Get all coin data
const initialTokenSetup = () => {
  // Check for saved tokens saved in local storage
  loadUserTokens()
  // Check for saved user settings in local storage
  loadUserSettings()
}

const getAllTokens = () => {
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
    // We need to update the UI in the main file, so we'll export this information
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
  )
    .then(response => {
      return response.json()
    })
    .then(data => {
      baseImageUrl = data.BaseImageUrl
      allCoins = data.Data
      // Building a complex array (with data returned) from myTokens
      var i = -1;
      myTokens.forEach(k => {
        ++i
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

// Export variables and functions to make them available to other files
export {
  coinList,
  allCoins,
  allTokens,
  allTokensFetched,
  myTokens,
  prefCurrency,
  baseImageUrl,
  initialTokenSetup,
  getAllTokens,
  saveUserTokens,
  loadUserTokens,
  loadUserSettings,
  fetchTokenPrice,
  fetchTokenData,
  updateTokenPrice,
  getHourlyOHLCV,
  getDailyOHLCV,
  getMonthlyOHLCV,
  get3MonthOHLCV
}