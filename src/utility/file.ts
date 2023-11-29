import del from 'del';
import fs from 'fs';
import path from 'path';
import { parse } from './parser';

export function parseFile<T>(path: string): T {
    const content = fs.readFileSync(path, 'utf-8');
    return parse<T>(content);
}

export function readFile(path: string): string {
    return fs.readFileSync(path, 'utf-8');
}

export function writeFile(content: string, outputPath: string) {
    const _path = path.parse(outputPath);
    fs.mkdirSync(_path.dir, { recursive: true });
    fs.writeFileSync(outputPath, content);
}

export function copyFile(inputPath: string, outputPath: string) {
    const _path = path.parse(outputPath);
    fs.mkdirSync(_path.dir, { recursive: true });
    fs.copyFileSync(inputPath, outputPath);
}

export function clearDirectory(path: string) {
    del.sync(path);
}