import fetch from 'node-fetch';
import * as dotenv from 'dotenv'
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

dotenv.config()

const mockFilePrefix = 'figma-file';

async function getLocalFile(filename: string): Promise<string | undefined> {
    try {
        return await fsPromises.readFile(filename, 'utf8');
    } catch (e) {
        console.log(`Error reading file: ${e}`)
    }
    return undefined;
}

export async function getFigmaFile(brand: IBrand): Promise<any> {
    if (process.env.FIGMA_FILE_MOCK_ENABLED) {
        console.log(`Getting figma file for brand: ${brand.name} from local mock file.`)
        let fileName = `${'./public/'}${mockFilePrefix}-${brand.name}.json`
        return getLocalFile(fileName);
    }
    console.log(`Getting figma file for brand: ${brand.name} from Figma API`)
    const response = await fetch(`https://api.figma.com/v1/files/${brand.figmaFileId}`, {
        method: 'get',
        headers: { 'Content-Type': 'application/json', 'X-Figma-Token': `${process.env.FIGMA_PERSONAL_TOKEN}` }
    });

    return await response.text();
}

export async function getFileNodes(brand: IBrand, nodeIds: string): Promise<any> {
    if (process.env.FIGMA_FILE_MOCK_ENABLED) {
        console.log(`Getting figma style file for brand: ${brand.name} from local mock file.`)
        let dir = './public/';
        let fileNameNodeStyles = `${dir}${mockFilePrefix}-${brand.name}-styles.json`;
        return await getLocalFile(fileNameNodeStyles)
    }

    const uri = `https://api.figma.com/v1/files/${brand.figmaFileId}/nodes?ids=${nodeIds}`;
    console.log(`Fetching nodes: ${nodeIds} from URI: ${uri}`);
    const response = await fetch(uri, {
        method: 'get',
        headers: { 'Content-Type': 'application/json', 'X-Figma-Token': `${process.env.FIGMA_PERSONAL_TOKEN}` }
    });

    return await response.text();
}

export async function writeFile(content: string, brand: string, cssIdentifier: string) {
    let dir = './generatedFiles/';
    let fileName = `${dir}${cssIdentifier}-${brand}.json`
    if (fs.existsSync(`${dir}`)) {
        try {
            await fsPromises.writeFile(fileName, content, 'utf8');
            console.log(`File: ${fileName} written successfully.`)
        } catch (e) {
            console.log(`Error writing file: ${e}`)
        }
    } else {
        try {
            fsPromises.mkdir(dir).then(async function () {
                console.log(`Directory: ${dir} created successfully`);
                await fsPromises.writeFile(`${dir}${cssIdentifier}-${brand}.json`, content, 'utf8');
                console.log(`File: ${fileName} written successfully.`)
            }).catch(function () {
                console.log('failed to create directory');
            });
        } catch (e) {
            console.log(`Error writing file: ${e}`)
        }
    }
}

export async function writeMockFile(content: string, brand: IBrand) {
    let dir = './public/';
    let fileName = `${dir}${mockFilePrefix}-${brand.name}.json`

    if (!fs.existsSync(`${dir}`)) {
        fsPromises.mkdir(dir).then(async function () {
            console.log(`Directory: ${dir} created successfully`);
            await fsPromises.writeFile(fileName, content, 'utf8');
            console.log(`File: ${fileName} written successfully.`)
        }).catch(function () {
            throw new Error('failed to create directory')
        });
    }

    try {
        await fsPromises.writeFile(fileName, content, 'utf8');
        console.log(`File: ${fileName} written successfully.`)
    } catch (e) {
        console.log(`Error writing file: ${e}`)
    }

    let figmaJson = JSON.parse(content);
    if (!figmaJson.name) {
        throw new Error('Missing name of Figma file. Probably invalid Figma file.')
    }

    console.log('Name:', figmaJson.name);
    console.log('Last modified:', figmaJson.lastModified);
    console.log('Version:', figmaJson.version);

    const jsonPrettyString = JSON.stringify(figmaJson, null, 2);

    try {
        const prettyFileName = `${dir}${mockFilePrefix}-${brand.name}-pretty.json`
        await fsPromises.writeFile(prettyFileName, jsonPrettyString, 'utf8');
        console.log(`File: ${prettyFileName} written successfully.`)
    } catch (e) {
        console.log(`Error writing file: ${e}`)
    }

    await writeMockNodeFile(figmaJson, brand);
}

async function writeMockNodeFile(figmaJson: any, brand: IBrand) {
    let dir = './public/';
    let fileNameNodeStyles = `${dir}${mockFilePrefix}-${brand.name}-styles.json`;

    let counter = 0;
    let styleKeysParams = Object.keys(figmaJson.styles).map(function (k) {
        counter++
        return k;
    }).join(',');

    console.log(`Style keys: ${styleKeysParams}`)
    console.log(`Style keys length: ${counter}`);

    let nodeStylesFileRaw = await getFileNodes(brand, styleKeysParams)

    try {
        await fsPromises.writeFile(fileNameNodeStyles, nodeStylesFileRaw, 'utf8');
        console.log(`File: ${fileNameNodeStyles} written successfully.`)
    } catch (e) {
        console.log(`Error writing file: ${e}`)
    }

    const jsonPrettyString = JSON.stringify(JSON.parse(nodeStylesFileRaw), null, 2);

    try {
        const prettyFileName = `${dir}${mockFilePrefix}-${brand.name}-styles-pretty.json`;
        await fsPromises.writeFile(prettyFileName, jsonPrettyString, 'utf8');
        console.log(`File: ${prettyFileName} written successfully.`)
    } catch (e) {
        console.log(`Error writing file: ${e}`)
    }
}
