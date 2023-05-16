"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function transformCSSToTailwind(designTokens) {
    console.log('*** Generating Tailwind CSS theme ***');
    let extendBrand = {
        colors: designTokens.styles.colorStyles.reduce((next, item) => {
            if (item.colorHex) {
                return Object.assign(Object.assign({}, next), { [item.nameJson]: item.colorHex });
            }
            else if (item.gradient) {
                const stops = item.gradient.stops;
                const colorStopTokens = stops.reduce((colorTokens, stop, index) => {
                    const stopPercent = Math.round((index / (stops.length - 1)) * 100);
                    return Object.assign(Object.assign({}, colorTokens), { [`${item.nameJson}${stopPercent}`]: stop.colorHex });
                }, {});
                return Object.assign(Object.assign({}, next), colorStopTokens);
            }
            return next;
        }, {}),
        fontFamily: designTokens.styles.textStyles.reduce((next, item) => {
            return Object.assign(Object.assign({}, next), { [item.nameJson]: item.fontFamily });
        }, {}),
        letterSpacing: designTokens.styles.textStyles.reduce((next, item) => {
            return Object.assign(Object.assign({}, next), { [item.nameJson]: formatNumber(item.letterSpacing) });
        }, {}),
        fontWeight: designTokens.styles.textStyles.reduce((next, item) => {
            return Object.assign(Object.assign({}, next), { [item.nameJson]: item.fontWeight });
        }, {}),
        lineHeight: designTokens.styles.textStyles.reduce((next, item) => {
            return Object.assign(Object.assign({}, next), { [item.nameJson]: formatNumber(item.lineHeightPx) });
        }, {}),
        fontSize: designTokens.styles.textStyles.reduce((next, item) => {
            return Object.assign(Object.assign({}, next), { [item.nameJson]: formatNumber(item.fontSize) });
        }, {}),
        spacing: designTokens.spacing.reduce((next, item) => {
            return Object.assign(Object.assign({}, next), { [item.nameJson]: formatNumber(item.spacing) });
        }, {}),
        borderWidth: designTokens.border.reduce((next, item) => {
            return Object.assign(Object.assign({}, next), { [item.nameJson]: formatNumber(item.strokeWeight, "px") });
        }, {}),
        borderRadius: designTokens.radius.reduce((next, item) => {
            return Object.assign(Object.assign({}, next), { [item.nameJson]: formatNumber(item.radius) });
        }, {}),
        boxShadow: designTokens.shadow.reduce((next, item) => {
            ///* offset-x | offset-y | blur-radius | spread-radius | color */
            return Object.assign(Object.assign({}, next), { [item.nameJson]: `${formatNumber(item.shadow.offset.x)} ${formatNumber(item.shadow.offset.y)} ${formatNumber(item.shadow.radius)} ${formatNumber(item.shadow.spread)} ${item.shadow.color}` });
        }, {})
    };
    function formatNumber(px, unit = "rem") {
        const value = px || 0;
        if (value === 0)
            return "0"; // Drop unit if 0
        return unit === "rem"
            ? `${value / 16}rem`
            : `${value}px`;
    }
    let themeOutput = JSON.stringify(extendBrand, null, 4);
    //PrimaryButton-state Normal: cssClass:semanticColorsTextDark3, borderRadius-small, xx, xxy, xxasdf2, asasd22, fontFamily...
    //PrimaryButton-state Warning: cssClass:headerDisplay
    //Tailwind components
    // -> This is the goal:::
    //PrimaryButton-Normal: CSS: primaryButton:hover
    //Component1: CSS: primaryButton-warning
    //Button components...
    console.log(themeOutput);
    return themeOutput;
}
exports.default = transformCSSToTailwind;
//# sourceMappingURL=transformCSSTailwind.js.map