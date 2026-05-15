(function () {
  // function containsText(selector, text) {
  //     var elements = document.querySelectorAll(selector);
  //     return Array.prototype.filter.call(elements, function(element){
  //         return RegExp(text).test(element.textContent);
  //     });
  // }

  function updateInput(inp, newValue) {
    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    ).set;
    nativeInputValueSetter.call(inp, newValue || '');
    var ev = new Event('input', { bubbles: true });
    inp.dispatchEvent(ev);
  }

  function updateAddress(address) {
    if (document.getElementById('addressLine1Input')) {
      updateInput(document.getElementById('addressLine1Input'), address.Line1);
      updateInput(document.getElementById('addressLine2Input'), address.Line2);
      updateInput(document.getElementById('cityInput'), address.City);
      updateInput(document.getElementById('postCodeInput'), address.PostalCode);
      updateInput(document.getElementById('companyInput'), address.Company);
    }
  }

  var pcaLoaded = false;
  function mutated(mutationList, observer) {
    var addressForm = document.querySelector('.checkout-address #companyInput');
    if (!pcaLoaded && addressForm && window.pca) {
      pcaLoaded = true;
      window.pca.load();
    } else if (!addressForm) {
      pcaLoaded = false;
    }

    var text =
      'If your order is a gift please enter a gift message here. Please do not enter delivery instructions here; you will be sent tracking information from DPD that will enable you to specify specific instructions.';
    var giftMessage = document.querySelector('input[name="orderComment"]');
    if (giftMessage && !giftMessage.hasAttribute('title')) {
      giftMessage.setAttribute('title', text);
    }
    var legend = document.querySelector('fieldset[data-test="checkout-shipping-comments"] legend');
    if (legend && !legend.hasAttribute('title')) {
      legend.setAttribute('title', text);
    }
    var warning =
      '<div id="checkout-shopping-warning" style="font-size:0.8em; margin-bottom:1em;">Please note that deliveries in snow and ice-affected areas may be subject to localised delays.</div>';
    var optionsLegend = document.querySelector('fieldset#checkout-shipping-options legend');
    if (optionsLegend && !document.getElementById('checkout-shopping-warning')) {
      optionsLegend.insertAdjacentHTML('afterend', warning);
    }
  }
  var observer = new MutationObserver(mutated);
  var app = document.getElementById('checkout-app');
  observer.observe(app.parentNode, {
    subtree: true,
    childList: true,
    attributes: false,
  });
  window.pca.on('load', function (type, id, control) {
    control.listen('prepopulate', function (address) {
      updateAddress(address);
      document.getElementById('phoneInput').focus();
    });
  });
})();
