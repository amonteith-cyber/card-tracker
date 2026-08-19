using CardTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CardTracker.Api.Data;

public class CardCollectionDbContext : DbContext
{
    public CardCollectionDbContext(DbContextOptions<CardCollectionDbContext> options)
        : base(options)
    {
    }

    public DbSet<Card> Cards => Set<Card>();
}