using CardTracker.Api.Data;
using CardTracker.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CardTracker.Api.Controllers;

[ApiController]
[Route("api/cards")]
public class CardsController : ControllerBase
{
    private readonly CardCollectionDbContext _context;

    public CardsController(CardCollectionDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Card>>> GetCards(
        [FromQuery] string? sport,
        [FromQuery] string? league,
        [FromQuery] string? team,
        [FromQuery] string? player)
    {
        var query = _context.Cards.AsQueryable();

        if (!string.IsNullOrWhiteSpace(sport))
        {
            var normalizedSport = sport.Trim().ToLower();

            query = query.Where(card =>
                card.Sport.ToLower() == normalizedSport);
        }

        if (!string.IsNullOrWhiteSpace(league))
        {
            var normalizedLeague = league.Trim().ToLower();

            query = query.Where(card =>
                card.League.ToLower() == normalizedLeague);
        }

        if (!string.IsNullOrWhiteSpace(team))
        {
            var normalizedTeam = team.Trim().ToLower();

            query = query.Where(card =>
                card.Team.ToLower() == normalizedTeam);
        }

        if (!string.IsNullOrWhiteSpace(player))
        {
            var normalizedPlayer = player.Trim().ToLower();

            query = query.Where(card =>
                card.PlayerName.ToLower().Contains(normalizedPlayer));
        }

        var cards = await query
            .OrderBy(card => card.PlayerName)
            .ThenBy(card => card.CardName)
            .ToListAsync();

        return Ok(cards);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Card>> GetCard(int id)
    {
        var card = await _context.Cards.FindAsync(id);

        if (card is null)
        {
            return NotFound(new
            {
                message = $"Card with ID {id} was not found."
            });
        }

        return Ok(card);
    }

    [HttpPost]
    public async Task<ActionResult<Card>> CreateCard(Card card)
    {
        card.Id = 0;
        card.DateAdded = DateTime.UtcNow;

        _context.Cards.Add(card);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCard),
            new { id = card.Id },
            card);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCard(int id, Card card)
    {
        if (id != card.Id)
        {
            return BadRequest(new
            {
                message = "The card ID in the URL must match the card ID in the request body."
            });
        }

        var existingCard = await _context.Cards.FindAsync(id);

        if (existingCard is null)
        {
            return NotFound(new
            {
                message = $"Card with ID {id} was not found."
            });
        }

        existingCard.Sport = card.Sport;
        existingCard.League = card.League;
        existingCard.Team = card.Team;
        existingCard.PlayerName = card.PlayerName;
        existingCard.CardName = card.CardName;
        existingCard.Year = card.Year;
        existingCard.Condition = card.Condition;
        existingCard.EstimatedValue = card.EstimatedValue;
        existingCard.Notes = card.Notes;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCard(int id)
    {
        var card = await _context.Cards.FindAsync(id);

        if (card is null)
        {
            return NotFound(new
            {
                message = $"Card with ID {id} was not found."
            });
        }

        _context.Cards.Remove(card);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}