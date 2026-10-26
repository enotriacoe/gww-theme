// All JS for the Sticky header

// Hiding/showing of the menu on scroll for desktop/larger screens

export function toggleMenuOnScroll() {
    let didScroll;
    let lastScrollTop = 0;
    const delta = 10; // How many pixels need to be scrolled before we toggle
    const navbarHeight = $('.header-container').outerHeight();
    const addToBasketNoMenuOffset = '72px';
    const addToBasketWithMenuOffset = '121px';

    function hasScrolled() {
        if ($(window).width() >= 801) {
            const currentScrollTop = $(window).scrollTop();

            // Make sure they scroll more than delta
            if (Math.abs(lastScrollTop - currentScrollTop) <= delta) {
                return;
            }

            // If user has scrolled down far enough, past the normal navbar height, we slideup the navigation portion of the header and reduce the top value of the sticky add to basket to keep an even gap.
            if (currentScrollTop > lastScrollTop && currentScrollTop > navbarHeight) {
                if ($('.navPages-container').is(':visible')) {
                    $('.navPages-container').slideUp(100);
                }
                $('.add-to-basket-wrap').animate({ top: addToBasketNoMenuOffset }, 100);
            } else {
                // Show the nav as they've scrolled up, move the sticky add to basket to account for this
                $('.navPages-container').slideDown(100);
                $('.sticky').animate({ top: addToBasketWithMenuOffset }, 100);
            }

            // The sticky class is self explanatory, but the static class was added to ensure the 'top' value of the div when
            // not sticky is always 0, using JS to add/remove an inline style didn't work well enough
            if (currentScrollTop > (navbarHeight * 0.75)) {
                $('.sticky-placeholder').addClass('visible');
                $('.add-to-basket-wrap').addClass('sticky');
                $('.add-to-basket-wrap').removeClass('static');
            } else {
                $('.sticky-placeholder').removeClass('visible');
                $('.add-to-basket-wrap').removeClass('sticky');
                $('.add-to-basket-wrap').addClass('static');
            }

            lastScrollTop = currentScrollTop;
        }
    }

    $(window).scroll(() => {
        didScroll = true;
    });

    setInterval(() => {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);
}

export function closePreviewCartModal() {
    $('body').on('click', e => {
        if (($('#previewModal').is(':visible')) && ($(e.target).closest('#previewModal').length === 0)) {
            $('#previewModal').foundation('reveal', 'close');
        }
    });

    $('#previewModal').on('click', '.close-previewModal', () => {
        $('#previewModal').foundation('reveal', 'close');
    });
}
