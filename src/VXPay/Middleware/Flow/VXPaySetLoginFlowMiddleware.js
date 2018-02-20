import VXPayFlow              from './../../Config/VXPayFlow'
import VXPaySetFlowMiddleware from './VXPaySetFlowMiddleware'

/**
 * @param {VXPay} vxpay
 * @return {VXPay}
 */
const VXPaySetLoginFlowMiddleware = (vxpay) => VXPaySetFlowMiddleware(vxpay, VXPayFlow.LOGIN);

export default VXPaySetLoginFlowMiddleware;