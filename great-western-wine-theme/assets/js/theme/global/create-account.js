// Custom 'Create Account' functionality

// Moves the 'terms and conditions' checkbox from the middle of the page to prepend the 'create account' button then reveals it
export default function moveTermsCheckboxToBottom() {
    $('#FormField_28').detach().appendTo('.confirm-cont');
    $('#FormField_28').show();
}
