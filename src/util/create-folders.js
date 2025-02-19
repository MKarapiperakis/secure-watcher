const fs = require("fs");

const createFolders = (...folders) => {
  let createdFolders = [];
  try {
    folders.forEach(folder => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
        createdFolders.push({ folder });
      }
    });
  } catch (err) {
    console.error(`Error creating folders: ${err}`);
  } finally {
    if (createdFolders.length > 0) {
      console.log("The following folders have been created successfully:");
      console.table(createdFolders);
    } else {
      console.log("No folders were created.");
    }
  }
};

module.exports = {
  createFolders,
};
