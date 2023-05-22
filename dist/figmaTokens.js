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
exports.bordersMap = exports.shadowMap = void 0;
const json_query_1 = __importDefault(require("json-query"));
const figmaFile_1 = require("./figmaFile");
const config_1 = __importDefault(require("./config"));
function getFigmaDesignTokens(brand, fileContent, canvasName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let figmaJson = JSON.parse(fileContent);
            if (!figmaJson.name) {
                throw new Error('Missing name of Figma file. Probably invalid Figma file.');
            }
            console.log('Name:', figmaJson.name);
            console.log('Last modified:', figmaJson.lastModified);
            console.log('Version:', figmaJson.version);
            //Extend the return to more style types based on Canvas and Frame logic in Figma file.
            return {
                styles: yield getStyles(brand, figmaJson),
                spacing: getTokens(figmaJson, canvasName, config_1.default.tokenTypes.spacing, spacingMap),
                radius: getTokens(figmaJson, canvasName, config_1.default.tokenTypes.radius, radiusMap),
                shadow: getTokens(figmaJson, canvasName, config_1.default.tokenTypes.shadows, shadowMap),
                border: getTokens(figmaJson, canvasName, config_1.default.tokenTypes.borders, bordersMap)
            };
        }
        catch (err) {
            console.log('Error parsing JSON string:', err);
        }
        return {
            spacing: [],
            radius: [],
            shadow: [],
            border: [],
            styles: { textStyles: [], colorStyles: [] }
        };
    });
}
exports.default = getFigmaDesignTokens;
function getTokens(figmaJson, canvasName, tokenConfig, tokenTypeMap) {
    console.log(`Fetching tokens from : ${tokenConfig.tokenFrameName}`);
    let tokenName = tokenConfig.tokenFrameName.toLowerCase();
    if (tokenConfig.tokenNamePrefix) {
        console.log(`Token prefix is set to: ${tokenConfig.tokenNamePrefix}`);
        tokenName = tokenConfig.tokenNamePrefix;
    }
    let figmaQueryResult = (0, json_query_1.default)(`document.children[* type=CANVAS & name = ${canvasName}].children[* type=FRAME & name=${tokenConfig.tokenFrameName}].children[* type=COMPONENT | type=RECTANGLE & name~/^${tokenName}.*/]`, {
        data: figmaJson,
        allowRegexp: true
    }).value;
    let tokens = tokenTypeMap(figmaQueryResult);
    console.log(`Hit length: ${tokens.length}`);
    return tokens;
}
function getStyles(brand, figmaJson) {
    return __awaiter(this, void 0, void 0, function* () {
        let counter = 0;
        let styleKeysParams = Object.keys(figmaJson.styles).map(function (k) {
            counter++;
            return k;
        }).join(',');
        console.log(`Style keys: ${styleKeysParams}`);
        console.log(`Style keys length: ${counter}`);
        return parseStyleNodes(yield (0, figmaFile_1.getFileNodes)(brand, styleKeysParams));
    });
}
function parseStyleNodes(styleNodesString) {
    try {
        let figmaJson = JSON.parse(styleNodesString);
        return {
            textStyles: getStyleNodes(figmaJson, textStyleMap),
            colorStyles: getStyleNodes(figmaJson, colorsStyleMap)
        };
    }
    catch (err) {
        console.log('Error parsing JSON string:', err);
    }
    return {
        textStyles: [],
        colorStyles: []
    };
}
function getStyleNodes(figmaNodesJson, styleTypeMap) {
    console.log(`Fetching styles using styleTypeMap: ${styleTypeMap.name}`);
    let styles = styleTypeMap(figmaNodesJson);
    console.log(`Hit length: ${styles.length}`);
    return styles;
}
function textStyleMap(figmaNodesJson) {
    let styleValues = (0, json_query_1.default)(`nodes[*].document.[* type=TEXT]`, {
        data: figmaNodesJson
    }).value;
    return sortTokens(styleValues.map(function (item) {
        var _a;
        let fillResult = (0, json_query_1.default)(`fills[type=SOLID]`, {
            data: item
        }).value;
        return {
            id: item.id,
            name: item.name,
            nameJson: removeSpecial(item.name, config_1.default.tokenTypes.textStyles.tokenNameSeparator),
            fontFamily: item.style.fontFamily,
            fontWeight: item.style.fontWeight,
            fontSize: item.style.fontSize,
            letterSpacing: item.style.letterSpacing,
            lineHeightPx: item.style.lineHeightPx,
            lineHeightPercent: item.style.lineHeightPercent,
            lineHeightUnit: item.style.lineHeightUnit,
            colorHex: RGBAToHexA(`rgba(${Math.round((fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.r) * 255)},${Math.round((fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.g) * 255)},${Math.round((fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.b) * 255)},${fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.a}`, (_a = (fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.a) == 1) !== null && _a !== void 0 ? _a : false)
        };
    }));
}
function colorsStyleMap(figmaNodesJson) {
    let styleValues = (0, json_query_1.default)(`nodes[*].document.[* type=RECTANGLE]`, {
        data: figmaNodesJson
    }).value;
    return sortTokens(styleValues.reduce(function (result, item) {
        var _a;
        const topFolderName = item.name.substring(0, item.name.indexOf('/'));
        if (!config_1.default.tokenTypes.colorStyles.includeFigmaTopFolders.includes(topFolderName)) {
            console.log(`Skip item: ${item.name} because the item is not in configurated topFolderName list in config.ts.`);
            return result;
        }
        let fillResult = item.fills[0];
        let colorStyle = {
            id: item.id,
            name: item.name,
            nameJson: removeSpecial(item.name, config_1.default.tokenTypes.colorStyles.tokenNameSeparator),
        };
        if ((fillResult === null || fillResult === void 0 ? void 0 : fillResult.type) === 'SOLID') {
            colorStyle.colorHex = RGBAToHexA(`rgba(${Math.round((fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.r) * 255)},${Math.round((fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.g) * 255)},${Math.round((fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.b) * 255)},${fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.a}`, (_a = (fillResult === null || fillResult === void 0 ? void 0 : fillResult.color.a) == 1) !== null && _a !== void 0 ? _a : false);
        }
        else if ((fillResult === null || fillResult === void 0 ? void 0 : fillResult.type) === 'GRADIENT_LINEAR') {
            colorStyle.gradient = {
                stops: fillResult.gradientStops.map((item) => {
                    var _a;
                    return ({
                        colorHex: RGBAToHexA(`rgba(${Math.round(item.color.r * 255)},${Math.round(item.color.g * 255)},${Math.round(item.color.b * 255)},${item.color.a}`, (_a = item.color.a == 1) !== null && _a !== void 0 ? _a : false),
                        position: item.position
                    });
                }),
                angle: 180 //Default - should be calculated in future gradientHandlePositions in Figma file on the fill.
            };
        }
        result.push(colorStyle);
        return result;
    }, []));
}
function spacingMap(figmaTokenValues) {
    console.log("SPACING MAP", figmaTokenValues);
    return sortTokens(figmaTokenValues.map((item) => ({
        id: item.id,
        name: item.name,
        nameJson: removeSpecial(item.name, config_1.default.tokenTypes.spacing.tokenNameSeparator),
        spacing: item.absoluteBoundingBox.width
    })));
}
function radiusMap(figmaTokenValues) {
    return sortTokens(figmaTokenValues.map((item) => ({
        id: item.id,
        name: item.name,
        nameJson: removeSpecial(item.name, config_1.default.tokenTypes.radius.tokenNameSeparator),
        radius: item.cornerRadius
    })));
}
function shadowMap(figmaTokenValues) {
    return sortTokens(figmaTokenValues.map(function (item) {
        var _a, _b;
        let effectsResult = (0, json_query_1.default)(`effects[type=DROP_SHADOW & visible = true]`, {
            data: item
        }).value;
        return {
            id: item.id,
            name: item.name,
            nameJson: removeSpecial(item.name, config_1.default.tokenTypes.shadows.tokenNameSeparator),
            shadow: {
                color: RGBAToHexA(`rgba(${Math.round((effectsResult === null || effectsResult === void 0 ? void 0 : effectsResult.color.r) * 255)},${Math.round((effectsResult === null || effectsResult === void 0 ? void 0 : effectsResult.color.g) * 255)},${Math.round((effectsResult === null || effectsResult === void 0 ? void 0 : effectsResult.color.b) * 255)},${effectsResult === null || effectsResult === void 0 ? void 0 : effectsResult.color.a}`, (_a = (effectsResult === null || effectsResult === void 0 ? void 0 : effectsResult.color.a) == 1) !== null && _a !== void 0 ? _a : false),
                offset: {
                    x: effectsResult === null || effectsResult === void 0 ? void 0 : effectsResult.offset.x,
                    y: effectsResult === null || effectsResult === void 0 ? void 0 : effectsResult.offset.y
                },
                radius: effectsResult === null || effectsResult === void 0 ? void 0 : effectsResult.radius,
                spread: (_b = effectsResult === null || effectsResult === void 0 ? void 0 : effectsResult.spread) !== null && _b !== void 0 ? _b : 0
            }
        };
    }));
}
exports.shadowMap = shadowMap;
function bordersMap(figmaTokenValues) {
    let strokesQueryResult = (0, json_query_1.default)(`strokes[type=SOLID]`, {
        data: figmaTokenValues
    }).value;
    return sortTokens(figmaTokenValues.map((item) => {
        var _a;
        return ({
            id: item.id,
            name: item.name,
            nameJson: removeSpecial(item.name, config_1.default.tokenTypes.borders.tokenNameSeparator),
            strokeWeight: item.strokeWeight,
            color: RGBAToHexA(`rgba(${Math.round((strokesQueryResult === null || strokesQueryResult === void 0 ? void 0 : strokesQueryResult.color.r) * 255)},${Math.round((strokesQueryResult === null || strokesQueryResult === void 0 ? void 0 : strokesQueryResult.color.g) * 255)},${Math.round((strokesQueryResult === null || strokesQueryResult === void 0 ? void 0 : strokesQueryResult.color.b) * 255)},${strokesQueryResult === null || strokesQueryResult === void 0 ? void 0 : strokesQueryResult.color.a}`, (_a = (strokesQueryResult === null || strokesQueryResult === void 0 ? void 0 : strokesQueryResult.color.a) == 1) !== null && _a !== void 0 ? _a : false)
        });
    }));
}
exports.bordersMap = bordersMap;
function RGBAToHexA(rgba, forceRemoveAlpha = false) {
    return "#" + rgba.replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
        .split(',') // splits them at ","
        .filter((string, index) => !forceRemoveAlpha || index !== 3)
        .map(string => parseFloat(string)) // Converts them to numbers
        .map((number, index) => index === 3 ? Math.round(number * 255) : number) // Converts alpha to 255 number
        .map(number => number.toString(16)) // Converts numbers to hex
        .map(string => string.length === 1 ? "0" + string : string) // Adds 0 when length of one number is 1
        .join(""); // Puts the array to togehter to a string
}
function removeSpecial(text, separator) {
    if (text) {
        const lower = text.toLowerCase();
        const upper = text.toUpperCase();
        let firstLetter = true;
        let result = '';
        let lastSpecialIndex = -1; //Set default last special position to -1 to avoid rule hit when beginning to parse string.
        for (let i = 0; i < lower.length; ++i) {
            if ((separator.includes(text[i])) || (lower[i].trim() === '')) {
                lastSpecialIndex = i;
            }
            else if (firstLetter) {
                result += lower[i];
                firstLetter = false;
            }
            else if (isNumber(text[i]) || (lower[i] !== upper[i])) {
                if (lastSpecialIndex === i - 1) {
                    result += upper[i];
                }
                else {
                    result += text[i];
                }
            }
        }
        return result;
    }
    return '';
}
function isNumber(text) {
    if (text) {
        let reg = new RegExp('[0-9]+$');
        return reg.test(text);
    }
    return false;
}
function sortTokens(tokens) {
    return tokens.sort((a, b) => (a.nameJson > b.nameJson) ? 1 : ((b.nameJson > a.nameJson) ? -1 : 0));
}
//# sourceMappingURL=figmaTokens.js.map