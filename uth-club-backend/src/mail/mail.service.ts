import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực tài khoản UTH Clubs and Events',
      template: './verify',
      context: {
        url,
      },
    });
  }

  async sendForgotPasswordMail(email: string, token: string) {
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${frontendBase}/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu UTH Clubs and Events',
      template: './forgot-password',
      context: {
        url,
      },
    });
  }

  async sendMembershipApprovedEmail(email: string, clubName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Thông báo duyệt đơn CLB: ${clubName}`,
      template: './membership-approved',
      context: {
        clubName,
      },
    });
  }

  async sendMembershipRejectedEmail(email: string, clubName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Thông báo kết quả đơn CLB: ${clubName}`,
      template: './membership-rejected',
      context: {
        clubName,
      },
    });
  }

  async sendEventApprovedEmail(email: string, eventName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Thông báo duyệt sự kiện: ${eventName}`,
      template: './event-approved',
      context: {
        eventName,
      },
    });
  }
}
