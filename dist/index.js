#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const inquirer = __importStar(require("inquirer"));
const chalk_1 = require("chalk");
const shell = __importStar(require("shelljs"));
const template = __importStar(require("./utils/template"));
const CHOICES = fs.readdirSync(path.join(__dirname, "templates"));
const QUESTIONS = [
    {
        name: "template",
        type: "list",
        message: "What template would you like to use?",
        choices: CHOICES,
    },
    {
        name: "name",
        type: "input",
        message: "Please input a new project name:",
    },
];
const CURR_DIR = process.cwd();
inquirer.prompt(QUESTIONS).then((answers) => {
    const projectChoice = answers["template"];
    const projectName = answers["name"];
    const templatePath = path.join(__dirname, "templates", projectChoice);
    const tartgetPath = path.join(CURR_DIR, projectName);
    const options = {
        projectName,
        templateName: projectChoice,
        templatePath,
        tartgetPath,
    };
    if (!createProject(options.tartgetPath)) {
        return;
    }
    createDirectoryContents(options.templatePath, options.projectName);
    // postProcess(options);
});
function createProject(projectPath) {
    if (fs.existsSync(projectPath)) {
        console.log((0, chalk_1.red)(`Folder ${projectPath} exists. Delete or use another name.`));
        return false;
    }
    fs.mkdirSync(projectPath);
    return true;
}
const SKIP_FILES = ["node_modules", ".template.json"];
function createDirectoryContents(templatePath, projectName) {
    // read all files/folders (1 level) from template folder
    const filesToCreate = fs.readdirSync(templatePath);
    // loop each file/folder
    filesToCreate.forEach((file) => {
        const origFilePath = path.join(templatePath, file);
        // get stats about the current file
        const stats = fs.statSync(origFilePath);
        // skip files that should not be copied
        if (SKIP_FILES.indexOf(file) > -1)
            return;
        if (stats.isFile()) {
            // read file content and transform it using template engine
            let contents = fs.readFileSync(origFilePath, "utf8");
            contents = template.render(contents, { projectName });
            // write file to destination folder
            const writePath = path.join(CURR_DIR, projectName, file);
            fs.writeFileSync(writePath, contents, "utf8");
        }
        else if (stats.isDirectory()) {
            // create folder in destination folder
            fs.mkdirSync(path.join(CURR_DIR, projectName, file));
            // copy files/folder inside current folder recursively
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
        }
    });
}
function postProcess(options) {
    const isNode = fs.existsSync(path.join(options.templatePath, "package.json"));
    if (isNode) {
        shell.cd(options.tartgetPath);
        const result = shell.exec("npm install");
        if (result.code !== 0) {
            return false;
        }
    }
    return true;
}
// #!/usr/bin/env node
// import * as fs from "fs";
// import * as path from "path";
// import * as inquirer from "inquirer";
// import { red } from "chalk";
// import * as shell from "shelljs";
// export interface CliOptions {
//   projectName: string;
//   targetPath: string;
//   templatePath: string;
// }
// const CURR_DIR = process.cwd();
// const QUESTIONS = [
//   {
//     name: "name",
//     type: "input",
//     message: "New project name?",
//   },
// ];
// function createProject(projectPath: string) {
//   if (fs.existsSync(projectPath)) {
//     console.log(
//       red(`Folder ${projectPath} exists. Delete or use another name.`)
//     );
//     return false;
//   }
//   fs.mkdirSync(projectPath);
//   return true;
// }
// function createDirectoryContents(
//   templatePath: string,
//   targetPath: string,
//   projectName: string
// ) {
//   const SKIP_FILES = ["node_modules"];
//   const filesToCreate = fs.readdirSync(templatePath);
//   filesToCreate.forEach((file) => {
//     if (SKIP_FILES.indexOf(file) > -1) return;
//     const origFilePath = path.join(targetPath, file);
//     const stats = fs.statSync(origFilePath);
//     if (stats.isFile()) {
//       let contents = fs.readFileSync(origFilePath, "utf8");
//       const writePath = path.join(targetPath, file);
//       fs.writeFileSync(writePath, contents, "utf8");
//     } else if (stats.isDirectory()) {
//       fs.mkdirSync(path.join(targetPath, file));
//       createDirectoryContents(
//         targetPath,
//         targetPath,
//         path.join(projectName, file)
//       );
//     }
//   });
// }
// inquirer.prompt(QUESTIONS).then((answers) => {
//   const projectName = answers["name"];
//   const targetPath = path.join(CURR_DIR, projectName);
//   const templatePath = path.join(CURR_DIR, "src/templates");
//   const options: CliOptions = {
//     projectName,
//     targetPath,
//     templatePath,
//   };
//   if (!createProject(options.targetPath)) return;
//   shell.exec(
//     `git clone https://github.com/nazmifeeroz/vite-reactts-eslint-prettier ${options.templatePath}`,
//     () => {
//       createDirectoryContents(
//         options.templatePath,
//         options.targetPath,
//         options.projectName
//       );
//     }
//   );
// });