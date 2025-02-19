const fs = require("fs");

const createFolders = (...args) => {
  const [storeFolder, cameraFolder, waterMarkFolder] = args;
  let createdFolders = [];
  try {
    if (!fs.existsSync(storeFolder)) {
      fs.mkdirSync(storeFolder, { recursive: true });
      createdFolders.push({ folder: storeFolder });
    }

    if (!fs.existsSync(cameraFolder)) {
      fs.mkdirSync(cameraFolder, { recursive: true });
      createdFolders.push({ folder: cameraFolder });
    }

    if (!fs.existsSync(waterMarkFolder)) {
      fs.mkdirSync(waterMarkFolder, { recursive: true });
      createdFolders.push({ folder: waterMarkFolder });
    }
  } catch (err) {
    console.log(`Error creating folders: ${err}`);
  } finally {
    if (createFolders.length > 0) {
      console.log("The following folders have been created succesfully:");
      console.table(createdFolders);
    } else console.log("No folders were created");
  }
};

module.exports = {
  createFolders,
};
