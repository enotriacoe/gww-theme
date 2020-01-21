import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import StencilDropDown from './stencil-dropdown';

export default function () {
    const TOP_STYLING = 'top: 49px;';
    const $quickSearchResults = $('.quickSearchResults');
    const $quickSearchDiv = $('#quickSearch');
    const $quickSearchInput = $('#quickSearch input');
    const $quickSearchDivMobile = $('.navPages-quickSearch');
    const $quickSearchInputMobile = $('.navPages-quickSearch input');
    const $quickSearchResultsMobile = $('.navPages-quickSearch .quickSearchResults');
    const $searchQuery = $('#search_query');
    const stencilDropDownExtendables = {
        hide: () => {
            $searchQuery.trigger('blur');
        },
        show: (event) => {
            $searchQuery.trigger('focus');
            event.stopPropagation();
        },
    };
    const stencilDropDown = new StencilDropDown(stencilDropDownExtendables);
    stencilDropDown.bind($('[data-search="quickSearch"]'), $quickSearchDiv, TOP_STYLING);

    stencilDropDownExtendables.onBodyClick = (e, $container) => {
        // If the target element has this data tag or one of it's parents, do not close the search results
        // We have to specify `.modal-background` because of limitations around Foundation Reveal not allowing
        // any modification to the background element.
        if ($(e.target).closest('[data-prevent-quick-search-close], .modal-background').length === 0) {
            stencilDropDown.hide($container);
        }
    };

    // stagger searching for 200ms after last input
    const doSearch = _.debounce((searchQuery) => {
        utils.api.search.search(searchQuery, { template: 'search/quick-results' }, (err, response) => {
            if (err) {
                return false;
            }

            $quickSearchResults.html(response);
        });
    }, 100);

    utils.hooks.on('search-quick', (event) => {
        const searchQuery = $(event.currentTarget).val();

        // server will only perform search with at least 3 characters
        if (searchQuery.length < 3) {
            return;
        }

        doSearch(searchQuery);
    });

    // Catch the submission of the quick-search
    $quickSearchDiv.on('submit', event => {
        const searchQuery = $(event.currentTarget).find('input').val();

        if (searchQuery.length === 0) {
            return event.preventDefault();
        }

        return true;
    });

    // Hide and show search elements as required

    $(document).click((e) => {
        if (($(e.target).closest($quickSearchDiv).length === 0) && ($(e.target).closest($quickSearchDivMobile).length === 0)) {
            $quickSearchResults.hide();
        }
    });

    $quickSearchInput.on('focus', () => {
        if (!($quickSearchInput[0].value)) {
            $quickSearchResults.empty();
        }
        $quickSearchResults.show();
    });

    $quickSearchInputMobile.on('focus', () => {
        if (!($quickSearchInputMobile[0].value)) {
            $quickSearchResultsMobile.empty();
        }
        $quickSearchResultsMobile.show();
    });

    function clearSearchResults() {
        $quickSearchInput[0].value = '';
        $quickSearchInputMobile[0].value = '';
        $quickSearchResults.empty();
        $quickSearchResults.hide();
        $('.btn-search-clear-text').hide();
    }

    $quickSearchDiv.on('click', '.btn-search-clear-text', (e) => {
        e.preventDefault();
        clearSearchResults();
    });

    $quickSearchResults.on('click', '.btn-search-clear', (e) => {
        e.preventDefault();
        clearSearchResults();
    });

    $quickSearchDivMobile.on('click', '.btn-search-clear-text', (e) => {
        e.preventDefault();
        clearSearchResults();
    });

    $quickSearchResultsMobile.on('click', '.btn-search-clear', (e) => {
        e.preventDefault();
        clearSearchResults();
    });

    $quickSearchInput.on('input', () => {
        $('.btn-search-clear-text').show();
        $quickSearchResults.html('<div class="searching-text">Searching...</div>');
        $quickSearchResults.show();
    });

    $quickSearchInputMobile.on('input', () => {
        $('.btn-search-clear-text').show();
        $quickSearchResultsMobile.html('<div class="searching-text">Searching...</div>');
        $quickSearchResultsMobile.show();
    });
}
