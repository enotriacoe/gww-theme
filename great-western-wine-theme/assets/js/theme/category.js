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

        const $gridViewButton = $('#grid-view');
        const $listViewButton = $('#list-view');
        const $productView = $('.productGrid');

        $gridViewButton.on('click', () => {
            if ($gridViewButton.not('.current-view')) {
                $listViewButton.removeClass('current-view')
                $gridViewButton.addClass('current-view')
                $productView.removeClass('product-list');
            }
        });

        $listViewButton.on('click', () => {            
            if ($listViewButton.not('current-view')) {
                console.log($gridViewButton);
                $gridViewButton.removeClass('current-view')
                $listViewButton.addClass('current-view')
                $productView.addClass('product-list');
            }
        });
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
