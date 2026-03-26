namespace Employee.Core.DTOs.AI
{
    public class ChatResponse
    {
        public string Reply { get; set; } = string.Empty;
        public bool IsSuccess { get; set; } = true;
        public string ErrorMessage { get; set; } = string.Empty;
    }
}
