using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Employee.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "daily",
                columns: table => new
                {
                    daily_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    day = table.Column<DateOnly>(type: "date", nullable: false),
                    fullname = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    area_name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    work_start = table.Column<TimeOnly>(type: "TIME", nullable: true),
                    work_end = table.Column<TimeOnly>(type: "TIME", nullable: true),
                    skill_lv = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    skill_note = table.Column<string>(type: "text", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    time_test = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_daily", x => x.daily_id);
                    table.ForeignKey(
                        name: "FK_daily_employee_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employee",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "project_month",
                columns: table => new
                {
                    project_month_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    project_id = table.Column<int>(type: "int", nullable: false),
                    month = table.Column<DateOnly>(type: "date", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_project_month", x => x.project_month_id);
                    table.ForeignKey(
                        name: "FK_project_month_employee_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employee",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_project_month_project_project_id",
                        column: x => x.project_id,
                        principalTable: "project",
                        principalColumn: "project_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "idx_daily_day",
                table: "daily",
                column: "day");

            migrationBuilder.CreateIndex(
                name: "uk_daily_employee_day",
                table: "daily",
                columns: new[] { "employee_id", "day" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_project_month_month",
                table: "project_month",
                column: "month");

            migrationBuilder.CreateIndex(
                name: "idx_project_month_project",
                table: "project_month",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "uk_project_month_emp",
                table: "project_month",
                columns: new[] { "employee_id", "project_id", "month" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "daily");

            migrationBuilder.DropTable(
                name: "project_month");
        }
    }
}
