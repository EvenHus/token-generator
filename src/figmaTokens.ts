import jsonQuery from 'json-query';
import { getFileNodes } from "./figmaFile";
import config from './config'

export default async function getFigmaDesignTokens(brand: IBrand, fileContent: string, canvasName: string): Promise<IDesignTokens> {
    try {
        let figmaJson = JSON.parse(fileContent);
        if (!figmaJson.name) {
            throw new Error('Missing name of Figma file. Probably invalid Figma file.')
        }

        console.log('Name:', figmaJson.name);
        console.log('Last modified:', figmaJson.lastModified);
        console.log('Version:', figmaJson.version);

        //Extend the return to more style types based on Canvas and Frame logic in Figma file.
        return {
            styles: await getStyles(brand, figmaJson),
            spacing: getTokens<ISpacing>(figmaJson, canvasName, config.tokenTypes.spacing, spacingMap),
            radius: getTokens<IRadius>(figmaJson, canvasName, config.tokenTypes.radius, radiusMap),
            shadow: getTokens<IShadow>(figmaJson, canvasName, config.tokenTypes.shadows, shadowMap),
            border: getTokens<IBorder>(figmaJson, canvasName, config.tokenTypes.borders, bordersMap)
        };
    } catch (err) {
        console.log('Error parsing JSON string:', err);
    }

    return {
        spacing: [],
        radius: [],
        shadow: [],
        border: [],
        styles: { textStyles: [], colorStyles: [] }
    }
}

function getTokens<TYPE>(figmaJson: any, canvasName: string, tokenConfig: ITokenTypeConfig, tokenTypeMap: any): TYPE[] {
    console.log(`Fetching tokens from : ${tokenConfig.tokenFrameName}`);

    let tokenName = tokenConfig.tokenFrameName.toLowerCase();

    if (tokenConfig.tokenNamePrefix) {
        console.log(`Token prefix is set to: ${tokenConfig.tokenNamePrefix}`)
        tokenName = tokenConfig.tokenNamePrefix
    }

    let figmaQueryResult = jsonQuery(`document.children[* type=CANVAS & name = ${canvasName}].children[* type=FRAME & name=${tokenConfig.tokenFrameName}].children[* type=COMPONENT | type=RECTANGLE & name~/^${tokenName}.*/]`, {
        data: figmaJson,
        allowRegexp: true
    }).value;

    let tokens = tokenTypeMap(figmaQueryResult);

    console.log(`Hit length: ${tokens.length}`);

    return tokens;
}

async function getStyles(brand: IBrand, figmaJson: any): Promise<IStyles> {

    let counter = 0;
    let styleKeysParams = Object.keys(figmaJson.styles).map(function (k) {
        counter++
        return k;
    }).join(',');

    console.log(`Style keys: ${styleKeysParams}`)
    console.log(`Style keys length: ${counter}`);

    return parseStyleNodes(await getFileNodes(brand, styleKeysParams));
}

function parseStyleNodes(styleNodesString: string): IStyles {
    try {
        let figmaJson: any = JSON.parse(styleNodesString);

        return {
            textStyles: getStyleNodes<ITextStyle>(figmaJson, textStyleMap),
            colorStyles: getStyleNodes<IColorStyle>(figmaJson, colorsStyleMap)
        };
    } catch (err) {
        console.log('Error parsing JSON string:', err);
    }

    return {
        textStyles: [],
        colorStyles: []
    };
}

function getStyleNodes<TYPE>(figmaNodesJson: any, styleTypeMap: any): TYPE[] {
    console.log(`Fetching styles using styleTypeMap: ${styleTypeMap.name}`);

    let styles = styleTypeMap(figmaNodesJson);
    console.log(`Hit length: ${styles.length}`);

    return styles;
}

function textStyleMap(figmaNodesJson: any): ITextStyle[] {
    let styleValues = jsonQuery(`nodes[*].document.[* type=TEXT]`, {
        data: figmaNodesJson
    }).value;

    return sortTokens(styleValues.map(function (item: any): ITextStyle {
        let fillResult = jsonQuery(`fills[type=SOLID]`, {
            data: item
        }).value;

        return {
            id: item.id,
            name: item.name,
            nameJson: removeSpecial(item.name, config.tokenTypes.textStyles.tokenNameSeparator),
            fontFamily: item.style.fontFamily,
            fontWeight: item.style.fontWeight,
            fontSize: item.style.fontSize,
            letterSpacing: item.style.letterSpacing,
            lineHeightPx: item.style.lineHeightPx,
            lineHeightPercent: item.style.lineHeightPercent,
            lineHeightUnit: item.style.lineHeightUnit,
            colorHex: RGBAToHexA(`rgba(${Math.round(fillResult?.color.r * 255)},${Math.round(fillResult?.color.g * 255)},${Math.round(fillResult?.color.b * 255)},${fillResult?.color.a}`, fillResult?.color.a == 1 ?? false)
        }
    }));
}

function colorsStyleMap(figmaNodesJson: any): IColorStyle[] {
    let styleValues = jsonQuery(`nodes[*].document.[* type=RECTANGLE]`, {
        data: figmaNodesJson
    }).value;

    return sortTokens(styleValues.reduce(function (result: IColorStyle[], item: any): IColorStyle[] {
        const topFolderName = item.name.substring(0, item.name.indexOf('/'));
        if (!config.tokenTypes.colorStyles.includeFigmaTopFolders.includes(topFolderName)) {
            console.log(`Skip item: ${item.name} because the item is not in configurated topFolderName list in config.ts.`)
            return result;
        }

        let fillResult = item.fills[0];

        let colorStyle: IColorStyle = {
            id: item.id,
            name: item.name,
            nameJson: removeSpecial(item.name, config.tokenTypes.colorStyles.tokenNameSeparator),
        }

        if (fillResult?.type === 'SOLID') {
            colorStyle.colorHex = RGBAToHexA(`rgba(${Math.round(fillResult?.color.r * 255)},${Math.round(fillResult?.color.g * 255)},${Math.round(fillResult?.color.b * 255)},${fillResult?.color.a}`, fillResult?.color.a == 1 ?? false)
        } else if (fillResult?.type === 'GRADIENT_LINEAR') {
            colorStyle.gradient = {
                stops: fillResult.gradientStops.map((item: any): IGradientStop => ({
                    colorHex: RGBAToHexA(`rgba(${Math.round(item.color.r * 255)},${Math.round(item.color.g * 255)},${Math.round(item.color.b * 255)},${item.color.a}`, item.color.a == 1 ?? false),
                    position: item.position
                })),
                angle: 180 //Default - should be calculated in future gradientHandlePositions in Figma file on the fill.
            }
        }

        result.push(colorStyle);

        return result;
    }, []));
}

function spacingMap(figmaTokenValues: any): ISpacing[] {
    console.log("SPACING MAP", figmaTokenValues)
    return sortTokens(figmaTokenValues.map((item: any): ISpacing => ({
        id: item.id,
        name: item.name,
        nameJson: removeSpecial(item.name, config.tokenTypes.spacing.tokenNameSeparator),
        spacing: item.absoluteBoundingBox.width
    })));
}

function radiusMap(figmaTokenValues: any): IRadius[] {
    return sortTokens(figmaTokenValues.map((item: any): IRadius => ({
        id: item.id,
        name: item.name,
        nameJson: removeSpecial(item.name, config.tokenTypes.radius.tokenNameSeparator),
        radius: item.cornerRadius
    })));
}

export function shadowMap(figmaTokenValues: any): IShadow[] {
    return sortTokens(figmaTokenValues.map(function (item: any): IShadow {
        let effectsResult = jsonQuery(`effects[type=DROP_SHADOW & visible = true]`, {
            data: item
        }).value;

        return {
            id: item.id,
            name: item.name,
            nameJson: removeSpecial(item.name, config.tokenTypes.shadows.tokenNameSeparator),
            shadow: {
                color: RGBAToHexA(`rgba(${Math.round(effectsResult?.color.r * 255)},${Math.round(effectsResult?.color.g * 255)},${Math.round(effectsResult?.color.b * 255)},${effectsResult?.color.a}`, effectsResult?.color.a == 1 ?? false),
                offset: {
                    x: effectsResult?.offset.x,
                    y: effectsResult?.offset.y
                },
                radius: effectsResult?.radius,
                spread: effectsResult?.spread ?? 0
            }
        };
    }));
}

export function bordersMap(figmaTokenValues: any): IBorder[] {
    let strokesQueryResult = jsonQuery(`strokes[type=SOLID]`, {
        data: figmaTokenValues
    }).value;

    return sortTokens(figmaTokenValues.map((item: any): IBorder => ({
        id: item.id,
        name: item.name,
        nameJson: removeSpecial(item.name, config.tokenTypes.borders.tokenNameSeparator),
        strokeWeight: item.strokeWeight,
        color: RGBAToHexA(`rgba(${Math.round(strokesQueryResult?.color.r * 255)},${Math.round(strokesQueryResult?.color.g * 255)},${Math.round(strokesQueryResult?.color.b * 255)},${strokesQueryResult?.color.a}`, strokesQueryResult?.color.a == 1 ?? false)
    })));
}

function RGBAToHexA(rgba: string, forceRemoveAlpha = false) {
    return "#" + rgba.replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
        .split(',') // splits them at ","
        .filter((string, index) => !forceRemoveAlpha || index !== 3)
        .map(string => parseFloat(string)) // Converts them to numbers
        .map((number, index) => index === 3 ? Math.round(number * 255) : number) // Converts alpha to 255 number
        .map(number => number.toString(16)) // Converts numbers to hex
        .map(string => string.length === 1 ? "0" + string : string) // Adds 0 when length of one number is 1
        .join("") // Puts the array to togehter to a string
}

function removeSpecial(text: string, separator: string[]) {
    if (text) {
        const lower = text.toLowerCase();
        const upper = text.toUpperCase();
        let firstLetter = true;

        let result = '';
        let lastSpecialIndex = -1; //Set default last special position to -1 to avoid rule hit when beginning to parse string.
        for (let i = 0; i < lower.length; ++i) {

            if ((separator.includes(text[i])) || (lower[i].trim() === '')) {
                lastSpecialIndex = i
            } else if (firstLetter) {
                result += lower[i]
                firstLetter = false;
            } else if (isNumber(text[i]) || (lower[i] !== upper[i])) {
                if (lastSpecialIndex === i - 1) {
                    result += upper[i];
                } else {
                    result += text[i];
                }
            }
        }
        return result;
    }
    return '';
}

function isNumber(text: string) {
    if (text) {
        let reg = new RegExp('[0-9]+$');
        return reg.test(text);
    }
    return false;
}

function sortTokens(tokens: any) {
    return tokens.sort((a: any, b: any) => (a.nameJson > b.nameJson) ? 1 : ((b.nameJson > a.nameJson) ? -1 : 0));
}
