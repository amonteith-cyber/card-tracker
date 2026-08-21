using System.ComponentModel.DataAnnotations;

namespace CardTracker.Api.Models;

public class Card
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Sport is required.")]
    [StringLength(50, ErrorMessage = "Sport cannot exceed 50 characters.")]
    public string Sport { get; set; } = string.Empty;

    [Required(ErrorMessage = "League is required.")]
    [StringLength(50, ErrorMessage = "League cannot exceed 50 characters.")]
    public string League { get; set; } = string.Empty;

    [Required(ErrorMessage = "Team is required.")]
    [StringLength(100, ErrorMessage = "Team cannot exceed 100 characters.")]
    public string Team { get; set; } = string.Empty;

    [Required(ErrorMessage = "Player name is required.")]
    [StringLength(100, ErrorMessage = "Player name cannot exceed 100 characters.")]
    public string PlayerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Card name is required.")]
    [StringLength(150, ErrorMessage = "Card name cannot exceed 150 characters.")]
    public string CardName { get; set; } = string.Empty;

    [Range(1800, 2100, ErrorMessage = "Year must be between 1800 and 2100.")]
    public int Year { get; set; }

    [Required(ErrorMessage = "Condition is required.")]
    [StringLength(50, ErrorMessage = "Condition cannot exceed 50 characters.")]
    public string Condition { get; set; } = string.Empty;

    [Range(0, 1_000_000, ErrorMessage = "Estimated value must be between 0 and 1,000,000.")]
    public decimal EstimatedValue { get; set; }

    [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters.")]
    public string? Notes { get; set; }

    public DateTime DateAdded { get; set; } = DateTime.UtcNow;
}