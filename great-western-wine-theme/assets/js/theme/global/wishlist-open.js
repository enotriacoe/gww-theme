export function closeAllWishlists() {
    if ($('[data-dropdown^="wishlist-dropdown"]').hasClass('is-open')) {
        $('[data-dropdown^="wishlist-dropdown"]').each(function closeWishlist() {
            const target = $(this);
            const targetsParent = $(this).parent();

            target.removeClass('is-open').attr('aria-expanded', 'false');
            targetsParent.find('ul').removeClass('is-open f-open-dropdown').attr('aria-hidden', 'true');
        });
    }
}

export function closeWishlistOnClick() {
    $('.body').on('click', '[data-dropdown^="wishlist-dropdown"]', (e) => {
        e.stopImmediatePropagation();

        const target = $(e.currentTarget).parent();

        if (target.find('a').hasClass('is-open')) {
            target.find('a').removeClass('is-open').attr('aria-expanded', 'false');
            target.find('ul').removeClass('is-open f-open-dropdown').attr('aria-hidden', 'true');
        } else {
            closeAllWishlists();
            target.find('a').addClass('is-open').attr('aria-expanded', 'true');
            target.find('ul').addClass('is-open f-open-dropdown').attr('aria-hidden', 'false');
        }
    });
}
