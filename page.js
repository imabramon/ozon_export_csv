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
const nameAttrName = "data-name";
const purposeAttrName = "data-purpose";
const categoryAttrName = "data-category";
const debitAttrName = "data-debit";
const creditAttrName = "data-credit";
const amountAttrName = "data-amount";

function makeTableRow({ date, name, debit, credit, amount, purpose, category }) {
  const template = document.querySelector("#tablerow");
  const node = template.content.cloneNode(true);

  const dateNode = node.querySelector(".table_row__date");
  const nameNode = node.querySelector(".table_row__name");
  const purposeNode = node.querySelector(".table_row__purpose");
  const categoryNode = node.querySelector(".table_row__category");
  const debitNode = node.querySelector(".table_row__debit");
  const creditNode = node.querySelector(".table_row__credit");
  const amountNode = node.querySelector(".table_row__amount");

  dateNode.textContent = date;
  nameNode.textContent = name;
  purposeNode.textContent = purpose;
  categoryNode.textContent = category;
  debitNode.textContent = debit;
  creditNode.textContent = credit;
  amountNode.textContent = amount;

  const row = node.querySelector("tr");

  row.setAttribute(dateAttrName, date);
  row.setAttribute(nameAttrName, name);
  row.setAttribute(purposeAttrName, purpose);
  row.setAttribute(categoryAttrName, category);
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
    const name = row.getAttribute(nameAttrName);
    const purpose = row.getAttribute(purposeAttrName);
    const category = row.getAttribute(categoryAttrName);
    const debit = row.getAttribute(debitAttrName);
    const credit = row.getAttribute(creditAttrName);
    const amount = row.getAttribute(amountAttrName);

    return [date, name, purpose, category, debit, credit, amount];
  });

  const rows = [["Дата", "Название", "Цель", "Категория", "Дебет", "Кредит", "Итого"], ...rowData];

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
