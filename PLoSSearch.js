/*
----------------------------------------------------------
PLoS Search Box Widget

Created on: February 23, 2011
Modified on: March 9, 2011
Created by: Veronica Canterbury

----------------------------------------------------------
*/

PLoSSearch = new function() {
    var BASE_URL = "../search-widget/";
    var STYLESHEET = BASE_URL + 'search_widget.css';
    var CONTENT_URL = BASE_URL + 'getPLoSSearchResults.js';
    var ROOT = 'plos_search_widget';
    var theHTML = '';
    var that = this;
    var scripts = document.getElementsByTagName('script');
    var thisScript = scripts[scripts.length-1];
    var theError = document.getElementById("PLoS-Error");

    that.requestStyles = function(styles_url) {  //adds the stylesheet to the page
        var stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.type = "text/css";
        stylesheet.href = styles_url;
        stylesheet.media = "all";
        document.getElementsByTagName('head')[0].appendChild(stylesheet);
    };

    that.requestContent= function(local) {  //adds the get search results code to the page
        var script = document.createElement('script');
        script.src = CONTENT_URL;
        script.type = "text/javascript";
        document.body.appendChild(script);
    };

    that.serverResponse = function(data) {
        var txt = data;
        var el = document.getElementById(ROOT);
        var resultsDiv = document.createElement('div');
        resultsDiv.innerHTML = txt;
        that.clearEl(el);
        el.appendChild(resultsDiv);
        el.style.display = 'block';
        that.moreLessLinks();
        that.plosToggleList();
    };

    that.serverError = function(text) {
        var el = document.getElementById(ROOT);
        var errorDiv = document.createElement('div');
        errorDiv.innerHTML = text;
        that.clearEl(el);
        el.appendChild(errorDiv);
        el.style.display = 'block';
    }

    that.eventListen = function(evnt, el, func) {  // listens for events on specified elements and triggers specified function
        if(!func) return;
        if(el.addEventListener) {  // W3C Model
            el.addEventListener(evnt, func, false);
        } else if(el.attachEvent) { // IE Model
            r = el.attachEvent("on"+evnt, func);
            return r;
        } else { console.log("unable to listen to events"); }
    };

    that.getResults = function(e) {  // sends the search string to solr
        if(!e) {
            e = window.event;
        }

        if(e.preventDefault) { e.preventDefault(); } //prevents form submit and page refresh
        e.returnValue = false;

        var query = document.getElementById('tbPLoSSearch').value;
        var el = document.getElementById(ROOT);
        that.clearEl(el);

        var loaderDiv = document.createElement('div');
        loaderDiv.id = "plos-loader";
        loaderDiv.innerHTML = '<img src="' + BASE_URL  + 'ajax-loader.gif" alt="loading" title="loading"/>';

        el.appendChild(loaderDiv);

        var errorDiv = document.createElement('div');
        errorDiv.id = "PLoS-Error";
        errorDiv.innerHTML = "Please enter a search query.";

        if(!query || query === '') {
            that.clearEl(el);
            el.appendChild(errorDiv);
            el.style.display = "block";
        }
        getPLoSSearchResults(query);
    };

    that.clearEl = function(el) {
        while(el.hasChildNodes()) { // clear results
            el.removeChild(el.childNodes[0]);
        }
    };


    that.plosToggleList = function () {
        var plosToggleResults = document.getElementById('plos-toggleView');
        var thePlosList = document.getElementById('PLoSSearchResults');
        var plosCollapseResults = document.getElementById('plos-collapseResults');

        plosToggleResults.onclick = function() {
            var currentValue = this.innerHTML;
            if(currentValue === "[+]") {
                var newTextNode = document.createTextNode("[-]");
                that.clearEl(this);
                this.appendChild(newTextNode);
                this.title = "Show Less";
                thePlosList.style.display = "block";
            } else {
                var newTextNode = document.createTextNode("[+]");
                that.clearEl(this);
                this.appendChild(newTextNode);
                this.title = "Show More";
                thePlosList.style.display = "none";
            }
            return false;
        };

        plosCollapseResults.onclick = function() {
            var newTextNode = document.createTextNode("[+]");
            that.clearEl(plosToggleResults);
            plosToggleResults.appendChild(newTextNode);
            plosToggleResults.title= "Show More";
            thePlosList.style.display = "none";
            return false;
        };
    };

    that.moreLessLinks = function() {
        var j;
        var links = document.getElementsByTagName("a");

        for(j=0; j < links.length; j++) {
            if(links[j].className === "plos-toggle-abstract") {
               links[j].onclick=function() {
                   var linkText = this.innerHTML;
                   var theAbstractId = "abstract-"+this.rel;
                   var theTruncatedId = "truncated-"+this.rel;
                   var theAbstract = document.getElementById(theAbstractId);
                   var truncatedAbstract = document.getElementById(theTruncatedId);
                   if(linkText === "[+]") {
                       var newTextNode = document.createTextNode("[-]");
                       that.clearEl(this);
                       this.appendChild(newTextNode);
                       this.title = "Show Less";
                       theAbstract.style.display="inline";
                       truncatedAbstract.style.display="none";
                   } else if(linkText === "[-]") {
                       var newTextNode = document.createTextNode("[+]");
                       that.clearEl(this);
                       this.appendChild(newTextNode);
                       theAbstract.style.display="none";
                       truncatedAbstract.style.display="inline";
                   }
                   return false;
               };
            } else if(links[j].className === "plos-abstract-less") {
                links[j].onclick=function() {
                   var theTruncatedId = this.rel;
                   var theAbstractId = theTruncatedId.replace("truncated", "abstract");
                   var theAbstract = document.getElementById(theAbstractId);
                   var truncatedAbstract = document.getElementById(theTruncatedId);
                   theAbstract.style.display="none";
                   truncatedAbstract.style.display="inline";
                   return false;
                };
            }
        }
    };

    that.PLoSDomReady = function(callback) {
        var oldonload = window.onload;
            if (typeof window.onload != 'function') {
                window.onload = callback;
            } else {
                window.onload = function() {
                    if (oldonload) {
                        oldonload();
                    }
                    callback();
                }
            }
    };


    /**  theHTML is the HTML code for the search form  **/
    theHTML += '<form name="frmPloSSearch" id="frmPloSSearch" action="" method="POST">';
    theHTML += '<div class="plos-row"><input type="text" size="15" value="" name="queryPLoSSearch" id="tbPLoSSearch" placeholder="search terms" />';
    theHTML += '<button id="btnPLoS" type="submit">Search</button></div>';
    theHTML += '</form>';

    that.PLoSDomReady(function() {
        var theForm = document.createElement('div');
        var theHiddenContent = document.createElement('div');
        that.requestStyles(STYLESHEET);
        theForm.innerHTML = theHTML;
        thisScript.parentNode.insertBefore(theForm, thisScript);
        theHiddenContent.id = ROOT;
        theHiddenContent.display = "none";
        theForm.appendChild(theHiddenContent);
        var frmEl = document.getElementById('frmPloSSearch');
        that.requestContent();
        that.eventListen("submit", frmEl, that.getResults ); // sets the form submit to the getResults function
    })
};
