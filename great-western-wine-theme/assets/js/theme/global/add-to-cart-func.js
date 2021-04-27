import utils from '@bigcommerce/stencil-utils';
import modalFactory, { showAlertModal } from './modal';


// Custom Add To Cart implementation for PLP pages, adapted from Product View

export function filterEmptyFilesFromForm(formData) {
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

export function getCartContent(cartItemId, onComplete) {
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

export function updateCartContent(modal, cartItemId, onComplete) {
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

export function addProductToCartGlobal(event) {
    let $addToCartBtn;
    if ($('#form-action-addToCart', $(event.target)).length > 0) {
        $addToCartBtn = $('#form-action-addToCart', $(event.target));
    } else {
        $addToCartBtn = $('.form-action-addToCart', $(event.target));
    }
    const previewModal = modalFactory('#previewModal')[0];
    const originalBtnVal = $addToCartBtn.val();
    const waitMessage = $addToCartBtn.data('waitMessage');
    const $overlay = $('.loadingOverlay');

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
            $overlay.show();
            // if no modal, redirect to the cart page
            this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
        }
    });
}

export function addToCartClickEvent() {
    $('.body').on('submit', 'form[data-cart-item-add]', (e) => {
        e.preventDefault();
        addProductToCartGlobal(e);
    });
}

export function quantityChangeEvent() {
    $('body').on('click', '[data-quantity-change] button', (event) => {
        event.preventDefault();
        const $target = $(event.currentTarget);
        const $text = $(event.currentTarget).parent().find('.incrementTotal');
        const $input = $(event.currentTarget).parent().find('[name=qty\\[\\]]');
        const quantityMin = parseInt($input.data('quantityMin'), 10);
        const quantityMax = parseInt($input.data('quantityMax'), 10);

        let maxStockMessage = $target.closest('.max-stock-parent').find('.max-stock-message-wrap');

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


        checkMaxQuantity(maxStockMessage, qty, quantityMax);
    });


    $('.close-stock-message').on('click', (event) => {
        event.preventDefault();
        const message = $(event.currentTarget).parent().parent();
        closeStockMessage(message);
    })
    $('body').on('keyup', '[data-quantity-change] input', (event) => {
        event.preventDefault();
        const $target = $(event.currentTarget);
        const quantityMin = parseInt($target.data('quantityMin'), 10);
        const quantityMax = parseInt($target.data('quantityMax'), 10);
        let maxStockMessage = $target.closest('.max-stock-parent').find('.max-stock-message-wrap');
        let qty = parseInt($target.val(), 10);

        if ((qty >= quantityMax) && (quantityMax > 0)) {
            $target.val(quantityMax);
            checkMaxQuantity(maxStockMessage, quantityMax, quantityMax);
        }
    });

    $('.close-stock-message').on('click', (event) => {
        event.preventDefault();
        let message = $(event.currentTarget).parent().parent();
        closeStockMessage(message);
    })
}

export function checkMaxQuantity(maxStockMessage, qty, quantityMax) {
    if (qty === quantityMax && maxStockMessage.is(":hidden")) {
        if ((maxStockMessage.parent().hasClass('add-to-cart-cont')) && ($(window).width() >= 905)) {
            maxStockMessage.show().animate({right:'100%'}, 400);
        } else {
            maxStockMessage.show().animate({top:-35}, 400);
        }
    } else if (qty !== quantityMax && maxStockMessage.is(":visible")) {
        closeStockMessage(maxStockMessage);
        // Need ot make it so that this works resposnively so it only happens like this above medium
    }
}

export function closeStockMessage(maxStockMessage) {
    maxStockMessage.animate({top:0, right:0}, 400, function() {
        $(this).hide();
    });
}
