"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.writeMockFile = exports.writeFile = exports.getFileNodes = exports.getFigmaFile = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const fs_1 = require("fs");
dotenv.config();
const mockFilePrefix = 'figma-file';
function getLocalFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fs_1.promises.readFile(filename, 'utf8');
        }
        catch (e) {
            console.log(`Error reading file: ${e}`);
        }
        return undefined;
    });
}
function getFigmaFile(brand) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.FIGMA_FILE_MOCK_ENABLED) {
            console.log(`Getting figma file for brand: ${brand.name} from local mock file.`);
            let fileName = `${'./public/'}${mockFilePrefix}-${brand.name}.json`;
            return getLocalFile(fileName);
        }
        console.log(`Getting figma file for brand: ${brand.name} from Figma API`);
        const response = yield (0, node_fetch_1.default)(`https://api.figma.com/v1/files/${brand.figmaFileId}`, {
            method: 'get',
            headers: { 'Content-Type': 'application/json', 'X-Figma-Token': `${process.env.FIGMA_PERSONAL_TOKEN}` }
        });
        return yield response.text();
    });
}
exports.getFigmaFile = getFigmaFile;
function getFileNodes(brand, nodeIds) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.FIGMA_FILE_MOCK_ENABLED) {
            console.log(`Getting figma style file for brand: ${brand.name} from local mock file.`);
            let dir = './public/';
            let fileNameNodeStyles = `${dir}${mockFilePrefix}-${brand.name}-styles.json`;
            return yield getLocalFile(fileNameNodeStyles);
        }
        const uri = `https://api.figma.com/v1/files/${brand.figmaFileId}/nodes?ids=${nodeIds}`;
        console.log(`Fetching nodes: ${nodeIds} from URI: ${uri}`);
        const response = yield (0, node_fetch_1.default)(uri, {
            method: 'get',
            headers: { 'Content-Type': 'application/json', 'X-Figma-Token': `${process.env.FIGMA_PERSONAL_TOKEN}` }
        });
        return yield response.text();
    });
}
exports.getFileNodes = getFileNodes;
function writeFile(content, brand, cssIdentifier) {
    return __awaiter(this, void 0, void 0, function* () {
        let dir = './generatedFiles/';
        let fileName = `${dir}${cssIdentifier}-${brand}.json`;
        if (fs.existsSync(`${dir}`)) {
            try {
                yield fs_1.promises.writeFile(fileName, content, 'utf8');
                console.log(`File: ${fileName} written successfully.`);
            }
            catch (e) {
                console.log(`Error writing file: ${e}`);
            }
        }
        else {
            try {
                fs_1.promises.mkdir(dir).then(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        console.log(`Directory: ${dir} created successfully`);
                        yield fs_1.promises.writeFile(`${dir}${cssIdentifier}-${brand}.json`, content, 'utf8');
                        console.log(`File: ${fileName} written successfully.`);
                    });
                }).catch(function () {
                    console.log('failed to create directory');
                });
            }
            catch (e) {
                console.log(`Error writing file: ${e}`);
            }
        }
    });
}
exports.writeFile = writeFile;
function writeMockFile(content, brand) {
    return __awaiter(this, void 0, void 0, function* () {
        let dir = './public/';
        let fileName = `${dir}${mockFilePrefix}-${brand.name}.json`;
        if (!fs.existsSync(`${dir}`)) {
            fs_1.promises.mkdir(dir).then(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(`Directory: ${dir} created successfully`);
                    yield fs_1.promises.writeFile(fileName, content, 'utf8');
                    console.log(`File: ${fileName} written successfully.`);
                });
            }).catch(function () {
                throw new Error('failed to create directory');
            });
        }
        try {
            yield fs_1.promises.writeFile(fileName, content, 'utf8');
            console.log(`File: ${fileName} written successfully.`);
        }
        catch (e) {
            console.log(`Error writing file: ${e}`);
        }
        let figmaJson = JSON.parse(content);
        if (!figmaJson.name) {
            throw new Error('Missing name of Figma file. Probably invalid Figma file.');
        }
        console.log('Name:', figmaJson.name);
        console.log('Last modified:', figmaJson.lastModified);
        console.log('Version:', figmaJson.version);
        const jsonPrettyString = JSON.stringify(figmaJson, null, 2);
        try {
            const prettyFileName = `${dir}${mockFilePrefix}-${brand.name}-pretty.json`;
            yield fs_1.promises.writeFile(prettyFileName, jsonPrettyString, 'utf8');
            console.log(`File: ${prettyFileName} written successfully.`);
        }
        catch (e) {
            console.log(`Error writing file: ${e}`);
        }
        yield writeMockNodeFile(figmaJson, brand);
    });
}
exports.writeMockFile = writeMockFile;
function writeMockNodeFile(figmaJson, brand) {
    return __awaiter(this, void 0, void 0, function* () {
        let dir = './public/';
        let fileNameNodeStyles = `${dir}${mockFilePrefix}-${brand.name}-styles.json`;
        let counter = 0;
        let styleKeysParams = Object.keys(figmaJson.styles).map(function (k) {
            counter++;
            return k;
        }).join(',');
        console.log(`Style keys: ${styleKeysParams}`);
        console.log(`Style keys length: ${counter}`);
        let nodeStylesFileRaw = yield getFileNodes(brand, styleKeysParams);
        try {
            yield fs_1.promises.writeFile(fileNameNodeStyles, nodeStylesFileRaw, 'utf8');
            console.log(`File: ${fileNameNodeStyles} written successfully.`);
        }
        catch (e) {
            console.log(`Error writing file: ${e}`);
        }
        const jsonPrettyString = JSON.stringify(JSON.parse(nodeStylesFileRaw), null, 2);
        try {
            const prettyFileName = `${dir}${mockFilePrefix}-${brand.name}-styles-pretty.json`;
            yield fs_1.promises.writeFile(prettyFileName, jsonPrettyString, 'utf8');
            console.log(`File: ${prettyFileName} written successfully.`);
        }
        catch (e) {
            console.log(`Error writing file: ${e}`);
        }
    });
}
//# sourceMappingURL=figmaFile.js.map