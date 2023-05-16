"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config_1 = __importDefault(require("./config"));
const figmaFile_1 = require("./figmaFile");
function generateMockBrands() {
    return __awaiter(this, void 0, void 0, function* () {
        config_1.default.brands.map(function (item) {
            return __awaiter(this, void 0, void 0, function* () {
                yield generateMockFile(item); //If FIGMA_FILE_ID is not set in enviroment, then process all brands.
            });
        });
    });
}
function generateMockFile(brand) {
    return __awaiter(this, void 0, void 0, function* () {
        let figmaFile = yield (0, figmaFile_1.getFigmaFile)(brand);
        yield (0, figmaFile_1.writeMockFile)(figmaFile, brand);
    });
}
generateMockBrands();
//# sourceMappingURL=generate-mock-files.js.map