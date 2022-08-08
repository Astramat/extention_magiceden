let url_magic = /^https:\/\/magiceden.io/;
let submit = document.getElementById('for');
let root = document.getElementById("root");
let loader = document.getElementById("loader");

function loading_extention(res) {
  if (res == false) {
    root.style.display = null;
    loader.style.display = null;
    return;
  }
  root.style.display = "none";
  loader.style.display = "block";
}

function isFloat(value) {
  if (typeof value === 'number' &&
    !Number.isNaN(value) &&
    !Number.isInteger(value)) {
    return true;
  }
  return false;
}

function convert_string(element_val) {
  var cal1 = isFloat(element_val[1].trim()) ? parseFloat(element_val[1].trim()) : parseInt(element_val[1].trim());
  var cal2 = isFloat(element_val[2].trim()) ? parseFloat(element_val[2].trim()) : parseInt(element_val[2].trim());
  var element1 = String(cal1 * 1000000000);
  var element2 = String(cal2 * 1000000000);

  return [element1, element2];
}

function import_value(element_val) {
  var original = convert_string(element_val);
  var element1 = original[0];
  var element2 = original[1];

  if (element1 == "0" && element2 == "0") return '';
  if (element1 != "0" && element2 == "0") return `%22takerAmount%22%3A%7B%22%24gte%22%3A${element1}%7D%7D`;
  if (element1 == "0" && element2 != "0") return `%22takerAmount%22%3A%7B%22%24lte%22%3A${element2}%7D%7D`;
  return `%22takerAmount%22%3A%7B%22%24gte%22%3A${element1}%2C%22%24lte%22%3A${element2}%7D%7D`;
}

function check_existe_result(element_val) {
  const url = `https://api-mainnet.magiceden.io/rpc/getListedNFTsByQueryLite?q=%7B%22%24match%22%3A%7B%22collectionSymbol%22%3A%22${element_val[0].trim().toLowerCase().replaceAll(" ", "_")}%22%2C${import_value(element_val)}%2C%22%24sort%22%3A%7B%22createdAt%22%3A-1%7D%2C%22%24skip%22%3A0%2C%22%24limit%22%3A20%2C%22status%22%3A%5B%5D%7D`;
  var xmlHttp = new XMLHttpRequest();

  xmlHttp.open("GET", url, false);
  xmlHttp.send(null);
  if (xmlHttp.status != 200 || JSON.parse(xmlHttp.responseText).results.length == 0) return false;
  return true;
}

function error() {
  $("#result").text("Not found result");
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  sendResponse(true);
  if (request.code != 3) return;
  loading_extention(request.data);
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (!url_magic.test(tabs[0].url)) return;
  loading_extention(true);
  if (tabs[0].status === 'loading') {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tabId == tabs[0].id && changeInfo.status === 'complete' && url_magic.test(tab.url)) {
        chrome.tabs.sendMessage(tabs[0].id, { code: 1 }, function (response) {
          loading_extention(response);
        });
      }
    });
  } else {
    chrome.tabs.sendMessage(tabs[0].id, { code: 1 }, function (response) {
      loading_extention(response);
    });
  }
});

submit.onsubmit = function (element) {
  var element_val = new Array(element.target["name_nft"].value, element.target["min_nft"].value, element.target["max_nft"].value);
  var original = convert_string(element_val);
  var element1 = original[0];
  var element2 = original[1];
  console.log(element_val[0].trim().toLowerCase().replaceAll(" ", "_").replace(/[^a-zA-Z ]/g, ""))
  const url = `https://magiceden.io/marketplace/${element_val[0].trim().toLowerCase().replaceAll(" ", "_")}?price=%7B%22filterMaxPrice%22%3A${element2}%2C%22filterMinPrice%22%3A${element1}%7D`;
  var loading = false;

  if (check_existe_result(element_val) == false) {
    element.preventDefault();
    return error();
  }
  element.preventDefault();
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (url_magic.test(tabs[0].url)) {
      loading_extention(true);
      if (url != tabs[0].url) {
        chrome.tabs.update(tabs[0].id, { url: url });
        loading = true;
      }
      if (tabs[0].status === 'loading' || loading) {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
          if (tabId == tabs[0].id && changeInfo.status === 'complete' && url_magic.test(tab.url)) {
            chrome.tabs.sendMessage(tabs[0].id, { code: 2, data: element_val });
          }
        });
      } else {
        chrome.tabs.sendMessage(tabs[0].id, { code: 2, data: element_val });
      }
    } else {
      chrome.tabs.create({ url: url, active: false}).then(async (tabs) => {
        await chrome.runtime.sendMessage({ code: 2, tabs: tabs, data: element_val });
        await chrome.tabs.update(tabs.id, {selected: true});
      });
    }
  });
};