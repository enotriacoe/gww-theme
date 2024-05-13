// Custom 'Create Account' functionality

export default function moveTermsCheckboxToBottom() {
    // Moves the 'marketing opt in' checkbox from the middle of the page to prepend the 'create account' button then reveals it
    if ($('.account--new')[0]) {
        $('#FormField_30').detach().appendTo('.confirm-cont');
        $('#FormField_30').show();
        // Moves the 'events opt in' checkbox from the middle of the page to prepend the 'create account' button then reveals it
        $('#FormField_33').detach().appendTo('.confirm-cont');
        $('#FormField_33').show();
        // Moves the 'terms and conditions' checkbox from the middle of the page to prepend the 'create account' button then reveals it
        $('#FormField_28').detach().appendTo('.confirm-cont');
        $('#FormField_28').show();
    }
}
