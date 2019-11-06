import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';

export default class Category extends CatalogPage {
    onReady() {
        compareProducts(this.context.urls);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

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

        // Grid View with Cookies
        const $gridViewButton = $('#grid-view');
        const $listViewButton = $('#list-view');

        if (sessionStorage.getItem('productsView') === null) {
            sessionStorage.setItem('list-view');
        }

        this.updateListView();

        $gridViewButton.on('click', () => {
            this.activeGridView();
        });

        $listViewButton.on('click', () => {
            this.activeListView();
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
        if (sessionStorage.getItem('productsView') === 'grid-view') {
            this.activeGridView();
        } else if (sessionStorage.getItem('productsView') === 'list-view') {
            this.activeListView();
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
}
