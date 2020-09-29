import { hooks, api } from '@bigcommerce/stencil-utils';
import _ from 'lodash';
import Url from 'url';
import urlUtils from './url-utils';
import modalFactory from '../global/modal';
import collapsibleFactory from './collapsible';
import { Validators } from './form-utils';
import nod from './nod';

/**
 * Faceted search view component
 */
class FacetedSearch {
    /**
     * @param {object} requestOptions - Object with options for the ajax requests
     * @param {function} callback - Function to execute after fetching templates
     * @param {object} options - Configurable options
     * @example
     *
     * let requestOptions = {
     *      templates: {
     *          productListing: 'category/product-listing',
     *          sidebar: 'category/topbar'
     *     }
     * };
     *
     * let templatesDidLoad = function(content) {
     *     $productListingContainer.html(content.productListing);
     *     $facetedSearchContainer.html(content.sidebar);
     * };
     *
     * let facetedSearch = new FacetedSearch(requestOptions, templatesDidLoad);
     */
    constructor(requestOptions, callback, options) {
        const defaultOptions = {
            accordionToggleSelector: '#facetedSearch .accordion-navigation, #facetedSearch .facetedSearch-toggle',
            blockerSelector: '#facetedSearch .blocker',
            clearFacetSelector: '#facetedSearch .facetedSearch-clearLink',
            componentSelector: '#facetedSearch-navList',
            facetNavListSelector: '#facetedSearch .navList',
            priceRangeErrorSelector: '#facet-range-form .form-inlineMessage',
            priceRangeFieldsetSelector: '#facet-range-form .form-fieldset',
            priceRangeFormSelector: '#facet-range-form',
            priceRangeMaxPriceSelector: '#facet-range-form [name=max_price]',
            priceRangeMinPriceSelector: '#facet-range-form [name=min_price]',
            showMoreToggleSelector: '#facetedSearch .accordion-content .toggleLink',
            facetedSearchFilterItems: '#facetedSearch-filterItems .form-input',
            modal: modalFactory('#modal-filter')[0],
            modalOpen: false,
        };

        // Private properties
        this.requestOptions = requestOptions;
        this.callback = callback;
        this.options = _.extend({}, defaultOptions, options);
        this.collapsedFacets = [];
        this.collapsedFacetItems = [];

        // Init collapsibles
        collapsibleFactory();

        this.removeSingleItemFilters();
        this.additionFilterFunctions();
        this.closeFilterOptions();

        // Init price validator
        this.initPriceValidator();

        // Show limited items by default
        $(this.options.facetNavListSelector).each((index, navList) => {
            this.collapseFacetItems($(navList));
        });

        // Mark initially collapsed accordions
        $(this.options.accordionToggleSelector).each((index, accordionToggle) => {
            const $accordionToggle = $(accordionToggle);
            const collapsible = $accordionToggle.data('collapsibleInstance');

            if (collapsible.isCollapsed) {
                this.collapsedFacets.push(collapsible.targetId);
            }
        });

        // Collapse all facets if initially hidden
        // NOTE: Need to execute after Collapsible gets bootstrapped
        setTimeout(() => {
            if ($(this.options.componentSelector).is(':hidden')) {
                this.collapseAllFacets();
            }
        });

        // Observe user events
        this.onStateChange = this.onStateChange.bind(this);
        this.onToggleClick = this.onToggleClick.bind(this);
        this.onAccordionToggle = this.onAccordionToggle.bind(this);
        this.onClearFacet = this.onClearFacet.bind(this);
        this.onFacetClick = this.onFacetClick.bind(this);
        this.onRangeSubmit = this.onRangeSubmit.bind(this);
        this.onSortBySubmit = this.onSortBySubmit.bind(this);
        this.filterFacetItems = this.filterFacetItems.bind(this);

        this.bindEvents();
        this.hideMoreFiltersIfNone();
    }

    // Public methods
    refreshView(content) {
        if (content) {
            this.callback(content);
        }

        // Init collapsibles
        collapsibleFactory();

        // Init price validator
        this.initPriceValidator();

        // Bind events
        this.bindEvents();

        this.collapseAllFacets();

        // eslint-disable-next-line no-undef

        this.updateListView();
        this.updateReadMore();
        this.removeSingleItemFilters();
        this.additionFilterFunctions();
        this.closeFilterOptions();
        this.hideMoreFiltersIfNone();
    }

    updateView() {
        api.getPage(urlUtils.getUrl(), this.requestOptions, (err, content) => {
            if (err) {
                throw new Error(err);
            }

            // Refresh view with new content
            this.refreshView(content);
        });
    }

    expandFacetItems($navList) {
        const id = $navList.attr('id');

        // Remove
        this.collapsedFacetItems = _.without(this.collapsedFacetItems, id);
    }

    collapseFacetItems($navList) {
        const id = $navList.attr('id');
        const hasMoreResults = $navList.data('hasMoreResults');

        if (hasMoreResults) {
            this.collapsedFacetItems = _.union(this.collapsedFacetItems, [id]);
        } else {
            this.collapsedFacetItems = _.without(this.collapsedFacetItems, id);
        }
    }

    toggleFacetItems($navList) {
        const id = $navList.attr('id');

        // Toggle depending on `collapsed` flag
        if (_.includes(this.collapsedFacetItems, id)) {
            this.getMoreFacetResults($navList);

            return true;
        }

        this.collapseFacetItems($navList);

        return false;
    }

    getMoreFacetResults($navList) {
        const facet = $navList.data('facet');
        const facetUrl = urlUtils.getUrl();

        if (this.requestOptions.showMore) {
            api.getPage(facetUrl, {
                template: this.requestOptions.showMore,
                params: {
                    list_all: facet,
                },
            }, (err, response) => {
                if (err) {
                    throw new Error(err);
                }

                this.options.modal.open();
                this.options.modalOpen = true;
                this.options.modal.updateContent(response);
            });
        }

        this.collapseFacetItems($navList);

        return false;
    }

    filterFacetItems(event) {
        const $items = $('.navList-item');
        const query = $(event.currentTarget).val().toLowerCase();

        $items.each((index, element) => {
            const text = $(element).text().toLowerCase();
            if (text.indexOf(query) !== -1) {
                $(element).show();
            } else {
                $(element).hide();
            }
        });
    }

    expandFacet($accordionToggle) {
        const collapsible = $accordionToggle.data('collapsibleInstance');

        collapsible.open();
    }

    collapseFacet($accordionToggle) {
        const collapsible = $accordionToggle.data('collapsibleInstance');

        collapsible.close();
    }

    collapseAllFacets() {
        const $accordionToggles = $(this.options.accordionToggleSelector);

        $accordionToggles.each((index, accordionToggle) => {
            const $accordionToggle = $(accordionToggle);

            this.collapseFacet($accordionToggle);
        });
    }

    expandAllFacets() {
        const $accordionToggles = $(this.options.accordionToggleSelector);

        $accordionToggles.each((index, accordionToggle) => {
            const $accordionToggle = $(accordionToggle);

            this.expandFacet($accordionToggle);
        });
    }

    // Private methods
    initPriceValidator() {
        if ($(this.options.priceRangeFormSelector).length === 0) {
            return;
        }

        const validator = nod();
        const selectors = {
            errorSelector: this.options.priceRangeErrorSelector,
            fieldsetSelector: this.options.priceRangeFieldsetSelector,
            formSelector: this.options.priceRangeFormSelector,
            maxPriceSelector: this.options.priceRangeMaxPriceSelector,
            minPriceSelector: this.options.priceRangeMinPriceSelector,
        };

        Validators.setMinMaxPriceValidation(validator, selectors);

        this.priceRangeValidator = validator;
    }

    restoreCollapsedFacetItems() {
        const $navLists = $(this.options.facetNavListSelector);

        // Restore collapsed state for each facet
        $navLists.each((index, navList) => {
            const $navList = $(navList);
            const id = $navList.attr('id');
            const shouldCollapse = _.includes(this.collapsedFacetItems, id);

            if (shouldCollapse) {
                this.collapseFacetItems($navList);
            } else {
                this.expandFacetItems($navList);
            }
        });
    }

    restoreCollapsedFacets() {
        const $accordionToggles = $(this.options.accordionToggleSelector);

        $accordionToggles.each((index, accordionToggle) => {
            const $accordionToggle = $(accordionToggle);
            const collapsible = $accordionToggle.data('collapsibleInstance');
            const id = collapsible.targetId;
            const shouldCollapse = _.includes(this.collapsedFacets, id);

            if (shouldCollapse) {
                this.collapseFacet($accordionToggle);
            } else {
                this.expandFacet($accordionToggle);
            }
        });
    }

    bindEvents() {
        // Clean-up
        this.unbindEvents();

        // DOM events
        $(window).on('statechange', this.onStateChange);
        $(document).on('click', this.options.showMoreToggleSelector, this.onToggleClick);
        $(document).on('toggle.collapsible', this.options.accordionToggleSelector, this.onAccordionToggle);
        $(document).on('keyup', this.options.facetedSearchFilterItems, this.filterFacetItems);
        $(this.options.clearFacetSelector).on('click', this.onClearFacet);

        // Hooks
        hooks.on('facetedSearch-facet-clicked', this.onFacetClick);
        hooks.on('facetedSearch-range-submitted', this.onRangeSubmit);
        hooks.on('sortBy-submitted', this.onSortBySubmit);
    }

    unbindEvents() {
        // DOM events
        $(window).off('statechange', this.onStateChange);
        $(document).off('click', this.options.showMoreToggleSelector, this.onToggleClick);
        $(document).off('toggle.collapsible', this.options.accordionToggleSelector, this.onAccordionToggle);
        $(document).off('keyup', this.options.facetedSearchFilterItems, this.filterFacetItems);
        $(this.options.clearFacetSelector).off('click', this.onClearFacet);

        // Hooks
        hooks.off('facetedSearch-facet-clicked', this.onFacetClick);
        hooks.off('facetedSearch-range-submitted', this.onRangeSubmit);
        hooks.off('sortBy-submitted', this.onSortBySubmit);
    }

    onClearFacet(event) {
        const $link = $(event.currentTarget);
        const url = $link.attr('href');

        event.preventDefault();
        event.stopPropagation();

        // Update URL
        urlUtils.goToUrl(url);
    }

    onToggleClick(event) {
        const $toggle = $(event.currentTarget);
        const $navList = $($toggle.attr('href'));

        // Prevent default
        event.preventDefault();

        // Toggle visible items
        this.toggleFacetItems($navList);
    }

    onFacetClick(event) {
        const $link = $(event.currentTarget);
        const url = $link.attr('href');

        event.preventDefault();

        $link.toggleClass('is-selected');

        // Update URL
        urlUtils.goToUrl(url);

        if (this.options.modalOpen) {
            this.options.modal.close();
        }
    }

    onSortBySubmit(event) {
        const url = Url.parse(window.location.href, true);
        const queryParams = $(event.currentTarget).serialize().split('=');

        url.query[queryParams[0]] = queryParams[1];
        delete url.query.page;

        event.preventDefault();

        urlUtils.goToUrl(Url.format({ pathname: url.pathname, search: urlUtils.buildQueryString(url.query) }));
    }

    onRangeSubmit(event) {
        event.preventDefault();

        if (!this.priceRangeValidator.areAll(nod.constants.VALID)) {
            return;
        }

        const url = Url.parse(window.location.href, true);
        let queryParams = decodeURI($(event.currentTarget).serialize()).split('&');
        queryParams = urlUtils.parseQueryParams(queryParams);

        for (const key in queryParams) {
            if (queryParams.hasOwnProperty(key)) {
                url.query[key] = queryParams[key];
            }
        }

        urlUtils.goToUrl(Url.format({ pathname: url.pathname, search: urlUtils.buildQueryString(url.query) }));
    }

    onStateChange() {
        this.updateView();
    }

    onAccordionToggle(event) {
        const $accordionToggle = $(event.currentTarget);
        const collapsible = $accordionToggle.data('collapsibleInstance');
        const id = collapsible.targetId;

        if (collapsible.isCollapsed) {
            this.collapsedFacets = _.union(this.collapsedFacets, [id]);
        } else {
            this.collapsedFacets = _.without(this.collapsedFacets, id);
        }
    }

    activeGridView() {
        const $gridViewButton = $('#grid-view');
        const $listViewButton = $('#list-view');
        const $productView = $('.productGrid');

        if ($gridViewButton.not('.current-view')) {
            $listViewButton.removeClass('current-view');
            $gridViewButton.addClass('current-view');
            $productView.removeClass('product-list');
            sessionStorage.setItem('productsView', 'grid-view');
        }
    }

    activeListView() {
        const $gridViewButton = $('#grid-view');
        const $listViewButton = $('#list-view');
        const $productView = $('.productGrid');

        if ($listViewButton.not('.current-view')) {
            $gridViewButton.removeClass('current-view');
            $listViewButton.addClass('current-view');
            $productView.addClass('product-list');
            sessionStorage.setItem('productsView', 'list-view');
        }
    }

    updateListView() {
        if ($('.page-content').hasClass('grid-with-sub-items') !== true) {
            if (sessionStorage.getItem('productsView') === 'grid-view') {
                this.activeGridView();
            } else if (sessionStorage.getItem('productsView') === 'list-view') {
                this.activeListView();
            }
        }
    }

    updateReadMore() {
        if ($('.show-read-more')[0]) {
            let maxLength = 200;
            const textToMinimise = $('.show-read-more');

            if (screen.width >= 801) {
                maxLength = 420;
            }

            const myStr = textToMinimise.text();
            if ($.trim(myStr).length > maxLength) {
                let newStr = myStr.substring(0, maxLength);
                newStr = newStr.substr(0, Math.min(newStr.length, newStr.lastIndexOf(' ')));
                const removedStr = myStr.substring(newStr.length, $.trim(myStr).length);
                textToMinimise.empty().html(newStr);
                textToMinimise.append('<span class="read-more-dots">...</span>');
                textToMinimise.append(' <a href="javascript:void(0);" class="read-more">Read more</a>');
                textToMinimise.append(`<span class="more-text">${removedStr}</span>`);
            }

            $('.read-more').on('click', (e) => {
                $(this).siblings('.more-text').contents().unwrap();
                $('.more-text').show();
                $('.show-read-more').addClass('read-more-open');
                $(e.target).remove();
                $('.read-more-dots').remove();
            });
        }
    }

    // If there's only one option under a filter, hide that filter entirely
    removeSingleItemFilters() {
        $('.navList').each(function hideSingleValueFilters() {
            if ($(this).children().length === 1) {
                $(this).parent().parent().remove();
            }
        });
    }

    additionFilterFunctions() {
        $('.toggle-filters').on('click', () => {
            const filterButtonText = $('.toggle-filter-txt');
            const filterButtonIcon = $('.toggle-filter-icon');

            $('.facetedSearch-navList').toggleClass('show-all-filters');

            if (filterButtonText.text() === 'More Filters') {
                filterButtonText.text('Less Filters');
            } else {
                filterButtonText.text('More Filters');
            }

            filterButtonIcon.toggleClass('flipped');
        });
    }

    hideMoreFiltersIfNone() {
        let filters = $('.accordion-block');
        if ($(window).width() >= 1261) {
            if (filters.length <= 4) {
                $('.toggle-filters').hide();
            } else {
                $('.toggle-filters').show();
            }
        } else if ($(window).width() >= 801) {
            if (filters.length <= 3) {
                $('.toggle-filters').hide();
            } else {
                $('.toggle-filters').show();
            }
        }
    }

    closeFilterOptions() {

        // Close filter on choice or click elsewhere
        $(document).click((e) => {
            if (
                ($(e.target).closest($('.accordion-block')).length === 0)
                && ($('.facetedSearch-toggle').has($(e.target)).length === 0)
                && !(($(e.target).hasClass('facetedSearch-toggle')))
            ) {
                this.collapseAllFacets();
            }
        });
    }
}

export default FacetedSearch;
