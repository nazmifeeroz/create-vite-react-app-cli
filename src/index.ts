#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as inquirer from "inquirer";
import { red } from "chalk";
import * as shell from "shelljs";
import * as template from "./utils/template";

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

export interface CliOptions {
  projectName: string;
  templateName: string;
  templatePath: string;
  tartgetPath: string;
  packageManagerChoice: string;
}

const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS).then((answers) => {
  const projectChoice = "react-template";
  const projectName = answers["name"];
  const templatePath = path.join(__dirname, "templates", projectChoice);
  const tartgetPath = path.join(CURR_DIR, projectName);

  const options: CliOptions = {
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
});

function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(
      red(`Folder ${projectPath} exists. Delete or use another name.`)
    );
    return false;
  }
  fs.mkdirSync(projectPath);

  return true;
}

const SKIP_FILES = ["node_modules", ".template.json"];

function createDirectoryContents(templatePath: string, projectName: string) {
  // read all files/folders (1 level) from template folder
  const filesToCreate = fs.readdirSync(templatePath);
  // loop each file/folder
  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    // skip files that should not be copied
    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      // read file content and transform it using template engine
      let contents = fs.readFileSync(origFilePath, "utf8");
      contents = template.render(contents, { projectName });
      // write file to destination folder
      const writePath = path.join(CURR_DIR, projectName, file);
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      // create folder in destination folder
      fs.mkdirSync(path.join(CURR_DIR, projectName, file));
      // copy files/folder inside current folder recursively
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(projectName, file)
      );
    }
  });
}

function postProcess(options: CliOptions) {
  const isNode = fs.existsSync(path.join(options.templatePath, "package.json"));
  if (isNode) {
    shell.cd(options.tartgetPath);
    const installCommand = `${options.packageManagerChoice} ${
      options.packageManagerChoice === "npm" ? "install" : ""
    }`;
    const result = shell.exec(installCommand, { silent: false });
    if (result.code !== 0) {
      return false;
    }
  }

  return true;
}
