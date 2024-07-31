const button = document.querySelector(".button");

async function getTransactions(start, end) {
  async function fetchTransactions(propNext = null) {
    const body = {
      cursors: { next: propNext, prev: null },
      filter: { categories: [], effect: "EFFECT_UNKNOWN" },
      perPage: 30,
    };
  
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
  
    const response = await fetch(
      "https://finance.ozon.ru/api/v2/clientOperations",
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
      }
    );
  
    if (response.status !== 200) {
      throw new Error("Запрос не успешен");
    }
  
    const {
      items: data,
      hasNextPage: hasNext,
      cursors: { next },
    } = await response.json();
  
    return [data, hasNext, next];
  }
  
  const fetchTransactionsBeforeDate = async (date) => {
    // console.log('start')
    let fullData = [];
    let next = null;
  
    while (true) {
      // console.log('while')
      const [data, hasNext, currentNext] = await fetchTransactions(next);
  
      fullData = [...fullData, ...data];
  
      if (!hasNext) {
        break;
      }
  
      const { time: lastTime } = data[data.length - 1];
  
      if (new Date(lastTime) <= date) {
        break;
      }
  
      next = currentNext;
    }
  
    // console.log(fullData);
  
    return fullData;
  }
  
  // const transactions = Array.from({ length: 10 }).map((item) => ({
  //   date: "09-11-2000",
  //   title: "Название",
  //   debit: 0,
  //   credit: 100,
  //   amount: -100,
  // }));

  const startDate = new Date(start).setHours(0, 0, 0, 0)
  const endDate = new Date(end).setHours(0, 0, 0, 0)

  const raw = await fetchTransactionsBeforeDate(endDate);

  const transactions = raw.filter(({time})=> {
    const date = new Date(time).setHours(0, 0, 0, 0)
    return date >= endDate && date <= startDate
  }).map(({time, purpose, accountAmount, categoryGroupName, merchantName})=>({
    date: time,
    title: `${purpose} ${categoryGroupName} ${merchantName}`,
    debit: accountAmount > 0 ? accountAmount/100 : 0,
    credit: accountAmount < 0 ? -accountAmount/100 : 0,
    amount: accountAmount /100
  }))

  console.log(transactions)

  return transactions;
}

function action(e) {
  e.preventDefault();

  const startDateInput = document.getElementById("startDate");
  const startDate = startDateInput.value;

  const endDateInput = document.getElementById("endDate");
  const endDate = endDateInput.value;

  chrome.tabs.query({ active: true }, function (tabs) {
    var tab = tabs[0];
    if (tab) {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: getTransactions,
          args: [startDate, endDate],
        })
        .then(onResult);
    } else {
      alert("There are no active tabs");
    }
  });
}

button.addEventListener("click", action);

function onResult(frames) {
  if (!frames || !frames.length) {
    alert("Could not retrieve images from specified page");
    return;
  }

  const transactionsData = frames
    .map((frame) => frame.result)
    .reduce((r1, r2) => r1.concat(r2));

  //   alert("onResult", transactionsData);

  // openExportPage(transactionsData);
}

function openExportPage(transactions) {
  chrome.tabs.create({ url: "page.html", active: false }, (tab) => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, transactions, (resp) => {
        chrome.tabs.update(tab.id, { active: true });
      });
    }, 500);
  });
}
