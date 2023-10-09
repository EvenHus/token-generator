const config: IFigTokConfig = {
    brands: [
        {
            name: 'forest',
            figmaFileId: 'S0K2rdHfw9ilUoefiCvjZx',
            variableFileId: 'S0K2rdHfw9ilUoefiCvjZx'
        },
        {
            name: 'flair',
            figmaFileId: 'mILqMH57RKvVNJJERWbGiD',
            variableFileId: 'mILqMH57RKvVNJJERWbGiD'
        }
    ],
    variableTypes: {
        color: {
            variableCollectionName: 'Brand',
        },
        spacing: {
            variableCollectionName: 'Spacing',
        },
        radius: {
            variableCollectionName: 'Border Radius',
        },
        shadows: {
            variableCollectionName: 'Shadows',
        },
    },
    tokenTypes: {
        spacing: {
            tokenNamePrefix: '\\*',
            tokenNameSeparator: ['*', '/', '-'],
            tokenFrameName: 'Spacing',
            collectionName: 'space'
        },
        radius: {
            tokenNamePrefix: '\\*',
            tokenNameSeparator: ['*', '/', '-'],
            tokenFrameName: 'BorderRadius',
            collectionName: 'borderradius'
        },
        shadows: {
            tokenNamePrefix: '\\*',
            tokenNameSeparator: ['*', '/', '-'],
            tokenFrameName: 'Shadows',
            collectionName: 'shadow'
        },
        borders: {
            tokenNamePrefix: '\\*',
            tokenNameSeparator: ['*', '/', '-'],
            tokenFrameName: 'BorderWeight',
            collectionName: 'borderweight'
        },
        textStyles: {
            tokenNameSeparator: ['/'],
            figmaType: 'TEXT',
        },
        color: {
            tokenNameSeparator: ['/'],
            includeFigmaTopFolders: ['Semantic', 'Base'],
            figmaType: 'RECTANGLE',
            tokenFrameName: 'Color',
            tokenNamePrefix: '\\*',
            collectionName: 'brand'
        },
    }
}

export default config;
