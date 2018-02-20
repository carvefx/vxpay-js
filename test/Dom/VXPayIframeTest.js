import {assert}    from 'chai'
import {JSDOM}     from 'jsdom'
import {URL}       from 'url'
import VXPayIframe from './../../src/VXPay/Dom/VXPayIframe'

const testDocument = "<!DOCTYPE html><html><body id='body'>test</body></html>";

describe('VXPayDomHelper', () => {
	describe('#constructor()', () => {
		it('Should throw an error on an invalid Document', () => {
			assert.throws(() => new VXPayIframe({}), TypeError, 'An iFrame can only be build on a valid Document object!')
		});
		it('Should create an iframe element on valid Document', () => {
			const dom    = new JSDOM(testDocument);
			const iframe = new VXPayIframe(dom.window.document, 'http://example.com', 'test-frame');

			// can't compare instance of objects as node.js doesn't have HTMLIframeElement
			assert.equal(iframe.frame.tagName.toLowerCase(), 'iframe');
		});
		it('Should apply styles if passed', () => {
			const dom    = new JSDOM(testDocument, {pretendToBeVisual: true});
			const styles = {
				width:   '675px',
				height:  '740px',
				top:     '5%',
				left:    '50%',
				display: 'none',
			};
			const iframe = new VXPayIframe(dom.window.document, 'http://example.com', 'test-frame', styles);

			// loop applied styles and check values
			for (let name in styles) {
				assert.equal(
					iframe.frame.style.getPropertyValue(name),
					styles[name],
					'Style property `' + name + "` doesn't match!"
				);
			}
		});
	});
	describe('#maximize()', () => {
		it('Should apply appropriate styles', () => {
			const dom    = new JSDOM(testDocument, {pretendToBeVisual: true});
			const iframe = new VXPayIframe(dom.window.document, 'http://example.com', 'test-frame');

			// check chainable
			assert.instanceOf(iframe.maximize(), VXPayIframe);

			// check styles
			assert.equal(iframe.frame.style.width, VXPayIframe.MAX_WIDTH);
			// somehow JSDOM doesn't understand vh, only px, so skip for now
			// assert.equal(iframe.frame.style.height, VXPayIframe.MAX_HEIGHT);
			assert.equal(iframe.frame.style.top, VXPayIframe.MAX_TOP + 'px', "Style `top` doesn't match!");
			assert.equal(iframe.frame.style.left, VXPayIframe.MAX_LEFT + 'px', "Style `left` doesn't match!");
			assert.equal(iframe.frame.style.marginLeft, VXPayIframe.MAX_LEFT_MARGIN + 'px', "Style `marginLeft` doesn't match!");
		});
	});
});