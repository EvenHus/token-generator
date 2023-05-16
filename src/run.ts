import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import config from './config'
import { getFigmaFile, writeFile } from "./figmaFile";
import getFigmaDesignTokens from "./figmaTokens";
import transformCSSToTailwind from "./transformCSSTailwind";


async function generateTokens() {
    config.brands.map(async function (item) {
        if (process.env.FIGMA_FILE_ID) {
            if (process.env.FIGMA_FILE_ID === item.figmaFileId) {
                console.log(`Environment file id is set - normally a Figma publish event.\nRender ONLY the specific figmaId: ${item.figmaFileId} for brand: ${item.name}`)
                await getFigmaTokensForBrand(item);
            }
        } else {
            await getFigmaTokensForBrand(item); //If FIGMA_FILE_ID is not set in enviroment, then process all brands.
        }
    });
}

async function getFigmaTokensForBrand(brand: IBrand) {
    let figmaFile = await getFigmaFile(brand);
    let designTokens = await getFigmaDesignTokens(brand, figmaFile, 'Design Tokens');
    console.log(JSON.stringify(designTokens, null, 4));
    let tailwindCSS = transformCSSToTailwind(designTokens);
    await writeFile(tailwindCSS, brand.name, 'tw-css-extend');
}

generateTokens();
