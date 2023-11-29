import { readFile } from "./file";

const variableRegex = /(?<={{)(\s*.*?)(?=}})/g
const matchingRegex = (variable: string) => new RegExp(`({{)(\\s*${variable}\\s*)(}})`, 'g');

export function getVariable(variable: string, parameters: { [key: string]: string }) {
    let param = process.env[`IEF_${variable}`]
    if (!param) {
        param = parameters[variable];
    }
    return param;
}

export function parseTemplate(path: string, parameters: { [key: string]: string }) {
    let content = readFile(path);
    const variables = getVariables(content);
    for(let i = 0; i < variables.length; i++) {
        const variable = variables[i];
        const param = getVariable(variable, parameters)
        if (typeof param === 'undefined')
            throw new Error(`Template variable {{ ${variable} }} in ${path} is missing from provided variables. 
            Variables can be provided through an environment variable IEF_varName or through the json config`);

        content = replaceVariableValue(content, variable, param);
    }
    return content;
}

export function getVariables(content: string) {
    const mustBeUnique = (q: string, i: number, a: string[]) => a.indexOf(q) === i
    return content.match(variableRegex)?.map(q => q.trim()).filter(mustBeUnique) || [];
}

export function replaceVariableValue(content: string, variable: string, value: string): string {
    const regex = matchingRegex(variable);
    return content.replace(regex, value);
}