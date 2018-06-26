
$(document).ready(() => {
    chrome.storage.sync.get(/* String or Array */["ignoredData"],onIgnoredDataFetched);
    $(document).on("click", "button", event => {
        const $userRow = $(event.currentTarget).parents("tr");

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type:"unignoreUser", userName: $userRow.attr("username")});
        });
    })
});

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "ignoreUser":
            chrome.storage.sync.get(/* String or Array */["ignoredData"], onIgnoredDataFetched);
            break;
        }
    }
);


function onIgnoredDataFetched(items) {
  //  items = [ { "yourBody": "myBody" } ]
  const $userContainer = $(".user__container");
  // $userContainer.html("");

  $.each(items.ignoredData, userName => {
      const userData = items.ignoredData[userName];
      $userContainer
      .children("table")
      .append('<tr username="'+userData.uniqueUsername+'"><td>'+userData.userName+'</td> <td>'+userData.ignoredSince+'</td> <td><button>Make Peace</td> </tr>');
  });
}



