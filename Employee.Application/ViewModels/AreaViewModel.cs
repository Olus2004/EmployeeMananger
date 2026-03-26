namespace Employee.Application.ViewModels;

public class AreaViewModel
{
    public int AreaId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public short Active { get; set; }
}

public class CreateAreaViewModel
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public short Active { get; set; } = 1;
}

public class UpdateAreaViewModel
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public short Active { get; set; }
}

