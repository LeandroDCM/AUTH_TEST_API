import mg, { Mailgun } from "mailgun-js";
import "dotenv/config";

interface MailerConfig {
  apiKey: string;
  domain: string;
}

export class Mailer {
  mailgun: Mailgun;
  config: MailerConfig = {
    apiKey: process.env.EMAIL_API_KEY as string,
    domain: process.env.EMAIL_DOMAIN as string,
  };

  constructor(config: MailerConfig) {
    this.mailgun = mg({
      apiKey: this.config.apiKey,
      domain: this.config.domain,
    });
  }

  send(from: string, to: string, subject: string, text: string, html: string) {
    const data = {
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };
    return this.mailgun.messages().send(data, (err, body) => {
      if (err || !body) {
        console.error("Error:", err);
      }

      console.log("Successfully sent email.");
    });
  }
}

const mailgunCli = new Mailer({
  apiKey: process.env.EMAIL_API_KEY as string,
  domain: process.env.EMAIL_DOMAIN as string,
});
export { mailgunCli };
