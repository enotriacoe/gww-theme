

// Custom Partnership Registration functionality

export function getPartnerInfo() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has('partner')) {
        const partner = urlParams.get('partner');
        const requestURL = `https://cdn.greatwine.co.uk/partners/${partner}.json`;
        $.getJSON(requestURL, (json) => {
            const headerHTML = json.partnership.header;
            const confirmText = json.partnership.confirmText;
            const membershipText = json.partnership.showMembershipNumber;

            $('.register-header').html(headerHTML);
            if (membershipText !== false) {
                $('.form-label:contains(Membership Number)').text(`${membershipText}`);
                $('#FormField_26').show();
            }
            $('#FormField_28 .checkbox-label').text(`${confirmText}`);
        });
    }
}
