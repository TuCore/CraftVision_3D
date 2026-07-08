using CraftVision.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using Microsoft.Extensions.Logging;

namespace CraftVision.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
        {
            try
            {
                var host = _config["SmtpSettings:Host"] ?? "smtp.gmail.com";
                var port = int.Parse(_config["SmtpSettings:Port"] ?? "587");
                var senderEmail = _config["SmtpSettings:SenderEmail"];
                var senderName = _config["SmtpSettings:SenderName"] ?? "CraftVision 3D";
                var password = _config["SmtpSettings:Password"];

                if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(password))
                {
                    _logger.LogWarning("Email sending is disabled. SmtpSettings not fully configured.");
                    return;
                }

                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(senderName, senderEmail));
                email.To.Add(new MailboxAddress("", toEmail));
                email.Subject = subject;

                var builder = new BodyBuilder();
                if (isHtml)
                {
                    builder.HtmlBody = body;
                }
                else
                {
                    builder.TextBody = body;
                }

                email.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(senderEmail, password);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            }
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string userName)
        {
            string subject = "Chào mừng bạn đến với CraftVision 3D! 🎉";
            string body = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                    <h2 style='color: #FF37C0;'>Xin chào {userName},</h2>
                    <p>Chào mừng bạn đã gia nhập <b>CraftVision 3D</b> - Trợ lý AI sáng tạo quà tặng thủ công số 1.</p>
                    <p>Tài khoản của bạn đã được đăng ký thành công thông qua Google.</p>
                    <p>Hãy bắt đầu trò chuyện với AI để khám phá ngay hàng nghìn ý tưởng DIY độc đáo nhé!</p>
                    <br/>
                    <a href='https://pulse-legend-suggestions-straight.trycloudflare.com' style='background: #FF37C0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Bắt đầu sáng tạo</a>
                    <br/><br/>
                    <p style='color: #666; font-size: 12px;'>Nếu bạn có bất kỳ thắc mắc nào, hãy trả lời trực tiếp email này.</p>
                    <p>Trân trọng,<br/><b>Đội ngũ CraftVision 3D</b></p>
                </div>
            ";

            await SendEmailAsync(toEmail, subject, body, true);
        }
    }
}
