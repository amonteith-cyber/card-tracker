using System.ComponentModel.DataAnnotations;

namespace CardTracker.Api.Models;

public class Card
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Sport { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string League { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Team { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string PlayerName { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string CardName { get; set; } = string.Empty;

    [Range(1800, 2100)]
    public int Year { get; set; }

    [Required]
    [StringLength(50)]
    public string Condition { get; set; } = string.Empty;

    [Range(0, 1_000_000)]
    public decimal EstimatedValue { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime DateAdded { get; set; } = DateTime.UtcNow;
}