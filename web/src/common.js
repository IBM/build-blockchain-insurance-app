/*global IBMCore*/
import './common.scss';
import './northstar.css';
import './northstar-forms.css';
import './northstar-tables.css';

// Apply Internationalization Polyfill
if (!window.Intl) {
  require('intl');
}

window.digitalData = {
  "page": {
    "category": {
      "primaryCategory": "Blockchain"
    },
    "pageInfo": {
      "language": "en-US",
      "publishDate": "2017-02-28",
      "publisher": "IBM Corporation",
      "version": "v18",
      "pageID": "None",
      "ibm": {
        "contentDelivery": "HTML"
      }
    }
  }
};

IBMCore.common.util.config.set({
  masthead: {
    type: "popup"
  },
  "footer": {
    "type": "alternate",
    "socialLinks": {
      "enabled": false
    }
  }
});

jQuery(() => {
  let regionSelector = jQuery('#region-selector');
  regionSelector.select2()
    .on('select2:select', () => {
      if(regionSelector.val()) {
        window.location.replace(window.location.pathname + '?applang=' + regionSelector.val());
      }
    });
});
