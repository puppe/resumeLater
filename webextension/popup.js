/* jshint browser: true */
/* globals browser */
"use strict";

const gettingItem = browser.storage.local.get();
gettingItem.then((results) => {
    document.querySelector("#panel-content").textContent = JSON.stringify(results, null, 2);
});
