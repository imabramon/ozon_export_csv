const button = document.querySelector(".button");

function getTransactions() {
  const transactions = Array.from({ length: 10 }).map((item) => ({
    date: "09-11-2000",
    title: "Название",
    debit: 0,
    credit: 100,
    amount: -100,
  }));

  const body = {
    cursors: { next: null, prev: null },
    filter: { categories: [], effect: "EFFECT_UNKNOWN" },
    perPage: 30,
  };

  const headers = new Headers();
  headers.append(
    "Content-Type",
    "application/json"
  )
  headers.append(
      'Accept',
      'application/json'
  )
  
  ;(async () => {
      const data = await fetch("https://finance.ozon.ru/api/v2/clientOperations", {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          credentials: "include",
      })

      const json = await data.json();
      console.log('call', json);
  
  })();


  return transactions;
}

function action(e) {
  e.preventDefault();

  chrome.tabs.query({ active: true }, function (tabs) {
    var tab = tabs[0];
    if (tab) {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: getTransactions,
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
