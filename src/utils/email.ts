import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { config } from 'dotenv'
import fs from 'fs';
import path from 'path';
import envConfig from '~/constants/config';

const sesClient = new SESClient({
  region: envConfig.aws.AWS_REGION,
  credentials: {
    secretAccessKey: envConfig.aws.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: envConfig.aws.AWS_ACCESS_KEY_ID as string
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.aws.SES_FROM_ADDRESS as string,
    toAddresses: toAddress,
    body,
    subject
  })
  return sesClient.send(sendEmailCommand)
}

export const generateEmailHtml = ({
  username,
  emailSubject,
  emailTitle,
  emailMessage,
  actionLink,
  buttonText,
  emailFooter
}: {
  username: string,
  emailSubject: string,
  emailTitle: string,
  emailMessage: string,
  actionLink: string,
  buttonText: string,
  emailFooter: string
}) => {
  const templatePath = path.resolve("src/templates/verify-email.templates.html");

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template file not found: ${templatePath}`);
    return "";
  }

  let emailHtml = fs.readFileSync(templatePath, "utf8");

  emailHtml = emailHtml.replace("{{username}}", username);
  emailHtml = emailHtml.replace("{{email_subject}}", emailSubject);
  emailHtml = emailHtml.replace("{{email_title}}", emailTitle);
  emailHtml = emailHtml.replace("{{email_message}}", emailMessage);
  emailHtml = emailHtml.replace("{{action_link}}", actionLink);
  emailHtml = emailHtml.replace("{{button_text}}", buttonText);
  emailHtml = emailHtml.replace("{{email_footer}}", emailFooter);

  return emailHtml;
}

export const sendVerifyEmailWithTemplate = (toAddress: string, verifyToken: string) => {
  const emailHtml = generateEmailHtml({
    username: toAddress,
    emailSubject: "Verify your email address",
    emailTitle: "Verify your email address",
    emailMessage: "Click the button below to verify your email address",
    actionLink: `${envConfig.server.CLIENT_URL}/verify-email?token=${verifyToken}`,
    buttonText: "Verify Email",
    emailFooter: "If you did not request this, please ignore this email and your password will remain unchanged."
  });

  return sendVerifyEmail(toAddress, "Verify your email address", emailHtml);
}

export const sendForgotPasswordEmailWithTemplate = (toAddress: string, forgotPasswordToken: string) => {
  const emailHtml = generateEmailHtml({
    username: toAddress,
    emailSubject: "Reset Your Password",
    emailTitle: "Forgot Your Password?",
    emailMessage: "We received a request to reset your password. Click the button below to set a new password.",
    actionLink: `${envConfig.server.CLIENT_URL}/reset-password?token=${forgotPasswordToken}`,
    buttonText: "Reset Password",
    emailFooter: "If you did not request a password reset, please ignore this email.If you did not request a password reset, please ignore this email."
  });

  return sendVerifyEmail(toAddress, "Verify your email address", emailHtml);
}
