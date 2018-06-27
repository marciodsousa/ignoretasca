
$(document).ready(() => {
    chrome.storage.sync.get(/* String or Array */["ignoredData"],onIgnoredDataFetched);
    $(document).on("click", ".usercard__action", event => {
        const $userRow = $(event.currentTarget).parents("[username]");

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type:"unignoreUser", userName: $userRow.attr("username")});
        });
    })
});

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "ignoreDataUpdated":
            chrome.storage.sync.get(/* String or Array */["ignoredData"], onIgnoredDataFetched);
            break;
        }
    }
);


function onIgnoredDataFetched(items) {
  //  items = [ { "yourBody": "myBody" } ]
  const $userContainer = $(".user__container");
  $userContainer.html("");

  $.each(items.ignoredData, userName => {
      const userData = items.ignoredData[userName];
      $userContainer
      .append(templateUserCard(userData));
  });
}

function templateUserCard(userData) {
    const dateParsingOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const parsedDate  = new Date(userData.ignoredSince).toLocaleDateString("pt-PT", dateParsingOptions);


    return '<div class="usercard" username="'+userData.uniqueUsername+'">'
        + '<img class="usercard__avatar" src="'+userData.avatarUrl+'" />'
        + '<div class="usercard__info">'
            + '<span class="usercard__title">'+userData.userName+'</span>'
            + '<span class="usercard__subtitle">'+parsedDate+'</span>'
        + '</div>'
        + '<div class="usercard__buttons"><span class="usercard__action">Fazer as Pazes</button></div>'
    + '</div>';
}