const loadedTabs = {}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request)
  if (request.code == 3) return;
  sendResponse(true);
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!loadedTabs[request.tabs.id] && tabId == request.tabs.id && changeInfo.status === 'complete' && /^https:\/\/magiceden.io/.test(tab.url)) {
      chrome.tabs.sendMessage(request.tabs.id, { code: request.code, data: request.data });
      [loadedTabs[tabId]] = '1';
    }
  });
});
