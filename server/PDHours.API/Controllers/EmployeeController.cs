using Microsoft.AspNetCore.Mvc;
using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Application.Interfaces.IServices;

namespace PDHours.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _service;

        public EmployeeController(IEmployeeService service)
        {
            _service = service;
        }

        [HttpGet("/EmployeeDataView")]
        public async Task<IActionResult> GetListView()
        {
            IQueryable<EmployeeListDTO> list = await _service.GetListView();

            if (list is null || !list.Any())
            {
                return NotFound();
            }

            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateEmployeeDTO dto)
        {
            try
            {
                _service.Add(new()
                {
                    EstimateHours = dto.EstimateHours,
                    Name = dto.Name,
                    SquadId = dto.SquadId
                });

                return Created();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
