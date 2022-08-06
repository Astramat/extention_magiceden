
const parse = require('./jquery-3.6.0.min.js');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var execute_script = false;
    var count_l = 0;

    function end_script(request) {
      console.log(request, "code executé");
      execute_script = false
      chrome.runtime.sendMessage({ code: 3, data: execute_script });
    }

    function click_button() {
      console.log("fh");
    }

    function wait_seconde(x) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve("end");
        }, x * 1000);
      });
    }

    async function test() {
      var listeners = $x('//*[@id="content"]/div[2]/div[3]/div[2]/div[5]/div[1]/div[1]') == [] || $x('//*[@id="content"]/div[2]/div[3]/div[2]/div[4]/div/div[2]/div[1]');
      if ($(".justify-content-center").length == 0 && listeners[0].children.length == count_l) { console.log("fin"); return; }
      while (count_l < listeners[0].children.length) {
        console.log(count_l);
        if (listeners[0].children[count_l].children[0].children[0].children[0].children[0].className == "tw-absolute tw-w-full tw-cursor-not-allowed") {
          console.log("tak");
          break;
        }
        listeners[0].children[count_l].children[0].children[0].children[0].children[0].click();
        count_l++;
      }

      if ($(".justify-content-center").length != 0 && $(".justify-content-center")[0].children[0].innerHTML == ' Loading more...') {
        window.scrollTo(0, document.body.scrollHeight);
        while ($(".justify-content-center")[0].children[0].innerHTML == ' Loading more...' && count_l == listeners[0].children.length) {
          await wait_seconde(1);
          listeners = $x('//*[@id="content"]/div[2]/div[3]/div[2]/div[5]/div[1]/div[1]') == [] || $x('//*[@id="content"]/div[2]/div[3]/div[2]/div[4]/div/div[2]/div[1]');
        }
        test();
      }
    }

    if (request.code == 1 || execute_script == true || request.code == 3) { sendResponse(execute_script); end_script(); return }
    else sendResponse(false);
    execute_script = true
    chrome.runtime.sendMessage({ code: 3, data: execute_script });
    if ($x('//*[@id="content"]/div[2]/div[1]/div[3]/div/div/div/div/div/div/button[1]').length != 0)
      $x('//*[@id="content"]/div[2]/div[1]/div[3]/div/div/div/div/div/div/button[1]')[0].click();
    if ($x('//*[@id="root"]/div[1]/header/nav/div[2]/div[2]/div/button[2]').length == 0) {
      end_script(request);
      alert("Wallet not connected");
      return
    }
    test()
    alert("end script");
    end_script(request);

});