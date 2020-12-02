const fs = require("fs");

async function run(dependency, logCorrectPackages = true, logMissingDependencies = true) {
    const dependencyVersion = await getDependencyVersionFromFile(dependency, "package.json");
    console.log(`Subfolders should contain package ${dependency} at version ${dependencyVersion}`);
    const subDirectories = getSubDirectories("./");

    for (const directoryPath of subDirectories) {
        const jsonPath = `${directoryPath}/package.json`;
        if (fs.existsSync(jsonPath)) {
            const localDependencyVersion = await getDependencyVersionFromFile("jest", jsonPath);

            logResults(logCorrectPackages, localDependencyVersion, dependencyVersion, jsonPath, logMissingDependencies);
        }
    }

    console.log(`Checked ${subDirectories.length} sub directories.`)
}

function getSubDirectories(sourceDirectory) {
    return fs.readdirSync(sourceDirectory, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
}

async function getDependencyVersionFromFile(dependency, filepath, fileEncoding = "utf8") {
    const fileContent = await fs.promises.readFile(filepath, fileEncoding).catch((err) => {
        if (err) console.error(err);
    });
    return getDependencyVersionFromString(dependency, fileContent);
}

function getDependencyVersionFromString(dependency, fileString) {
    let data = fileString;
    const lineIdentifier = '"' + dependency + '": "';
    const lineIndex = data.indexOf(lineIdentifier);

    if (lineIndex != -1) {
        data = data.substring(lineIndex + lineIdentifier.length);
        data = data.substring(0, data.indexOf('"'));

        return data;
    } else {
        return null;
    }
}

function logResults(logCorrectPackages, localDependencyVersion, dependencyVersion, jsonPath, logMissingDependencies) {
    if (logCorrectPackages && localDependencyVersion == dependencyVersion) {
        console.log(`Contains the same version (${jsonPath})`);
    } else if (localDependencyVersion != null) {
        console.error(`Contains other version: ${localDependencyVersion} (${jsonPath})`);
    } else if (logMissingDependencies) {
        console.error(`Doesn't contain dependency  (${jsonPath})`);
    }
}