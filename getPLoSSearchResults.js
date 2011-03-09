/*
 ----------------------------------------------------------
 get PLoS Search Results -- jsonp request to PLoS Solr

 Created on: February 23, 2011
 Created by: Veronica Canterbury
 ----------------------------------------------------------
 */

var getPLoSSearchResults = function(query) {
    var searchUrl = "http://localhost:8983/solr/select";
    var dataMode = "json";
    var numResults = "30";
    var startResults = 0;
    var theQuery = 'q='+query;
    var params = [
        'json.wrf=displayPLoSResults', // this tells solr that we want the json data wrapped with the displayPLoSResults function callback
        'wt='+dataMode, // in this case, we want json
        'start='+startResults,
        'rows='+numResults,
        'fl=id,title,counter_total_month,author,abstract,journal,article_type,publication_date',
        'fq=!article_type_facet:"Issue Image"',
        'sort=counter_total_month desc' // solr fields we want to get back, ex. abstract and counter_total_month are
                                        // not returned by default, we have to explicitly ask for them
    ];

    params = params.concat(theQuery);

    var strData = params.join('&');
    var script = document.createElement('script');
    script.type = "text/javascript";
    if(query) {
        script.src = searchUrl +'?'+strData; // setting the search url and query string
        document.getElementById("plos_search_widget").appendChild(script); // inserting the results
        window.setTimeout(function() {
            if(!hasDisplayedPLoSSearchResults) {
                var PLoSSearchError = '<span id="PLoS-Error">Search Timed Out</span>';
                PLoSSearch.serverError(PLoSSearchError);
            }
        }, 5000);
    }
};

var hasDisplayedPLoSSearchResults = false;

var displayPLoSResults = function(data) {
    hasDisplayedPLoSSearchResults = true;
    var resultsData = data.response.docs;
    var resultsLength = resultsData.length;
    var results = '';
    var highlighting = data.highlighting;
    var resultsString = ' Result';
    var totalResults = '';
    var viewString = '';
    var queryString = encodeURI(document.getElementById('tbPLoSSearch').value);
    var plosAdvancedSearchLink = 'http://www.plosone.org/search/advancedSearch.action?pageSize=50&unformattedQuery=' + queryString;
    var plosEOLAdvancedSearchString = "View advanced results on PLoS One";
    var topString = "Top ";
    var i, h, j;

    function formatMo(value) {
        switch (value) {
            case 1:
                return "January";
            case 2:
                return "February";
            case 3:
                return "March";
            case 4:
                return "April";
            case 5:
                return "May";
            case 6:
                return "June";
            case 7:
                return "July";
            case 8:
                return "August";
            case 9:
                return "September";
            case 10:
                return "October";
            case 11:
                return "November";
            case 12:
                return "December";
            default:
                return value;
        }
    }


    if(resultsLength > 0) {
        viewString = '&nbsp;&nbsp;<a href="#" rel="toggleArticleList" id="plos-toggleView" title="Show More">[+]</a>';
    }

    if(resultsLength > 1) {
        resultsString = ' Results';
    }

    if(resultsLength == data.response.numFound) {
        topString = "";
    }

    if(data.response.numFound > resultsLength) {
        totalResults = data.response.numFound;
        resultsString = ' of ' + totalResults + ' Results';
        plosEOLAdvancedSearchString = "View more results on PLoS One";
    }
    results += '<div id="PLoS-Search-Widget">';

    if (resultsLength > 0) {
        results += '<div><h3>' + topString + resultsLength + resultsString + '</h3>' + viewString + '<p><a href="' + plosAdvancedSearchLink + '" title="View Advanced Results" target="_blank">View advanced results on PLoS One</a></p></div>';
        results += '<div id="PLoSSearchResults"><ol>';
        for (i = 0; i < resultsData.length; i++) {
            var result = resultsData[i];
            var author = result.author;
            var pubDate = result.publication_date;

            if (author) {

                var authorLength = author.length;
                var authors = '';

                // if there are multiple authors, format author string
                if (Object.prototype.toString.call(author) === '[object Array]' && authorLength > 1) {
                    for (j = 0; j< authorLength; j++) {
                        authors += author[j];
                        if (j < authorLength - 1) {
                            authors += ', ';
                        }
                    }
                    author = authors;
                }
            } else {
                author = "";
            }

            if (pubDate) {
                pubDate = pubDate.substr(0, pubDate.indexOf("T"));
                pubDate = pubDate.split("-");
                var year = pubDate[0];
                var month = pubDate[1];
                if (month.indexOf('0') === 0) {
                    month = month.substr(1, 1);
                }

                month = formatMo(parseInt(month, 10));

                var day = pubDate[2];

                pubDate = month + " " + " " + day + " " + year;

            }

            var highlights = '';
            for (h = 0; h < highlighting[result.id].everything.length; h++) {
                highlights += highlighting[result.id].everything[h];
            }

            var abstractText = '';
            var originalAbstract = result.abstract + " ";
            if(originalAbstract !== " ") {
                var truncated = originalAbstract.substr(0,100)+ "...";
                abstractText += '<span class="truncated" id="truncated-'+ result.id + '">'+ truncated +'</span>';
                abstractText += '<span class="hiddenAbstract" id="abstract-'+ result.id +'">'+ originalAbstract + '</span>&nbsp;<a href="#" class="plos-toggle-abstract" rel="' + result.id + '" title="more">[+]</a>';
            }

            results += "<li>";
            results += '<p><a class="article" title="Read Open-Access Article" href="http://dx.plos.org/' + result.id + '">' + result.title + '</a> - Views: ' + result.counter_total_month + '</p>';
            results += '<p class="authors">' + author + '</p>';
            results += '<p class="cite">' + highlights + '</p>';
            if (originalAbstract !== ' ') {
                results += '<p class="cite abstract"><strong>Abstract: </strong>' + abstractText + '</p>';
            }
            results += "<p><em><strong>" + result.journal + "</strong>:</em> " + result.article_type + ", published " + pubDate + "</p>";
            results += "</li>";
        }

        results += "</ol>";
        results += '<p id="plos-eollinks"><a href="#" id="plos-collapseResults" title="Hide Results List">[-]</a> <a href="' + plosAdvancedSearchLink + '" title="' +  plosEOLAdvancedSearchString + '" target="_blank" id="PLoS-BASL">' + plosEOLAdvancedSearchString + '</a></p></div>';
        results += "</div>";
        PLoSSearch.serverResponse(results);
    } else {
        results += "<p>No Results</p>";
        results += "</div>";
        PLoSSearch.serverError(results);
    }

};



