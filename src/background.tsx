// import * as React from "react";
// import * as ReactDOM from "react-dom";

import { sharedApiClient } from './networking';

// Listen to messages sent from other parts of the extension.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // onMessage must return "true" if response is async.
  let isResponseAsync = false;

  if (request.setBadgeText) {
    chrome.browserAction.setBadgeText({ text: '99+' });
  }

  const _handleMessageRequest = () => {
    const successCallback = (response: any) => sendResponse({ response });
    const failureCallback = (error: any) => sendResponse({ error });

    sharedApiClient.request(request.arguments, false)
      .then(successCallback)
      .catch(failureCallback);

    return true;
  }

  const _handleMessageOpenOptionsPage = () => {
    chrome.runtime.openOptionsPage();
    return true;
  }

  const _handleMessagePlayAudio = () => {
    const { url } = request.arguments;

    const audio = new Audio(url);
    audio.play();

    return true;
  }

  switch (request.method) {
    case 'request': return _handleMessageRequest();
    case 'openOptionsPage': return _handleMessageOpenOptionsPage();
    case 'playAudio': return _handleMessagePlayAudio();
    default:
      console.log(`Message not supported.`);
  }

  return isResponseAsync;
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log(activeInfo);
  // alert(JSON.stringify(activeInfo))
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    // alert(JSON.stringify(tab))

    chrome.runtime.sendMessage({ setBadgeText: true });
  })
});