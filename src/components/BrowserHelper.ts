export default class BrowserHelper {

    // http://www.surfingsuccess.com/javascript/javascript-browser-detection.html#.WurdwdOFO34
    static readonly isChrome = navigator.userAgent.lastIndexOf('Chrome/') > 0;
    static readonly isSafari = navigator.userAgent.lastIndexOf('Safari/') > 0 && navigator.userAgent.lastIndexOf('Chrome/') < 0;
    static readonly isFirefox = navigator.userAgent.lastIndexOf('Firefox/') > 0;
    static readonly iPhone = navigator.userAgent.includes('iPhone');
    static readonly isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}