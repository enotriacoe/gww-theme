import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();

        // Grid View with Cookies
        if (sessionStorage.getItem('productsView') === null) {
            sessionStorage.setItem('productsView', 'grid-view');
        }

        this.updateListView();

        $('.change-list-view').on('click', '#grid-view', () => {
            this.activeGridView();
        });

        $('.change-list-view').on('click', '#list-view', () => {
            this.activeListView();
        });

        this.closeAllWishlists();
        this.removeDuplicateDescZones();
        this.toggleMoreDesc();
        this.toggleSingleWishlistOnly();
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/topbar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
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

    closeAllWishlists() {
        if ($('[data-dropdown^="wishlist-dropdown-"]').hasClass('is-open')) {
            $('[data-dropdown^="wishlist-dropdown-"]').each(function closeWishlist() {
                const target = $(this);
                const targetsParent = $(this).parent();

                target.removeClass('is-open').attr('aria-expanded', 'false');
                targetsParent.find('ul').removeClass('is-open f-open-dropdown').attr('aria-hidden', 'true');
            });
        }
    }

    removeDuplicateDescZones() {
        if ($('.desc-zone-bottom').length > 1) {
            $('.desc-zone-bottom')[0].remove();
        }
        if ($('.desc-zone-top').length > 1) {
            $('.desc-zone-top')[1].remove();
        }
    }

    toggleMoreDesc() {
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

    toggleSingleWishlistOnly() {
        // Open and close only the wishlist that is clicked
        $('.page-content').on('click', '[data-dropdown^="wishlist-dropdown-"]', (e) => {
            e.stopImmediatePropagation();

            const target = $(e.currentTarget).parent();

            if (target.find('a').hasClass('is-open')) {
                target.find('a').removeClass('is-open').attr('aria-expanded', 'false');
                target.find('ul').removeClass('is-open f-open-dropdown').attr('aria-hidden', 'true');
            } else {
                this.closeAllWishlists();
                target.find('a').addClass('is-open').attr('aria-expanded', 'true');
                target.find('ul').addClass('is-open f-open-dropdown').attr('aria-hidden', 'false');
            }
        });
    }
}
