const nodemailer = require("nodemailer");
const { BadRequestError } = require("../lib/errors");
const fs = require("fs");
module.exports = (filePath, receivers, storePath) => {
  try {
    main(filePath, receivers, storePath).then((response) => {
      if (!!response) {
        console.log("Mail sent successfully");
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File deleted successfully:", filePath);
          }
        });
      } else {
        console.log("error notifying user");
        throw new BadRequestError("Bad Request");
      }
    });
  } catch (error) {
    console.log(`error notifying user: ${error}`);
  }

  async function main(filePath, receivers) {
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_SENDER,
          pass: process.env.PASSWORD_SENDER,
        },
      });
      let formattedStorePath = `file:///${storePath.replace(/\\/g, "/")}`;

      let info = await transporter.sendMail({
        from: `"Secure Watcher Automation Service" <${process.env.EMAIL_SENDER}>`,
        to: process.env.EMAIL_SENDER,
        bcc: receivers,
        subject: `Camera Spotted Movement`,
        html: `<p style="font-size: 24px; font-weight: bold; color: #d9534f; text-align: center;">⚠ Motion Detected! ⚠</p>
          <p style="font-size: 18px; color: #333; text-align: center;">Your security camera has detected movement.</p>
          <hr style="width: 50%; border: 1px solid #d9534f; margin: 20px auto;">
          <div style="text-align: center;">
              <p style="font-size: 16px; color: #555;">See the captured image below:</p>
              <img src="cid:capture_image" alt="Captured Image" style="max-width: 100%; height: auto; border: 2px solid #d9534f;">
          </div>
         <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Or you can check it directly on your local Windows machine:</p>
              <p style="font-size: 16px; font-weight: bold; color: #555;">${storePath}</p>
          </div>`,
        attachments: [
          {
            filename: filePath.split("/").pop(),
            path: filePath,
            cid: "capture_image",
          },
        ],
      });

      return info.messageId;
    } catch (err) {
      console.log("error sending email: ", err);
      return null;
    }
  }
};
