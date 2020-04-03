

// Custom Partnership Registration functionality

export function getPartnerInfo() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has('partner')) {
        const partner = urlParams.get('partner');
        const requestURL = `https://cdn.greatwesternwine.co.uk/partners/${partner}.json`;
        $.getJSON(requestURL, (json) => {
            const headerHTML = json.partnership.header;
            const confirmText = json.partnership.confirmText;
            const membershipText = json.partnership.showMembershipNumber;

            $('.register-header').html(headerHTML);
            $('.form-label:contains(Membership Number)').text(`${membershipText}`);
            $('#FormField_28 .checkbox-label').text(`${confirmText}`);
            $('#FormField_26').show();
        });
    }
}

export function quantityChangeEvent() {
    $('body').on('click', '[data-quantity-change] button', (event) => {
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
