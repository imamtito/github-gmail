// Retriving user options
chrome.extension.sendMessage({}, function(settings) {
  initOnHashChangeAction(settings['Domains'])
  initShortcut(settings['Shortcut'])
  initListViewShortcut(settings['Regexp'])
})

function initOnHashChangeAction(domains) {
  allDomains = "//github.com,"
  if(domains) allDomains += domains

  // Take string -> make array -> make queries -> avoid nil -> join queries to string
  selectors = allDomains.replace(/\s/, '').split(',').map(function (name) {
    if (name.length) return (".AO [href*='" + name + "']")
  }).filter(function(name) { return name }).join(", ")

  intervals = []

  // Find GitHub link and append it to tool bar on hashchange
  window.onhashchange = function() {
    // In case previous intervals got interrupted
    clearAllIntervals()

    retryForActiveMailBody = setInterval(function() {
      mail_body = $('.nH.hx').filter(function() { return this.clientHeight != 0 })[0]

      if( mail_body ) {

        github_links = mail_body.querySelectorAll(selectors)

        // Avoid multple buttons
        $('.github-link').remove()

        if( github_links.length ) {

          url = github_links[github_links.length-1].href
          // Go to thread instead of .diff link (pull request notifications)
          url = url.match(/\.diff/) ? url.slice(0, url.length-5) : url
          link = $("<a class='github-link T-I J-J5-Ji lS T-I-ax7 ar7' target='_blank' href='"+ url +"'>Visit Thread on GitHub</a>")

          $(".iH > div").append(link)
          window.idled = true

        }

        clearInterval(retryForActiveMailBody)
      } else if ( $('.nH.hx').length == 0 ) {
        // Not in a mail view
        clearInterval(retryForActiveMailBody)
      }
    }, 100)

    intervals.push(retryForActiveMailBody)
  }
}

function initShortcut(shortcut) {

  $(document).on("keypress", function(event) {

    // Processing shortcut from preference
    combination = shortcut.replace(/\s/g, '').split('+')

    keys = ['shift', 'alt', 'meta', 'ctrl']
    trueOrFalse = []

    // If a key is in the combination, push the value to trueOrFalse array, and delete it from the combination
    keys.map(function(key) {
      index = combination.indexOf(key)
      if(index >= 0) { 
        trueOrFalse.push( eval('event.' + key + 'Key' ) )
        combination.splice(index, 1)
      }
    })

    // If there is a keyCode left, add that to the mix.
    if(combination.length) trueOrFalse.push(event.keyCode == combination[0])

    // Evaluate trueOrFalse by looking for the existence of False
    trueOrFalse = (trueOrFalse.indexOf(false) < 0)

    // Shortcut: bind user's combination, if a button exist and event not in a textarea
    if( trueOrFalse && window.idled && $(".github-link:visible")[0] && notAnInput(event.target)) {
      triggerGitHubLink()
    }
  })
}

function initListViewShortcut(regexp) {
  $(document).on("keypress", function(event) {
    // Shortcut: bind ctrl + return
    selected = getVisible(document.querySelectorAll('.PE ~ [tabindex="0"]'))
    if( event.ctrlKey && event.keyCode == 13 && selected ) {
      generateUrlAndGoTo(selected, regexp)
    }
  })
}

function initListViewShortcut(regexp) {
  $(document).on("keypress", function(event) {
    // Shortcut: bind ctrl + return
    selected = getVisible(document.querySelectorAll('.PE ~ [tabindex="0"]'))
    if( event.ctrlKey && event.keyCode == 13 && selected ) {
      generateUrlAndGoTo(selected, regexp)
    }
  })
}

// Trigger the appended link in mail view
function triggerGitHubLink () {
  // avoid link being appended multiple times    
  window.idled = false

  $(".github-link:visible")[0].dispatchEvent(fakeClick())
  setTimeout( function(){ window.idled = true }, 100)
}

// Go to selected email GitHub thread
function generateUrlAndGoTo (selected, regexp) {
  if( (title = selected.innerText.match(/\[(.*)\]\s.*\s\(\#(\d*)\)/)) ) {

    // org name coms from a label
    regexp = new RegExp(regexp)
    org = selected.querySelectorAll('.av')[0].innerText.toLowerCase().match(regexp)

    if(org) {
      org = org[1]
      repo = title[1]
      issue_no = title[2]

      url = "https://github.com/" + org + "/" + repo + "/issues/" + issue_no
      linkWithUrl(url).dispatchEvent(fakeClick())
    }
  }
}

// 
// Helpers
// 

// .click() doesn't usually work as expected
function fakeClick () {
  var click = document.createEvent("MouseEvents")
  click.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  return click
}

function linkWithUrl (url) {
  var l = document.createElement('a')
  l.href = url
  l.target = "_blank"
  return l
}

function getVisible (nodeList) {
  if(nodeList.length) {
    var node
    $(nodeList).map(function() {
      if(typeof node == 'undefined' && (this.offsetTop > 0 || this.offsetLeft > 0)) {
        node = this
      }
    })
    return node
  }
}

function notAnInput (element) {
  return !element.className.match(/editable/) && element.tagName != "TEXTAREA" && element.tagName != "INPUT"
}

function clearAllIntervals () {
  intervals.map(function(num) {
    clearInterval(num)
    delete intervals[intervals.indexOf(num)]
  })
}
