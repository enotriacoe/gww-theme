var googleMapWrapper = document.getElementById('google-map');
if (googleMapWrapper != null) {
    var googleMapIframe = googleMapWrapper.getElementsByTagName("iframe")[0];
    googleMapIframe.setAttribute("title", "Our Location");
}