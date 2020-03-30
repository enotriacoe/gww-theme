const googleMapWrapper = document.getElementById('google-map');
let googleMapIframe;
if (googleMapWrapper != null) {
    googleMapIframe = googleMapWrapper.getElementsByTagName('iframe')[0];
    googleMapIframe.setAttribute('title', 'Our Location');
}
