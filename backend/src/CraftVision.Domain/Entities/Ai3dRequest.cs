using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CraftVision.Domain.Entities;

public class Ai3dRequest
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Required]
    [MaxLength(20)]
    public string TaskType { get; set; } = null!; // "TextTo3D" or "ImageTo3D"

    [MaxLength(255)]
    public string? TripoTaskId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "queued"; // queued, running, success, failed, etc.

    [Required]
    [MaxLength(128)]
    public string IdempotencyKey { get; set; } = null!;

    [MaxLength(128)]
    public string? LockedBy { get; set; }

    public DateTime? LockedUntil { get; set; }

    public int CreditCost { get; set; }

    public Guid? UploadedFileId { get; set; }

    [ForeignKey(nameof(UploadedFileId))]
    public UploadedFile? UploadedFile { get; set; }

    [MaxLength(50)]
    public string? ModelVersion { get; set; }

    public string? ResultModelUrl { get; set; }

    public string? ErrorMessage { get; set; }

    public int? Progress { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
