import dotenv from 'dotenv';
dotenv.config();
import config from './config'
import { getFigmaFile, getFigmaVariables, writeFile } from "./figmaFile";
import getFigmaDesignTokens from "./figmaTokens";
import getSortedVariablesByBrand from './figmaVariables';
import transformCSSToTailwind from "./transformCSSTailwind";
import { log } from 'console';


async function generateTokens() {
    config.brands.map(async function (item) {
        if (process.env.FIGMA_FILE_ID) {
            if (process.env.FIGMA_FILE_ID === item.figmaFileId) {
                console.log(`Environment file id is set - normally a Figma publish event.\nRender ONLY the specific figmaId: ${item.figmaFileId} for brand: ${item.name}`)
                await getFigmaTokensForBrand(item);
            }
        } else {
            await getFigmaTokensForBrand(item);
        }
    });
}

async function getFigmaTokensForBrand(brand: IBrand) {
    log("Getting Figma tokens for brand: " + brand.name)
    let variablesFile = await getFigmaVariables(brand);
    let figmaFile = await getFigmaFile(brand);
    log("Done")

    log(`Sorting variables for ${brand.name}`)
    let variablesByBrand = await getSortedVariablesByBrand(variablesFile, brand);
    let designTokens = await getFigmaDesignTokens(brand, figmaFile, variablesByBrand);
    log("Done")

    log("Transforming CSS to Tailwind")
    let tailwindCSS = transformCSSToTailwind(designTokens);
    log("Done")
    log("Writing design tokens to file")
    await writeFile(tailwindCSS, brand.name, 'tailwind');
}

generateTokens();