const firstCurrency = document.getElementById('currency-one');
const secondCurrency = document.getElementById('currency-two');
const firstAmount = document.getElementById('amount-one');
const secondAmount = document.getElementById('amount-two');
const rate = document.getElementById('rate');
let currentCurrency;

firstCurrency.addEventListener('change', changeCurrency);
secondCurrency.addEventListener('change', changeCurrency);
firstAmount.addEventListener('input', calculate);

async function getCurrency() {
  const fetchData = await fetch('https://api.exchangeratesapi.io/latest');

  const data = await fetchData.json();

  createCurrencyOptions(data);
}

function createCurrencyOptions(data) {
  const currency = data.rates;
  for (let value in currency) {
    let exchangeOptionOne = document.createElement('option');
    exchangeOptionOne.value = `${value}`;
    exchangeOptionOne.innerText = `${value}`;
    firstCurrency.append(exchangeOptionOne);

    let exchangeOptionTwo = document.createElement('option');
    exchangeOptionTwo.value = `${value}`;
    exchangeOptionTwo.innerText = `${value}`;
    secondCurrency.append(exchangeOptionTwo);
  }
}

async function changeCurrency(selectedCurrency) {
  let currencyNode = selectedCurrency.target.parentNode.childNodes[1];

  if (currencyNode.id === 'currency-one') {
    const fetchData = await fetch(
      `https://api.exchangeratesapi.io/latest?base=${selectedCurrency.target.value}`
    );
    const data = await fetchData.json();

    currentCurrency = data;
    createCurrencyOptions(data);
    historicalRates(data);
  }
}

function calculate() {
  secondAmount.value = (
    firstAmount.value * currentCurrency.rates[secondCurrency.value]
  ).toFixed(2);
  rate.innerText = `1 ${
    currentCurrency.base
  } is equal with ${currentCurrency.rates[secondCurrency.value].toFixed(6)} ${
    secondCurrency.value
  }`;
}

const rateDisplay = document.querySelector('.rate-display');
const fluxRate = document.querySelector('.flux-rate');

async function historicalRates(currencyNode) {
  fluxRate.innerHTML = '';
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate() - 1;
  const today = `${year}-${month}-${day}`;
  const lastDay = currentDate.getDate() - 2;
  const yesterday = `${year}-${month}-${lastDay}`;

  const fetchData = await fetch(
    `https://api.exchangeratesapi.io/history?base=${currencyNode.base}&start_at=${yesterday}&end_at=${today}&symbols=EUR,USD,GBP,CHF,CAD`
  );
  const data = await fetchData.json();

  for (const [key, value] of Object.entries(data.rates[data.start_at])) {
    const rateDisplay = document.createElement('div');
    const yesterdaysValue = parseFloat(`${value}`);
    const displayYesterdaysValue = yesterdaysValue
      .toString()
      .split('')
      .splice(0, 9)
      .join('');
    const todaysValue = parseFloat(`${data.rates[data.end_at][`${key}`]}`);
    const displayTodaysValue = todaysValue
      .toString()
      .split('')
      .splice(0, 9)
      .join('');
    const variation = yesterdaysValue - todaysValue;
    const displayVariation = variation
      .toString()
      .split('')
      .splice(0, 9)
      .join('');
    rateDisplay.classList.add('rateDisplay');
    if (variation > 0) {
      rateDisplay.classList.add('increasing');
    } else {
      rateDisplay.classList.add('decreasing');
    }
    rateDisplay.innerHTML = `
      <div class="currencyRate">${key}</div>
      <div class="yesterdayCurrencyRate">${displayYesterdaysValue}</div>
      <div class="currencyVariationRate">${displayVariation}</div>
      <div class="todayCurrencyRate">${displayTodaysValue}</div>
    `;
    fluxRate.append(rateDisplay);
  }
}

getCurrency();
