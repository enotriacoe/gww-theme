// All JS for the Sticky header

// Hiding/showing of the menu on scroll for desktop/larger screens

export function toggleMenuOnScroll() {
    let didScroll;
    let lastScrollTop = 0;
    const delta = 10; // How many pixels need to be scrolled before we toggle
    const navbarHeight = $('.header-container').outerHeight();

    function hasScrolled() {
        if ($(window).width() >= 801) {
            const currentScrollTop = $(window).scrollTop();

            // Make sure they scroll more than delta
            if (Math.abs(lastScrollTop - currentScrollTop) <= delta) {
                return;
            }

            // If they scrolled down and are past the navbar, add class .nav-up.
            // This is necessary so you never see what is "behind" the navbar.
            if (currentScrollTop > lastScrollTop && currentScrollTop > navbarHeight) {
                // Scroll Down
                $('.navPages-container').slideUp(100);
            } else {
                // Scroll Up
                // eslint-disable-next-line no-lonely-if
                if (currentScrollTop + $(window).height() < $(document).height()) {
                    $('.navPages-container').slideDown(100);
                }
            }

/*             if (currentScrollTop > (navbarHeight * 0.75)) {
                $('.sticky-placeholder').addClass('visible');
                $('.add-to-basket-wrap').addClass('sticky');
            } else {
                $('.sticky-placeholder').removeClass('visible');
                $('.add-to-basket-wrap').removeClass('sticky');
            } */

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
