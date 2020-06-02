/* eslint-disable no-restricted-globals, no-shadow, prefer-arrow-callback, func-names */
import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';

export default class Category extends CatalogPage {
    onReady() {
        compareProducts(this.context.urls);

        const categoryFunction = this;

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        // Grid View with Cookies
        if (sessionStorage.getItem('productsView') === null) {
            sessionStorage.setItem('productsView', 'grid-view');
        }

        function activeGridView() {
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

        function activeListView() {
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

        function updateListView() {
            if ($('.page-content').hasClass('grid-with-sub-items') !== true) {
                if (sessionStorage.getItem('productsView') === 'grid-view') {
                    activeGridView();
                } else if (sessionStorage.getItem('productsView') === 'list-view') {
                    activeListView();
                }
            }
        }

        updateListView();

        $('.page-content').on('click', '#grid-view', function () {
            activeGridView();
        });

        $('.page-content').on('click', '#list-view', function () {
            activeListView();
        });

        $('.close-sub-items').on('click', function () {
            const subItemList = $(this).parent();
            subItemList.toggleClass('is-open');
        });

        $('.group-item-options').on('click', function () {
            const groupItem = $(this).parent();
            groupItem.toggleClass('is-open');
        });

        if ($('.show-read-more')[0]) {
            let maxLength = 200;
            if (screen.width >= 801) {
                maxLength = 420;
            }

            $('.show-read-more').each(function () {
                const myStr = $(this).text();
                if ($.trim(myStr).length > maxLength) {
                    let newStr = myStr.substring(0, maxLength);
                    newStr = newStr.substr(0, Math.min(newStr.length, newStr.lastIndexOf(' ')));
                    const removedStr = myStr.substring(newStr.length, $.trim(myStr).length);
                    $(this).empty().html(newStr);
                    $(this).append('<span class="read-more-dots">...</span>');
                    $(this).append(' <a href="javascript:void(0);" class="read-more">Read more</a>');
                    $(this).append(`<span class="more-text">${removedStr}</span>`);
                }
            });
            $('.read-more').on('click', function () {
                $(this).siblings('.more-text').contents().unwrap();
                $('.more-text').show();
                $('.show-read-more').css('max-height', 'none');
                $('.category-text').css('width', '100%');
                $(this).remove();
                $('.read-more-dots').remove();
            });
        }

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
        if ((window.location.pathname.replace(/\//g, '')) === 'producers') {
            this.getAllProducers(categoryFunction);
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

    initFacetedSearch() {
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

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        });
    }

    displayProducers(dataReturned) {
        // Get all of the countries from the API/Proxy
        if (dataReturned) {
            const producerList = dataReturned.data[0].children;
            let currentProducerName;
            let currentProducerUrl;
            const producerDiv = document.querySelector('.group-list');
            producerDiv.innerHTML = ('');

            // Loop through each country and display
            for (let i = 0, length = producerList.length; i < length; i++) {
                currentProducerName = producerList[i].name;
                currentProducerUrl = producerList[i].url;
                producerDiv.innerHTML = (`${producerDiv.innerHTML}<li><a href='${currentProducerUrl}'>${currentProducerName}</a></li>`);
            }
        }
    }

    sortListAlphabetically() {
        // Custom JS to sort category list PGP
        const list = $('ul.group-list');
        const items = $('li', list);

        // sort the list
        const sortedItems = items.get().sort((a, b) => {
            const aText = $.trim($(a).text().toUpperCase());
            const bText = $.trim($(b).text().toUpperCase());

            return aText.localeCompare(bText);
        });

        list.append(sortedItems);

        // create the titles
        let lastLetter = '';
        list.find('li').each(function addLetterHeaders() {
            const $this = $(this);
            const text = $.trim($this.text());
            const firstLetter = text[0];

            if (firstLetter !== lastLetter) {
                $this.before(`<li class="splitter">${firstLetter}`);
                lastLetter = firstLetter;
            }
        });
    }

    getAllProducers(categoryFunction) {
        fetch('https://bcapi.greatwesternwine.co.uk/catalog/flattened-categories/producers')
            .then(function (response) {
                return response.json();
            })
            .then(function (returnedJson) {
                categoryFunction.displayProducers(returnedJson);
                categoryFunction.sortListAlphabetically();
            });
    }
}
