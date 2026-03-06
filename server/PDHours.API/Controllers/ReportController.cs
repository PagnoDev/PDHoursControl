using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PDHours.Application.DTOs.ReportDTO;
using PDHours.Application.Interfaces.IServices;
using PDHours.Domain.Models;

namespace PDHours.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _service;

        public ReportController(IReportService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReports()
        {
            try
            {
                var reports = await _service.GetAll();
                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportDTO reportDTO)
        {
            try
            {
                ReportModel newReport = new()
                {
                    Description = reportDTO.Description,
                    EmployeeId = reportDTO.EmployeeId,
                    SpentHours = reportDTO.SpentHours
                };

                _service.Add(newReport);

                Console.WriteLine(newReport);

                return Created();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
