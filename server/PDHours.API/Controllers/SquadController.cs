using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Application.DTOs.SquadDTO;
using PDHours.Application.Interfaces.IServices;
using PDHours.Domain.Models;

namespace PDHours.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SquadController : ControllerBase
    {
        private readonly ISquadService _service;

        public SquadController(ISquadService service)
        {
            _service = service;
        }

        [HttpGet("DataView")]
        [EnableQuery]
        public async Task<IActionResult> GetAll()
        {
            IQueryable<SquadListDTO?> data = await _service.GetListView();

            if (data == null || !data.Any())
                return NotFound();

            return Ok(data);
        }

        /// <summary>
        /// /SquadDailyAverage?id=1&startDate=2024-01-01&endDate=2024-12-31
        /// </summary>
        [HttpGet("DailyAverage")]
        public async Task<IActionResult> GetDailyAverageByPeriod(int id, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            if (!startDate.HasValue || !endDate.HasValue)
                return BadRequest("Os parâmetros startDate e endDate são obrigatórios.");

            if (startDate.Value.Date > endDate.Value.Date)
                return BadRequest("O startDate não pode ser maior que o endDate.");

            SquadDailyAverageDTO? data = await _service.GetDailyAverageByPeriod(id, startDate.Value, endDate.Value);

            if (data == null)
                return NotFound(new { message = $"Squad com ID {id} não encontrada" });

            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetailsById(int id)
        {
        SquadModel? data = await _service.GetById(id);

            if(data == null)
                return NotFound(new { message = $"Squad com ID {id} não encontrada" });

            return Ok(data);
        }

        /// <summary>
        /// /MemberDetails?id=1&startDate=2024-01-01&endDate=2024-12-31
        /// </summary>
        [HttpGet("MemberDetails")]
        public async Task<IActionResult> GetTotalHourByMember(int id, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            List<TotalHoursByEmployeeDTO> data = await _service.GetHourByMember(id, startDate, endDate);
            if (data == null || !data.Any())
                return NotFound();

            return Ok(data);
        }

        [HttpGet("MemberReportsTotalHours")]
        public async Task<IActionResult> GetMemberReportsTotalHours(int id)
        {
            SquadModel? squad = await _service.GetById(id);

            if (squad == null)
                return NotFound(new { message = $"Squad com ID {id} não encontrada" });

            int totalHours = await _service.GetTotalHours(id);

            return Ok(new
            {
                SquadId = id,
                TotalHours = totalHours
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSquadDTO newSquad)
        {
            if(String.IsNullOrWhiteSpace(newSquad.Name))
                return UnprocessableEntity("O nome da squad é obrigatório.");

            SquadModel sm = new()
            {
                Name = newSquad.Name
            };

            _service.Add(sm);

            return Created();
        }
    }
}
