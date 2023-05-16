import 'focus-within-polyfill';

import './global/jquery-migrate';
import './global/accessibility';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import carousel from './common/carousel';
import svgInjector from './global/svg-injector';
import { closeWishlistOnClick } from './global/wishlist-open';
import { addToCartClickEvent, quantityChangeEvent, maxStockMessage } from './global/add-to-cart-func';
import { getPartnerInfo } from './global/partner-reg';
import moveTermsCheckboxToBottom from './global/create-account';
import toggleMobileSearch from './global/mobile-search-toggle';
import { toggleMenuOnScroll, closePreviewCartModal } from './global/sticky-header';

export default class Global extends PageManager {
    onReady() {
        const { cartId, secureBaseUrl } = this.context;
        cartPreview(secureBaseUrl, cartId);
        quickSearch();
        currencySelector(cartId);
        foundation($(document));
        quickView(this.context);
        carousel(this.context);
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        svgInjector();
        // Custom below
        closeWishlistOnClick();
        addToCartClickEvent();
        quantityChangeEvent();
        getPartnerInfo();
        moveTermsCheckboxToBottom();
        toggleMobileSearch();
        toggleMenuOnScroll();
        closePreviewCartModal();
    }
}
