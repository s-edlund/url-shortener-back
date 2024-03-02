"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLValidator = void 0;
class URLValidator {
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch (err) {
            return false;
        }
    }
}
exports.URLValidator = URLValidator;
//# sourceMappingURL=url-validator.js.map