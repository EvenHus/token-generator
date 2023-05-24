const config: IFigTokConfig = {
    brands: [
        {
            name: 'forest',
            figmaFileId: 'S0K2rdHfw9ilUoefiCvjZx'
        },
        {
            name: 'flair',
            figmaFileId: 'mILqMH57RKvVNJJERWbGiD'
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
