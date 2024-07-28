chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  addDataToTable(message);
  //   appendTableRow({
  //     date:"09-11-2000",
  //     title:"Название",
  //     debit:0,
  //     credit:100,
  //     amount:-100,
  //   })
  sendResponse("OK");
});

const dateAttrName = "data-date";
const titleAttrName = "data-title";
const debitAttrName = "data-debit";
const creditAttrName = "data-credit";
const amountAttrName = "data-amount";

function makeTableRow({ date, title, debit, credit, amount }) {
  const template = document.querySelector("#tablerow");
  const node = template.content.cloneNode(true);

  const dateNode = node.querySelector(".table_row__date");
  const titleNode = node.querySelector(".table_row__name");
  const debitNode = node.querySelector(".table_row__debit");
  const creditNode = node.querySelector(".table_row__credit");
  const amountNode = node.querySelector(".table_row__amount");

  dateNode.textContent = date;
  titleNode.textContent = title;
  debitNode.textContent = debit;
  creditNode.textContent = credit;
  amountNode.textContent = amount;

  console.log(node);

  const row = node.querySelector("tr");

  row.setAttribute(dateAttrName, date);
  row.setAttribute(titleAttrName, title);
  row.setAttribute(debitAttrName, debit);
  row.setAttribute(creditAttrName, credit);
  row.setAttribute(amountAttrName, amount);

  return node;
}

function appendTableRow(data) {
  const tableBody = document.querySelector(".table .table__body");
  const node = makeTableRow(data);
  tableBody.appendChild(node);
}

function addDataToTable(transactions) {
  if (!transactions || !transactions.length) {
    return;
  }

  transactions.forEach((transaction) => {
    appendTableRow(transaction);
  });

  return;
}

function makeCSV() {
  const rowNodes = document.querySelectorAll("tbody .table_row");

  const rowData = Array.from(rowNodes).map((row) => {
    const date = row.getAttribute(dateAttrName);
    const title = row.getAttribute(titleAttrName);
    const debit = row.getAttribute(debitAttrName);
    const credit = row.getAttribute(creditAttrName);
    const amount = row.getAttribute(amountAttrName);

    return [date, title, debit, credit, amount];
  });

  const rows = [["Дата", "Название", "Дебет", "Кредит", "Итого"], ...rowData];

  let csvContent =
    "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

  return csvContent
}

function downloadCSV(){
    const csv = makeCSV()
    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for FF

    link.click();

    window.URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}

const button = document.querySelector("button");
button.addEventListener("click", downloadCSV);
