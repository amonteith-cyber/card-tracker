using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CardTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Sport = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    League = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Team = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    PlayerName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CardName = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Year = table.Column<int>(type: "INTEGER", nullable: false),
                    Condition = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    EstimatedValue = table.Column<decimal>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    DateAdded = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cards", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cards");
        }
    }
}
