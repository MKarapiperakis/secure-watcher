const fs = require("fs");
const path = require("path");
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully:", filePath);

          const parentFolder = path.dirname(filePath);

          fs.readdir(parentFolder, (err, files) => {
            if (err) {
              console.error("Error reading folder:", err);
            } else if (files.length === 0) {
              // If empty, delete the parent folder
              fs.rmdir(parentFolder, (err) => {
                if (err) {
                  console.error("Error deleting folder:", err);
                } else {
                  console.log(
                    "Parent folder deleted:",
                    parentFolder
                  );
                }
              });
            }
          });
        }
      });
}


module.exports = {
    deleteFile,
  };
  