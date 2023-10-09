interface IVariable {
    id: string;
    resolvedType: string;
    codeSyntax: string;
    name: string;
    valuesByMode: {
        [key: string]: {
            value: string;
            type: string;
        };
    };
}

interface IMode {
    name: string;
    modeId: string;
}

interface ICollection {
    id: string;
    name: string;
    modes: IMode[];
    variables: IVariable[];
}

async function sortVariablesByCollection(variablesFile: any) {
    let figmaJson = JSON.parse(variablesFile);

    const sorted = Object.keys(figmaJson.meta.variableCollections).map(function (collectionKey) {

        figmaJson.meta.variableCollections[collectionKey].variables =
            Object.keys(figmaJson.meta.variables)
                .filter(function (key) {
                    let variableCollectionId = figmaJson.meta.variables[key].variableCollectionId;
                    if (variableCollectionId === collectionKey) {
                        return true
                    }
                })
                .map(function (key) {
                    return figmaJson.meta.variables[key]
                });

        return figmaJson.meta.variableCollections[collectionKey]
    });

    return sorted
}

async function changeIdToNameOnValuesByMode(sortedVariablesByCollection: any[]) {
    let figmaJson = sortedVariablesByCollection;
    Object.keys(figmaJson).map(function (collectionKey: any) {
        figmaJson[collectionKey].variables.map(function (variableKey: any) {
            let valuesByMode = variableKey.valuesByMode;
            Object.keys(valuesByMode).map(function (modeKey) {
                let mode = figmaJson[collectionKey].modes.filter(function (mode: any) {
                    return mode.modeId === modeKey
                });

                if (mode.length > 0) {
                    const chainName = mode[0].name.toLowerCase().replace(/\s/g, '').toString();
                    valuesByMode[chainName] = valuesByMode[modeKey];
                    delete valuesByMode[modeKey];
                }
            })
        })
    })

    return figmaJson;
}

async function mergeVaraiblesFromCollections(changedIdToNameOnValuesByMode: any) {
    let figmaJson = changedIdToNameOnValuesByMode;
    let variables = figmaJson.map(function (collection: any) {
        return collection.variables;
    })

    let mergedVariables = [].concat.apply([], variables);

    return mergedVariables;
}

async function sortCollectionByMode(
    sortedVariablesByCollection: ICollection[],
    allVariables: any[]
): Promise<any> {
    try {
        const chains: any[] = [];
        sortedVariablesByCollection.forEach((collection: ICollection) => {
            const currentCollection = collection.name.toLowerCase().replace(/\s/g, "");

            collection.modes.forEach((mode: IMode) => {
                const currentMode = mode.name.toLowerCase().replace(/\s/g, "");
                const checkIfChainExists = chains.find((chain: any) => chain.name === currentMode);
                const variables = collection.variables.map((variable: any) => {
                    let tokenValue = "";
                    if (variable.valuesByMode[currentMode].type === "VARIABLE_ALIAS") {
                        const aliasId = variable.valuesByMode[currentMode].id;
                        const variableByAlias = allVariables.find((variable: any) => variable.id === aliasId);
                        const valueByCurrentMode = variableByAlias.valuesByMode[currentMode];
                        tokenValue = valueByCurrentMode;
                    } else {
                        tokenValue = variable.valuesByMode[currentMode];
                    }
                    return {
                        id: variable.id,
                        resolvedType: variable.resolvedType,
                        codeSyntax: variable.codeSyntax,
                        name: variable.name,
                        value: tokenValue
                    };
                });
                if (!checkIfChainExists) {
                    chains.push({
                        name: currentMode,
                        tokens: [{
                            tokenType: currentCollection,
                            collectionId: collection.id,
                            variables
                        }],
                    });
                } else {
                    checkIfChainExists.tokens.push({
                        tokenType: currentCollection,
                        collectionId: collection.id,
                        variables
                    });
                }
            });
        });

        return chains;
    } catch (err) {
        console.log("Error parsing JSON string:", err);
        return err;
    }
}


export default async function getSortedVariablesByBrand(variablesFile: any, brand: IBrand) {
    // Sort the variables by collection
    let sortedVariablesByCollection = await sortVariablesByCollection(variablesFile);
    // Change the id to name on values by mode
    let changedIdToNameOnValuesByMode = await changeIdToNameOnValuesByMode(sortedVariablesByCollection);
    // Merge all variables from all collections
    let allVariables = await mergeVaraiblesFromCollections(changedIdToNameOnValuesByMode);
    // Sort the variables by mode
    let sortedCollectionByMode: any = await sortCollectionByMode(changedIdToNameOnValuesByMode, allVariables);
    // Get the variables by brand
    let variablesByBrand = sortedCollectionByMode.filter((item: any) => item.name === brand.name)[0];

    return variablesByBrand
}