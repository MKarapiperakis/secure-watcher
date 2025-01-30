const nodemailer = require("nodemailer");

const limitReached = (req, res) => {
  let ipv4 = !!req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"]
    : null;
  const currentTimestamp = new Date();
  let comments = `Rate limit exceeded: ${
    !!ipv4 ? ipv4 : "unknown user"
  } attempted too many requests.`;

  console.log(
    `Rate limit exceeded: ${
      !!ipv4 ? ipv4 : "unknown user"
    } attempted too many requests.`
  );

  res
    .status(429)
    .send("The limit of 200 requests per 20 minutes has been exceeded");

  sendEmail(comments);
};

async function sendEmail(comments) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.PASSWORD_SENDER,
    },
  });

  let info = await transporter.sendMail({
    from: `"Villa Agapi Automation Service" <${process.env.EMAIL_SENDER}>`,
    to: process.env.EMAIL_SENDER,
    subject: `API Limit has been reached`,
    html: `
        <h1>IMPORTANT<h1>
        <h2>${comments}</h2>
        
        
        <hr style = "width: 200px">
        <div style="text-align: center;">
            <i>Villa Agapi Automation Service</i>
        </div>
        `,
  });
}

module.exports = limitReached;
