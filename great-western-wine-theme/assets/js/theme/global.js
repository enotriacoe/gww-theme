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
import maintenanceMode from './global/maintenanceMode';
import carousel from './common/carousel';
import loadingProgressBar from './global/loading-progress-bar';
import svgInjector from './global/svg-injector';
import objectFitImages from './global/object-fit-polyfill';
import { closeWishlistOnClick } from './global/wishlist-open';
import { addToCartClickEvent, quantityChangeEvent } from './global/add-to-cart-func';
import { getPartnerInfo } from './global/partner-reg';
import moveTermsCheckboxToBottom from './global/create-account';
import toggleMobileSearch from './global/mobile-search-toggle';

export default class Global extends PageManager {
    onReady() {
        cartPreview(this.context.secureBaseUrl, this.context.cartId);
        quickSearch();
        currencySelector();
        foundation($(document));
        quickView(this.context);
        carousel();
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        maintenanceMode(this.context.maintenanceMode);
        loadingProgressBar();
        svgInjector();
        objectFitImages();
        closeWishlistOnClick();
        addToCartClickEvent();
        quantityChangeEvent();
        getPartnerInfo();
        moveTermsCheckboxToBottom();
        toggleMobileSearch();
    }
}
