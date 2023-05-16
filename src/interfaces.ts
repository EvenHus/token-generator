interface IDesignTokens{
    spacing:ISpacing[],
    radius:IRadius[],
    shadow:IShadow[],
    border:IBorder[],
    styles:IStyles
}

interface IBaseToken {
    id: string,
    name: string,
    nameJson: string
}

interface ISpacing extends IBaseToken {
    spacing: number
}

interface IRadius extends IBaseToken{
    radius: number
}

interface IShadow extends IBaseToken {
    shadow: {
        color: string,
        offset: {
            x: number,
            y: number
        },
        radius: number,
        spread: number
    }
}

interface IBorder extends IBaseToken {
    strokeWeight: number,
    color: string
}

interface IStyles {
    textStyles: ITextStyle[],
    colorStyles: IColorStyle[]
}

interface ITextStyle extends IBaseToken {
    fontFamily: string,
    fontWeight: number,
    fontSize: number,
    letterSpacing: number,
    lineHeightPx: number,
    lineHeightPercent: number,
    lineHeightUnit: string,
    colorHex: string

}

interface IColorStyle extends IBaseToken {
    colorHex?: string
    gradient?: IGradient
}

interface IGradient {
    stops: IGradientStop[]
    angle: number
}

interface IGradientStop {
    colorHex: string
    position: number
}


interface IFigTokConfig {
    brands: IBrand[],
    tokenTypes: ITokenTypes
}

interface ITokenTypes {
    spacing:ITokenTypeConfig,
    radius:ITokenTypeConfig,
    shadows:ITokenTypeConfig,
    borders:ITokenTypeConfig,
    textStyles:ITextStyleTypeConfig,
    colorStyles:IColorStyleTypeConfig
}

interface ITokenTypeConfig {
    tokenNamePrefix: string,
    tokenNameSeparator: string[],
    tokenFrameName: string,
}

interface IColorStyleTypeConfig {
    tokenNameSeparator: string[],
    includeFigmaTopFolders: string[],
    figmaType: string
}

interface ITextStyleTypeConfig {
    tokenNameSeparator: string[],
    figmaType: string
}

interface IBrand {
    name: string,
    figmaFileId: string
}
