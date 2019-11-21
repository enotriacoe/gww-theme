/* eslint-disable no-restricted-globals, no-shadow, prefer-arrow-callback, func-names */
import utils, { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import modalFactory, { showAlertModal } from './global/modal';

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
        if (sessionStorage.getItem('productsView') === null) {
            sessionStorage.setItem('productsView', 'list-view');
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
            if (sessionStorage.getItem('productsView') === 'grid-view') {
                activeGridView();
            } else if (sessionStorage.getItem('productsView') === 'list-view') {
                activeListView();
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

        // Custom Add To Cart implementation for PLP pages, adapted from Product View


        function filterEmptyFilesFromForm(formData) {
            try {
                for (const [key, val] of formData) {
                    if (val instanceof File && !val.name && !val.size) {
                        formData.delete(key);
                    }
                }
            } catch (e) {
                console.error(e); // eslint-disable-line no-console
            }
            return formData;
        }

        function getCartContent(cartItemId, onComplete) {
            const options = {
                template: 'cart/preview',
                params: {
                    suggest: cartItemId,
                },
                config: {
                    cart: {
                        suggestions: {
                            limit: 4,
                        },
                    },
                },
            };

            utils.api.cart.getContent(options, onComplete);
        }

        function updateCartContent(modal, cartItemId, onComplete) {
            getCartContent(cartItemId, (err, response) => {
                if (err) {
                    return;
                }

                modal.updateContent(response);

                // Update cart counter
                const $body = $('body');
                const $cartQuantity = $('[data-cart-quantity]', modal.$content);
                const $cartCounter = $('.navUser-action .cart-count');
                const quantity = $cartQuantity.data('cartQuantity') || 0;

                $cartCounter.addClass('cart-count--positive');
                $body.trigger('cart-quantity-update', quantity);

                if (onComplete) {
                    onComplete(response);
                }
            });
        }

        const $overlay = $('.loadingOverlay');

        function addProductToCartCat(event) {
            const previewModal = modalFactory('#previewModal')[0];
            const $addToCartBtn = $('#form-action-addToCart', $(event.target));
            const originalBtnVal = $addToCartBtn.val();
            const waitMessage = $addToCartBtn.data('waitMessage');

            // Do not do AJAX if browser doesn't support FormData
            if (window.FormData === undefined) {
                return;
            }

            // Prevent default
            event.preventDefault();

            $addToCartBtn
                .val(waitMessage)
                .prop('disabled', true);

            $overlay.show();

            // Add item to cart
            utils.api.cart.itemAdd(filterEmptyFilesFromForm(new FormData(event.currentTarget)), (err, response) => {
                const errorMessage = err || response.data.error;

                $addToCartBtn
                    .val(originalBtnVal)
                    .prop('disabled', false);

                $overlay.hide();

                // Guard statement
                if (errorMessage) {
                    // Strip the HTML from the error message
                    const tmp = document.createElement('DIV');
                    tmp.innerHTML = errorMessage;

                    return showAlertModal(tmp.textContent || tmp.innerText);
                }

                // Open preview modal and update content
                if (previewModal) {
                    previewModal.open();

                    updateCartContent(previewModal, response.data.cart_item.id);
                } else {
                    this.$overlay.show();
                    // if no modal, redirect to the cart page
                    this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
                }
            });
        }

        $('.page-content').on('submit', 'form[data-cart-item-add]', function (e) {
            e.preventDefault();
            addProductToCartCat(e);
        });

        $('body').on('click', '[data-quantity-change] button', function (event) {
            event.preventDefault();
            const $target = $(event.currentTarget);
            const $text = $(event.currentTarget).parent().find('.incrementTotal');
            const $input = $(event.currentTarget).parent().find('[name=qty\\[\\]]');
            const quantityMin = parseInt($input.data('quantityMin'), 10);
            const quantityMax = parseInt($input.data('quantityMax'), 10);

            let qty = parseInt($input.val(), 10);

            // If action is incrementing
            if ($target.data('action') === 'inc') {
                // If quantity max option is set
                if (quantityMax > 0) {
                    // Check quantity does not exceed max
                    if ((qty + 1) <= quantityMax) {
                        qty++;
                    }
                } else {
                    qty++;
                }
            } else if (qty > 1) {
                // If quantity min option is set
                if (quantityMin > 0) {
                    // Check quantity does not fall below min
                    if ((qty - 1) >= quantityMin) {
                        qty--;
                    }
                } else {
                    qty--;
                }
            }

            // update hidden input
            $input.val(qty);
            // update text
            $text.text(qty);
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
