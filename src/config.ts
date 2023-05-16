const config: IFigTokConfig = {
    brands: [
        {
            name: 'sylinder-cms-no',
            figmaFileId: '48YJxFPN4Soe14JpkxCsmg'
        },
        {
            name: 'kiwi-no',
            figmaFileId: '6L1xRBGkzBUts7uYXhFy12'
        },
        {
            name: 'meny-no',
            figmaFileId: 'qQGoSBeCsSMxnd3vybKInp'
        },
        {
            name: 'spar-no',
            figmaFileId: '608qa3dx5uVgGmcFbGTaPX'
        },
        {
            name: 'kmh-no',
            figmaFileId: 'o2aeg8I2rrmYfuiwxXI4uW'
        },
        {
            name: 'narbutikken-no',
            figmaFileId: '48YJxFPN4Soe14JpkxCsmg' // Same as sylinder-cms-no
        },
        {
            name: 'trumf-no',
            figmaFileId: 'lrGWjclRpeXUwYFUHNrsDp'
        }
    ],
    tokenTypes: {
        spacing: {
            tokenNamePrefix: '\\*',
            tokenNameSeparator: ['*', '/', '-'],
            tokenFrameName: 'Spacing'
        },
        radius: {
            tokenNamePrefix: '\\*',
            tokenNameSeparator: ['*', '/', '-'],
            tokenFrameName: 'BorderRadius'
        },
        shadows: {
            tokenNamePrefix: '\\*',
            tokenNameSeparator: ['*', '/', '-'],
            tokenFrameName: 'Shadows'
        },
        borders: {
            tokenNamePrefix: '\\*',
            tokenNameSeparator: ['*', '/', '-'],
            tokenFrameName: 'BorderWeight'
        },
        textStyles: {
            tokenNameSeparator: ['/'],
            figmaType: 'TEXT',
        },
        colorStyles: {
            tokenNameSeparator: ['/'],
            includeFigmaTopFolders: ['Semantic', 'Base'],
            figmaType: 'RECTANGLE'
        },
    }
}

export default config;
