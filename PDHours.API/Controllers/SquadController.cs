using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PDHours.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SquadController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok("SquadController is working!");
        }
    }
}
