import nodemailer, { Transporter } from 'nodemailer';
import env from 'dotenv';
import crypto from 'crypto';

env.config();

interface MailOptions {
  name?: string;
  message?: string;
  link?: string;
}

interface SendMailResponse {
  messageId: string;
  otpCode: string;
  otpExpiresAt: Date;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Biến môi trường ${key} không được định nghĩa`);
  }
  return value || defaultValue!;
};

const mailConfig = {
  host: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
  port: Number(getEnvVar('SMTP_PORT', '587')),
  auth: {
    user: getEnvVar('SMTP_USER'),
    pass: getEnvVar('SMTP_PASS'),
  },
  secure: false,
  logger: true,
  debug: true,
  tls: {
    rejectUnauthorized: false,
  },
};

export const mailService = {
  transporter: nodemailer.createTransport(mailConfig) as Transporter,

  async sendMail(emailTo: string, subject: string, plainText: string, options: MailOptions = {}): Promise<SendMailResponse> {
    try {
      if (!emailTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)) {
        throw new Error('Địa chỉ email không hợp lệ');
      }

      const otpCode = crypto.randomInt(100000, 999999).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const message = options.message ? `${options.message} Mã OTP của bạn là: <strong>${otpCode}</strong>. Hiệu lực trong 5 phút.` : `Mã OTP của bạn là: <strong>${otpCode}</strong>. Hiệu lực trong 5 phút.`;
      const plainTextWithOTP = plainText ? `${plainText} Mã OTP của bạn là: ${otpCode}. Hiệu lực trong 5 phút.` : `Mã OTP của bạn là: ${otpCode}. Hiệu lực trong 5 phút.`;

      const html = getDefaultTemplate(
        options.name || 'bạn',
        message,
        options.link || ''
      );

      const info = await this.transporter.sendMail({
        from: `"Hệ thống OTP" <${mailConfig.auth.user}>`,
        to: emailTo,
        subject: subject || 'Mã OTP xác thực của bạn',
        text: plainTextWithOTP,
        html,
      });

      console.log('Email gửi thành công:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
        otpCode,
        otpExpiresAt,
      });

      return {
        messageId: info.messageId,
        otpCode,
        otpExpiresAt,
      };
    } catch (err: any) {
      console.error('Lỗi gửi mail:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        errno: err.errno,
      });
      if (err.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối đến server SMTP. Kiểm tra host và port.');
      } else if (err.responseCode === 535) {
        throw new Error('Xác thực SMTP thất bại. Kiểm tra username/password.');
      }
      throw new Error(`Không thể gửi email: ${err.message}`);
    }
  },
};

function getDefaultTemplate(name: string, message: string, link: string) {
  return `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Xin chào ${name},</h2>
      <p>${message}</p>
      ${link ? `<p><a href="${link}" target="_blank">Nhấn vào đây để tiếp tục</a></p>` : ''}
      <p style="color: gray; font-size: 12px;">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    </div>
  `;
}