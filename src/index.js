#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var inquirer = require("inquirer");
var chalk_1 = require("chalk");
var shell = require("shelljs");
var figlet_1 = require("figlet");
var template = require("./utils/template");
var withTitle = function (cli) {
    return (0, figlet_1["default"])("Vite React App", function (err, data) {
        if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
        }
        console.clear();
        console.log(data);
        console.log((0, chalk_1.dim)("\nReact template configured with " + chalk_1.underline.bgBlueBright.black("ViteJS") + ", " + chalk_1.underline.bgCyan.black("Typescript") + ", " + chalk_1.underline.bgYellow.black("Eslint/Prettier") + " and " + chalk_1.underline.bgRed.white("React Testing Library") + "."));
        console.log((0, chalk_1.dim)("Template can be found at " + chalk_1.underline.green("https://github.com/nazmifeeroz/vite-reactts-eslint-prettier") + "\n"));
        cli();
    });
};
var QUESTIONS = [
    {
        name: "name",
        type: "input",
        message: "Please input a new project name:"
    },
    {
        name: "packageManagerChoice",
        type: "list",
        message: "Which package manager do you wish to use:",
        choices: ["yarn", "npm"]
    },
];
var CURR_DIR = process.cwd();
withTitle(function () {
    return inquirer.prompt(QUESTIONS).then(function (answers) {
        var projectChoice = "react-template";
        var projectName = answers["name"];
        var templatePath = path.join(__dirname, "templates", projectChoice);
        var tartgetPath = path.join(CURR_DIR, projectName);
        var options = {
            projectName: projectName,
            templateName: projectChoice,
            templatePath: templatePath,
            tartgetPath: tartgetPath,
            packageManagerChoice: answers["packageManagerChoice"]
        };
        if (!createProject(options.tartgetPath)) {
            return;
        }
        createDirectoryContents(options.templatePath, options.projectName);
        postProcess(options);
    });
});
function createProject(projectPath) {
    if (fs.existsSync(projectPath)) {
        console.log((0, chalk_1.red)("Folder " + projectPath + " exists. Delete or use another name."));
        return false;
    }
    fs.mkdirSync(projectPath);
    return true;
}
var SKIP_FILES = ["node_modules", ".template.json"];
function createDirectoryContents(templatePath, projectName) {
    // read all files/folders (1 level) from template folder
    var filesToCreate = fs.readdirSync(templatePath);
    // loop each file/folder
    filesToCreate.forEach(function (file) {
        var origFilePath = path.join(templatePath, file);
        // get stats about the current file
        var stats = fs.statSync(origFilePath);
        // skip files that should not be copied
        if (SKIP_FILES.indexOf(file) > -1)
            return;
        if (stats.isFile()) {
            // read file content and transform it using template engine
            var contents = fs.readFileSync(origFilePath, "utf8");
            contents = template.render(contents, { projectName: projectName });
            // write file to destination folder
            var writePath = path.join(CURR_DIR, projectName, file);
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
    var isNode = fs.existsSync(path.join(options.templatePath, "package.json"));
    if (isNode) {
        shell.cd(options.tartgetPath);
        var installCommand = options.packageManagerChoice + " " + (options.packageManagerChoice === "npm" ? "install" : "");
        console.log((0, chalk_1.dim)("\nRunning " + installCommand + "..."));
        shell.exec(installCommand, function () {
            console.log(chalk_1.underline.bgMagenta.white("\nNew project created successfully!"));
            console.log((0, chalk_1.dim)("\n\nChange directory into your project folder:"));
            console.log((0, chalk_1.yellow)("  cd " + options.projectName));
            var runAppCommand = options.packageManagerChoice + " " + (options.packageManagerChoice === "npm" ? "run" : "") + " dev";
            console.log((0, chalk_1.dim)("\nRun app:"));
            console.log((0, chalk_1.yellow)("  " + runAppCommand));
            console.log((0, chalk_1.green)("\nEnjoy!\n"));
        });
    }
    return true;
}
