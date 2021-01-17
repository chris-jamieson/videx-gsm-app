const Mailgun = require("mailgun-js");
const juice = require("juice");

const config = require("./config");

const mailGunLogger = (httpOptions, payload, form) => {
  const { method, path } = httpOptions;
  const hasPayload = !!payload;
  const hasForm = !!form;

  if (config.env !== "production") {
    // TODO: should really use log level here
    console.log(
      "DEBUG",
      "Mailgun request sent in test mode",
      `%s %s payload: %s form: %s`,
      method,
      path,
      hasPayload,
      hasForm
    );
  }
};

const mailgun = Mailgun({
  apiKey: config.mailgunApiKey,
  domain: config.mailgunDomain,
  // testMode: config.env === 'test' ? false : config.mailgunTestMode, // in test environment, don't use test mode (tests will catch with HTTP mocks)
  testMode: config.mailgunTestMode,
  testModeLogger: mailGunLogger,
  host: config.mailgunHost,
});

function sendEmail(
  fromAddress = config.senderEmailAddress,
  toAddress = "default@example.com",
  subject = "No subject",
  html = "",
  text = ""
) {
  return new Promise((resolve, reject) => {
    const data = {
      from: fromAddress,
      to: toAddress,
      subject,
      text,
      html: juice(html), // inline any CSS in the HTML, for mailgun
    };

    // TODO: if no text provided, generate from html using html-to-text module

    mailgun.messages().send(data, (err, body) => {
      if (err) {
        return reject(err);
      }

      return resolve(body);
    });
  });
}

module.exports = {
  sendEmail,
};
