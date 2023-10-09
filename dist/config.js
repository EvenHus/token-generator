"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    brands: [
        {
            name: 'forest',
            figmaFileId: 'S0K2rdHfw9ilUoefiCvjZx'
        },
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
};
exports.default = config;
//# sourceMappingURL=config.js.map