import Url from 'url';

const urlUtils = {
    getUrl: () => `${window.location.pathname}${window.location.search}`,

    goToUrl: (url) => {
        window.history.pushState({}, document.title, url);
        $(window).trigger('statechange');
    },

    replaceParams: (url, params) => {
        const parsed = Url.parse(url, true);
        let param;

        // Let the formatter use the query object to build the new url
        parsed.search = null;

        for (param in params) {
            if (params.hasOwnProperty(param)) {
                parsed.query[param] = params[param];
            }
        }

        return Url.format(parsed);
    },

    buildQueryString: (queryData) => {
        let out = '';
        let key;
        for (key in queryData) {
            if (queryData.hasOwnProperty(key)) {
                if (Array.isArray(queryData[key])) {
                    let ndx;

                    for (ndx in queryData[key]) {
                        if (queryData[key].hasOwnProperty(ndx)) {
                            const cleanComponent = encodeURIComponent(queryData[key][ndx]).replaceAll('%20', '+');
                            out += `&${key}=${cleanComponent}`;
                        }
                    }
                } else {
                    const cleanComponent = encodeURIComponent(queryData[key]).replaceAll('%20', '+');
                    out += `&${key}=${cleanComponent}`;
                }
            }
        }

        return out.substring(1);
    },

    parseQueryParams: (queryData) => {
        const params = {};

        for (let i = 0; i < queryData.length; i++) {
            const temp = queryData[i].split('=');

            if (temp[0] in params) {
                if (Array.isArray(params[temp[0]])) {
                    params[temp[0]].push(temp[1]);
                } else {
                    params[temp[0]] = [params[temp[0]], temp[1]];
                }
            } else {
                params[temp[0]] = temp[1];
            }
        }

        return params;
    },
};

export default urlUtils;
