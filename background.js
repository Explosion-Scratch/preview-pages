chrome.runtime.onMessage.addListener(({msg, url}, sender, respond) => {
   console.log("Got message", msg, sender, respond);
   
   if (msg === "iframe-unlock"){
      chrome.declarativeNetRequest.updateDynamicRules({
         removeRuleIds: [1],
         addRules: [{
            "id": 1,
            "priority": 1,
            "action": {
              "type": "modifyHeaders",
              "responseHeaders": [
                { "header": "content-security-policy", "operation": "set", "value": "upgrade-insecure-requests;"},
                { "header": "x-frame-options", "operation": "set", "value": "ALLOWALL" }
              ]
            },
            "condition": {
               "requestMethods": ["get"],
               "regexFilter": "^https://.+/",
               "resourceTypes": ["sub_frame", "main_frame"]
             }
         }]
      })
   }
   if (msg === "iframe-relock"){
      chrome.declarativeNetRequest.updateDynamicRules({
         removeRuleIds: [1],
      })
   }
})
