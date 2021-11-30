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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const inquirer = __importStar(require("inquirer"));
const chalk_1 = require("chalk");
const shell = __importStar(require("shelljs"));
const figlet_1 = __importDefault(require("figlet"));
const template = __importStar(require("./utils/template"));
const withTitle = (cli) => (0, figlet_1.default)("Vite React App", function (err, data) {
    if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
    }
    console.clear();
    console.log(data);
    console.log("v0.6.4");
    console.log((0, chalk_1.dim)(`\nReact template configured with ${chalk_1.underline.bgBlueBright.black("ViteJS")}, ${chalk_1.underline.bgCyan.black("Typescript")}, ${chalk_1.underline.bgYellow.black("Eslint/Prettier")} and ${chalk_1.underline.bgRed.black("React Testing Library")}.`));
    console.log((0, chalk_1.dim)(`Template can be found at ${chalk_1.underline.green("https://github.com/nazmifeeroz/vite-reactts-eslint-prettier")}\n`));
    cli();
});
const QUESTIONS = [
    {
        name: "name",
        type: "input",
        message: "Please input a new project name:",
    },
    {
        name: "packageManagerChoice",
        type: "list",
        message: "Which package manager do you wish to use:",
        choices: ["yarn", "npm"],
    },
];
const CURR_DIR = process.cwd();
withTitle(() => inquirer.prompt(QUESTIONS).then((answers) => {
    const projectChoice = "react-template";
    const projectName = answers["name"];
    const templatePath = path.join(__dirname, "templates", projectChoice);
    const tartgetPath = path.join(CURR_DIR, projectName);
    const options = {
        projectName,
        templateName: projectChoice,
        templatePath,
        tartgetPath,
        packageManagerChoice: answers["packageManagerChoice"],
    };
    if (!createProject(options.tartgetPath)) {
        return;
    }
    createDirectoryContents(options.templatePath, options.projectName);
    postProcess(options);
}));
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
        const installCommand = `${options.packageManagerChoice} ${options.packageManagerChoice === "npm" ? "install" : ""}`;
        console.log((0, chalk_1.dim)(`\nRunning ${installCommand}...`));
        shell.exec(installCommand, () => {
            console.log(chalk_1.underline.bgMagenta.white("\nNew project created successfully!"));
            console.log((0, chalk_1.dim)("\n\nChange directory into your project folder:"));
            console.log((0, chalk_1.yellow)(`  cd ${options.projectName}`));
            const runAppCommand = `${options.packageManagerChoice} ${options.packageManagerChoice === "npm" ? "run" : ""} dev`;
            console.log((0, chalk_1.dim)("\nRun app:"));
            console.log((0, chalk_1.yellow)(`  ${runAppCommand}`));
            console.log((0, chalk_1.green)("\nEnjoy!\n"));
        });
    }
    return true;
}
