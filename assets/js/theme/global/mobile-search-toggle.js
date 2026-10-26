export default function toggleMobileSearch() {
    const searchButtonCont = $('.navUser-item--search');
    searchButtonCont.on('click', '.btn-show-search', () => {
        $('.navPages-quickSearch').slideToggle(250);
    });
}
