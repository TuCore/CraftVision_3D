namespace CraftVision.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true);
        Task SendWelcomeEmailAsync(string toEmail, string userName);
    }
}
