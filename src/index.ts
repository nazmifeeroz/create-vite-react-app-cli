#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as inquirer from "inquirer";
import { underline, red, dim, green, yellow } from "chalk";
import * as shell from "shelljs";
import figlet from "figlet";
import * as template from "./utils/template";

const withTitle = (cli: () => {}) =>
  figlet("Vite React App", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.clear();
    console.log(data);
    console.log("v0.6.5");
    console.log(
      dim(
        `\nReact template configured with ${underline.bgBlueBright.black(
          "ViteJS"
        )}, ${underline.bgCyan.black("Typescript")}, ${underline.bgYellow.black(
          "Eslint/Prettier"
        )} and ${underline.bgRed.black("React Testing Library")}.`
      )
    );
    console.log(
      dim(
        `Template can be found at ${underline.green(
          "https://github.com/nazmifeeroz/vite-reactts-eslint-prettier"
        )}\n`
      )
    );

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

export interface CliOptions {
  projectName: string;
  templateName: string;
  templatePath: string;
  tartgetPath: string;
  packageManagerChoice: string;
}

const CURR_DIR = process.cwd();

withTitle(() =>
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
  })
);

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

    console.log(dim(`\nRunning ${installCommand}...`));

    shell.exec(installCommand, () => {
      console.log(
        underline.bgMagenta.white("\nNew project created successfully!")
      );

      console.log(dim("\n\nChange directory into your project folder:"));
      console.log(yellow(`  cd ${options.projectName}`));

      const runAppCommand = `${options.packageManagerChoice} ${
        options.packageManagerChoice === "npm" ? "run" : ""
      } dev`;
      console.log(dim("\nRun app:"));
      console.log(yellow(`  ${runAppCommand}`));

      console.log(green("\nEnjoy!\n"));
    });
  }

  return true;
}
