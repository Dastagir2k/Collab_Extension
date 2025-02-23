
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.setOptions({ tabId: tab.id, path: "index.html" });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addContentContextMenu",
    title: 'Add to Collab Assist',
    contexts: ["selection"],
  });
});