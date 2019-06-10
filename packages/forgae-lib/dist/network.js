"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils = __importStar(require("forgae-utils"));
class Network {
    constructor(_network) {
        let params = this.getNetwork(_network);
        this.url = params.url;
        this.networkId = params.networkId;
    }
    getNetwork(_network) {
        let params = utils.getNetwork(_network);
        return params;
    }
}
exports.Network = Network;
//# sourceMappingURL=network.js.map