
$(document).ready(() => {

    // as soon as the document is ready, fetch data to build the pop-up view
    chrome.storage.sync.get(["ignoredData"],onIgnoredDataFetched);
    $(document).on("click", ".usercard__action", event => {
        const $userRow = $(event.currentTarget).parents("[username]");

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type:"unignoreUser", userName: $userRow.attr("username")});
        });
    })
});

// interprocess communication
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "ignoreDataUpdated":
            chrome.storage.sync.get("ignoredData", onIgnoredDataFetched);
            break;
        }
    }
);

// ignoredData fetching callback function.
function onIgnoredDataFetched(items) {
    const $userContainer = $(".user__container");
    $userContainer.html("");

    if(!Object.keys(items.ignoredData).length) {
        $userContainer.append(emptyStateTemplate());
    } else {
        $.each(items.ignoredData, userName => {
            const userData = items.ignoredData[userName];

            $userContainer
            .append(templateUserCard(userData));
        });
    }

}

// template function
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

// template function
function emptyStateTemplate() {
    return '<div class="user__container--empty"><span>Nenhum utilizador ignorado.</span></div>';
}