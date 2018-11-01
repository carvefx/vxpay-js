import VXPayConfig                         from './VXPay/VXPayConfig'
import VXPayLogger                         from './VXPay/VXPayLogger'
import VXPayHelperFrame                    from './VXPay/Dom/Frame/VXPayHelperFrame'
import VXPayPaymentFrame                   from './VXPay/Dom/Frame/VXPayPaymentFrame'
import VXPayPaymentTab                     from './VXPay/Dom/Frame/VXPayPaymentTab'
import VXPayInitPaymentMiddleware          from './VXPay/Middleware/Frames/VXPayInitPaymentMiddleware'
import VXPayInitHelperMiddleware           from './VXPay/Middleware/Frames/VXPayInitHelperMiddleware'
import VXPayListenOrCallLoggedInMiddleware from './VXPay/Middleware/Actions/VXPayListenOrCallLoggedInMiddleware'
import VXPayOnAVSStatusListenMiddleware    from './VXPay/Middleware/Actions/VXPayOnAVSStatusListenMiddleware'
import VXPayAVSStatusTriggerMiddleware     from './VXPay/Middleware/Actions/VXPayAVSStatusTriggerMiddleware'
import VXPayListenForBalanceMiddleware     from './VXPay/Middleware/Actions/VXPayListenForBalanceMiddleware'
import VXPayBalanceTriggerMiddleware       from './VXPay/Middleware/Actions/VXPayBalanceTriggerMiddleware'
import VXPayListenForActiveAbosMiddleware  from './VXPay/Middleware/Actions/VXPayListenForActiveAbosMiddleware'
import VXPayActiveAbosTriggerMiddleware    from './VXPay/Middleware/Actions/VXPayActiveAbosTriggerMiddleware'
import VXPayListenForLogoutMiddleware      from './VXPay/Middleware/Actions/VXPayListenForLogoutMiddleware'
import VXPayLogoutTriggerMiddleware        from './VXPay/Middleware/Actions/VXPayLogoutTriggerMiddleware'
import VXPayState                          from './VXPay/Model/VXPayState'
import VXPayWhenTokenTransferred           from './VXPay/Middleware/Condition/VXPayWhenTokenTransferred'
import VXPayOpenLoginCommand               from './VXPay/Middleware/Command/VXPayOpenLoginCommand'
import VXPayOpenSignUpCommand              from './VXPay/Middleware/Command/VXPayOpenSignUpCommand'
import VXPayOpenVoiceCallCommand           from './VXPay/Middleware/Command/VXPayOpenVoiceCallCommand'
import VXPayOpenPaymentCommand             from './VXPay/Middleware/Command/VXPayOpenPaymentCommand'
import VXPayOpenSettingsCommand            from './VXPay/Middleware/Command/VXPayOpenSettingsCommand'
import VXPayOpenAboCommand                 from './VXPay/Middleware/Command/VXPayOpenAboCommand'
import VXPayResetPasswordCommand           from './VXPay/Middleware/Command/VXPayResetPasswordCommand'
import VXPayLostPasswordCommand            from './VXPay/Middleware/Command/VXPayLostPasswordCommand'
import VXPayOpenLimitedPaymentCommand      from './VXPay/Middleware/Command/VXPayOpenLimitedPaymentCommand'
import VXPayOpenVipAboTrialCommand         from './VXPay/Middleware/Command/VXPayOpenVipAboTrialCommand'
import VXPayOpenPremiumAboCommand          from './VXPay/Middleware/Command/VXPayOpenPremiumAboCommand'
import VXPayOpenAVSCommand                 from './VXPay/Middleware/Command/VXPayOpenAVSCommand'
import VXPayOpenPromoCodeCommand           from './VXPay/Middleware/Command/VXPayOpenPromoCodeCommand'
import VXPayOpenOneClickCommand            from './VXPay/Middleware/Command/VXPayOpenOneClickCommand'
import VXPayOpenAutoRechargeCommand        from './VXPay/Middleware/Command/VXPayOpenAutoRechargeCommand'
import VXPayOpenOpenBalanceCommand         from './VXPay/Middleware/Command/VXPayOpenOpenBalanceCommand'
import VXPayTriggerShowForTab              from './VXPay/Middleware/Frames/VXPayTriggerShowForTab'

export default class VXPay {
	/**
	 * @param {VXPayConfig} config
	 */
	constructor(config) {
		this.config      = config;
		this.logger      = new VXPayLogger(this.config.logging, this.config.window);
		this._state      = new VXPayState();
		this.logger.log('VXPay::constructor - ' + JSON.stringify(this.config.getOptions()));
	}

	/**
	 * @return {VXPayState}
	 */
	get state() {
		return this._state;
	}

	/**
	 * @return {Promise<VXPay>}
	 * @private
	 */
	_initHelperFrame() {
		return new Promise(resolve => VXPayInitHelperMiddleware(this, resolve))
	}

	/**
	 * @param {Boolean} triggerLoad
	 * @return {Promise<VXPay>}
	 * @private
	 */
	_initPaymentFrame(triggerLoad = true) {
		this.logger.log('VXPay::_initPaymentFrame', triggerLoad);
		return new Promise(resolve => VXPayInitPaymentMiddleware(this, resolve, triggerLoad))
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openLogin(flowOptions = {}) {
		this.logger.log('VXPay::openLogin');

		return new Promise((resolve, reject) => {
			return this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenLoginCommand(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		});
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openSignUp(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			return this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenSignUpCommand(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		});
	}

	/**
	 * @return {Promise<VXPay>}
	 */
	openVoiceCall() {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(VXPayOpenVoiceCallCommand.run)
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openSignUpOrLogin(flowOptions = {}) {
		return this._initHelperFrame()
			.then(vxpay => vxpay.helperFrame.getLoginCookie())
			.then(msg => msg.hasCookie ? this.openLogin(flowOptions) : this.openSignUp(flowOptions))
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openPayment(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenPaymentCommand.run(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openAbo(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenAboCommand(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @return {Promise<VXPay>}
	 */
	openSettings() {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(VXPayOpenSettingsCommand.run)
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	resetPassword(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayResetPasswordCommand.run(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	lostPassword(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayLostPasswordCommand.run(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @return {Promise<VXPay>}
	 */
	limitPayment() {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(VXPayOpenLimitedPaymentCommand.run)
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	vipAboTrial(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenVipAboTrialCommand(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	premiumAbo(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenPremiumAboCommand(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openAVS(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenAVSCommand(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openPromoCode(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenPromoCodeCommand(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openScratchCard(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenPromoCodeCommand(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openOneClick(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenOneClickCommand.run(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openAutoReCharge(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenAutoRechargeCommand.run(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @param {Object} flowOptions
	 * @return {Promise<VXPay>}
	 */
	openBalance(flowOptions = {}) {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(VXPayWhenTokenTransferred)
				.then(vxpay => VXPayOpenOpenBalanceCommand(vxpay, flowOptions))
				.then(VXPayTriggerShowForTab)
				.then(resolve)
				.catch(reject)
		})
	}

	/**
	 * @return {Promise<VXPayIsLoggedInResponseMessage>}
	 */
	isLoggedIn() {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(vxpay => (new VXPayListenOrCallLoggedInMiddleware(vxpay, resolve, reject)).run())
				.catch(reject)
		});
	}

	/**
	 * @return {Promise<VXPayAVSStatusMessage>}
	 */
	getAVSStatus() {
		return new Promise((resolve, reject) => {
			return this._initPaymentFrame()
				.then(vxpay => VXPayOnAVSStatusListenMiddleware(vxpay, resolve, reject))
				.then(VXPayAVSStatusTriggerMiddleware)
				.catch(reject)
		})
	}

	/**
	 * @return {Promise<VXPayBalanceMessage>}
	 */
	getBalance() {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(vxpay => VXPayListenForBalanceMiddleware(vxpay, resolve, reject))
				.then(VXPayBalanceTriggerMiddleware)
				.catch(reject)
		});
	}

	/**
	 * @return {Promise<VXPayActiveAbosMessage>}
	 */
	getActiveAbos() {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(vxpay => VXPayListenForActiveAbosMiddleware(vxpay, resolve, reject))
				.then(VXPayActiveAbosTriggerMiddleware)
				.catch(reject)
		})
	}

	/**
	 * @return {Promise<VXPayLoggedOutMessage>}
	 */
	logout() {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(vxpay => VXPayListenForLogoutMiddleware(vxpay, resolve, reject))
				.then(VXPayLogoutTriggerMiddleware)
				.catch(reject)
		})
	}

	/**
	 * @return {VXPayConfig}
	 */
	get config() {
		return this._config;
	}

	/**
	 * @param {VXPayConfig} value
	 */
	set config(value) {
		if (!(value instanceof VXPayConfig)) {
			throw new TypeError('Please provide an instance of VXPayConfig!');
		}

		if (typeof this._logger !== 'undefined') {
			this._logger.log('VXPay::config -> ', value);
		}

		this._config = value;
	}

	/**
	 * @return {VXPayLogger}
	 */
	get logger() {
		return this._logger;
	}

	/**
	 * @param {VXPayLogger} value
	 */
	set logger(value) {
		if (!(value instanceof VXPayLogger)) {
			throw new TypeError('Please provide an instance of VXPayLogger!');
		}

		this._logger = value;
	}

	/**
	 * @return {Number}
	 */
	get apiVersion() {
		return this.config.apiVersion;
	}

	/**
	 * @param {Number} value
	 */
	set apiVersion(value) {
		this.config.apiVersion = value;
	}

	/**
	 * @return {Promise<VXPayPaymentHooksConfig>}
	 */
	get hooks() {
		this.logger.log('VXPay::hooks');

		return new Promise((resolve, reject) => {
			if (this.state.isContentLoaded) {
				this.logger.log('VXPay::hooks -> already loaded, resolve ...');
				return resolve(this._paymentFrame.hooks);
			}

			// init and don't trigger load
			this._initPaymentFrame(false)
				.then(vxpay => resolve(vxpay._paymentFrame.hooks))
				.catch(reject);
		});
	}

	/**
	 * @return {Promise<VXPayPaymentFrame|VXPayPaymentTab>}
	 */
	get paymentFrame() {
		return new Promise((resolve, reject) => {
			this._initPaymentFrame()
				.then(vxpay => resolve(vxpay._paymentFrame))
				.catch(reject)
		});
	}

	/**
	 * @param {VXPayPaymentFrame|VXPayPaymentTab} value
	 */
	set paymentFrame(value) {
		if (!(value instanceof VXPayPaymentFrame) && !(value instanceof VXPayPaymentTab)) {
			throw new TypeError('Payment frame should be an instance of VXPayPaymentFrame or VXPayPaymentTab');
		}

		this._paymentFrame = value;
	}

	/**
	 * @return {VXPayHelperFrame}
	 */
	get helperFrame() {
		return this._helperFrame;
	}

	/**
	 * @param {VXPayHelperFrame} value
	 */
	set helperFrame(value) {
		if (!(value instanceof VXPayHelperFrame)) {
			throw new TypeError('Helper frame should be an instance of VXPayHelperFrame');
		}

		this._helperFrame = value;
	}

	/**
	 * @return {Window|undefined}
	 */
	get window() {
		return this.config.window;
	}
}
