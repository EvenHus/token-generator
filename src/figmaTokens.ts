import jsonQuery from 'json-query';
import { getFileNodes } from "./figmaFile";
import config from './config'

export default async function getFigmaDesignTokens(brand: IBrand, fileContent: string, variables: any[]): Promise<IDesignTokens> {
    try {
        let figmaJson = JSON.parse(fileContent);
        if (!figmaJson.name) {
            throw new Error('Missing name of Figma file. Probably invalid Figma file.')
        }

        return {
            textStyles: await getStyles(brand, figmaJson),
            spacing: getTokens<ISpacing>(config.tokenTypes.spacing, spacingMap, variables),
            radius: getTokens<IRadius>(config.tokenTypes.radius, radiusMap, variables),
            border: getTokens<IBorder>(config.tokenTypes.borders, bordersMap, variables),
            color: getTokens<IColorStyle>(config.tokenTypes.color, colorMap, variables)
        };
    } catch (err) {
        console.log('Error parsing JSON string:', err);
    }

    return {
        spacing: [],
        radius: [],
        border: [],
        textStyles: [],
        color: []
    }
}

async function getStyles(brand: IBrand, figmaJson: any): Promise<ITextStyle[]> {
    let counter = 0;
    let styleKeysParams = Object.keys(figmaJson.styles).map(function (k) {
        counter++
        return k;
    }).join(',');

    return parseStyleNodes(await getFileNodes(brand, styleKeysParams));
}

function getTokens<TYPE>(tokenConfig: ITokenTypeConfig, tokenTypeMap: any, variables: any): TYPE[] {
    let collectionName = tokenConfig.collectionName.toLowerCase();
    let variablesFilteredByCollectionName = variables.tokens.filter((variable: any) => variable.tokenType === collectionName)[0].variables

    let tokens = tokenTypeMap(variablesFilteredByCollectionName);

    return tokens;
}



function parseStyleNodes(styleNodesString: string): ITextStyle[] {
    try {
        let figmaJson: any = JSON.parse(styleNodesString);

        return getStyleNodes<ITextStyle>(figmaJson, textStyleMap)
    } catch (err) {
        console.log('Error parsing JSON string:', err);
    }

    return [];
}

function getStyleNodes<TYPE>(figmaNodesJson: any, styleTypeMap: any): TYPE[] {
    let styles = styleTypeMap(figmaNodesJson);

    return styles;
}

function textStyleMap(figmaNodesJson: any): ITextStyle[] {
    let styleValues = jsonQuery(`nodes[*].document.[* type=TEXT]`, {
        data: figmaNodesJson
    }).value;


    console.log(styleValues.length)

    return sortTokens(
        styleValues.map(function (item: any): ITextStyle {
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
        })
    );
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


function radiusMap(variables: any): IRadius[] {
    return variables.map((variable: any) => ({
        id: variable.id,
        resolvedType: variable.resolvedType,
        codeSyntax: variable.codeSyntax,
        name: variable.name,
        nameJson: removeSpecial(variable.name, config.tokenTypes.radius.tokenNameSeparator),
        radius: variable.value
    }));
}

function colorMap(variables: any): any { // IColor
    return variables.map((variable: any) => ({
        id: variable.id,
        resolvedType: variable.resolvedType,
        codeSyntax: variable.codeSyntax,
        name: variable.name,
        nameJson: removeSpecial(variable.name, config.tokenTypes.color.tokenNameSeparator),
        colorHex: RGBAToHexA(`rgba(${Math.round(variable.value.r * 255)},${Math.round(variable.value.g * 255)},${Math.round(variable.value.b * 255)},${variable.value.a}`, variable.value.a == 1 ?? false),
    }));
}

function spacingMap(variables: any): ISpacing[] { // ISpace
    return variables.map((variable: any) => ({
        id: variable.id,
        resolvedType: variable.resolvedType,
        codeSyntax: variable.codeSyntax,
        name: variable.name,
        nameJson: removeSpecial(variable.name, config.tokenTypes.spacing.tokenNameSeparator),
        spacing: variable.value
    }));
}

function bordersMap(variables: any): IBorder { // IBorderWeightMap
    return variables.map((variable: any) => ({
        id: variable.id,
        resolvedType: variable.resolvedType,
        codeSyntax: variable.codeSyntax,
        name: variable.name,
        nameJson: removeSpecial(variable.name, config.tokenTypes.borders.tokenNameSeparator),
        strokeWeight: variable.value
    }));
}

function sizeMap(variables: any): ISpacing { // ISizeMap
    return variables.map((variable: any) => ({
        id: variable.id,
        resolvedType: variable.resolvedType,
        codeSyntax: variable.codeSyntax,
        name: variable.name,
        // nameJson: removeSpecial(variable.name, config.tokenTypes.borders.tokenNameSeparator),
        size: variable.value
    }));
}