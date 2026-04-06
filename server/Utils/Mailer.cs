using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System;

namespace ThstiServer.Utils
{
    public class Mailer
    {
        private readonly IConfiguration _config;
        private readonly SmtpClient _smtpClient;
        private readonly string _fromAddress;

        public Mailer(IConfiguration config)
        {
            _config = config;
            var host = _config["SMTP_HOST"] ?? "smtp.ethereal.email";
            var portString = _config["SMTP_PORT"] ?? "587";
            int port = int.TryParse(portString, out var p) ? p : 587;
            var user = _config["SMTP_USER"];
            var pass = _config["SMTP_PASS"];
            
            _smtpClient = new SmtpClient(host, port)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(user, pass)
            };

            _fromAddress = _config["SMTP_FROM"] ?? "noreply@thsti.res.in";
        }

        public async Task SendForgotPasswordEmailAsync(string toEmail, string resetUrl)
        {
            var subject = "Reset your THSTI CMS password";
            
            var textBody = $@"
We received a request to reset your THSTI CMS password. 
Please click the link below to set a new password. This link will expire in 15 minutes.

{resetUrl}

If you did not request this, please ignore this email.
";
            var htmlBody = $@"
<p>We received a request to reset your THSTI CMS password.</p>
<p>Please click the link below to set a new password. This link will expire in <strong>15 minutes</strong>.</p>
<p><a href=""{resetUrl}"">Reset Password</a></p>
<p>If you did not request this, please ignore this email.</p>
";
            
            await SendEmailAsync(toEmail, subject, textBody, htmlBody);
        }

        public async Task SendForgotUsernameEmailAsync(string toEmail, string username)
        {
            var subject = "Your THSTI CMS username";
            
            var textBody = $@"
You recently requested your THSTI CMS username.
Your username is: {username}

If you did not request this, please ensure your account is secure.
";
            var htmlBody = $@"
<p>You recently requested your THSTI CMS username.</p>
<p>Your username is: <strong>{username}</strong></p>
<p>If you did not request this, please ensure your account is secure.</p>
";
            
            await SendEmailAsync(toEmail, subject, textBody, htmlBody);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string plainText, string htmlText)
        {
            try
            {
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_fromAddress, "THSTI CMS Admin"),
                    Subject = subject,
                    Body = htmlText,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);
                
                await _smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine($"[MAILER] Sent email to {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MAILER] Error sending email to {toEmail}: {ex.Message}");
            }
        }
    }
}
