using Microsoft.AspNetCore.Mvc;
using Employee.Core.DTOs.AI;
using Employee.Core.Interfaces;

namespace Employee.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly IOpenClawService _aiService;

        public AIController(IOpenClawService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Message))
            {
                return BadRequest(new { Message = "Câu hỏi gửi đi không được để trống." });
            }

            var response = await _aiService.SendMessageAsync(request);
            
            if (response.IsSuccess)
            {
                return Ok(response);
            }
            
            return StatusCode(500, response);
        }
    }
}
