// each key will be a ignored user data.
let ignoredData = {};

// interprocess communication
const port = chrome.runtime.connect();
window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    console.log("Content script received: " + event.data.text);
    port.postMessage(event.data.text);

    showUserContent(event.data.text);
  }
}, false);

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {  
            case "unignoreUser":
            showUserContent({uniqueUsername: message.userName});
            delete ignoredData[message.userName];
            updateIgnoredData();
            break;
        }
    }
);

$(document).ready(() => {
    //fetch ignored users, and really ignore them.
    getIgnoredData(savedItems => {
        if (savedItems){
            processIgnoredUsers(savedItems);
            ignoredData = savedItems;
        }
    });

    $(document).on("click", ".comment-block-user", (event) => {
        const $commentElement = $(event.currentTarget).closest("div.comment");
        const $commentHeader = $commentElement.find(".comment-header");
        const userName = $commentHeader.children("cite").text();
        const avatarUrl = $commentElement.children(".avatar").attr("src");

        ignoreUser(userName, avatarUrl)
    });

    // to each comment add the option to ignore the user
    $(".comment-inner").each((position, item) => {
        const $commentElement = $(item);
        const userName = $commentElement.find('cite.fn').text();

        $commentElement.find('.comment-actions').prepend(blockUserActionButtonTemplate({userName}));
        $commentElement.find('.comment-reply-link').css('display', 'inline');
    });
});

// Creares the ignoredUser object and handles all the needed communications
function ignoreUser(userName, avatarUrl = "") {
    const uniqueUsername = userName.toLowerCase().trim().replace(" ", "");
    const currentUserData = ignoredData[uniqueUsername] ? ignoredData[uniqueUsername] : {uniqueUsername, userName, avatarUrl, ignoredSince: Date.now()};

    ignoredData[uniqueUsername] = currentUserData;

    updateIgnoredData();
    hideUserContent({uniqueUsername});
}

function processIgnoredUsers (usersData) {
  Object.keys(usersData).forEach(uniqueUsername => {
    hideUserContent(usersData[uniqueUsername]);
  });
}

function hideUserContent(ignoreOptions) 
{
    handleUserContent({...ignoreOptions, hide: true});
}

function showUserContent(ignoreOptions) 
{
    handleUserContent({...ignoreOptions, hide: false});
}

function handleUserContent( {uniqueUsername, ignoreWholeThread = true, hide = true}) {
    $("cite").each((position, item)=>{
        const $itemElement = $(item);

        if ($itemElement.text().toLowerCase().trim().replace(" ", "") === uniqueUsername){
            if(hide) 
                $itemElement.parents("li.comment").first().hide();
            else
                $itemElement.parents("li.comment").first().show();
            
        }
    })
}

//fetches ignoredUserData from chrome
function getIgnoredData(callback) {
  chrome.storage.sync.get("ignoredData", (savedData) => callback(savedData.ignoredData));
}

//saves updated ignoredUserData to chrome and forces update on pop-up
function updateIgnoredData() {
    chrome.storage.sync.set({ ignoredData });
    chrome.runtime.sendMessage( {type:"ignoreDataUpdated"});
}

// template function
function blockUserActionButtonTemplate(userData) {
    return '<a rel="nofollow" class="comment-block-user" style="background-image: url('+chrome.extension.getURL("block2.png")+');" aria-label="Bloquear '+ userData.userName +'"></a>';
}