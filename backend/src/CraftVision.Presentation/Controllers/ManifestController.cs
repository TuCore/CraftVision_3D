using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Manifest;
using CraftVision.Application.Interfaces;
using CraftVision.Infrastructure.Data;
using CraftVision.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/manifest")]
[AllowAnonymous]
public class ManifestController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailService _emailService;

    public ManifestController(ApplicationDbContext db, IEmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }

    [HttpGet("count")]
    public async Task<IActionResult> GetCount()
    {
        var count = await _db.ManifestWishes.CountAsync();
        return Ok(new { count });
    }

    [HttpPost]
    public async Task<IActionResult> MakeWish([FromBody] ManifestRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.WishText))
            return BadRequest("Email và lời nguyện ước không được để trống.");

        var wish = new ManifestWish
        {
            Email = dto.Email.Trim(),
            WishText = dto.WishText.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.ManifestWishes.Add(wish);
        await _db.SaveChangesAsync();

        var totalWishes = await _db.ManifestWishes.CountAsync();

        // Send beautiful HTML email with the wish card
        var emailBody = $@"
<!DOCTYPE html>
<html>
<head><meta charset=""UTF-8""></head>
<body style=""margin:0;padding:0;background:linear-gradient(135deg,#1a0a2e 0%,#2d1050 50%,#1a0a2e 100%);"">
  <div style=""max-width:500px;margin:40px auto;text-align:center;font-family:'Segoe UI',sans-serif;"">
    
    <!-- Glowing Title -->
    <div style=""background:linear-gradient(135deg,rgba(255,100,150,0.15),rgba(255,150,50,0.15));border:1px solid rgba(255,120,80,0.3);border-radius:20px;padding:40px 30px;margin-bottom:20px;"">
      <h1 style=""font-size:28px;margin:0 0 8px 0;background:linear-gradient(135deg,#ff6eb4,#ff9a3c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"">
        ✨ Nguyện Ước Của Bạn
      </h1>
      <p style=""color:rgba(255,180,120,0.7);font-size:13px;margin:0;"">CraftVision 3D · Cây Năng Lượng Nguyện Ước</p>
    </div>

    <!-- Tree Illustration (SVG) -->
    <div style=""padding:30px 0;"">
      <svg width=""200"" height=""220"" viewBox=""0 0 200 220"" xmlns=""http://www.w3.org/2000/svg"">
        <defs>
          <radialGradient id=""glow"" cx=""50%"" cy=""50%"" r=""50%"">
            <stop offset=""0%"" stop-color=""#ff9a3c"" stop-opacity=""0.8""/>
            <stop offset=""100%"" stop-color=""#ff6eb4"" stop-opacity=""0""/>
          </radialGradient>
          <radialGradient id=""sphere"" cx=""40%"" cy=""35%"" r=""60%"">
            <stop offset=""0%"" stop-color=""#fff"" stop-opacity=""0.9""/>
            <stop offset=""50%"" stop-color=""#ffb347""/>
            <stop offset=""100%"" stop-color=""#ff6eb4""/>
          </radialGradient>
        </defs>
        <!-- Portal ring -->
        <circle cx=""100"" cy=""100"" r=""90"" fill=""none"" stroke=""url(#glow)"" stroke-width=""1"" opacity=""0.4""/>
        <circle cx=""100"" cy=""100"" r=""75"" fill=""rgba(255,110,180,0.05)"" stroke=""rgba(255,154,60,0.3)"" stroke-width=""1.5""/>
        <!-- Crown glow -->
        <ellipse cx=""100"" cy=""65"" rx=""42"" ry=""38"" fill=""rgba(255,150,80,0.35)"" filter=""url(#glow)""/>
        <ellipse cx=""72"" cy=""75"" rx=""30"" ry=""28"" fill=""rgba(255,110,180,0.30)""/>
        <ellipse cx=""128"" cy=""75"" rx=""30"" ry=""28"" fill=""rgba(255,110,180,0.30)""/>
        <!-- Trunk -->
        <path d=""M88 170 Q90 130 92 100"" stroke=""#7c3a1e"" stroke-width=""8"" fill=""none"" stroke-linecap=""round""/>
        <path d=""M112 170 Q110 130 108 100"" stroke=""#7c3a1e"" stroke-width=""8"" fill=""none"" stroke-linecap=""round""/>
        <!-- Energy sphere -->
        <circle cx=""100"" cy=""135"" r=""18"" fill=""url(#sphere)"" filter=""url(#glow)""/>
        <circle cx=""100"" cy=""135"" r=""10"" fill=""white"" opacity=""0.7""/>
        <!-- Sparkle dots -->
        <circle cx=""60"" cy=""180"" r=""3"" fill=""#ff9a3c"" opacity=""0.8""/>
        <circle cx=""80"" cy=""190"" r=""4"" fill=""#ff6eb4"" opacity=""0.9""/>
        <circle cx=""100"" cy=""195"" r=""3"" fill=""#ff9a3c"" opacity=""0.8""/>
        <circle cx=""120"" cy=""190"" r=""4"" fill=""#ff6eb4"" opacity=""0.9""/>
        <circle cx=""140"" cy=""180"" r=""3"" fill=""#ff9a3c"" opacity=""0.8""/>
      </svg>
    </div>

    <!-- Wish Card -->
    <div style=""background:linear-gradient(135deg,rgba(255,110,180,0.1),rgba(255,154,60,0.1));border:1px solid rgba(255,120,80,0.25);border-radius:16px;padding:25px;margin:0 10px 25px;"">
      <p style=""color:rgba(255,220,180,0.6);font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px 0;"">Lời Nguyện Ước Của Bạn</p>
      <p style=""color:#fff;font-size:16px;line-height:1.7;margin:0;font-style:italic;"">
        &ldquo;{dto.WishText}&rdquo;
      </p>
    </div>

    <!-- Footer note -->
    <p style=""color:rgba(255,180,120,0.5);font-size:12px;line-height:1.6;margin:0 20px;"">
      Lời nguyện ước của bạn đã được gửi đến vũ trụ 🌌<br/>
      Bạn là người ước thứ <strong style=""color:#ff9a3c;"">{totalWishes}</strong> trên Cây Nguyện Ước CraftVision.<br/><br/>
      <span style=""color:rgba(255,180,120,0.35);"">CraftVision 3D · Trợ lý AI Sáng tạo Quà tặng</span>
    </p>
  </div>
</body>
</html>";

        await _emailService.SendEmailAsync(dto.Email, "✨ Lời nguyện ước của bạn đã được gửi đi!", emailBody);

        return Ok(new ManifestResponseDto
        {
            Success = true,
            TotalWishes = totalWishes,
            Message = "Lời nguyện ước đã được gửi đến vũ trụ!"
        });
    }
}
