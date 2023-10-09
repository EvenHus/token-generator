// import express, { Express, Request, Response } from 'express';
// import dotenv from 'dotenv';
// dotenv.config();
// import config from './config'
// import {getFigmaFile, writeMockFile} from "./figmaFile";


// async function generateMockBrands() {
//     config.brands.map(async function (item) {
//         await generateMockFile(item); //If FIGMA_FILE_ID is not set in enviroment, then process all brands.
//     });
// }

// async function generateMockFile(brand: IBrand) {
//     let figmaFile = await getFigmaFile(brand);
//     await writeMockFile(figmaFile, brand);
// }

// generateMockBrands();
